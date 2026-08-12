import type { MediaArchetype } from '@/types/console'
import { MM } from '@/data/kits/media-archetypes'

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
    position: [0, l.offsetYMm * MM, z],
    aspect: l.widthMm / l.heightMm,
  }
}

/**
 * Aspect ratio the cover artwork should be authored at for this archetype —
 * the label for cartridges, the whole front face for cases.
 */
export function coverAspect(a: MediaArchetype): number {
  const l = a.cartridgeLabel
  if (l) return l.widthMm / l.heightMm
  return a.dimensions.width / a.dimensions.height
}

/* ------------------------------------------------------------------ */
/* Shelf layout                                                        */
/* ------------------------------------------------------------------ */

export type ShelfSlot = {
  index: number
  row: number
  column: number
  /** Metres, relative to the shelf anchor (centre of the bottom row). */
  position: [number, number, number]
}

export type ShelfLayoutOptions = {
  archetype: MediaArchetype
  count: number
  /** Usable interior width of the shelf, in mm. */
  shelfWidthMm: number
  /** Vertical spacing between shelf boards, in mm. Defaults to box height + clearance. */
  rowPitchMm?: number
  /** Gap between neighbouring boxes, in mm. */
  gapMm?: number
}

const DEFAULT_GAP_MM = 4
const ROW_CLEARANCE_MM = 45

export type ShelfMetrics = {
  perRow: number
  rows: number
  rowPitchMm: number
  gapMm: number
}

/**
 * How the boxes pack. Shared by the layout and by the shelving unit that draws
 * boards under each row, so the carcass can never disagree with its contents.
 */
export function shelfMetrics({
  archetype: a,
  count,
  shelfWidthMm,
  rowPitchMm,
  gapMm = DEFAULT_GAP_MM,
}: ShelfLayoutOptions): ShelfMetrics {
  const perRow = Math.max(1, Math.floor((shelfWidthMm + gapMm) / (a.dimensions.width + gapMm)))
  return {
    perRow,
    rows: Math.max(0, Math.ceil(count / perRow)),
    rowPitchMm: rowPitchMm ?? a.dimensions.height + ROW_CLEARANCE_MM,
    gapMm,
  }
}

/**
 * Arrange boxes standing upright, faced out, filling left to right and then
 * upward. Faced-out rather than spine-out is both readable and honest: this is
 * how cartridges were actually stood on a shelf, and it is the only arrangement
 * where a cartridge is identifiable at all — carts have no spine print.
 *
 * Rows are centred individually, so a short final row sits centred rather than
 * hanging off the left edge.
 */
export function layoutShelf(options: ShelfLayoutOptions): ShelfSlot[] {
  const { archetype: a, count } = options
  if (count <= 0) return []

  const boxW = a.dimensions.width
  const boxH = a.dimensions.height
  const { perRow, rowPitchMm: pitch, gapMm } = shelfMetrics(options)

  const slots: ShelfSlot[] = []
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / perRow)
    const column = i % perRow

    // Centre each row on its own occupancy, not on the theoretical full row.
    const inThisRow = Math.min(perRow, count - row * perRow)
    const rowWidth = inThisRow * boxW + (inThisRow - 1) * gapMm

    const xMm = -rowWidth / 2 + column * (boxW + gapMm) + boxW / 2
    const yMm = row * pitch + boxH / 2

    slots.push({
      index: i,
      row,
      column,
      position: [xMm * MM, yMm * MM, 0],
    })
  }
  return slots
}

/** Total footprint of a laid-out shelf, in metres — useful for framing shots. */
export function shelfExtent(slots: ShelfSlot[], a: MediaArchetype) {
  if (slots.length === 0) return { width: 0, height: 0 }
  const halfW = (a.dimensions.width / 2) * MM
  const halfH = (a.dimensions.height / 2) * MM
  let minX = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const s of slots) {
    minX = Math.min(minX, s.position[0] - halfW)
    maxX = Math.max(maxX, s.position[0] + halfW)
    maxY = Math.max(maxY, s.position[1] + halfH)
  }
  return { width: maxX - minX, height: maxY }
}
