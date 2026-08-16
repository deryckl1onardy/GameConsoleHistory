import { useEffect, useRef } from 'react'
import type { Group } from 'three'
import gsap from 'gsap'
import { getConsole } from '@/data/consoles'
import { useScene } from '@/store/scene'
import { ConsoleModel } from '../models/registry'
import { presentOffset } from './hall-glide'
import type { ShelfArtifact } from './shelf-layout'

/** How far a hovered artifact steps forward, in metres. */
const HOVER_FORWARD = 0.045
const HOVER_SCALE = 1.03
const HOVER_DURATION = 0.35
/** How long the presenting step takes. */
const PRESENT_DURATION = 0.6

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
 * Hover motion is GSAP on a ref, never React state: there is currently zero
 * `useFrame` in this codebase, and driving a per-frame nudge through
 * re-renders would be the first. `artifact.position`/`.rotation` are stable
 * array references from the module-level MUSEUM_LAYOUT singleton, so
 * React-three-fiber only re-applies them when they actually change — which
 * means the tween's own mutation is never clobbered by an unrelated
 * re-render (the same guarantee the GLB hide-mesh pass already relies on,
 * see GltfModel.tsx).
 *
 * THREE nested groups, and the nesting is load-bearing:
 *
 *   pose     carries the artifact's real position. Static.
 *   present  the per-console presenting step — the focused console steps
 *            forward onto the stage (presentOffset in hall-glide.ts, the one
 *            source of truth). A DEDICATED group on purpose: two GSAP tweens
 *            on one position.z would fight.
 *   hover    the step-forward and scale. Starts at the ORIGIN, so its tween is
 *            a relative offset — and because its parent is unrotated, its +Z
 *            is the hall's +Z, which is what "steps toward the viewer" has to
 *            mean whatever yaw the console itself carries.
 *   yaw      the console's own room rotation. Innermost, so it cannot turn the
 *            hover direction with it.
 *
 * This used to be one group carrying pose, rotation and tween together, with
 * the tween writing `position.z` ABSOLUTELY — `z: hovered ? 0.045 : 0`. That
 * was invisible while every station sat on the hall's centre line at z = 0,
 * because resting at "0" was resting where it belonged. The moment stations
 * receded down the hall, the resting tween slammed all twenty-two consoles
 * back to z = 0, piling the entire collection at the entrance and leaving
 * every plinth in the gallery empty.
 */
export function ArtifactSlot({ artifact }: { artifact: ShelfArtifact }) {
  const entry = getConsole(artifact.id)
  const hovered = useScene((s) => s.hoveredId === artifact.id)
  const focusedId = useScene((s) => s.focusedId)
  const hallView = useScene((s) => s.hallView)
  const reducedMotion = useScene((s) => s.reducedMotion)
  const hoverRef = useRef<Group>(null)
  const presentRef = useRef<Group>(null)

  // Only the focused console presents, and only in the station view — in the
  // overview nothing is on the stage, and an off-stage console does not lean
  // forward on its own plinth.
  const presenting = hallView === 'station' && focusedId === artifact.id

  useEffect(() => {
    const g = hoverRef.current
    if (!g) return
    const duration = reducedMotion ? 0 : HOVER_DURATION
    // Relative to the artifact's own resting pose, which its parent carries.
    // Every console lifts on hover — it is the "this is clickable" cue, and
    // clicking opens the console's detail room.
    gsap.to(g.position, { z: hovered ? HOVER_FORWARD : 0, duration, ease: 'power2.out' })
    gsap.to(g.scale, {
      x: hovered ? HOVER_SCALE : 1,
      y: hovered ? HOVER_SCALE : 1,
      z: hovered ? HOVER_SCALE : 1,
      duration,
      ease: 'power2.out',
    })
  }, [hovered, reducedMotion])

  // The presenting step: the SAME number shelfWorldPose/stageWorldPos read
  // (presentOffset in hall-glide.ts), so the hero console and this slot can
  // never drift apart about where the presented console stands.
  useEffect(() => {
    const g = presentRef.current
    if (!g) return
    const target = presenting ? presentOffset(artifact.id)[2] : 0
    const duration = reducedMotion ? 0 : PRESENT_DURATION
    gsap.to(g.position, { z: target, duration, ease: 'power2.out' })
  }, [presenting, reducedMotion, artifact.id])

  if (!entry) return null

  return (
    <group position={artifact.position}>
      <group ref={presentRef}>
        <group ref={hoverRef}>
          <group rotation={artifact.rotation}>
            <ConsoleModel entry={entry} position={[0, 0, 0]} rotation={[0, 0, 0]} />
          </group>
        </group>
      </group>
    </group>
  )
}
