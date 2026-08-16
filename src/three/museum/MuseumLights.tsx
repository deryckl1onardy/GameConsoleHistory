import { useEffect, useLayoutEffect, useRef } from 'react'
import type { AmbientLight, DirectionalLight, Object3D, SpotLight } from 'three'
import gsap from 'gsap'
import { useScene } from '@/store/scene'
import { kelvinToColor } from '../lighting'
import { MUSEUM_LAYOUT } from './layout'
import { APPROACH_TIMING } from './approach'

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
 * current station rather than a theatrical pool.
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

/** Half-extents of the shadow frustum. Sized to the hall, not to one station. */
const SHADOW_X = 5
const SHADOW_Y = 5

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

  const { hall } = MUSEUM_LAYOUT

  const bay =
    MUSEUM_LAYOUT.bays.find((b) => b.generation === focusGeneration) ?? MUSEUM_LAYOUT.bays[0]
  const bayFocus: [number, number, number] = [
    bay.boardCenter[0],
    bay.boardY + bay.tallest / 2,
    bay.boardCenter[2],
  ]

  const hovered = hoveredId ? MUSEUM_LAYOUT.byId[hoveredId] : null
  // Whichever the accent should sit over: a hovered artifact if there is one,
  // otherwise the centre of the current station.
  const accentTarget: [number, number, number] = hovered
    ? [hovered.position[0], hovered.position[1] + hovered.size.height / 2, hovered.position[2]]
    : bayFocus

  /*
    The accent follows the current station down the HALL now, not just up and
    down a wall — so it tracks Z as well as X and Y. It is the one light in the
    scene that visibly moves, so it is tweened rather than snapped, the same
    GSAP-on-refs discipline as the artifact's own hover step.
  */
  useEffect(() => {
    const target = accentTargetRef.current
    const spot = accentRef.current
    if (!target || !spot) return
    const duration = reducedMotion ? 0 : 0.5
    gsap.to(target.position, {
      x: accentTarget[0],
      y: accentTarget[1],
      z: accentTarget[2],
      duration,
      ease: 'power2.inOut',
    })
    // Hangs from the ceiling just in front of whatever it is lighting.
    gsap.to(spot.position, {
      x: accentTarget[0] * 0.7,
      y: hall.height - 0.25,
      z: accentTarget[2] + 0.9,
      duration,
      ease: 'power2.inOut',
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accentTarget[0], accentTarget[1], accentTarget[2], reducedMotion, hall.height])

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

      <object3D ref={keyTargetRef} position={[0, 1, -8]} />

      {/*
        The key comes from high and slightly to one side, down the hall. Its
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
        position={[-3.2, hall.height + 1.5, 4]}
        intensity={REST.key}
        color={kelvinToColor(KEY_TEMP_K)}
        castShadow
        shadow-mapSize={quality === 'low' ? [1024, 1024] : [2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      >
        {/*
          The frustum has to cover the whole hall, not one station: geometry
          outside a shadow camera's frustum samples the depth map out of range
          and comes back FULLY SHADOWED, which in the previous version rendered
          seven of eight bays black. Far plane runs the length of the hall.
        */}
        <orthographicCamera
          attach="shadow-camera"
          args={[-SHADOW_X, SHADOW_X, SHADOW_Y, -SHADOW_Y, 0.1, 60]}
        />
      </directionalLight>

      {/* Counter-fill from the other side so no console face goes solid. */}
      <directionalLight
        position={[3.6, hall.height, 2]}
        intensity={0.5}
        color={kelvinToColor(FILL_TEMP_K)}
      />

      {/*
        The accent: a soft wash over whichever station (or, hovered, artifact)
        currently has focus. This is what says "you are here" — and it is the
        same mechanism the approach transition ramps to full, so there is only
        ever one way a thing gets emphasised in this scene.
      */}
      <object3D ref={accentTargetRef} position={bayFocus} />
      <spotLight
        ref={accentRef}
        position={[bayFocus[0] * 0.7, hall.height - 0.25, bayFocus[2] + 0.9]}
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
