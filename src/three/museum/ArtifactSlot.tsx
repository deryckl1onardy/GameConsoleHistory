import { useEffect, useRef } from 'react'
import type { Group } from 'three'
import gsap from 'gsap'
import { getConsole } from '@/data/consoles'
import { useScene } from '@/store/scene'
import { ConsoleModel } from '../models/registry'
import type { ShelfArtifact } from './shelf-layout'

/** How far a hovered artifact steps forward, in metres. */
const HOVER_FORWARD = 0.045
const HOVER_SCALE = 1.03
const HOVER_DURATION = 0.35

/**
 * One console on a board.
 *
 * Reuses `ConsoleModel` verbatim, which means the shelf inherits the whole
 * loading story for free — the per-model Suspense boundary, the
 * `LoadingVolume` placeholder, the measured per-console scale, the error
 * boundary, and the `known` fast path that skips the HEAD probe. A
 * museum-specific model loader would be a second thing to keep correct.
 *
 * The artifact keeps its ROOM yaw (set in shelf-layout.ts). That is not a
 * styling choice — it is what makes the shelf-to-room transform a pure
 * translation. See museum-shots.ts.
 *
 * Hover motion is GSAP on an outer group's refs, never React state: there is
 * currently zero `useFrame` in this codebase, and driving a per-frame nudge
 * through re-renders would be the first. `artifact.position`/`.rotation` are
 * stable array references from the module-level MUSEUM_LAYOUT singleton, so
 * React-three-fiber only re-applies them when they actually change — which
 * means the tween's own mutation of `group.position.z`/`group.scale` is
 * never clobbered by an unrelated re-render (the same guarantee the GLB
 * hide-mesh pass already relies on, see GltfModel.tsx).
 */
export function ArtifactSlot({ artifact }: { artifact: ShelfArtifact }) {
  const entry = getConsole(artifact.id)
  const hovered = useScene((s) => s.hoveredId === artifact.id)
  const reducedMotion = useScene((s) => s.reducedMotion)
  const groupRef = useRef<Group>(null)

  useEffect(() => {
    const g = groupRef.current
    if (!g) return
    const duration = reducedMotion ? 0 : HOVER_DURATION
    // z here is the PARENT's frame (this group's own position, evaluated
    // before its own rotation reaches children) — so it moves the console
    // toward the museum's +Z / camera side regardless of the artifact's own
    // yaw, which is what "steps forward" has to mean.
    gsap.to(g.position, { z: hovered ? HOVER_FORWARD : 0, duration, ease: 'power2.out' })
    gsap.to(g.scale, {
      x: hovered ? HOVER_SCALE : 1,
      y: hovered ? HOVER_SCALE : 1,
      z: hovered ? HOVER_SCALE : 1,
      duration,
      ease: 'power2.out',
    })
  }, [hovered, reducedMotion])

  if (!entry) return null

  return (
    <group ref={groupRef} position={artifact.position} rotation={artifact.rotation}>
      {/* Identity transform here — the outer group above already carries the
          artifact's real pose; ConsoleModel gets the origin so the hover
          tween composes with it rather than fighting it. */}
      <ConsoleModel entry={entry} position={[0, 0, 0]} rotation={[0, 0, 0]} />
    </group>
  )
}
