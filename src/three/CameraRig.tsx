import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import gsap from 'gsap'
import { INTRO, artifactShotFor, aspectDolly, shotCameraPosition, shotsFor, type Shot } from './shots'
import { applyFrameOffset, frameOffsetFor } from '@/frame'
import { useActiveConsole, useActiveDiorama, useScene } from '@/store/scene'

/**
 * The single thing allowed to move the camera.
 *
 * Shots are chosen by setting `mode` in the store; nothing else may touch the
 * camera. That constraint is what keeps the mode bar, the panel tabs and the
 * 3D click targets from fighting each other over framing.
 *
 * OrbitControls' `target` prop is applied asynchronously and does not aim the
 * camera on first mount — it keeps its default -Z orientation and stares past
 * the set, which renders as a plausible-looking black frame with a perfectly
 * healthy scene graph. Everything here aims it explicitly instead.
 */

/** Modes that map onto a camera shot. 'compare' is handled elsewhere. */
const MODE_TO_SHOT = {
  console: 'console',
  diorama: 'diorama',
  library: 'library',
  controller: 'controller',
} as const

/** The resting polar-angle clamp, applied once a shot has finished arriving. */
const REST_MIN_POLAR = 0.15
const REST_MAX_POLAR = Math.PI / 2.15

export function CameraRig() {
  const controls = useRef<OrbitControlsImpl>(null)
  const camera = useThree((s) => s.camera)
  const width = useThree((s) => s.size.width)
  const height = useThree((s) => s.size.height)

  const entry = useActiveConsole()
  const spec = useActiveDiorama()
  const mode = useScene((s) => s.mode)
  const selectedRank = useScene((s) => s.selectedGameRank)
  const reducedMotion = useScene((s) => s.reducedMotion)
  const introDone = useScene((s) => s.introDone)
  const setIntroDone = useScene((s) => s.setIntroDone)
  const layout = useScene((s) => s.layout)
  const panelOpen = useScene((s) => s.panelOpen)
  const setFrameOffset = useScene((s) => s.setFrameOffset)
  const reframeNonce = useScene((s) => s.reframeNonce)

  const shots = useMemo(() => shotsFor(entry, spec), [entry, spec])
  const dolly = aspectDolly(width / Math.max(1, height))

  /** Where the camera belongs right now, in the one world that remains. */
  const restingShot = useMemo((): Shot | null => {
    // The artifact shot is not in `shots` (it depends on the selected rank,
    // which shotsFor does not receive) — build it from the same layout the
    // spread renders with, so camera and contents cannot disagree.
    if (mode === 'artifact' && selectedRank !== null) {
      return artifactShotFor(entry, spec, selectedRank, layout)
    }
    const shotId = MODE_TO_SHOT[mode as keyof typeof MODE_TO_SHOT]
    return shotId ? shots[shotId] : null
  }, [mode, selectedRank, shots, entry, spec, layout])

  /** Every tween runs through here so only one can ever own the camera. */
  const active = useRef<gsap.core.Tween | gsap.core.Timeline | null>(null)

  const applyShot = useMemo(
    () =>
      (shot: Shot, opts: { animate: boolean; distanceScale?: number; duration?: number }) => {
        const c = controls.current
        const scale = opts.distanceScale ?? 1
        const to = shotCameraPosition(shot, dolly * scale)

        // Kill any in-flight move first: rapid mode switching otherwise leaves
        // two tweens interpolating the same camera toward different shots.
        active.current?.kill()
        active.current = null

        const finish = () => {
          if (!c) return
          c.minDistance = shot.minDistance
          c.maxDistance = shot.maxDistance * dolly
          c.minPolarAngle = REST_MIN_POLAR
          c.maxPolarAngle = REST_MAX_POLAR
          c.enabled = true
          c.update()
        }

        if (!opts.animate) {
          camera.position.set(...to)
          if (c) c.target.set(...shot.target)
          camera.updateProjectionMatrix()
          finish()
          return
        }

        if (c) {
          c.enabled = false
          /*
            Every clamp is relaxed during flight, not just distance. Polar angle
            matters just as much: the controller shot sits almost overhead, so a
            tween crossing from diorama or console toward it passes through
            angles the resting clamp would reject. OrbitControls re-derives and
            clamps the camera's spherical position on every internal update()
            it runs — which happens every frame while enableDamping is on,
            independent of our own onUpdate below — so a tween that leaves any
            clamp engaged gets silently fought and corrupted mid-flight. Rapid
            re-triggering compounds that drift, since each new tween starts from
            wherever the camera actually is, not where GSAP last computed.
          */
          c.minDistance = 0
          c.maxDistance = Infinity
          c.minPolarAngle = 0
          c.maxPolarAngle = Math.PI
          c.minAzimuthAngle = -Infinity
          c.maxAzimuthAngle = Infinity
        }

        const proxy = {
          px: camera.position.x,
          py: camera.position.y,
          pz: camera.position.z,
          tx: c?.target.x ?? shot.target[0],
          ty: c?.target.y ?? shot.target[1],
          tz: c?.target.z ?? shot.target[2],
        }

        active.current = gsap.to(proxy, {
          px: to[0],
          py: to[1],
          pz: to[2],
          tx: shot.target[0],
          ty: shot.target[1],
          tz: shot.target[2],
          duration: (opts.duration ?? 1200) / 1000,
          ease: 'power3.inOut',
          onUpdate: () => {
            camera.position.set(proxy.px, proxy.py, proxy.pz)
            if (c) {
              c.target.set(proxy.tx, proxy.ty, proxy.tz)
              c.update()
            }
          },
          onComplete: () => {
            active.current = null
            finish()
          },
        })
      },
    [camera, dolly],
  )

  // Opening move: tight on the console, hold, then ease back to the resting
  // console shot. Runs once per console, and never under reduced motion.
  useLayoutEffect(() => {
    const shot = shots.console

    if (introDone || reducedMotion) {
      applyShot(shots[MODE_TO_SHOT[mode as keyof typeof MODE_TO_SHOT] ?? 'console'], {
        animate: false,
      })
      if (!introDone) setIntroDone(true)
      return
    }

    applyShot(shot, { animate: false, distanceScale: INTRO.startScale })

    const timer = window.setTimeout(() => {
      applyShot(shot, { animate: true, duration: INTRO.pullBackMs })
      setIntroDone(true)
    }, INTRO.holdMs)

    return () => window.clearTimeout(timer)
    // Intentionally keyed on the console only — re-running on every mode change
    // would replay the intro.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry.id])

  // Any change of destination drives the camera — a section/mode change, or
  // the panel selecting a different game. One effect for all of them, so they
  // cannot disagree. The rank is part of the key so picking game 3 while game
  // 1 is lifted flies the camera, and backing out to the list returns it to
  // the spread.
  const destinationKey = `mode:${mode}:rank:${selectedRank ?? 'none'}`

  useEffect(() => {
    if (!restingShot) return
    if (!introDone) return
    applyShot(restingShot, { animate: !reducedMotion })
  }, [destinationKey, introDone, reducedMotion, applyShot, restingShot])

  // Reframe on resize without animating — a resize is not a camera move.
  useEffect(() => {
    if (!restingShot) return
    if (!introDone) return
    applyShot(restingShot, { animate: false })
    // Only when the viewport actually changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height])

  /**
   * Keep the frame offset in sync with the chrome — but only while the
   * camera sits at the shot's authored distance. The offset (frame.ts) lifts
   * the subject clear of the bottom panel; that projection shift is
   * invisible at the resting distance and very visible zoomed in — once the
   * camera dolls inside the authored framing, the same shift leaves the
   * subject sitting noticeably high of centre. So the offset blends out
   * linearly as the camera approaches minDistance: full offset at the
   * resting shot, none at the closest dolly, so the look-at point (the
   * console's or box's middle) lands dead centre at full zoom. Reapplied on
   * every controls change, because zoom is continuous and the projection
   * lives on the camera.
   */
  useEffect(() => {
    const c = controls.current
    const apply = () => {
      const base = frameOffsetFor(width, height, layout, !panelOpen, mode !== 'console')
      let t = 1
      if (c && restingShot) {
        const dist = camera.position.distanceTo(c.target)
        const lo = restingShot.minDistance
        const hi = restingShot.distance * dolly
        if (hi > lo) t = Math.min(1, Math.max(0, (dist - lo) / (hi - lo)))
      }
      const offset = { dx: base.dx * t, dy: base.dy * t }
      applyFrameOffset(camera, offset)
      setFrameOffset(offset)
    }
    apply()
    c?.addEventListener('change', apply)
    return () => c?.removeEventListener('change', apply)
  }, [width, height, layout, panelOpen, camera, setFrameOffset, restingShot, dolly, mode])

  /**
   * The reset view: snap the camera back to the resting shot. Wired to the
   * legend's reset button and to canvas double-click (both call
   * `bumpReframe`). Pan is unbounded in this build, so this is the way home.
   */
  useEffect(() => {
    if (reframeNonce === 0) return
    // The resting shot already knows about artifact mode — reuse it rather
    // than re-deriving, so reset behaves identically to every other arrival.
    if (restingShot) applyShot(restingShot, { animate: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reframeNonce])

  useEffect(() => {
    return () => {
      active.current?.kill()
    }
  }, [])

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.06}
      // minPolarAngle/maxPolarAngle are deliberately NOT set here. drei
      // re-applies JSX props to the underlying instance on every re-render —
      // of which there are many (mode, shots and dolly all change often) — so
      // a fixed prop would silently reassert the resting clamp mid-tween,
      // fighting the relaxed clamp `applyShot` had just set. They are managed
      // imperatively instead: relaxed to [0, π] for the duration of a move,
      // and restored to the resting range in `finish()`.
    />
  )
}

/** Exposed for tests. */
export { MODE_TO_SHOT }
