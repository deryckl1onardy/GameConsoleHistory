import type { ConsoleEntry, Generation } from '@/types/console'
import { getConsole } from '@/data/consoles'
import { SHELF_CONSTANTS, type MuseumLayout, type ShelfArtifact } from './shelf-layout'

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

/* ------------------------------------------------------------------ */
/* Console order — the collection as a walk.                          */
/* ------------------------------------------------------------------ */

/**
 * The earliest release year of a console, `0` when it has no release dates
 * at all. The timeline guard: every mark is positioned by year, so a
 * dateless console must fall out to a harmless 0 (never NaN/Infinity from
 * `Math.min()` on an empty list) rather than break the strip.
 */
export function yearOf(entry: ConsoleEntry): number {
  const dates = Object.values(entry.released).filter(Boolean) as string[]
  if (dates.length === 0) return 0
  return Math.min(...dates.map((d) => new Date(d).getFullYear()))
}

/**
 * Every artifact, in the one order guaranteed to match what the camera walks
 * past: station by station down the hall (oldest generation first), oldest
 * console first within each station. This is the ordering the timeline strip,
 * the keyboard map and every focus transition use, so focus always moves the
 * same way the collection physically does.
 */
export function consoleOrder(layout: MuseumLayout): ShelfArtifact[] {
  return layout.bays.flatMap((b) => b.artifacts)
}

function requireIndex(layout: MuseumLayout, id: string): number {
  const i = consoleOrder(layout).findIndex((a) => a.id === id)
  if (i === -1) {
    throw new Error(`hall-glide: ${id} is not on any shelf`)
  }
  return i
}

/** The console one step further into history (deeper down the hall). Wraps. */
export function nextConsole(layout: MuseumLayout, id: string): string {
  const order = consoleOrder(layout)
  return order[(requireIndex(layout, id) + 1) % order.length].id
}

/** The console one step back toward the entrance. Wraps. */
export function prevConsole(layout: MuseumLayout, id: string): string {
  const order = consoleOrder(layout)
  return order[(requireIndex(layout, id) - 1 + order.length) % order.length].id
}

/** The first console of a generation, in walk order — the ↑/↓ generation step. */
export function firstOfGeneration(layout: MuseumLayout, generation: Generation): string | null {
  return layout.bays.find((b) => b.generation === generation)?.artifacts[0]?.id ?? null
}

/** The generation one station deeper into the hall. Clamps at the far end. */
export function nextGeneration(layout: MuseumLayout, generation: Generation): Generation {
  const gens = layout.bays.map((b) => b.generation)
  const i = gens.indexOf(generation)
  if (i === -1) return generation
  return gens[Math.min(i + 1, gens.length - 1)]
}

/** The generation one station nearer the entrance. Clamps at the near end. */
export function prevGeneration(layout: MuseumLayout, generation: Generation): Generation {
  const gens = layout.bays.map((b) => b.generation)
  const i = gens.indexOf(generation)
  if (i === -1) return generation
  return gens[Math.max(i - 1, 0)]
}

/** The console whose earliest release year is `year`, or null. */
export function consoleAtYear(layout: MuseumLayout, year: number): string | null {
  for (const artifact of consoleOrder(layout)) {
    const entry = getConsole(artifact.id)
    if (entry && yearOf(entry) === year) return artifact.id
  }
  return null
}
