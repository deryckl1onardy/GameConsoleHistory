import { useEffect, useLayoutEffect, useRef } from 'react'
import type { AmbientLight, DirectionalLight, Object3D, SpotLight } from 'three'
import gsap from 'gsap'
import { useScene } from '@/store/scene'
import { kelvinToColor } from '../lighting'
import { MUSEUM_LAYOUT } from './layout'
import { APPROACH_TIMING } from './approach'

/**
 * Lighting for the archive.
 *
 * A gallery is dim, but you can still see the whole room — what marks the
 * piece you are standing at is a brighter pool on it, not everything else
 * being switched off. So: a base that reads the entire wall, plus one accent
 * that follows the focused bay, and shifts to a hovered artifact within it.
 *
 * The first version tried to light only the focused bay, with a shadow frustum
 * sized to it. That failed for a reason worth recording: a directional light
 * illuminates everything regardless of its shadow camera, but geometry OUTSIDE
 * that camera's frustum samples the depth map out of range and comes back
 * fully shadowed. Seven of the eight bays rendered black. The shadow frustum
 * therefore covers the WHOLE museum, which it can afford to — the collection
 * is only ~1.6m wide and ~2.8m tall, so a 2048 map still lands near 1.4mm per
 * texel, sharper than the room ever gets.
 *
 * Hover dimming is FOUR NUMBERS on three lights, tweened by GSAP on refs —
 * never a material edit. Shelf materials come from useGLTF's shared cache;
 * mutating opacity/emissive on them would leak into every future user of that
 * same cached object, including the hero console the approach transition
 * later reuses. Ambient and key step down a little, the accent steps up a
 * lot: the hovered piece nets brighter, everything else nets darker, and
 * nothing but numbers changed.
 *
 * Palette: a deliberately WARM near-black, continuous with the app's ink,
 * never the slate-indigo dark scenes default to. The room the approach arrives
 * in is warmer still, so the move reads as stepping out of a cold hall.
 */

/** Cool enough to read as institutional, warm enough to belong to this app. */
const KEY_TEMP_K = 4300
const FILL_TEMP_K = 3100
/** Warmer than the key: a picture light, not daylight. */
const ACCENT_TEMP_K = 3400

/** Half-extents of the shadow frustum, sized to the whole collection. */
const SHADOW_X = 1.5
const SHADOW_Y = 2.1

const REST = { ambient: 0.38, key: 1.5, accent: 6.5 }
const HOVER = { ambient: 0.3, key: 1.15, accent: 9.5 }
const DIM_DURATION = 0.4
/** The transition's own levels — see the approach effect below. */
const FOCUS = { ambient: 0.22, key: 0.85, accent: 4.2 }
const DARK = { ambient: 0, key: 0, accent: 0 }

export function MuseumLights() {
  const focusGeneration = useScene((s) => s.focusGeneration)
  const hoveredId = useScene((s) => s.hoveredId)
  const quality = useScene((s) => s.quality)
  const reducedMotion = useScene((s) => s.reducedMotion)
  const approach = useScene((s) => s.approach)

  const ambientRef = useRef<AmbientLight>(null)
  const keyRef = useRef<DirectionalLight>(null)
  const keyTargetRef = useRef<Object3D>(null)
  const accentRef = useRef<SpotLight>(null)
  const accentTargetRef = useRef<Object3D>(null)

  // A directional/spot light aims at its `target` object, which must itself be
  // in the scene graph. Wiring it once by ref is the standard R3F dance.
  useEffect(() => {
    if (keyRef.current && keyTargetRef.current) keyRef.current.target = keyTargetRef.current
    if (accentRef.current && accentTargetRef.current) {
      accentRef.current.target = accentTargetRef.current
    }
  }, [])

  const { extent } = MUSEUM_LAYOUT
  const midY = (extent.maxY + extent.minY) / 2

  const bay =
    MUSEUM_LAYOUT.bays.find((b) => b.generation === focusGeneration) ?? MUSEUM_LAYOUT.bays[0]
  const bayFocusY = bay.boardY + bay.tallest / 2

  const hovered = hoveredId ? MUSEUM_LAYOUT.byId[hoveredId] : null
  // Whichever the accent should sit over: a hovered artifact if there is one,
  // otherwise the centre of the focused bay.
  const accentX = hovered ? hovered.position[0] : 0
  const accentY = hovered ? hovered.position[1] + hovered.size.height / 2 : bayFocusY

  // The accent's own target and position track the focus/hover smoothly —
  // this is the one light in the scene that visibly moves, so it is tweened
  // rather than snapped, the same GSAP-on-refs discipline as the artifact's
  // own hover step.
  useEffect(() => {
    const target = accentTargetRef.current
    const spot = accentRef.current
    if (!target || !spot) return
    const duration = reducedMotion ? 0 : 0.5
    gsap.to(target.position, { x: accentX, y: accentY, duration, ease: 'power2.inOut' })
    gsap.to(spot.position, { x: accentX * 0.6, y: accentY + 1.15, duration, ease: 'power2.inOut' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accentX, accentY, reducedMotion])

  // Dim the hall, brighten the accent, on hover — never per frame, never a
  // material. Runs once per hover CHANGE, not per pointer move (BayHitPlane
  // already collapses that upstream).
  useEffect(() => {
    const a = ambientRef.current
    const k = keyRef.current
    const s = accentRef.current
    if (!a || !k || !s) return
    const to = hovered ? HOVER : REST
    const duration = reducedMotion ? 0 : DIM_DURATION
    gsap.to(a, { intensity: to.ambient, duration, ease: 'power2.out' })
    gsap.to(k, { intensity: to.key, duration, ease: 'power2.out' })
    gsap.to(s, { intensity: to.accent, duration, ease: 'power2.out' })
  }, [hovered, reducedMotion])

  /*
    The transition's light choreography — the other half of the hero's
    illumination continuity. Diorama ramps the room lights in on arrival and
    out on retreat (Diorama.tsx); this is the museum half:

      focusing    the hall dips while the camera holds on the chosen artifact,
                  giving the dead 260ms beat a visible purpose
      approaching the dip recovers — the handoff happens at FULL museum light
      arriving    the hall goes DARK over the arrival while the room ramps in,
                  so the hero console's illumination crosses over continuously
                  and the museum is provably dark when it unmounts at idle:
                  the unlit shelves vanish into the black, never pop out of
                  frame, and the hero's own light never steps.

    Same GSAP-on-refs discipline as the hover dim: four numbers on three
    lights, never a material edit (shelf materials are useGLTF's shared
    cache — mutating them would leak into the room's hero console).
  */
  useEffect(() => {
    const a = ambientRef.current
    const k = keyRef.current
    const s = accentRef.current
    if (!a || !k || !s) return
    const target =
      approach === 'focusing'
        ? FOCUS
        : approach === 'arriving'
          ? DARK
          : REST
    // Arriving dims faster than the room's own 0.9s ramp so the double-light
    // crossing is brief; focusing matches its 260ms hold.
    const duration = reducedMotion
      ? 0
      : approach === 'arriving'
        ? 0.6
        : approach === 'focusing'
          ? APPROACH_TIMING.FOCUS_HOLD_MS / 1000
          : 0.5
    gsap.to(a, { intensity: target.ambient, duration, ease: 'power2.inOut' })
    gsap.to(k, { intensity: target.key, duration, ease: 'power2.inOut' })
    gsap.to(s, { intensity: target.accent, duration, ease: 'power2.inOut' })
  }, [approach, reducedMotion])

  // Ramp in from dark after the RETREAT remounts the hall: the room has just
  // gone dark, so the museum must come up, not snap on. Read once at mount
  // (the Diorama trick) — a fresh shelf load (?screen=shelf, first paint) has
  // approach === 'idle' and wants the lights there immediately.
  // LAYOUT effect: a plain effect would paint the remount one frame at full
  // JSX intensity — a flash of the hall mid-fade — before zeroing it.
  useLayoutEffect(() => {
    const cameFromRetreat = useScene.getState().approach !== 'idle'
    if (!cameFromRetreat) return
    const a = ambientRef.current
    const k = keyRef.current
    const s = accentRef.current
    if (!a || !k || !s) return
    a.intensity = 0
    k.intensity = 0
    s.intensity = 0
    const duration = useScene.getState().reducedMotion ? 0 : 0.45
    gsap.to(a, { intensity: REST.ambient, duration, ease: 'power2.out' })
    gsap.to(k, { intensity: REST.key, duration, ease: 'power2.out' })
    gsap.to(s, { intensity: REST.accent, duration, ease: 'power2.out' })
    // Mount-only, same as Diorama's arrival ramp.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <group>
      {/*
        The base level of the hall. Low enough to stay a dark archive, high
        enough that an unfocused bay is legible rather than a silhouette —
        the collection is the content, and content you cannot see is not
        restraint, it is a bug.
      */}
      <ambientLight ref={ambientRef} intensity={REST.ambient} color={kelvinToColor(FILL_TEMP_K)} />

      <object3D ref={keyTargetRef} position={[0, midY, 0]} />

      <directionalLight
        // three caches shadow.map on first render, so a runtime mapSize change
        // silently no-ops without a remount.
        key={quality}
        ref={keyRef}
        position={[-2.1, midY + 2.4, 3.4]}
        intensity={REST.key}
        color={kelvinToColor(KEY_TEMP_K)}
        castShadow
        shadow-mapSize={quality === 'low' ? [1024, 1024] : [2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      >
        <orthographicCamera
          attach="shadow-camera"
          args={[-SHADOW_X, SHADOW_X, SHADOW_Y, -SHADOW_Y, 0.1, 14]}
        />
      </directionalLight>

      {/*
        Counter from the opposite side so the unlit face of a console is shaped
        rather than solid black. No shadow — one shadow pass is the budget, and
        a second only muddies the key's.
      */}
      <directionalLight
        position={[2.6, midY + 0.9, 2.2]}
        intensity={0.42}
        color={kelvinToColor(FILL_TEMP_K)}
      />

      {/*
        The accent: a picture light over whichever bay (or, hovered, artifact)
        currently has focus. This is what says "you are here", and it is the
        same mechanism the later approach transition ramps to full — so there
        is only ever one way a thing gets emphasised in this scene.
      */}
      <object3D ref={accentTargetRef} position={[0, bayFocusY, 0]} />
      <spotLight
        ref={accentRef}
        position={[0, bayFocusY + 1.15, 1.5]}
        intensity={REST.accent}
        distance={4.2}
        angle={0.62}
        penumbra={1}
        decay={1.6}
        color={kelvinToColor(ACCENT_TEMP_K)}
      />
    </group>
  )
}
