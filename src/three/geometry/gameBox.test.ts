import { describe, expect, it } from 'vitest'
import {
  BOX_FACE,
  boxSizeMetres,
  coverAspect,
  labelPlane,
  layoutShelf,
  shelfExtent,
} from './gameBox'
import { archetype, MEDIA_ARCHETYPES } from '@/data/kits/media-archetypes'
import { snes } from '@/data/consoles/snes'

/**
 * The whole 22-console roadmap rests on these functions producing correctly
 * sized boxes from the mm table. A box that is subtly the wrong size next to a
 * correctly sized console reads as broken, so the dimensions are pinned here.
 */

describe('box geometry', () => {
  it('converts the SNES cartridge to exact scene metres', () => {
    const [w, h, d] = boxSizeMetres(archetype('cart-snes-na'))
    expect(w).toBeCloseTo(0.136, 6)
    expect(h).toBeCloseTo(0.088, 6)
    expect(d).toBeCloseTo(0.02, 6)
  })

  it('derives every archetype size from the published mm table', () => {
    for (const a of Object.values(MEDIA_ARCHETYPES)) {
      const [w, h, d] = boxSizeMetres(a)
      expect(w, `${a.id} width`).toBeCloseTo(a.dimensions.width / 1000, 9)
      expect(h, `${a.id} height`).toBeCloseTo(a.dimensions.height / 1000, 9)
      expect(d, `${a.id} depth`).toBeCloseTo(a.dimensions.depth / 1000, 9)
    }
  })

  it('names BoxGeometry face groups in three.js order', () => {
    // If three ever reorders these, the cover art silently moves to the side.
    expect(BOX_FACE).toEqual({
      right: 0,
      left: 1,
      top: 2,
      bottom: 3,
      front: 4,
      back: 5,
    })
  })
})

describe('cartridge labels', () => {
  it('places the NES label at its published size, not a proportional guess', () => {
    // NESdev: 55 x 97 mm — 46% of the width but 72% of the height. A single
    // inset scalar could not express that.
    const plane = labelPlane(archetype('cart-nes'))!
    expect(plane.width).toBeCloseTo(0.055, 6)
    expect(plane.height).toBeCloseTo(0.097, 6)
  })

  it('sits the label proud of the front face so it cannot z-fight', () => {
    const a = archetype('cart-snes-na')
    const plane = labelPlane(a)!
    const halfDepth = a.dimensions.depth / 2000
    expect(plane.position[2]).toBeGreaterThan(halfDepth)
    // ...but only just: a visibly floating sticker is worse than a flat one.
    expect(plane.position[2] - halfDepth).toBeLessThan(0.0005)
  })

  it('keeps every label inside its own shell', () => {
    for (const a of Object.values(MEDIA_ARCHETYPES)) {
      const plane = labelPlane(a)
      if (!plane) continue
      expect(plane.width, `${a.id} label wider than shell`).toBeLessThanOrEqual(
        a.dimensions.width / 1000,
      )
      const top = Math.abs(plane.position[1]) + plane.height / 2
      expect(top, `${a.id} label overflows shell height`).toBeLessThanOrEqual(
        a.dimensions.height / 1000 + 1e-9,
      )
    }
  })

  it('returns no label plane for cases, which print edge to edge', () => {
    expect(labelPlane(archetype('jewel-cd'))).toBeNull()
    expect(labelPlane(archetype('dvd-keepcase'))).toBeNull()
    expect(labelPlane(archetype('switch-case'))).toBeNull()
  })

  it('authors cover art at the label aspect for carts, face aspect for cases', () => {
    expect(coverAspect(archetype('cart-nes'))).toBeCloseTo(55 / 97, 6)
    expect(coverAspect(archetype('dvd-keepcase'))).toBeCloseTo(135 / 190, 6)
  })
})

describe('shelf layout', () => {
  const cart = archetype('cart-snes-na')

  it('fits five 136mm cartridges across a 760mm shelf', () => {
    const slots = layoutShelf({ archetype: cart, count: 10, shelfWidthMm: 760 })
    expect(slots).toHaveLength(10)
    expect(new Set(slots.map((s) => s.row)).size).toBe(2)
    expect(slots.filter((s) => s.row === 0)).toHaveLength(5)
  })

  it('never overlaps neighbouring boxes in a row', () => {
    const slots = layoutShelf({ archetype: cart, count: 10, shelfWidthMm: 760 })
    const halfW = cart.dimensions.width / 2000
    const row0 = slots.filter((s) => s.row === 0).sort((a, b) => a.position[0] - b.position[0])
    for (let i = 1; i < row0.length; i++) {
      const gap = row0[i].position[0] - halfW - (row0[i - 1].position[0] + halfW)
      expect(gap, `boxes ${i - 1}/${i} overlap`).toBeGreaterThanOrEqual(-1e-9)
    }
  })

  it('stays inside the shelf width', () => {
    const slots = layoutShelf({ archetype: cart, count: 10, shelfWidthMm: 760 })
    const halfW = cart.dimensions.width / 2000
    for (const s of slots) {
      expect(Math.abs(s.position[0]) + halfW).toBeLessThanOrEqual(760 / 2000 + 1e-9)
    }
  })

  it('centres a short final row rather than left-aligning it', () => {
    // 7 SNES carts = 5 + 2. The pair should straddle the centre line.
    const slots = layoutShelf({ archetype: cart, count: 7, shelfWidthMm: 760 })
    const lastRow = slots.filter((s) => s.row === 1)
    expect(lastRow).toHaveLength(2)
    const centre = (lastRow[0].position[0] + lastRow[1].position[0]) / 2
    expect(centre).toBeCloseTo(0, 9)
  })

  it('stands every box on the row it belongs to, resting on the board', () => {
    const slots = layoutShelf({ archetype: cart, count: 10, shelfWidthMm: 760 })
    const halfH = cart.dimensions.height / 2000
    for (const s of slots) {
      // Bottom of the box is at the row's board height, never below it.
      expect(s.position[1] - halfH).toBeGreaterThanOrEqual(-1e-9)
    }
    const row1Y = slots.find((s) => s.row === 1)!.position[1]
    const row0Y = slots.find((s) => s.row === 0)!.position[1]
    expect(row1Y).toBeGreaterThan(row0Y)
  })

  it('derives rows-per-shelf from width alone, for every archetype', () => {
    // The point of the parametric kit: no per-console tuning anywhere. Packing
    // is purely a function of the published width and the gap.
    const shelfWidthMm = 760
    const gapMm = 4
    for (const a of Object.values(MEDIA_ARCHETYPES)) {
      const slots = layoutShelf({ archetype: a, count: 10, shelfWidthMm })
      const perRow = slots.filter((s) => s.row === 0).length
      const expected = Math.max(
        1,
        Math.floor((shelfWidthMm + gapMm) / (a.dimensions.width + gapMm)),
      )
      expect(perRow, `${a.id}`).toBe(Math.min(expected, 10))
    }
  })

  it('packs a narrow archetype more densely than a wide one', () => {
    const wide = layoutShelf({ archetype: archetype('dvd-keepcase'), count: 12, shelfWidthMm: 600 })
    const narrow = layoutShelf({ archetype: archetype('switch-case'), count: 12, shelfWidthMm: 600 })
    const perRow = (s: typeof wide) => s.filter((x) => x.row === 0).length
    expect(perRow(narrow)).toBeGreaterThan(perRow(wide))
  })

  it('handles empty and single-item shelves', () => {
    expect(layoutShelf({ archetype: cart, count: 0, shelfWidthMm: 760 })).toEqual([])
    const one = layoutShelf({ archetype: cart, count: 1, shelfWidthMm: 760 })
    expect(one).toHaveLength(1)
    expect(one[0].position[0]).toBeCloseTo(0, 9)
  })

  it('falls back to one per row when the shelf is narrower than a box', () => {
    const slots = layoutShelf({ archetype: cart, count: 3, shelfWidthMm: 50 })
    expect(slots.map((s) => s.row)).toEqual([0, 1, 2])
  })

  it('reports an extent that matches the laid-out boxes', () => {
    const slots = layoutShelf({ archetype: cart, count: 10, shelfWidthMm: 760 })
    const { width, height } = shelfExtent(slots, cart)
    // Five 136mm carts plus four 4mm gaps.
    expect(width).toBeCloseTo((5 * 136 + 4 * 4) / 1000, 6)
    expect(height).toBeGreaterThan(cart.dimensions.height / 1000)
  })
})

describe('the SNES shelf as configured', () => {
  it('lays out all ten games inside the bookshelf', () => {
    const a = archetype(snes.mediaArchetype)
    const slots = layoutShelf({
      archetype: a,
      count: snes.games.length,
      shelfWidthMm: 760,
    })
    expect(slots).toHaveLength(10)

    const { height } = shelfExtent(slots, a)
    // Must fit within the 1600mm bookshelf, from its 550mm bottom board.
    expect(height).toBeLessThan(1.6 - 0.55)
  })
})
