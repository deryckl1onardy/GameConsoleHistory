import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import gsap from 'gsap'
import { INTRO, aspectDolly, shotCameraPosition, shotsFor, type Shot } from './shots'
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
  const reducedMotion = useScene((s) => s.reducedMotion)
  const introDone = useScene((s) => s.introDone)
  const setIntroDone = useScene((s) => s.setIntroDone)

  const shots = useMemo(() => shotsFor(entry, spec), [entry, spec])
  const dolly = aspectDolly(width / Math.max(1, height))

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

  // Mode changes drive the camera.
  useEffect(() => {
    if (!introDone) return
    const shotId = MODE_TO_SHOT[mode as keyof typeof MODE_TO_SHOT]
    if (!shotId) return
    applyShot(shots[shotId], { animate: !reducedMotion })
  }, [mode, shots, introDone, reducedMotion, applyShot])

  // Reframe on resize without animating — a resize is not a camera move.
  useEffect(() => {
    if (!introDone) return
    const shotId = MODE_TO_SHOT[mode as keyof typeof MODE_TO_SHOT]
    if (!shotId) return
    applyShot(shots[shotId], { animate: false })
    // Only when the viewport actually changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height])

  useEffect(() => () => void active.current?.kill(), [])

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan={false}
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
