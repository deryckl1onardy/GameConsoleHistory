import { useEffect, useLayoutEffect, useRef } from 'react'
import type { Group } from 'three'
import { useActiveConsole, useActiveDiorama, useScene } from '@/store/scene'
import { ConsoleModel } from './models/registry'
import { MUSEUM_LAYOUT } from './museum/layout'
import { shelfWorldPose } from './museum/hall-glide'
import { HardwareAnnotations } from './HardwareAnnotations'

/**
 * The one and only instance of the currently active console.
 *
 * `useGLTF` caches its parsed scene by URL, so the same console can never be
 * rendered by two components at once without either duplicating it or fighting
 * over a shared object's state. Only ONE thing may own it: this component,
 * mounted once directly under `<Canvas>`, outside both the museum and the
 * room. `ShelfBay` skips the artifact whose id matches the active console;
 * `Diorama` never renders `<ConsoleModel>` at all. Whichever "scene" is
 * showing, this is what's actually drawing the hardware.
 *
 * Its transform is set imperatively, not derived reactively every render —
 * on purpose. During an approach or retreat, CameraRig's choreography
 * TELEPORTS this group by the same rigid translation as the camera, in the
 * same synchronous block (see museum-shots.ts's roomDelta). If this
 * component's own render also tried to recompute "where should I be" from
 * `screen`/`entry.id` on every pass, it would fight that teleport mid-flight.
 * So the reset effect below only runs when `approach` is genuinely `'idle'` —
 * outside any transition — which covers ordinary console switching (the
 * existing room picker) and leaves the choreography as the sole writer
 * whenever a move is actually in progress.
 */
export const heroGroupRef: { current: Group | null } = { current: null }

export function HeroConsole() {
  const entry = useActiveConsole()
  const spec = useActiveDiorama()
  const screen = useScene((s) => s.screen)
  const approach = useScene((s) => s.approach)
  const groupRef = useRef<Group>(null)

  useEffect(() => {
    heroGroupRef.current = groupRef.current
    return () => {
      heroGroupRef.current = null
    }
  }, [])

  /*
    The hero must be standing at the chosen artifact's spot the MOMENT the
    approach begins. The flight flies to that spot, and the artifact's own
    slot is skipped once it becomes the active console (ShelfBay filters it
    out) — so a stale position leaves the camera flying at an empty board
    and the console visibly vanishes until the handoff teleports it into the
    room. This effect is deliberately NOT gated on `approach` (unlike the
    reset below): it owns the shelf pose whenever the shelf is showing,
    transition or not. It cannot fight the choreography — the forward
    teleport happens after `screen` has flipped to 'room' (guard returns),
    and the retreat teleport sets exactly this pose (a no-op re-apply).

    LAYOUT effect: the very first painted frame of the newly chosen console
    is already in place — before this, the first frame of a fresh shelf load
    also painted the hero at the origin.
  */
  useLayoutEffect(() => {
    if (screen !== 'shelf') return
    const artifact = MUSEUM_LAYOUT.byId[entry.id]
    if (!artifact) return
    const g = groupRef.current
    if (!g) return
    // shelfWorldPose, not raw artifact.position: the hero lives OUTSIDE the
    // glided hall group, so its shelf pose must include whatever glide offset
    // the hall is carrying (zero until Phase 4 — but the hero must already
    // route through here, or the moment the hall glides it would sit at the
    // un-glided spot).
    const pose = shelfWorldPose(MUSEUM_LAYOUT, entry.id)
    g.position.set(...pose.position)
    g.rotation.set(...pose.rotation)
  }, [entry.id, screen])

  useEffect(() => {
    if (approach !== 'idle') return
    const g = groupRef.current
    if (!g) return

    if (screen === 'shelf') {
      const artifact = MUSEUM_LAYOUT.byId[entry.id]
      if (!artifact) {
        if (import.meta.env.DEV) {
          console.warn(`[HeroConsole] ${entry.id} is not on any shelf — leaving its position as-is.`)
        }
        return
      }
      const pose = shelfWorldPose(MUSEUM_LAYOUT, entry.id)
      g.position.set(...pose.position)
      g.rotation.set(...pose.rotation)
    } else {
      g.position.set(...spec.consolePosition)
      g.rotation.set(...(spec.consoleRotation ?? [0, 0, 0]))
    }
  }, [entry.id, screen, approach, spec])

  return (
    <group ref={groupRef}>
      {/* Identity transform here — the ref'd group above carries the real
          pose, so the choreography's teleport and this component's own
          idle-reset both write to one place, never to ConsoleModel's own
          internal group. */}
      <ConsoleModel entry={entry} position={[0, 0, 0]} rotation={[0, 0, 0]} />
      {/* Local-space sibling of the model, on purpose — HardwareCallout
          anchors are authored in exactly this group's own coordinate frame,
          so mounting anywhere else would need to redo the transform here. */}
      <HardwareAnnotations entry={entry} />
    </group>
  )
}
