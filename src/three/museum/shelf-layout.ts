import type { ConsoleEntry, Generation } from '@/types/console'
import { GENERATION_ERAS, GENERATION_LABELS } from '@/data/roster'
import { mm } from '../lighting'

/**
 * The museum's floor plan, as pure data.
 *
 * The collection is laid out as a GALLERY HALL you walk down, not a wall you
 * scroll up. Each generation is a *station*: a plinth carrying that
 * generation's consoles in a row. Stations recede along −Z in release order,
 * so walking deeper into the hall is moving forward through time, and the
 * length of the hall is the length of the history.
 *
 * It was a vertical wall of stacked shelves before. That gave the collection
 * no architecture to sit in and no depth to read against — one bay filled the
 * frame and the rest were somewhere off-screen above and below, which is why
 * it never felt like a museum. A hall has a floor, a far end, and a middle
 * distance, so the generations you are not looking at are still *there*.
 *
 * Nothing here is authored per console: every position falls out of the real
 * `entry.dimensions` and the console's own room yaw, the same way shots.ts
 * derives every camera move from DioramaSpec anchors. Change a console's
 * measured width and its neighbours move.
 *
 * Three problems this has to solve that a naive row of plinths does not:
 *
 * 1. **THE INVARIANT.** Each console keeps its ROOM yaw here — see
 *    `museum-shots.ts`. That is what makes shelf→room a pure translation and
 *    the transition seamless. Positions may move anywhere; ROTATIONS MAY NOT.
 *    Guarded by museum-shots.test.ts.
 *
 * 2. **Stations would hide behind each other.** Looking down a hall, a plinth
 *    on the centre line occludes every plinth behind it. So stations alternate
 *    to either side of the walkway — the arrangement a real gallery uses for
 *    exactly this reason — and the hall reads as a receding zigzag rather than
 *    a queue.
 *
 * 3. **The artifacts are turned.** Each console keeps its room yaw (see 1), so
 *    its footprint along X is the rotated extent, not its width. An Atari at
 *    -16 degrees occupies 397mm of plinth, not 346mm. Spacing off the raw
 *    width would overlap them.
 */

/** Top surface of a plinth — a real museum pedestal height, so consoles sit near eye line. */
const PLINTH_TOP = 0.92
/** Plinth length beyond the outermost artifact, each side. */
const END_PAD = 0.16
const MIN_PLINTH = 0.9
const MAX_PLINTH = 3.2
/** Gap between neighbours, as a fraction of their mean footprint. */
const GAP_RATIO = 0.55
const MIN_GAP = 0.1
const MAX_GAP = 0.28
/** Plinth depth beyond the deepest artifact. */
const DEPTH_PAD = 0.14

/** Distance between one station and the next, down the hall. */
const STATION_SPACING = 4.6
/** How far each station sits to its side of the walkway. Alternates. */
const STATION_STAGGER_X = 1.5
/** The first station's distance from the hall's entrance (z = 0). */
const FIRST_STATION_Z = -2.2

/** Clear width of the hall between its side walls. */
const HALL_WIDTH = 7.4
/** Floor to ceiling. */
const HALL_HEIGHT = 4.6
/** Hall floor. Everything stands on this. */
const FLOOR_Y = 0
/** Run of hall beyond the last station, so the far end never feels cut off. */
const HALL_RUN_OUT = 6

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
  /** Earliest release year in this generation — the station's date on the wall. */
  firstYear: number
  /** Top surface of the plinth: the Y artifacts rest on. Constant across the hall. */
  boardY: number
  boardLength: number
  boardDepth: number
  /** Centre of the plinth's top surface — now carries a real X and Z. */
  boardCenter: [number, number, number]
  /** Which side of the walkway this station stands on. */
  side: 'left' | 'right'
  /** Tallest artifact in this bay, in metres. */
  tallest: number
  artifacts: ShelfArtifact[]
}

export type MuseumLayout = {
  bays: ShelfBay[]
  byId: Record<string, ShelfArtifact>
  extent: {
    minX: number
    maxX: number
    minY: number
    maxY: number
    /** Deepest point of the hall (most negative Z) and its entrance. */
    minZ: number
    maxZ: number
  }
  hall: {
    width: number
    height: number
    floorY: number
    /** Where the walkway starts and ends, for the camera to travel between. */
    entranceZ: number
    farZ: number
  }
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

/**
 * How much plinth a console eats along X once turned by its own yaw. The
 * rotated axis-aligned extent of a w x d rectangle.
 */
export function rotatedFootprintX(widthM: number, depthM: number, yaw: number): number {
  return Math.abs(widthM * Math.cos(yaw)) + Math.abs(depthM * Math.sin(yaw))
}

/**
 * The companion of `rotatedFootprintX`: how far a w x d rectangle reaches
 * along Z once turned by its own yaw. Used to find a console's own front
 * face — not the shared plinth edge — so a label can clear that specific
 * object regardless of how deep its neighbours on the same station are.
 */
export function rotatedFootprintZ(widthM: number, depthM: number, yaw: number): number {
  return Math.abs(widthM * Math.sin(yaw)) + Math.abs(depthM * Math.cos(yaw))
}

/**
 * Lay the built consoles out as a hall of generation stations.
 *
 * Oldest nearest the entrance, receding into the hall in release order — so
 * the walk from the door to the far wall is 1977 to now.
 */
export function layoutMuseum(consoles: ConsoleEntry[]): MuseumLayout {
  const byGen = new Map<Generation, ConsoleEntry[]>()
  for (const c of consoles) {
    const list = byGen.get(c.generation) ?? []
    list.push(c)
    byGen.set(c.generation, list)
  }

  // Oldest first, and within a station oldest first too, so the eye reads
  // left-to-right through a generation the way it reads front-to-back through
  // the hall.
  const generations = [...byGen.keys()].sort((a, b) => a - b)
  for (const g of generations) {
    byGen.get(g)!.sort((a, b) => earliestYear(a) - earliestYear(b))
  }

  const bays: ShelfBay[] = generations.map((generation, index) => {
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

    const contentLength = footprints.reduce((n, f) => n + f, 0) + gaps.reduce((n, g) => n + g, 0)
    const boardLength = clamp(contentLength + 2 * END_PAD, MIN_PLINTH, MAX_PLINTH)
    const boardDepth = Math.max(...sizes.map((s) => s.depth)) + DEPTH_PAD
    const tallest = Math.max(...sizes.map((s) => s.height))

    // Alternate sides of the walkway so no station hides behind another.
    const side: 'left' | 'right' = index % 2 === 0 ? 'left' : 'right'
    const centerX = (side === 'left' ? -1 : 1) * STATION_STAGGER_X
    const centerZ = FIRST_STATION_Z - index * STATION_SPACING

    // Walk the row from its left edge, centred on the station's own X.
    const artifacts: ShelfArtifact[] = []
    let x = centerX - contentLength / 2
    entries.forEach((entry, i) => {
      const half = footprints[i] / 2
      artifacts.push({
        id: entry.id,
        generation,
        position: [x + half, PLINTH_TOP, centerZ],
        // THE INVARIANT: the console's ROOM yaw, unchanged. See the file header.
        rotation: [0, yaws[i], 0],
        size: sizes[i],
        footprintX: footprints[i],
      })
      x += footprints[i] + (gaps[i] ?? 0)
    })

    return {
      generation,
      label: GENERATION_LABELS[generation],
      era: GENERATION_ERAS[generation] ?? null,
      // Entries are already sorted oldest-first above, so the first one holds
      // the generation's own date. Derived, never authored, like everything
      // else here.
      firstYear: earliestYear(entries[0]),
      boardY: PLINTH_TOP,
      boardLength,
      boardDepth,
      boardCenter: [centerX, PLINTH_TOP, centerZ],
      side,
      tallest,
      artifacts,
    }
  })

  const byId: Record<string, ShelfArtifact> = {}
  for (const bay of bays) for (const a of bay.artifacts) byId[a.id] = a

  const halfLengths = bays.map((b) => b.boardLength / 2 + Math.abs(b.boardCenter[0]))
  const farZ = bays[bays.length - 1].boardCenter[2] - HALL_RUN_OUT

  return {
    bays,
    byId,
    extent: {
      minX: -Math.max(...halfLengths),
      maxX: Math.max(...halfLengths),
      minY: FLOOR_Y,
      maxY: PLINTH_TOP + Math.max(...bays.map((b) => b.tallest)),
      minZ: farZ,
      maxZ: 0,
    },
    hall: {
      width: HALL_WIDTH,
      height: HALL_HEIGHT,
      floorY: FLOOR_Y,
      entranceZ: 0,
      farZ,
    },
  }
}

/**
 * Which generation the camera is currently nearest, given how far down the
 * hall it is looking.
 *
 * Measured against each station's own Z — the same point `bayShot` targets —
 * so "nearest" means the same thing to this function as it does to the camera
 * that framed it.
 *
 * Exists because travelling the hall used to move the camera without telling
 * anything about it: the generation rail and the accent light both kept
 * pointing at the station you had left. See `syncFocusGeneration` in the
 * scene store.
 */
export function generationNearestZ(layout: MuseumLayout, z: number): Generation {
  let best = layout.bays[0]
  let bestDistance = Infinity
  for (const bay of layout.bays) {
    const distance = Math.abs(bay.boardCenter[2] - z)
    if (distance < bestDistance) {
      bestDistance = distance
      best = bay
    }
  }
  return best.generation
}

/**
 * Which artifact sits under a given X on a station's plinth, or null for a gap.
 * The shelf hit-tests with one plane per station and resolves the artifact
 * here, rather than raycasting 180k triangles of console geometry.
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
  PLINTH_TOP,
  END_PAD,
  MIN_PLINTH,
  MAX_PLINTH,
  MIN_GAP,
  MAX_GAP,
  STATION_SPACING,
  STATION_STAGGER_X,
  FIRST_STATION_Z,
  HALL_WIDTH,
  HALL_HEIGHT,
  FLOOR_Y,
} as const
