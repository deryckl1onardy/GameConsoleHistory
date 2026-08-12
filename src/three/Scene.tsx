import { Suspense, useEffect } from 'react'
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

function Effects() {
  const quality = useScene((s) => s.quality)

  if (fxParam === 'none') return null

  if (quality === 'low') {
    // Keep the band and the vignette — together they still read as miniature,
    // and they are the cheapest two effects in the stack.
    return (
      <EffectComposer multisampling={0}>
        <TiltShift2 blur={0.35} taper={0.5} samples={6} />
        <Vignette offset={0.28} darkness={0.72} />
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
      <TiltShift2 blur={1.15} taper={0.9} samples={14} start={[0, 0.44]} end={[1, 0.64]} />
      <Bloom intensity={0.4} luminanceThreshold={0.75} luminanceSmoothing={0.3} mipmapBlur />
      <HueSaturation saturation={0.16} />
      <Vignette offset={0.24} darkness={0.68} />
      <SMAA />
    </EffectComposer>
  )
}

/** Dev-only: expose the camera so framing can be inspected from the console. */
function DebugHandles() {
  const { camera, scene, gl } = useThree()
  useEffect(() => {
    if (!import.meta.env.DEV) return
    const w = window as unknown as Record<string, unknown>
    w.__camera = camera
    w.__scene = scene
    w.__gl = gl
  }, [camera, scene, gl])
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
      <color attach="background" args={[spec.lighting.backdrop]} />

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

      <Suspense fallback={null}>
        <Diorama entry={entry} spec={spec} archetypeId={archetypeId} />
      </Suspense>

      <Effects />
    </Canvas>
  )
}
