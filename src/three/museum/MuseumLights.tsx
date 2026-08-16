import { useEffect, useLayoutEffect, useRef } from 'react'
import type { AmbientLight, DirectionalLight, Object3D, SpotLight } from 'three'
import gsap from 'gsap'
import { useScene } from '@/store/scene'
import { kelvinToColor } from '../lighting'
import { STAGE_ANCHOR } from './hall-glide'
import { MUSEUM_LAYOUT } from './layout'
import { APPROACH_TIMING } from './approach'
import { MUSEUM_SHELL_LAYER } from './layers'

/**
 * Lighting for the hall.
 *
 * This is a MODERN WHITE GALLERY, which is a different lighting problem from
 * the dark archive it replaced, and the old approach would be actively wrong
 * here. A dark room marks its current piece by being dark everywhere else and
 * dropping one bright pool; a white gallery is evenly and generously lit
 * throughout, and a hard spotlight in one would read as a mistake rather than
 * as emphasis. So the levels are inverted: a high ambient that lifts the whole
 * hall, a soft key for form and contact shadows, and a *gentle* wash over the
 * stage — the one fixed point every focused console presents on — rather
 * than a theatrical pool.
 *
 * The rig is STATIC by design. The camera is bolted down while browsing and
 * the hall glides consoles to the stage, so the lights never need to chase a
 * station or a hovered artifact: one key angle and one accent pool, fixed on
 * the stage, with the shadow frustum shrunk to match (6× the texel density on
 * the one console anyone is looking at).
 *
 * The consoles do the contrasting. They are dark, saturated, plastic objects
 * against white plaster, which is exactly why a bright hall shows them off
 * better than a dark one ever did — a museum paints its walls white for this
 * reason.
 *
 * Hover dimming is FOUR NUMBERS on three lights, tweened by GSAP on refs —
 * never a material edit. Shelf materials come from useGLTF's shared cache;
 * mutating opacity/emissive on them would leak into every future user of that
 * same cached object, including the hero console the approach transition later
 * reuses.
 */

/** Gallery daylight-ish. Cool enough to read as institutional, not clinical. */
const KEY_TEMP_K = 5200
const FILL_TEMP_K = 5600
/** The accent is barely warmer than the key — a wash, not a stage light. */
const ACCENT_TEMP_K = 4600

/**
 * Half-extents of the shadow frustum. The hall used to need ±5/far-60 to
 * cover every station at once; the rig is now STATIC, aimed at the stage —
 * the one console anyone is looking at — so the frustum shrinks to about
 * ±2/far-12, a roughly 6× gain in shadow texel density on the subject.
 * (The rest of the hall renders without a key-light shadow term, which is
 * fine: the stage is where the collection presents itself, and the ambient
 * carries the rest of the room.)
 */
const SHADOW_X = 2
const SHADOW_Y = 2
const SHADOW_FAR = 12

/*
  A white gallery's numbers are almost the inverse of the archive's: ambient
  carries the room and the accent only tips the balance. Hovering lifts the
  accent slightly and takes a little off the fill, so the hovered console gains
  contrast without the hall visibly dimming — dimming a white room to
  emphasise something looks like a fault, not a focus.
*/
const REST = { ambient: 2.05, key: 1.35, accent: 1.6 }
const HOVER = { ambient: 1.92, key: 1.3, accent: 2.6 }
const DIM_DURATION = 0.4
/** The transition's own levels — see the approach effect below. */
const FOCUS = { ambient: 1.5, key: 1.05, accent: 2.4 }
const DARK = { ambient: 0, key: 0, accent: 0 }

export function MuseumLights() {
  const hoveredId = useScene((s) => s.hoveredId)
  const quality = useScene((s) => s.quality)
  const reducedMotion = useScene((s) => s.reducedMotion)
  const approach = useScene((s) => s.approach)

  const ambientRef = useRef<AmbientLight>(null)
  const keyRef = useRef<DirectionalLight>(null)
  const keyTargetRef = useRef<Object3D>(null)
  const fillRef = useRef<DirectionalLight>(null)
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

  // Every museum light also carries the shell's own layer (see layers.ts) —
  // ADDING it, not replacing, since these still need to illuminate the
  // plinths and consoles sitting on the default layer too.
  useEffect(() => {
    for (const l of [ambientRef.current, keyRef.current, fillRef.current, accentRef.current]) {
      l?.layers.enable(MUSEUM_SHELL_LAYER)
    }
  }, [])

  const { hall } = MUSEUM_LAYOUT

  // The rig is STATIC: the stage is where every focused console presents, so
  // there is no per-focus or per-hover target to chase — one fixed point,
  // one key angle, one accent pool. This is what lets the shadow frustum
  // shrink to the stage (see SHADOW_X above) and what makes the focused
  // console's lighting identical no matter which machine it is.
  const stageFocus: [number, number, number] = [
    STAGE_ANCHOR[0],
    STAGE_ANCHOR[1] + 0.12,
    STAGE_ANCHOR[2],
  ]

  const hovered = Boolean(hoveredId)

  // Lift the accent on hover — never per frame, never a material. Runs once
  // per hover CHANGE, not per pointer move (BayHitPlane collapses that
  // upstream).
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
      approaching the dip recovers — the handoff happens at FULL hall light
      arriving    the hall goes DARK over the arrival while the room ramps in,
                  so the hero console's illumination crosses over continuously
                  and the museum is provably dark when it unmounts at idle

    The arrival matters more in a white gallery than it did in the archive: the
    hall is now BRIGHTER than the era room it hands over to, so this ramp is
    carrying a much larger change in level. It runs slightly longer than the
    old 0.6s for that reason — dropping two stops of light in half a second
    reads as a cut, not a transition.
  */
  useEffect(() => {
    const a = ambientRef.current
    const k = keyRef.current
    const s = accentRef.current
    if (!a || !k || !s) return
    const target =
      approach === 'focusing' ? FOCUS : approach === 'arriving' ? DARK : REST
    const duration = reducedMotion
      ? 0
      : approach === 'arriving'
        ? 0.75
        : approach === 'focusing'
          ? APPROACH_TIMING.FOCUS_HOLD_MS / 1000
          : 0.5
    gsap.to(a, { intensity: target.ambient, duration, ease: 'power2.inOut' })
    gsap.to(k, { intensity: target.key, duration, ease: 'power2.inOut' })
    gsap.to(s, { intensity: target.accent, duration, ease: 'power2.inOut' })
  }, [approach, reducedMotion])

  // Ramp in from dark after the RETREAT remounts the hall: the room has just
  // gone dark, so the museum must come up, not snap on. Read once at mount
  // (the Diorama trick) — a fresh shelf load has approach === 'idle' and wants
  // the lights there immediately. LAYOUT effect: a plain effect would paint
  // the remount one frame at full JSX intensity — a flash of a bright white
  // hall mid-fade, which in this palette would be genuinely unpleasant.
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
    const duration = useScene.getState().reducedMotion ? 0 : 0.5
    gsap.to(a, { intensity: REST.ambient, duration, ease: 'power2.out' })
    gsap.to(k, { intensity: REST.key, duration, ease: 'power2.out' })
    gsap.to(s, { intensity: REST.accent, duration, ease: 'power2.out' })
    // Mount-only, same as Diorama's arrival ramp.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <group>
      {/*
        The hall's own level. High, because this is a white gallery and the
        walls are meant to be bright — the collection reads as dark objects
        against light, which is the whole reason galleries are painted this way.
      */}
      <ambientLight ref={ambientRef} intensity={REST.ambient} color={kelvinToColor(FILL_TEMP_K)} />

      <object3D ref={keyTargetRef} position={stageFocus} />

      {/*
        The key comes from high and slightly to one side of the stage. Its
        real job here is not brightness — ambient handles that — but SHAPE:
        without a directional source the consoles would sit in flat white with
        no contact shadow and no modelling, which is the failure mode of a
        naive bright scene.
      */}
      <directionalLight
        // three caches shadow.map on first render, so a runtime mapSize change
        // silently no-ops without a remount.
        key={quality}
        ref={keyRef}
        position={[STAGE_ANCHOR[0] - 3.2, hall.height + 1.5, STAGE_ANCHOR[2] + 4]}
        intensity={REST.key}
        color={kelvinToColor(KEY_TEMP_K)}
        castShadow
        shadow-mapSize={quality === 'low' ? [1024, 1024] : [2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      >
        {/*
          The frustum is sized to the STAGE, the one console anyone is looking
          at: ±2 × far-12 instead of the whole hall. This is the 6× texel
          density win — but it is also a deliberate trade: geometry outside
          the frustum samples the depth map out of range and comes back fully
          shadowed, so the far consoles in the hall lose their key-light
          shadow term and are carried by the ambient + fill. That is the
          point of a stage: one subject, crisply lit; the collection recedes
          around it.
        */}
        <orthographicCamera
          attach="shadow-camera"
          args={[-SHADOW_X, SHADOW_X, SHADOW_Y, -SHADOW_Y, 0.1, SHADOW_FAR]}
        />
      </directionalLight>

      {/* Counter-fill from the other side so no console face goes solid. */}
      <directionalLight
        ref={fillRef}
        position={[3.6, hall.height, 2]}
        intensity={0.5}
        color={kelvinToColor(FILL_TEMP_K)}
      />

      {/*
        The accent: a soft wash over the stage, where every focused console
        presents. Fixed, like the whole rig — this is what says \"you are
        here\", and it is the same mechanism the approach transition ramps to
        full, so there is only ever one way a thing gets emphasised in this
        scene.
      */}
      <object3D ref={accentTargetRef} position={stageFocus} />
      <spotLight
        ref={accentRef}
        // Hangs from the ceiling just in front of the stage.
        position={[STAGE_ANCHOR[0] * 0.7, hall.height - 0.25, STAGE_ANCHOR[2] + 0.9]}
        intensity={REST.accent}
        distance={7}
        angle={0.7}
        penumbra={1}
        decay={1.2}
        color={kelvinToColor(ACCENT_TEMP_K)}
      />
    </group>
  )
}
