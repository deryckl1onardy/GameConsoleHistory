import { Suspense, useEffect, useLayoutEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
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
import { CAMERA_FOV_DEG } from './shots'
import { HeroConsole, heroGroupRef } from './HeroConsole'
import {
  useActiveArchetypeId,
  useActiveConsole,
  useActiveDiorama,
  useScene,
} from '@/store/scene'

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
  fov: CAMERA_FOV_DEG,
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
 * Post-processing — the room's miniature kit. The tilt-shift band is a
 * MINIATURE effect: it blurs by screen position so a real-sized room reads as
 * a model on a table. Ambient occlusion and antialiasing describe solid
 * objects in a space; bloom, the band, a saturation lift and a faint vignette
 * fake the lens.
 */
function Effects() {
  const quality = useScene((s) => s.quality)
  const mode = useScene((s) => s.mode)
  // The room's frame offset lifts the subject up on screen (frame.ts), so the
  // focus band has to rise with it or the console renders permanently blurred
  // while the chrome says it's sharp. CameraRig mirrors the applied offset
  // here via the store, tweening it on the same beat as the arrival — the
  // band follows the subject instead of fighting it. UV origin is bottom-left
  // in these shaders, which is why the shift is +dy and not -dy.
  const offset = useScene((s) => s.frameOffset)
  const bandStart = 0.44 + offset.dy
  const bandEnd = 0.64 + offset.dy

  /*
    The tilt-shift band is tuned to where the CONSOLE sits on screen, not
    where the library shot's media spread ends up — the spread sits off to
    the console's side and lower in frame, well outside that band, which
    rendered every cartridge permanently blurred regardless of how good the
    geometry or the art was. The toy-diorama illusion the band exists for
    also doesn't apply once you're this close, inspecting individual boxes —
    sharpness matters more there than the miniature effect. Skip it entirely
    in library and artifact mode rather than trying to re-tune a moving band
    per shot (artifact is the same argument, one box closer).
  */
  const showTiltShift = mode !== 'library' && mode !== 'artifact'

  if (fxParam === 'none') return null

  if (quality === 'low') {
    // Low quality drops to the two cheapest effects.
    return (
      <EffectComposer multisampling={0}>
        {showTiltShift && (
          <TiltShift2 blur={0.35} taper={0.5} samples={6} start={[0, bandStart]} end={[1, bandEnd]} />
        )}
        <Vignette offset={0.4} darkness={0.22} />
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
        small object". See showTiltShift above for why it's skipped in library
        mode.
      */}
      {showTiltShift && (
        <TiltShift2 blur={1.15} taper={0.9} samples={14} start={[0, bandStart]} end={[1, bandEnd]} />
      )}
      <Bloom intensity={0.4} luminanceThreshold={0.75} luminanceSmoothing={0.3} mipmapBlur />
      <HueSaturation saturation={0.16} />
      {/*
        A near-black backdrop could carry a heavy vignette; a white gallery
        one cannot — the same darkening that used to read as cinematic focus
        reads as dirt smeared into the corners of a bright room. Kept faint
        rather than removed: the room still wants a soft lens falloff, just
        not one heavy enough to fight its own backdrop.
      */}
      <Vignette offset={0.4} darkness={0.22} />
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

  return (
    <mesh position={[0, 2, -14]}>
      <planeGeometry args={[90, 50]} />
      <meshBasicMaterial color={spec.lighting.backdrop} toneMapped={false} />
    </mesh>
  )
}

/**
 * The far background, owned here (not via <color attach>) so the colour can
 * change with the console. Each console's era room has its own backdrop, so
 * switching consoles warms or cools the whole world behind the set.
 */
function Background() {
  const scene = useThree((s) => s.scene)
  const spec = useActiveDiorama()

  // Layout effect so the very first paint never shows a null/transparent
  // background (R3F's default) before the colour is established.
  useLayoutEffect(() => {
    if (!(scene.background instanceof THREE.Color)) {
      scene.background = new THREE.Color(spec.lighting.backdrop)
    } else {
      scene.background.copy(new THREE.Color(spec.lighting.backdrop))
    }
  }, [spec.lighting.backdrop, scene])

  return null
}

export function Scene() {
  const entry = useActiveConsole()
  const spec = useActiveDiorama()
  const archetypeId = useActiveArchetypeId()
  const setQuality = useScene((s) => s.setQuality)

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
      <Backdrop />
      <DebugHandles />

      {/*
        Mounted unconditionally — this is the ONE instance of whichever
        console is active. Diorama never renders a console itself; see
        HeroConsole.tsx for why exactly one owner is the whole point.
      */}
      <HeroConsole />

      <Suspense fallback={null}>
        <Diorama entry={entry} spec={spec} archetypeId={archetypeId} />
      </Suspense>

      <Effects />
    </Canvas>
  )
}
