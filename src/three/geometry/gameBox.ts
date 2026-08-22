import type { ConsoleEntry, DioramaSpec, MediaArchetype } from '@/types/console'
import { MM, archetype } from '@/data/kits/media-archetypes'

/**
 * Game-box geometry maths.
 *
 * Kept pure — no React, no renderer — because dimensional accuracy is a product
 * requirement and this is where it is decided. Everything here is exercised
 * directly by tests.
 *
 * Local space for a box, authored face-on to the camera:
 *   +X = right   (width)
 *   +Y = up      (height)
 *   +Z = front   (depth / thickness)
 */

/**
 * three.js BoxGeometry emits its six faces as material groups in this fixed
 * order. Naming them stops the front cover ending up on the underside.
 */
/**
 * How high the selected box lifts off the floor, in metres. The pick-up-a-
 * game metaphor of the spread: selection lifts the box for reading. Shared
 * between GameBox (which renders the lift) and the artifact shot (which aims
 * the camera at the LIFTED position, so the box is dead-centre in frame).
 */
export const LIFT_M = 0.05

export const BOX_FACE = {
  right: 0, // +X
  left: 1, // -X  — the spine when a case stands on a shelf
  top: 2, // +Y
  bottom: 3, // -Y
  front: 4, // +Z  — the cover
  back: 5, // -Z
} as const

export type BoxFace = keyof typeof BOX_FACE

/** Archetype size as scene metres, [width, height, depth]. */
export function boxSizeMetres(a: MediaArchetype): [number, number, number] {
  return [a.dimensions.width * MM, a.dimensions.height * MM, a.dimensions.depth * MM]
}

/**
 * The shell's rounded-rect profile in scene metres, centred on the origin —
 * the cross-section `GameBox` extrudes to build the case. `cornerRadiusMm`
 * lives on every archetype and was unused before this: carts are chunky
 * (4-6mm), cases are near-square (2-3mm), and a plain cuboid read as a block
 * of wood next to the real thing.
 */
export function boxProfile(a: MediaArchetype): { w: number; h: number; r: number } {
  return {
    w: a.dimensions.width * MM,
    h: a.dimensions.height * MM,
    // Never let the radius exceed half the shorter side — a badly authored
    // archetype should degrade to a pill, not throw or self-intersect.
    r: Math.min(a.cornerRadiusMm * MM, (Math.min(a.dimensions.width, a.dimensions.height) / 2) * MM),
  }
}

/**
 * Edge roundover applied to the extruded shell, in metres — shared with
 * GameBox.tsx's `useShellGeometry` so there is exactly one source of truth
 * for it. This has to live here, not just in GameBox.tsx: three.js's
 * ExtrudeGeometry bevel does not stay INSIDE the box's nominal depth — the
 * flat front/back caps themselves shift outward by `bevelThickness` beyond
 * `±depth/2`. `labelPlane` below computes the label's proud-ness from
 * `depth/2` alone, so anything printed on the front face has to add this
 * offset too, or the (now-further-forward) shell simply buries it. A real
 * bug caught by measuring the built geometry's bounding box: the shell's
 * true front sat 0.65mm ahead of the label for the Atari cartridge, hiding
 * it completely.
 */
/** Nominal edge bevel before the per-archetype clamps in `edgeBevelMetres`. */
export const EDGE_BEVEL_M = 0.0008

export function edgeBevelMetres(a: MediaArchetype, depthM: number): number {
  const { r } = boxProfile(a)
  return Math.min(EDGE_BEVEL_M, r * 0.5, depthM * 0.2)
}

export type LabelPlane = {
  /** Plane size in metres. */
  width: number
  height: number
  /** Local offset of the plane centre, in metres. */
  position: [number, number, number]
  /** Aspect (w/h) the artwork should be authored at. */
  aspect: number
}

/**
 * How proud a printed sticker sits off the shell. Real cartridge labels are
 * paper on plastic; without the offset the two surfaces z-fight.
 */
const LABEL_PROUD_MM = 0.15

/**
 * The printed label plane for a cartridge, or null for cases — which are
 * printed edge to edge and need no separate geometry.
 */
export function labelPlane(a: MediaArchetype): LabelPlane | null {
  const l = a.cartridgeLabel
  if (!l) return null

  const width = l.widthMm * MM
  const height = l.heightMm * MM
  const z = (a.dimensions.depth / 2 + LABEL_PROUD_MM) * MM

  return {
    width,
    height,
    position: [(l.offsetXMm ?? 0) * MM, l.offsetYMm * MM, z],
    aspect: l.widthMm / l.heightMm,
  }
}

/**
 * Aspect ratio the cover artwork should be authored at for this archetype —
 * the label for cartridges, the whole front face for cases. Also the aspect
 * the BACK cover should be authored at: real game boxes print the back panel
 * at the same footprint as the front, so there is no separate `backAspect`.
 */
export function coverAspect(a: MediaArchetype): number {
  const l = a.cartridgeLabel
  if (l) return l.widthMm / l.heightMm
  return a.dimensions.width / a.dimensions.height
}

/**
 * Aspect ratio the SPINE artwork should be authored at — the narrow strip
 * read on a shelf, depth (width, once turned 90°) by height. Only meaningful
 * for archetypes with `hasBackArt` (cartridges have no spine print at all,
 * just the shell's own bare edge). Cartridges are allowed through this
 * function anyway rather than throwing — a caller gates on `hasBackArt`
 * before ever using the result, same convention as `labelPlane` returning
 * `null` rather than every caller needing its own cartridge/case branch.
 */
export function spineAspect(a: MediaArchetype): number {
  return a.dimensions.depth / a.dimensions.height
}

/**
 * Whether this archetype's artwork is mapped straight onto the shell's own
 * six faces (true) or printed on separate planes floating proud of it
 * (false). The single switch behind two different constructions in
 * GameBox.tsx — see `useShellGeometry` there for the geometry each one gets.
 *
 * The test is "does this archetype need an inset label", not the `kind`
 * string, because that is the actual functional requirement. A cartridge's
 * art is a sticker at its own real published size, offset from the face's
 * centre — an NES label is 55x97mm on a 120x134mm shell, shifted right to
 * clear the connector ridge. Face-mapped UVs cannot express that without
 * baking the inset and the offset into every individual game's image, so
 * cartridges keep the separate label plane, which is exactly the case that
 * plane was invented for.
 *
 * Everything else — cardboard boxes, keepcases, jewel cases — prints
 * full-bleed to the edges, where a floating plane buys nothing and costs
 * real bugs: a plane must be positioned clear of the shell's own bevel or
 * it renders INSIDE the solid geometry and vanishes (see GameBox.tsx's
 * spine comment for the measured version of that failure). Painting the
 * face itself makes that class of bug structurally impossible.
 *
 * The trade is corner rounding: the face-mapped path is a BoxGeometry, so
 * `cornerRadiusMm` is not expressed for these archetypes. That is arguably
 * more accurate for a printed cardboard carton, which really does have
 * square corners, and a small loss for a moulded plastic case, which does
 * not. Keyed on one predicate so that judgement can be revisited in one
 * place rather than hunted through the renderer.
 */
export function printsPerFace(a: MediaArchetype): boolean {
  return a.cartridgeLabel === null
}

/* ------------------------------------------------------------------ */
/* Spread layout                                                       */
/* ------------------------------------------------------------------ */

/**
 * Cases and cartridges stand up unaided — no furniture is needed to show them
 * honestly. The ten games lay out as two staggered ranks standing upright,
 * faced out, raked back slightly, directly on the same floor the console
 * stands on. This replaces the wooden-shelf layout (`layoutShelf`, deleted
 * along with GameShelf.tsx): a lone bookshelf in a room that otherwise holds
 * only a shadow-catching floor read as a leftover prop.
 */

export type SpreadSlot = {
  index: number
  /** 0 = front rank, closest to the viewer. */
  rank: number
  column: number
  /** Metres, relative to the spread anchor (floor centre of the front rank). */
  position: [number, number, number]
  /** Radians. Only X (the rake) is ever non-zero today. */
  rotation: [number, number, number]
}

export type SpreadOptions = {
  archetype: MediaArchetype
  count: number
  /** How many rows of depth. Defaults to 2 — enough to stagger, not a wall. */
  ranks?: number
  /** Gap between neighbouring boxes within a rank, in mm. */
  gapMm?: number
  /** Distance between ranks, in mm. Defaults to a generous multiple of depth. */
  rankDepthMm?: number
  /** How far the boxes tip back from vertical, in degrees. */
  rakeDeg?: number
}

const DEFAULT_GAP_MM = 4
const DEFAULT_RANKS = 2
const DEFAULT_RANK_DEPTH_FACTOR = 2.2
const DEFAULT_RAKE_DEG = 8

/**
 * How many ranks the ten-game spread actually uses in the scene (MediaSpread
 * and the library camera shot in shots.ts both import this — never the bare
 * `layoutSpread` default — so the two can never disagree about the shape
 * being framed). Two ranks of five is eight times wider than it is deep: to
 * fit that width in frame, the camera has to pull back so far that each
 * box's face — only ~70mm tall for a cartridge — becomes a sliver of the
 * screen, unreadable regardless of how good the art or the geometry is. Four
 * ranks keeps the footprint close to square, so the camera can sit near
 * enough for a box to actually read as an object.
 */
export const MEDIA_SPREAD_RANKS = 4

/**
 * Arrange boxes standing upright, faced out, split across `ranks` rows of
 * depth. Faced-out rather than spine-out is both readable and honest: this is
 * how cartridges were actually displayed, and it is the only arrangement
 * where a cartridge is identifiable at all — carts have no spine print.
 *
 * Each rank is centred on its own occupancy, so a short final rank sits
 * centred rather than hanging off one edge. The back rank is offset half a
 * pitch in X so it staggers visibly behind the gaps in the front rank instead
 * of hiding directly behind it.
 */
export function layoutSpread({
  archetype: a,
  count,
  ranks = DEFAULT_RANKS,
  gapMm = DEFAULT_GAP_MM,
  rankDepthMm,
  rakeDeg = DEFAULT_RAKE_DEG,
}: SpreadOptions): SpreadSlot[] {
  if (count <= 0 || ranks <= 0) return []

  const boxW = a.dimensions.width
  const boxH = a.dimensions.height
  const pitch = rankDepthMm ?? a.dimensions.depth * DEFAULT_RANK_DEPTH_FACTOR
  const rakeRad = (rakeDeg * Math.PI) / 180

  // Split as evenly as possible across ranks; any remainder fills the front
  // ranks first, so the front reads fullest rather than the back.
  const base = Math.floor(count / ranks)
  const remainder = count % ranks
  const perRank = Array.from({ length: ranks }, (_, r) => base + (r < remainder ? 1 : 0))

  const slots: SpreadSlot[] = []
  let index = 0
  for (let rank = 0; rank < ranks; rank++) {
    const inThisRank = perRank[rank]
    if (inThisRank <= 0) continue

    const rowWidth = inThisRank * boxW + (inThisRank - 1) * gapMm
    // Stagger every other rank half a pitch, so a box in the back rank sits
    // behind a gap in the front rank instead of directly behind a box.
    const stagger = rank % 2 === 1 ? (boxW + gapMm) / 2 : 0

    for (let column = 0; column < inThisRank; column++) {
      const xMm = -rowWidth / 2 + column * (boxW + gapMm) + boxW / 2 + stagger
      const zMm = rank * pitch
      const yMm = boxH / 2

      slots.push({
        index,
        rank,
        column,
        position: [xMm * MM, yMm * MM, zMm * MM],
        rotation: [rakeRad, 0, 0],
      })
      index += 1
    }
  }
  return slots
}

/** Total footprint of a laid-out spread, in metres — useful for framing shots. */
export function spreadExtent(
  slots: SpreadSlot[],
  a: MediaArchetype,
): { width: number; height: number; depth: number } {
  if (slots.length === 0) return { width: 0, height: 0, depth: 0 }
  const halfW = (a.dimensions.width / 2) * MM
  const halfH = (a.dimensions.height / 2) * MM
  const halfD = (a.dimensions.depth / 2) * MM
  let minX = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  let maxZ = -Infinity
  for (const s of slots) {
    minX = Math.min(minX, s.position[0] - halfW)
    maxX = Math.max(maxX, s.position[0] + halfW)
    maxY = Math.max(maxY, s.position[1] + halfH)
    maxZ = Math.max(maxZ, s.position[2] + halfD)
  }
  return { width: maxX - minX, height: maxY, depth: maxZ }
}

/**
 * Where the spread sits: on the console's own floor plane, beside it. Derived
 * from `spec.consolePosition` rather than authored per console, so all 22
 * consoles inherit it and the camera (shots.ts) and the contents (MediaSpread)
 * can never disagree about where it is — `spec.shelfPosition` is not used
 * here; it names a wall the room no longer has.
 */
const CONSOLE_CLEARANCE_M = 0.12

export function mediaAnchor(entry: ConsoleEntry, spec: DioramaSpec): [number, number, number] {
  const media = archetype(entry.mediaArchetype)
  const slots = layoutSpread({ archetype: media, count: entry.games.length, ranks: MEDIA_SPREAD_RANKS })
  const extent = spreadExtent(slots, media)
  const consoleHalfWidth = (entry.dimensions.width * MM) / 2

  return [
    spec.consolePosition[0] + consoleHalfWidth + CONSOLE_CLEARANCE_M + extent.width / 2,
    spec.consolePosition[1],
    spec.consolePosition[2],
  ]
}
