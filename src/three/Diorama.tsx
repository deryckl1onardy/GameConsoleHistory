import { useEffect, useMemo, useRef } from 'react'
import type { DirectionalLight, Object3D } from 'three'
import type { ConsoleEntry, DioramaSpec, MediaArchetypeId } from '@/types/console'
import { kelvinToColor } from './lighting'
import { mediaAnchor } from './geometry/gameBox'
import { MediaSpread } from './MediaSpread'
import { useScene } from '@/store/scene'

/**
 * Lighting for the room screen, plus the two things the lights need to land
 * on: the console (owned by HeroConsole, not here) and its games.
 *
 * This used to build the full period room (RoomShell, Prop, TvPlaceholder,
 * a wooden game shelf, a placed ControllerModel) around whichever console
 * HeroConsole was showing. Pulled out because too much of it was clipping —
 * walls into the console, props into each other — and it wasn't worth
 * chasing down piece by piece right now. `entry`/`archetypeId` stay as props
 * because MediaSpread reads both.
 *
 * Nothing here is deleted from the data model or the type system — DioramaSpec
 * still carries footprint/props/tv/shelfPosition/controllerPosition, the prop
 * kit still exists, `entry.controllers[0]` is still real data. This component
 * just stops drawing most of it. Re-adding the room later is restoring the
 * JSX that used to live here, not rebuilding the model. The one exception is
 * the games: they were restored (as MediaSpread, standing on the floor rather
 * than a wooden shelf) because the Games tab has nothing to show without them.
 * MediaSpread only mounts while the Games section is actually open
 * (section === 'games') — ten boxes standing beside the console at every
 * other moment, including the very first paint before anyone has touched a
 * section, read as clutter the user never asked to see, not a size
 * comparison.
 *
 * The other visible piece that stays is the shadow-catching floor. A real
 * directional shadow needs a surface to land on, and the console would
 * otherwise float — so a single plane sits just under the console's base and
 * receives the key light's shadow map. It is ShadowMaterial, fully transparent
 * except where the shadow falls, so the clean cutaway look is untouched and
 * only the console's own real, directional shadow appears.
 */

/** The fill's fixed intensity — never varies by console, so a plain constant. */
const FILL_INTENSITY = 0.35

/** How dark the received shadow renders. The floor itself stays invisible. */
const SHADOW_OPACITY = 0.45

/** How far the floor dips below the console's base, to avoid z-fighting. */
const FLOOR_EPSILON = 0.001

export function Diorama({
  entry,
  spec,
  archetypeId,
}: {
  entry: ConsoleEntry
  spec: DioramaSpec
  archetypeId: MediaArchetypeId
}) {
  const keyColor = useMemo(
    () => kelvinToColor(spec.lighting.tempK),
    [spec.lighting.tempK],
  )

  const spreadAnchor = useMemo(() => mediaAnchor(entry, spec), [entry, spec])
  // The whole Games SECTION mounts the spread — list and artifact alike; in
  // artifact mode MediaSpread itself dims everything but the selected box.
  const showSpread = useScene((s) => s.section === 'games')

  const keyRef = useRef<DirectionalLight>(null)
  const keyTargetRef = useRef<Object3D>(null)

  // A directional light aims at its `target` object, which must itself be in
  // the scene graph. The key aims at the console so the shadow frustum is
  // centred where the shadow is actually cast, not at the room origin.
  useEffect(() => {
    if (keyRef.current && keyTargetRef.current) {
      keyRef.current.target = keyTargetRef.current
    }
  }, [])

  return (
    <group>
      <ambientLight intensity={spec.lighting.ambientIntensity} color={keyColor} />

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
        shadow-radius={4}
      >
        <orthographicCamera attach="shadow-camera" args={[-4, 4, 4, -4, 0.1, 20]} />
      </directionalLight>

      <object3D ref={keyTargetRef} position={spec.consolePosition} />

      {/* Cool bounce fill from the open side, so shadows are not dead black */}
      <directionalLight position={[-2.5, 1.6, 3]} intensity={FILL_INTENSITY} color="#9fb6d0" />

      {/*
        The console itself is NOT rendered here. HeroConsole owns the single
        instance of whichever console is active, mounted once outside both
        the museum and the room, so it can be teleported by the approach's
        rigid translation without ever being duplicated or re-parsed. See
        HeroConsole.tsx. It lands at spec.consolePosition exactly as before —
        only the room built around that point is gone.
      */}

      {/*
        The console's ten games, standing on the same floor beside it — only
        while the Games section is actually open. `mediaAnchor` derives the
        position from spec.consolePosition, so the camera (shots.ts) and the
        contents here can never disagree about where the spread actually is,
        but WHETHER it's on screen at all is a separate question: at rest, in
        the console section, the console is the subject and ten cartridges
        parked beside it are visual noise nobody asked for.
      */}
      {showSpread && <MediaSpread entry={entry} archetypeId={archetypeId} position={spreadAnchor} />}

      {/*
        The one surface the room DOES place: a shadow catcher under the
        console. Sized to the room's own footprint and centred on the console,
        sitting just beneath its base. It is ShadowMaterial, so it renders
        nothing at all except the key light's shadow — the console casts a
        real, directional shadow (toward -x/-z, away from the light) instead
        of a painted-on disc, while the cutaway backdrop stays clean.
      */}
      <mesh
        position={[
          spec.consolePosition[0],
          spec.consolePosition[1] - FLOOR_EPSILON,
          spec.consolePosition[2],
        ]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={spec.footprint} />
        <shadowMaterial transparent opacity={SHADOW_OPACITY} depthWrite={false} />
      </mesh>
    </group>
  )
}
