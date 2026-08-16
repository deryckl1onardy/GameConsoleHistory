import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import gsap from 'gsap'
import { INTRO, aspectDolly, shotCameraPosition, shotsFor, type Shot } from './shots'
import { approachShot as computeApproachShot, bayShots, roomDelta } from './museum/museum-shots'
import { NO_OFFSET, applyFrameOffset, frameOffsetFor } from '@/frame'
import { MUSEUM_LAYOUT } from './museum/layout'
import { generationNearestZ } from './museum/shelf-layout'
import { APPROACH_TIMING } from './museum/approach'
import { heroGroupRef } from './HeroConsole'
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

/**
 * The museum is a wall, so orbiting past its edges shows the back of a plane
 * and an empty void. The room is a freestanding set and stays unclamped.
 * Managed imperatively for exactly the same reason as the polar clamps.
 */
const MUSEUM_AZIMUTH = 0.62

export function CameraRig() {
  const controls = useRef<OrbitControlsImpl>(null)
  const camera = useThree((s) => s.camera)
  const gl = useThree((s) => s.gl)
  const width = useThree((s) => s.size.width)
  const height = useThree((s) => s.size.height)

  const entry = useActiveConsole()
  const spec = useActiveDiorama()
  const mode = useScene((s) => s.mode)
  const reducedMotion = useScene((s) => s.reducedMotion)
  const introDone = useScene((s) => s.introDone)
  const setIntroDone = useScene((s) => s.setIntroDone)
  const layout = useScene((s) => s.layout)
  const panelOpen = useScene((s) => s.panelOpen)
  const setFrameOffset = useScene((s) => s.setFrameOffset)
  const reframeNonce = useScene((s) => s.reframeNonce)

  const screen = useScene((s) => s.screen)
  const focusGeneration = useScene((s) => s.focusGeneration)
  const museumIntroDone = useScene((s) => s.museumIntroDone)
  const setMuseumIntroDone = useScene((s) => s.setMuseumIntroDone)
  const approach = useScene((s) => s.approach)
  const approachNonce = useScene((s) => s.approachNonce)
  const advanceApproach = useScene((s) => s.advanceApproach)
  const setScreen = useScene((s) => s.setScreen)
  const setFocusGeneration = useScene((s) => s.setFocusGeneration)
  const focusNavNonce = useScene((s) => s.focusNavNonce)

  const shots = useMemo(() => shotsFor(entry, spec), [entry, spec])
  const museumShots = useMemo(() => bayShots(MUSEUM_LAYOUT), [])
  const dolly = aspectDolly(width / Math.max(1, height))

  const onShelf = screen === 'shelf'

  /**
   * Where the camera belongs right now, whichever world we are in. Having one
   * resolver rather than three copies of `MODE_TO_SHOT[mode]` is what keeps
   * the intro, mode-change and resize effects from disagreeing about the
   * destination — which, with a shared tween, would corrupt the flight.
   */
  const restingShot = useMemo((): Shot | null => {
    if (onShelf) return museumShots.get(focusGeneration) ?? null
    const shotId = MODE_TO_SHOT[mode as keyof typeof MODE_TO_SHOT]
    return shotId ? shots[shotId] : null
  }, [onShelf, museumShots, focusGeneration, mode, shots])

  /** Every tween runs through here so only one can ever own the camera. */
  const active = useRef<gsap.core.Tween | gsap.core.Timeline | null>(null)
  /**
   * The frame-offset tween, owned separately from `active` on purpose: the
   * offset is a projection change, not a camera move, so it must be able to
   * run while `applyShot` owns the camera (and vice versa).
   */
  const offsetTween = useRef<gsap.core.Tween | null>(null)

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
          // Read fresh rather than closing over the `onShelf` this call was
          // scheduled with: the approach choreography calls `applyShot`
          // *immediately after* flipping `screen` within the same callback
          // (the retreat's outbound flight, in particular), and a captured
          // `onShelf` from render time would still say the OLD screen at that
          // point — this component won't re-render with the new value until
          // the next tick. Reading the store directly here means `finish()`
          // is correct no matter when the tween that calls it was scheduled.
          const stillOnShelf = useScene.getState().screen === 'shelf'
          // Set on EVERY finish, both branches — a clamp that is only ever
          // applied on one screen leaks into the other the moment a path
          // skips it, and an azimuth-locked room is very hard to diagnose.
          c.minAzimuthAngle = stillOnShelf ? -MUSEUM_AZIMUTH : -Infinity
          c.maxAzimuthAngle = stillOnShelf ? MUSEUM_AZIMUTH : Infinity
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
    // The museum has its own opening; the room's belongs to the room.
    if (onShelf) return

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
  }, [entry.id, onShelf])

  // The museum's own arrival: land on the opening bay without animating in
  // from wherever the camera happened to be.
  useLayoutEffect(() => {
    if (!onShelf || museumIntroDone || !restingShot) return
    applyShot(restingShot, { animate: false })
    setMuseumIntroDone(true)
  }, [onShelf, museumIntroDone, restingShot, applyShot, setMuseumIntroDone])

  /*
    What counts as "the user asked to go somewhere new".

    In the room that is a mode change. On the shelf it is a RAIL CLICK
    specifically — `focusNavNonce` — and deliberately NOT `focusGeneration`
    itself, because that field now also changes passively as a pan discovers
    it has arrived near a different bay (`syncFocusGeneration`). Keying the
    effect below on the generation would make every such sync re-apply that
    bay's shot and yank the camera out of the drag the user is still in the
    middle of. Navigation moves the camera; noticing where you are does not.
  */
  const destinationKey = onShelf ? `bay:${focusNavNonce}` : `mode:${mode}`

  // Any change of destination drives the camera — a mode change in the room, a
  // bay change in the museum. One effect for both, so they cannot disagree.
  //
  // `approach` is read but deliberately NOT a dependency: the approach
  // choreography's own handoff also changes `onShelf` (screen flips), which
  // is what this effect is keyed on, so listing `approach` too would make it
  // fire a SECOND time when `approach` later reaches 'idle' on its own,
  // re-tweening to a destination the camera has already been sitting at
  // since the handoff. Reading it unlisted means the guard sees whatever
  // `approach` was AT THE MOMENT restingShot/onShelf actually changed — which
  // is exactly what "is this a real navigation change, or the choreography's
  // own doing" needs to ask.
  useEffect(() => {
    if (!restingShot) return
    if (onShelf ? !museumIntroDone : !introDone) return
    if (approach !== 'idle') return
    applyShot(restingShot, { animate: !reducedMotion })
    // `restingShot` is read, not listed — see `destinationKey` above for why
    // the shelf must react to navigation intent rather than to the generation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destinationKey, onShelf, introDone, museumIntroDone, reducedMotion, applyShot])

  // Reframe on resize without animating — a resize is not a camera move.
  useEffect(() => {
    if (!restingShot) return
    if (onShelf ? !museumIntroDone : !introDone) return
    if (approach !== 'idle') return
    applyShot(restingShot, { animate: false })
    // Only when the viewport actually changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height])

  /**
   * Keep the frame offset in sync with the chrome at rest. The offset is the
   * room's projection contract (frame.ts): applied whenever the room is up
   * and idle — on layout/panel/viewport changes, and once `arriving` hands
   * over to `idle`. While `arriving`/`retreating` is in flight, the tween in
   * the choreography effect owns the offset and this effect stays out.
   */
  useEffect(() => {
    const s = useScene.getState()
    if (s.screen !== 'room' || s.approach !== 'idle') return
    const offset = frameOffsetFor(width, height, s.layout, !s.panelOpen)
    applyFrameOffset(camera, offset)
    s.setFrameOffset(offset)
    // `approach` listed so a mid-flight viewport change is corrected the
    // moment the tween hands control back.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height, layout, panelOpen, approach])

  /**
   * The approach and its reverse — the whole "take it off the shelf, walk
   * into its era" move. See museum/approach.ts for the timing table this
   * mirrors.
   *
   * Keyed on `approachNonce`, not on `approach` itself. `approach` changes
   * several more times over the course of this very sequence (focusing ->
   * approaching -> arriving -> idle), each transition driven by THIS
   * effect's own timers calling `advanceApproach` — if the effect were keyed
   * on `approach`, every one of those internal transitions would count as "a
   * dependency changed," and React would run this effect's cleanup (clearing
   * whatever timers are still pending) and then immediately re-invoke the
   * body, which would see a state other than 'focusing'/'retreating' and do
   * nothing — silently dropping the rest of the sequence. `approachNonce`
   * only changes when a genuinely NEW request comes in (`selectArtifact` or
   * `retreatToShelf`), so this effect schedules its full run exactly once per
   * request and is left alone to finish it.
   */
  /**
   * The reset view: snap the camera back to the resting shot. Wired to the
   * legend's reset button and to canvas double-click (both call
   * `bumpReframe`). Pan is unbounded in this build, so this is the way home.
   */
  useEffect(() => {
    if (reframeNonce === 0) return
    const s = useScene.getState()
    if (s.screen !== 'room' || s.approach !== 'idle') return
    const shot = shots[MODE_TO_SHOT[mode as keyof typeof MODE_TO_SHOT]]
    if (shot) applyShot(shot, { animate: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reframeNonce])

  /**
   * The hall's gesture set: left-drag AND the wheel both WALK THE CAMERA DOWN
   * THE HALL, never around the room and never in and out of it. The museum is
   * a gallery hall of generation stations receding along Z, so the gesture
   * that browses it is travel — scrolling down carries you deeper into the
   * hall and forward through time. OrbitControls' rotate AND zoom are
   * therefore OFF on the shelf (see the JSX below) and this handler owns both
   * gestures.
   *
   * Travel is applied to BOTH the camera and the orbit target by the same
   * world-Z delta, so the relative offset OrbitControls derives from is
   * unchanged and its own update() loop stays idempotent with it. Horizontal
   * drag movement is deliberately ignored — only the vertical component
   * drives travel, because "drag up to go forward" is the same muscle memory
   * as scrolling a page. The wheel travels by its pixel delta with the same
   * per-pixel scale as the drag.
   *
   * This used to pan along Y, back when the collection was a wall of shelves
   * stacked vertically. In a hall that gesture would slide the camera up
   * through the ceiling.
   */
  useEffect(() => {
    if (!onShelf) return
    const el = gl.domElement
    let dragging = false
    let lastClientY = 0

    // Pixel delta -> world delta at the camera's current standoff: the world
    // height visible through the lens divided by the canvas height. Travel
    // reads at the same rate as the scene moves under the cursor.
    const travelHall = (dyPx: number) => {
      const c = controls.current
      if (!c || dyPx === 0) return
      const dist = camera.position.distanceTo(c.target)
      // The scene's camera is always a PerspectiveCamera (see Scene.tsx's
      // CAMERA); the union type just needs the narrow before reading fov.
      const fov = 'fov' in camera ? camera.fov : 50
      const worldHeight = 2 * dist * Math.tan(((fov * Math.PI) / 180) / 2)
      const worldPerPx = worldHeight / Math.max(1, el.clientHeight)
      // Scrolling down / dragging up (positive dyPx) carries you DEEPER into
      // the hall, which is −Z. The target moves with the camera so the view
      // translates down the hall without swinging.
      const delta = -dyPx * worldPerPx
      camera.position.z += delta
      c.target.z += delta
      c.update()

      /*
        Tell the rest of the app which station we are now in front of. Without
        this the travel was silent: the generation rail kept highlighting the
        station you started from, and the accent light — the one thing
        MuseumLights calls "what says you are here" — stayed parked over it.

        A passive sync, never `setFocusGeneration`: this must not feed back
        into the destination effect and re-aim the camera mid-drag.
      */
      useScene.getState().syncFocusGeneration(generationNearestZ(MUSEUM_LAYOUT, c.target.z))
    }

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return
      dragging = true
      lastClientY = e.clientY
    }
    const onMove = (e: PointerEvent) => {
      if (!dragging) return
      const s = useScene.getState()
      // The approach owns the camera while it is in flight; a drag that
      // started before 'focusing' must not fight it.
      if (s.screen !== 'shelf' || s.approach !== 'idle') {
        dragging = false
        return
      }
      const dyPx = e.clientY - lastClientY
      lastClientY = e.clientY
      travelHall(dyPx)
    }
    const onUp = () => {
      dragging = false
    }

    // Wheel = the same vertical pan. Non-passive so the pan can preventDefault
    // (the page is overflow-hidden anyway; this keeps the gesture clean on
    // trackpads with momentum). deltaMode normalises lines/pages to pixels.
    const onWheel = (e: WheelEvent) => {
      const s = useScene.getState()
      if (s.screen !== 'shelf' || s.approach !== 'idle') return
      e.preventDefault()
      let dyPx = e.deltaY
      if (e.deltaMode === 1) dyPx *= 16
      else if (e.deltaMode === 2) dyPx *= Math.max(1, el.clientHeight)
      travelHall(dyPx)
    }

    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('pointerup', onUp)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('wheel', onWheel)
      window.removeEventListener('pointerup', onUp)
    }
  }, [onShelf, gl, camera])

  useEffect(() => {
    const state = useScene.getState().approach
    if (state !== 'focusing' && state !== 'retreating') return

    const timers: number[] = []
    const after = (ms: number, fn: () => void) => {
      timers.push(window.setTimeout(fn, ms))
    }

    const tweenOffsetTo = (target: { dx: number; dy: number }, ms: number, ease: string) => {
      offsetTween.current?.kill()
      const from = useScene.getState().frameOffset
      if (from.dx === target.dx && from.dy === target.dy) return
      const proxy = { dx: from.dx, dy: from.dy }
      offsetTween.current = gsap.to(proxy, {
        dx: target.dx,
        dy: target.dy,
        duration: ms / 1000,
        ease,
        onUpdate: () => {
          applyFrameOffset(camera, { dx: proxy.dx, dy: proxy.dy })
          setFrameOffset({ dx: proxy.dx, dy: proxy.dy })
        },
        onComplete: () => {
          applyFrameOffset(camera, target)
          setFrameOffset(target)
          offsetTween.current = null
        },
      })
    }

    if (state === 'focusing') {
      const focusMs = reducedMotion ? 0 : APPROACH_TIMING.FOCUS_HOLD_MS
      const flightMs = reducedMotion ? 0 : APPROACH_TIMING.FLIGHT_MS
      const arriveMs = reducedMotion ? 0 : APPROACH_TIMING.ARRIVE_MS
      const approachShot = computeApproachShot(MUSEUM_LAYOUT, entry, spec)

      after(focusMs, () => {
        if (!advanceApproach('approaching')) return
        /*
          The frame offset ramps in DURING the flight, not after the handoff:
          the console arrives at its final, lifted screen position while the
          camera is still moving, so the room materialises around an
          already-settled subject. Ramping it during `arriving` instead made
          the subject visibly drift upward after the camera had stopped — the
          "console isn't where the camera put it" feel.
        */
        const s = useScene.getState()
        tweenOffsetTo(frameOffsetFor(width, height, s.layout, !s.panelOpen), flightMs, 'power2.inOut')
        applyShot(approachShot, {
          animate: !reducedMotion,
          duration: APPROACH_TIMING.FLIGHT_MS,
        })
      })

      after(focusMs + flightMs, () => {
        // THE HANDOFF. Camera, orbit target and the hero console all move by
        // the identical rigid translation, in this one synchronous block,
        // before any store write — see museum-shots.ts's roomDelta for why
        // that makes the two poses exactly, not approximately, the same
        // pixel. No React render can land between these lines: the store
        // write at the end is what schedules the next one.
        //
        // Kill any tween still owning the camera first. The intro effect's
        // applyShot also kills it in the same commit, but this is the one
        // place a stray onUpdate landing AFTER the translation would rewrite
        // the camera with pre-teleport (museum-space) values — defensive
        // zero is cheaper than the bug it rules out.
        active.current?.kill()
        active.current = null
        // Land EXACTLY on the approach shot's end pose before translating:
        // the flight tween may have been killed a frame short of its end,
        // and the teleport must start from the exact pose — otherwise the
        // console lands a few pixels off and the intro's own snap visibly
        // corrects it (the "jittery" step at the handoff).
        const exact = shotCameraPosition(approachShot, dolly)
        camera.position.set(exact[0], exact[1], exact[2])
        const handoffControls = controls.current
        if (handoffControls) handoffControls.target.set(...approachShot.target)
        const delta = roomDelta(MUSEUM_LAYOUT, entry, spec)
        camera.position.x += delta[0]
        camera.position.y += delta[1]
        camera.position.z += delta[2]
        const c = controls.current
        if (c) {
          c.target.x += delta[0]
          c.target.y += delta[1]
          c.target.z += delta[2]
          c.update()
        }
        const hero = heroGroupRef.current
        if (hero) {
          hero.position.set(...spec.consolePosition)
          hero.rotation.set(...(spec.consoleRotation ?? [0, 0, 0]))
        } else if (import.meta.env.DEV) {
          console.warn('[CameraRig] approach handoff ran with no hero console mounted.')
        }
        // The offset is FULL here, exactly as the flight ramp left it — and
        // it must stay CONSTANT across the handoff (full on both sides of
        // the translation), so the subject does not move a pixel. Snap it to
        // the exact target: the ramp tween may have been killed a frame
        // short, and a sub-pixel residual is exactly the kind of step this
        // handoff exists to prevent.
        offsetTween.current?.kill()
        const s = useScene.getState()
        const frameTarget = frameOffsetFor(width, height, s.layout, !s.panelOpen)
        applyFrameOffset(camera, frameTarget)
        setFrameOffset(frameTarget)
        setScreen('room')
        advanceApproach('arriving')
      })

      after(focusMs + flightMs + arriveMs, () => {
        advanceApproach('idle')
      })
    } else {
      // retreating
      const fadeMs = reducedMotion ? 0 : APPROACH_TIMING.RETREAT_FADE_MS
      const flightMs = reducedMotion ? 0 : APPROACH_TIMING.RETREAT_FLIGHT_MS

      after(fadeMs, () => {
        // The offset stays FULL through the fade (the room view is stable
        // while it goes dark) and across the teleport — constant on both
        // sides, exactly like the forward handoff — then ramps to zero
        // during the flight back, mirroring the forward move.
        offsetTween.current?.kill()
        active.current?.kill()
        active.current = null

        // The mirrored handoff: -delta instead of +delta, back to the shelf.
        const delta = roomDelta(MUSEUM_LAYOUT, entry, spec)
        camera.position.x -= delta[0]
        camera.position.y -= delta[1]
        camera.position.z -= delta[2]
        const c = controls.current
        if (c) {
          c.target.x -= delta[0]
          c.target.y -= delta[1]
          c.target.z -= delta[2]
          c.update()
        }
        const artifact = MUSEUM_LAYOUT.byId[entry.id]
        const hero = heroGroupRef.current
        if (hero && artifact) {
          hero.position.set(...artifact.position)
          hero.rotation.set(...artifact.rotation)
        } else if (import.meta.env.DEV) {
          console.warn('[CameraRig] retreat handoff missing the hero console or its shelf slot.')
        }
        // Land back on the bay this console actually came from, whatever
        // `focusGeneration` happened to be before (it shouldn't have moved,
        // but this is the authoritative source, not an assumption).
        setFocusGeneration(entry.generation)
        setScreen('shelf')

        // Offset out during the pull-back, so the view settles as the camera
        // returns to the bay instead of stepping before it moves.
        tweenOffsetTo(NO_OFFSET, flightMs, 'power2.inOut')

        // `finish()` inside `applyShot` reads `screen` fresh (see its own
        // comment) rather than a value captured when this closure was
        // created, so calling it in the very same tick as `setScreen` above
        // is safe — it will apply the museum's clamps, not the room's.
        const shot = museumShots.get(entry.generation)
        if (shot) applyShot(shot, { animate: !reducedMotion, duration: APPROACH_TIMING.RETREAT_FLIGHT_MS })
      })

      after(fadeMs + flightMs, () => {
        advanceApproach('idle')
      })
    }

    return () => {
      timers.forEach((t) => window.clearTimeout(t))
      offsetTween.current?.kill()
      offsetTween.current = null
    }
    // Deliberately narrow: entry/spec are captured for the whole sequence
    // (consoleId cannot change again until this cycle reaches 'idle' — the
    // UI guards that, see ShelfBay's click handler), and `approach` itself is
    // read once, fresh, above, precisely to avoid this effect re-triggering
    // on its own internal transitions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approachNonce])

  useEffect(() => {
    return () => {
      active.current?.kill()
      offsetTween.current?.kill()
    }
  }, [])

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.06}
      /*
        The shelf's gestures are the vertical-pan drag + wheel owned by the
        effect above: rotate is OFF so a left-drag never orbits the museum
        wall, pan is OFF so OrbitControls' own (horizontal) pan never competes
        with it, and zoom is OFF so the wheel pans instead of dollying. The
        room keeps all three — rotate to look around, pan to bring the
        console's front edge back into the offset framing, zoom to inspect.
      */
      enableRotate={!onShelf}
      enablePan={!onShelf}
      enableZoom={!onShelf}
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
