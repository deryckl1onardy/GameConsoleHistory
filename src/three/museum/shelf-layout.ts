import type { ConsoleEntry, Generation } from '@/types/console'
import { GENERATION_ERAS, GENERATION_LABELS } from '@/data/roster'
import { mm } from '../lighting'

/**
 * The museum's floor plan, as pure data.
 *
 * Nothing here is authored per console: every position falls out of the real
 * `entry.dimensions` and the console's own room yaw, the same way shots.ts
 * derives every camera move from DioramaSpec anchors. Change a console's
 * measured width and its neighbours move.
 *
 * Two problems this has to solve that a naive grid does not:
 *
 * 1. **The collection is lopsided.** Five of the eight generations hold exactly
 *    one built console. A fixed-width board with one artifact adrift on it
 *    reads as broken; a board sized to its contents reads as a plinth, which
 *    is what a museum actually gives a single significant object. So boards are
 *    only as long as they need to be, floored at MIN_BOARD.
 *
 * 2. **The artifacts are turned.** Each console keeps its room yaw here (see
 *    `museum-shots.ts` for why that matters), so its footprint along X is the
 *    rotated extent, not its width. An Atari at -16 degrees occupies 397mm of
 *    board, not 346mm. Spacing off the raw width would overlap them.
 */

/** Board surface the artifacts rest on. */
const BOARD_THICKNESS = 0.04
/** Clear space above the tallest artifact in a bay, before the next board. */
const HEADROOM = 0.22
/** Board length beyond the outermost artifact, each side. */
const END_PAD = 0.16
const MIN_BOARD = 0.9
const MAX_BOARD = 3.2
/** Gap between neighbours, as a fraction of their mean footprint. */
const GAP_RATIO = 0.55
const MIN_GAP = 0.1
const MAX_GAP = 0.28
/** Board depth beyond the deepest artifact. */
const DEPTH_PAD = 0.1
/** Height of the lowest (newest) board. Everything stacks up from here. */
const BOTTOM_BOARD_Y = 0.45

export type ShelfArtifact = {
  id: string
  generation: Generation
  /** World position of the console's BASE — ConsoleModel floor-aligns to it. */
  position: [number, number, number]
  rotation: [number, number, number]
  /** Real dimensions in metres. */
  size: { width: number; height: number; depth: number }
  /** Extent along X once rotated — what spacing actually has to clear. */
  footprintX: number
}

export type ShelfBay = {
  generation: Generation
  label: string
  era: string | null
  /** Top surface of the board: the Y artifacts rest on. */
  boardY: number
  boardLength: number
  boardDepth: number
  /** Centre of the board's top surface. */
  boardCenter: [number, number, number]
  /** Tallest artifact in this bay, in metres. */
  tallest: number
  artifacts: ShelfArtifact[]
}

export type MuseumLayout = {
  bays: ShelfBay[]
  byId: Record<string, ShelfArtifact>
  extent: { minX: number; maxX: number; minY: number; maxY: number }
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

/**
 * How much board a console eats along X once turned by its own yaw. The
 * rotated axis-aligned extent of a w x d rectangle.
 */
export function rotatedFootprintX(widthM: number, depthM: number, yaw: number): number {
  return Math.abs(widthM * Math.cos(yaw)) + Math.abs(depthM * Math.sin(yaw))
}

/**
 * Lay the built consoles out as a wall of generation shelves.
 *
 * Oldest generation on top, reading downward through time — matching the
 * concept's mock. Bays are built newest-first from BOTTOM_BOARD_Y upward so
 * the bottom of the unit sits at a fixed height regardless of how tall the
 * collection grows.
 */
export function layoutMuseum(consoles: ConsoleEntry[]): MuseumLayout {
  const byGen = new Map<Generation, ConsoleEntry[]>()
  for (const c of consoles) {
    const list = byGen.get(c.generation) ?? []
    list.push(c)
    byGen.set(c.generation, list)
  }

  // Oldest first. Within a bay, oldest first too, so the eye reads left-to-right
  // through the generation the same way it reads top-to-bottom through history.
  const generations = [...byGen.keys()].sort((a, b) => a - b)
  for (const g of generations) {
    byGen.get(g)!.sort((a, b) => earliestYear(a) - earliestYear(b))
  }

  // Place bays bottom-up (newest first), then reverse, so BOTTOM_BOARD_Y holds.
  const placed: ShelfBay[] = []
  let cursorY = BOTTOM_BOARD_Y

  for (const generation of [...generations].reverse()) {
    const entries = byGen.get(generation)!

    const sizes = entries.map((e) => ({
      width: mm(e.dimensions.width),
      height: mm(e.dimensions.height),
      depth: mm(e.dimensions.depth),
    }))
    const yaws = entries.map((e) => e.diorama.consoleRotation?.[1] ?? 0)
    const footprints = sizes.map((s, i) => rotatedFootprintX(s.width, s.depth, yaws[i]))

    // Gaps scale with their neighbours: a fixed gap beside a 346mm Atari and a
    // 104mm PS5 reads crowded on one side and empty on the other.
    const gaps: number[] = []
    for (let i = 0; i < footprints.length - 1; i += 1) {
      gaps.push(clamp(GAP_RATIO * ((footprints[i] + footprints[i + 1]) / 2), MIN_GAP, MAX_GAP))
    }

    const contentLength =
      footprints.reduce((n, f) => n + f, 0) + gaps.reduce((n, g) => n + g, 0)
    const boardLength = clamp(contentLength + 2 * END_PAD, MIN_BOARD, MAX_BOARD)
    const boardDepth = Math.max(...sizes.map((s) => s.depth)) + DEPTH_PAD
    const tallest = Math.max(...sizes.map((s) => s.height))

    const boardY = cursorY

    // Walk the row from its left edge, centred on x = 0.
    const artifacts: ShelfArtifact[] = []
    let x = -contentLength / 2
    entries.forEach((entry, i) => {
      const half = footprints[i] / 2
      artifacts.push({
        id: entry.id,
        generation,
        position: [x + half, boardY, 0],
        rotation: [0, yaws[i], 0],
        size: sizes[i],
        footprintX: footprints[i],
      })
      x += footprints[i] + (gaps[i] ?? 0)
    })

    placed.push({
      generation,
      label: GENERATION_LABELS[generation],
      era: GENERATION_ERAS[generation] ?? null,
      boardY,
      boardLength,
      boardDepth,
      boardCenter: [0, boardY, 0],
      tallest,
      artifacts,
    })

    cursorY = boardY + tallest + HEADROOM + BOARD_THICKNESS
  }

  const bays = placed.reverse()

  const byId: Record<string, ShelfArtifact> = {}
  for (const bay of bays) for (const a of bay.artifacts) byId[a.id] = a

  const halfLengths = bays.map((b) => b.boardLength / 2)
  return {
    bays,
    byId,
    extent: {
      minX: -Math.max(...halfLengths),
      maxX: Math.max(...halfLengths),
      minY: BOTTOM_BOARD_Y - BOARD_THICKNESS,
      maxY: Math.max(...bays.map((b) => b.boardY + b.tallest)),
    },
  }
}

/**
 * Which generation the camera is currently nearest, given the height it is
 * looking at.
 *
 * Measured against each bay's own FOCUS height — the middle of its artifacts,
 * the same point `bayShot` targets — rather than its board, so "nearest" means
 * the same thing to this function as it does to the camera that framed it.
 *
 * Exists because panning used to move the camera without telling anything
 * about it: the generation rail and the accent light both kept pointing at
 * the bay you had left. See `syncFocusGeneration` in the scene store.
 */
export function generationNearestY(layout: MuseumLayout, y: number): Generation {
  let best = layout.bays[0]
  let bestDistance = Infinity
  for (const bay of layout.bays) {
    const distance = Math.abs(bay.boardY + bay.tallest / 2 - y)
    if (distance < bestDistance) {
      bestDistance = distance
      best = bay
    }
  }
  return best.generation
}

/**
 * Which artifact sits under a given X on a bay's board, or null for a gap.
 * The shelf hit-tests with one plane per bay and resolves the artifact here,
 * rather than raycasting 180k triangles of console geometry.
 */
export function artifactAtX(bay: ShelfBay, x: number): ShelfArtifact | null {
  for (const a of bay.artifacts) {
    const half = a.footprintX / 2
    if (x >= a.position[0] - half && x <= a.position[0] + half) return a
  }
  return null
}

function earliestYear(entry: ConsoleEntry): number {
  const dates = Object.values(entry.released).filter(Boolean) as string[]
  if (dates.length === 0) return 0
  return Math.min(...dates.map((d) => new Date(d).getFullYear()))
}

export const SHELF_CONSTANTS = {
  BOARD_THICKNESS,
  HEADROOM,
  END_PAD,
  MIN_BOARD,
  MAX_BOARD,
  MIN_GAP,
  MAX_GAP,
  BOTTOM_BOARD_Y,
} as const
