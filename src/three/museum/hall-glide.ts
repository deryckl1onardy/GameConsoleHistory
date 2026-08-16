import { SHELF_CONSTANTS, type MuseumLayout } from './shelf-layout'

/**
 * The maths of the hall GLIDE — the shelf navigation redesign's replacement
 * for a free-floating camera.
 *
 * The camera no longer travels while browsing; the COLLECTION presents
 * itself. When a console gains focus the whole hall (one group wrapping
 * MuseumScene, see Phase 4) glides in 2-D — X and Z — so that console arrives
 * at the stage, and the camera sits still. Two offsets describe that move:
 *
 *   hallOffsetFor(id)   the GROUP offset that brings artifact `id` to the
 *                       stage: STAGE_ANCHOR − artifact.position. Pure
 *                       function of the id — no live value is ever read.
 *   presentOffset(id)   the per-console presenting STEP: once on stage, the
 *                       focused machine steps forward off its plinth, sized
 *                       so every console lands at the same on-screen size.
 *                       Zero until Phase 6 turns it on.
 *
 * `shelfWorldPose(id)` is the artifact's ACTUAL world pose at any moment —
 * resting place + the live glide offset (what the hall group is carrying
 * right now) + the present step. This is the one function the hero console
 * routes through: the hero lives OUTSIDE the glided hall group (it is the
 * single shared GLB instance, see HeroConsole.tsx), so if it ever used raw
 * `artifact.position` it would sit at the un-glided spot the moment the
 * group moves.
 *
 * THE INVARIANT. The whole shelf→room transition rests on the transform
 * between a console's shelf pose and its room pose being a pure translation
 * with rotations untouched (see museum-shots.ts). The glide cannot break
 * that, because:
 *
 *   stageWorldPos(id) = STAGE_ANCHOR + presentOffset(id)
 *                     = artifact.position + hallOffsetFor(id) + presentOffset(id)
 *
 * is a pure function of the id, so
 *
 *   T = roomPosition − stageWorldPos(id)
 *
 * is still a pure translation, and `shelfWorldPose` never touches rotation.
 * museum-shots.test.ts's glide-invariant suite pins that equation and the
 * rotation guard directly.
 */

type Vec3 = [number, number, number]

const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]

/**
 * Where a focused console presents: the hall's centre line, just past the
 * first station, on a plinth of the same height as every other (consoles
 * never leave plinth height — they step forward along it, not up or down).
 * The stage plinth itself is drawn by MuseumScene (Phase 4).
 */
export const STAGE_ANCHOR: Vec3 = [0, SHELF_CONSTANTS.PLINTH_TOP, -4.6]

/**
 * The LIVE glide offset — what the hall group's position is right now.
 *
 * Module-level, in the same spirit as `heroGroupRef`: the glide group is
 * animated imperatively by CameraRig (GSAP on a ref), and both the hall's
 * own hit-testing (world→local X conversion, ShelfBay) and the hero console
 * (shelfWorldPose) need to read the CURRENT value between renders. Zero
 * until Phase 4 animates it; tests set it directly.
 */
let hallOffset: Vec3 = [0, 0, 0]

export function getHallOffset(): Vec3 {
  return hallOffset
}

export function setHallOffset(v: Vec3): void {
  hallOffset = v
}

/**
 * The group offset that brings artifact `id` to the stage — the target the
 * glide animates `hallOffset` toward when `id` is focused.
 *
 * Throws for a console that is not on any shelf: this is where the
 * "not on any shelf" guard now lives, shared by the glide, the hero pose and
 * roomDelta (museum-shots.ts), so a misplaced console fails loudly in one
 * place instead of drifting silently in three.
 */
export function hallOffsetFor(layout: MuseumLayout, id: string): Vec3 {
  const artifact = layout.byId[id]
  if (!artifact) {
    throw new Error(`hall-glide: ${id} is not on any shelf`)
  }
  return sub(STAGE_ANCHOR, artifact.position)
}

/**
 * The per-console presenting step, in metres, added on top of the glide.
 *
 * Zero until Phase 6: the focused console steps forward off its plinth so
 * every machine reads at the same on-screen size from the fixed stage
 * camera. Computed here, once, and consumed by BOTH `stageWorldPos` and
 * `ArtifactSlot`'s present group — one helper, one truth, so the two
 * implementations can never drift apart.
 */
export function presentOffset(_id: string): Vec3 {
  return [0, 0, 0]
}

/** Where the focused console presents, in world space. */
export function stageWorldPos(id: string): Vec3 {
  return add(STAGE_ANCHOR, presentOffset(id))
}

/**
 * An artifact's real world pose at this instant: its resting place on its
 * plinth, plus whatever the hall group is currently carrying, plus its
 * present step. Rotation is ALWAYS the artifact's own — the invariant.
 */
export function shelfWorldPose(
  layout: MuseumLayout,
  id: string,
): { position: Vec3; rotation: Vec3 } {
  const artifact = layout.byId[id]
  if (!artifact) {
    throw new Error(`hall-glide: ${id} is not on any shelf`)
  }
  return {
    position: add(add(artifact.position, getHallOffset()), presentOffset(id)),
    rotation: artifact.rotation,
  }
}
