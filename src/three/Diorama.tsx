import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import type { AmbientLight, DirectionalLight } from 'three'
import gsap from 'gsap'
import type { ConsoleEntry, DioramaSpec, MediaArchetypeId } from '@/types/console'
import { useScene } from '@/store/scene'
import { kelvinToColor, mm } from './lighting'
import { ContactShadow } from './ContactShadow'

/**
 * Lighting for the room screen. That's it — no walls, furniture, TV,
 * controller placement or game shelf.
 *
 * This used to build the full period room (RoomShell, Prop, TvPlaceholder,
 * GameShelf, a placed ControllerModel) around whichever console HeroConsole
 * was showing. Pulled out because too much of it was clipping — walls into
 * the console, props into each other — and it wasn't worth chasing down
 * piece by piece right now. `entry`/`archetypeId` stay as props (unused for
 * now) because every removed piece read from them, and the signature
 * shouldn't need to change again if the room comes back.
 *
 * Nothing here is deleted from the data model or the type system — DioramaSpec
 * still carries footprint/props/tv/shelfPosition/controllerPosition, GameShelf
 * and the prop kit still exist, `entry.controllers[0]` is still real data. This
 * component just stops drawing any of it. Re-adding the room later is
 * restoring the JSX that used to live here, not rebuilding the model.
 */

/** The fill's fixed intensity — never varies by console, so a plain constant. */
const FILL_INTENSITY = 0.35

export function Diorama({
  entry,
  spec,
}: {
  entry: ConsoleEntry
  spec: DioramaSpec
  archetypeId: MediaArchetypeId
}) {
  const keyColor = useMemo(
    () => kelvinToColor(spec.lighting.tempK),
    [spec.lighting.tempK],
  )

  /*
    The contact shadow's disc radius, sized off the console's real footprint:
    just beyond the longest side, so the dark core hides under the console
    and the soft edge peeks out around it. A disc is rotation-invariant, so
    the console's yaw never fights it.
  */
  const shadowRadius = useMemo(() => {
    const w = mm(entry.dimensions.width)
    const d = mm(entry.dimensions.depth)
    return Math.max(w, d) * 0.9
  }, [entry.dimensions.width, entry.dimensions.depth])

  const approach = useScene((s) => s.approach)
  const ambientRef = useRef<AmbientLight>(null)
  const keyRef = useRef<DirectionalLight>(null)
  const fillRef = useRef<DirectionalLight>(null)

  /*
    Fade up from black on arrival — but only when there WAS an arrival.
    Diorama mounts fresh exactly when `screen` flips to 'room', which is
    either the tail end of the approach handoff (lights should ramp in) or a
    plain direct room load with no museum ever involved (?screen=room, or
    before this screen existed at all — lights should just be there, full
    brightness, no unmotivated fade). `useScene.getState()` here, read once
    at mount, not the reactive `approach` this component also holds below:
    we want the value as it stood the INSTANT this component appeared, not
    whatever it becomes a moment later when the approach effect advances it
    to 'arriving'.

    LAYOUT effect, deliberately: a plain effect would paint one frame with
    the lights at their full JSX intensities before zeroing them — a double-
    lit flash at the handoff. Zeroing must land before first paint.
  */
  useLayoutEffect(() => {
    const cameFromApproach = useScene.getState().approach !== 'idle'
    if (!cameFromApproach) return
    const a = ambientRef.current
    const k = keyRef.current
    const f = fillRef.current
    if (!a || !k || !f) return
    a.intensity = 0
    k.intensity = 0
    f.intensity = 0
    const duration = useScene.getState().reducedMotion ? 0 : 0.9
    gsap.to(a, { intensity: spec.lighting.ambientIntensity, duration, ease: 'power2.out' })
    gsap.to(k, { intensity: spec.lighting.intensity, duration, ease: 'power2.out' })
    gsap.to(f, { intensity: FILL_INTENSITY, duration, ease: 'power2.out' })
    // Mount-only: this is "did we arrive here," not a reactive binding.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // The reverse: fade to black BEFORE unmounting, while `screen` is still
  // 'room' (it only flips at the retreat's own handoff, ~250ms after this
  // fires) — so the room genuinely goes dark rather than popping straight to
  // the museum mid-brightness.
  useEffect(() => {
    if (approach !== 'retreating') return
    const a = ambientRef.current
    const k = keyRef.current
    const f = fillRef.current
    if (!a || !k || !f) return
    const duration = useScene.getState().reducedMotion ? 0 : 0.25
    gsap.to(a, { intensity: 0, duration, ease: 'power2.in' })
    gsap.to(k, { intensity: 0, duration, ease: 'power2.in' })
    gsap.to(f, { intensity: 0, duration, ease: 'power2.in' })
  }, [approach])

  return (
    <group>
      <ambientLight ref={ambientRef} intensity={spec.lighting.ambientIntensity} color={keyColor} />

      {/* Key light — position and temperature come from the era preset */}
      <directionalLight
        ref={keyRef}
        position={spec.lighting.keyPosition}
        intensity={spec.lighting.intensity}
        color={keyColor}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      >
        <orthographicCamera attach="shadow-camera" args={[-4, 4, 4, -4, 0.1, 20]} />
      </directionalLight>

      {/* Cool bounce fill from the open side, so shadows are not dead black */}
      <directionalLight ref={fillRef} position={[-2.5, 1.6, 3]} intensity={FILL_INTENSITY} color="#9fb6d0" />

      {/*
        The console itself is NOT rendered here. HeroConsole owns the single
        instance of whichever console is active, mounted once outside both
        the museum and the room, so it can be teleported by the approach's
        rigid translation without ever being duplicated or re-parsed. See
        HeroConsole.tsx. It lands at spec.consolePosition exactly as before —
        only the room built around that point is gone.
      */}

      {/*
        The one thing the room DOES place: a fake contact shadow under the
        console. There is no floor to catch a real one, and the console would
        otherwise float — this is what makes it read as sitting on a plinth.
      */}
      <ContactShadow position={spec.consolePosition} radius={shadowRadius} />
    </group>
  )
}
