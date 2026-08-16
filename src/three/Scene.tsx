import { Suspense, useEffect, useLayoutEffect, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import { PerformanceMonitor } from '@react-three/drei'
import {
  Bloom,
  EffectComposer,
  HueSaturation,
  N8AO,
  SMAA,
  TiltShift2,
  Vignette,
} from '@react-three/postprocessing'
import * as THREE from 'three'
import { Diorama } from './Diorama'
import { CameraRig } from './CameraRig'
import { HeroConsole, heroGroupRef } from './HeroConsole'
import { MuseumScene } from './museum/MuseumScene'
import {
  useActiveArchetypeId,
  useActiveConsole,
  useActiveDiorama,
  useScene,
  useSceneMounts,
} from '@/store/scene'
import { APPROACH_TIMING } from './museum/approach'

/**
 * The tilt-shift toy diorama look.
 *
 * Real miniature-faking photography is a long lens from far away with a
 * horizontal band of focus. Both halves matter:
 *
 *   1. Long lens, big standoff. A 24° lens 13m back flattens perspective the way
 *      a macro shot of an actual model does. Getting close with a wide lens
 *      reads as "room", not "model" — no amount of blur fixes that.
 *   2. A screen-space focus band (TiltShift2), not depth-of-field. A tilt-shift
 *      lens blurs by screen position, not distance, which is precisely why the
 *      effect fools the eye about scale.
 *   3. Ambient occlusion in the corners and a saturation lift. Toy plastic is
 *      more saturated and more contact-shadowed than real furniture.
 */

/**
 * Only the lens lives here now — every position and target comes from the shot
 * system in `shots.ts`, and CameraRig is the one thing allowed to apply them.
 *
 * A 24° vertical lens is a long one. That is deliberate: flattened perspective
 * is what makes a set read as a miniature, and it holds up equally well on a
 * 20cm console at 1.2m and a 4.2m room at 13m.
 */
const CAMERA = {
  fov: 24,
  position: [7.5, 5.7, 8.75] as [number, number, number],
  near: 0.05,
  far: 120,
}

/**
 * Dev bisect switch: ?fx=none disables post entirely, ?fx=noao drops N8AO.
 * Post-processing failures render as a black frame with a perfectly healthy
 * scene graph, which is otherwise slow to diagnose.
 */
const fxParam =
  typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('fx')
    : null

/**
 * Post-processing, and it is NOT the same for both screens.
 *
 * The tilt-shift band is a MINIATURE effect: it blurs by screen position so a
 * real-sized room reads as a model on a table. That is exactly right for the
 * room and exactly wrong for the shelf, where the subject is a whole
 * collection and the neighbouring generations are the content — blurring them
 * dissolved every bay but one into an unreadable smear and fought the one
 * thing the shelf exists to do. It used to apply to both screens because this
 * component never knew which screen it was on.
 *
 * The shelf keeps the effects that describe SOLID OBJECTS IN A SPACE —
 * ambient occlusion and antialiasing — and drops the ones that fake a lens:
 * the band, the bloom, and the heavy vignette (which on a bright gallery
 * would read as dirt in the corners rather than as focus).
 */
function Effects() {
  const quality = useScene((s) => s.quality)
  const screen = useScene((s) => s.screen)
  // The room's frame offset lifts the subject up on screen (frame.ts), so the
  // focus band has to rise with it or the console renders permanently blurred
  // while the chrome says it's sharp. CameraRig mirrors the applied offset
  // here via the store, tweening it on the same beat as the arrival — the
  // band follows the subject instead of fighting it. UV origin is bottom-left
  // in these shaders, which is why the shift is +dy and not -dy.
  const offset = useScene((s) => s.frameOffset)
  const bandStart = 0.44 + offset.dy
  const bandEnd = 0.64 + offset.dy

  if (fxParam === 'none') return null

  const onShelf = screen === 'shelf'

  if (quality === 'low') {
    // Low quality drops to the two cheapest effects. On the shelf that leaves
    // nothing worth composing for, so it renders untouched rather than paying
    // for a pass that only darkens the corners.
    if (onShelf) return null
    return (
      <EffectComposer multisampling={0}>
        <TiltShift2 blur={0.35} taper={0.5} samples={6} start={[0, bandStart]} end={[1, bandEnd]} />
        <Vignette offset={0.28} darkness={0.72} />
      </EffectComposer>
    )
  }

  if (onShelf) {
    return (
      <EffectComposer multisampling={0}>
        {fxParam !== 'noao' && (
          <N8AO aoRadius={0.45} intensity={2.2} distanceFalloff={0.8} quality="medium" />
        )}
        <SMAA />
      </EffectComposer>
    )
  }

  return (
    <EffectComposer multisampling={0}>
      {/* Contact shadows in every corner — the single biggest "solid object" cue */}
      {fxParam !== 'noao' && (
        <N8AO aoRadius={0.45} intensity={2.2} distanceFalloff={0.8} quality="medium" />
      )}
      {/*
        The focus band is narrow and sits slightly below centre, where the set
        actually is. A wide band does nothing — the whole point is that only a
        shallow slice is sharp, which is what the eye reads as "very close to a
        small object".
      */}
      <TiltShift2 blur={1.15} taper={0.9} samples={14} start={[0, bandStart]} end={[1, bandEnd]} />
      <Bloom intensity={0.4} luminanceThreshold={0.75} luminanceSmoothing={0.3} mipmapBlur />
      <HueSaturation saturation={0.16} />
      <Vignette offset={0.24} darkness={0.68} />
      <SMAA />
    </EffectComposer>
  )
}

/**
 * Dev-only: expose the camera so framing can be inspected from the console.
 * `__store` is here too because the scene is driven entirely by store state —
 * without it, checking why the camera is somewhere means guessing.
 */
function DebugHandles() {
  const { camera, scene, gl, controls } = useThree()
  useEffect(() => {
    if (!import.meta.env.DEV) return
    const w = window as unknown as Record<string, unknown>
    w.__camera = camera
    w.__scene = scene
    w.__gl = gl
    w.__controls = controls
    w.__store = useScene
    w.__THREE = THREE
    w.__heroRef = heroGroupRef
  }, [camera, scene, gl, controls])
  return null
}

function Backdrop() {
  const spec = useActiveDiorama()
  const approach = useScene((s) => s.approach)
  const reducedMotion = useScene((s) => s.reducedMotion)
  const matRef = useRef<THREE.MeshBasicMaterial>(null)

  /*
    Fade in over the arrival instead of popping in behind the handoff. The
    sheet is an UNLIT material, so it stays at full brightness while the room
    lights are still ramping — an opacity fade keeps it in step with the
    world. Read once at mount (the Diorama trick): a direct room load
    (?screen=room) had approach === 'idle' and wants the sheet there.
    LAYOUT effect: a plain effect would paint one frame of the opaque sheet
    behind the handoff before zeroing it.
  */
  useLayoutEffect(() => {
    const cameFromApproach = useScene.getState().approach !== 'idle'
    const m = matRef.current
    if (!m || !cameFromApproach) return
    m.opacity = 0
    const duration = useScene.getState().reducedMotion ? 0 : APPROACH_TIMING.ARRIVE_MS / 1000
    gsap.to(m, { opacity: 1, duration, ease: 'power2.out' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Retreat: go transparent during the fade so the teleport never leaves a
  // bright unlit sheet behind the museum for a frame.
  useEffect(() => {
    if (approach !== 'retreating') return
    const m = matRef.current
    if (!m) return
    const duration = reducedMotion ? 0 : APPROACH_TIMING.RETREAT_FADE_MS / 1000
    gsap.to(m, { opacity: 0, duration, ease: 'power2.in' })
  }, [approach, reducedMotion])

  return (
    <mesh position={[0, 2, -14]}>
      <planeGeometry args={[90, 50]} />
      <meshBasicMaterial
        ref={matRef}
        color={spec.lighting.backdrop}
        toneMapped={false}
        transparent
      />
    </mesh>
  )
}

/**
 * The far background, owned here (not via <color attach>) so its colour can
 * be TWEENED across the handoff instead of snapping. The hall warms into the
 * era room's backdrop over the arrival and cools back over the retreat fade —
 * same clock as the lights, so the whole world changes at one speed.
 */
function Background() {
  const scene = useThree((s) => s.scene)
  const spec = useActiveDiorama()
  const screen = useScene((s) => s.screen)
  const approach = useScene((s) => s.approach)
  const reducedMotion = useScene((s) => s.reducedMotion)

  // Layout effect so the very first paint never shows a null/transparent
  // background (R3F's default) before the colour is established.
  useLayoutEffect(() => {
    if (!(scene.background instanceof THREE.Color)) {
      scene.background = new THREE.Color(MUSEUM_BACKDROP)
    }
    const bg = scene.background as THREE.Color
    const target = new THREE.Color(
      screen === 'room' ? spec.lighting.backdrop : MUSEUM_BACKDROP,
    )
    const ms =
      approach === 'arriving'
        ? APPROACH_TIMING.ARRIVE_MS
        : approach === 'retreating'
          ? APPROACH_TIMING.RETREAT_FADE_MS
          : 0
    const duration = ms > 0 && !reducedMotion ? ms / 1000 : 0
    gsap.killTweensOf(bg)
    if (duration === 0) {
      bg.copy(target)
      return
    }
    gsap.to(bg, { r: target.r, g: target.g, b: target.b, duration, ease: 'power2.inOut' })
  }, [screen, approach, spec.lighting.backdrop, reducedMotion, scene])

  return null
}

/**
 * The archive's own ground. A warm near-black continuous with the app's ink —
 * not the slate-indigo that dark scenes default to. The room's backdrop is
 * warmer still, so the approach reads as moving from a cold hall into a home.
 */
const MUSEUM_BACKDROP = '#0d0b09'

export function Scene() {
  const entry = useActiveConsole()
  const spec = useActiveDiorama()
  const archetypeId = useActiveArchetypeId()
  const setQuality = useScene((s) => s.setQuality)
  const { museum, room } = useSceneMounts()

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={CAMERA}
      gl={{
        antialias: false,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
      }}
    >
      <Background />

      {/*
        Ignore readings taken while the tab is hidden. Backgrounded tabs get
        throttled rAF, which the monitor reads as a struggling GPU and
        permanently downgrades quality — so a user who switches tabs once comes
        back to a worse-looking scene on a machine that was coping fine.
      */}
      <PerformanceMonitor
        onDecline={() => {
          if (!document.hidden) setQuality('low')
        }}
        onIncline={() => {
          if (!document.hidden) setQuality('high')
        }}
      />

      <CameraRig />
      {/*
        The backdrop plane is meshBasicMaterial, so it ignores lights entirely
        and would stay lit while the museum goes dark. It belongs to the room
        only; `scene.background` covers the museum.
      */}
      {room && <Backdrop />}
      <DebugHandles />

      {/*
        Mounted unconditionally, outside both branches below — this is the
        ONE instance of whichever console is active, whichever screen is
        showing. Neither MuseumScene nor Diorama render a console themselves;
        see HeroConsole.tsx for why exactly one owner is the whole point.
      */}
      <HeroConsole />

      {/*
        One Suspense per SCENE rather than one for everything. The old single
        boundary meant any suspending child blanked the entire diorama; with
        twelve models on a shelf that would have strobed the whole museum.
      */}
      {museum && (
        <Suspense fallback={null}>
          <MuseumScene />
        </Suspense>
      )}

      {room && (
        <Suspense fallback={null}>
          <Diorama entry={entry} spec={spec} archetypeId={archetypeId} />
        </Suspense>
      )}

      <Effects />
    </Canvas>
  )
}
