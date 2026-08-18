import { describe, expect, it } from 'vitest'
import {
  BOX_FACE,
  boxProfile,
  boxSizeMetres,
  coverAspect,
  labelPlane,
  layoutSpread,
  mediaAnchor,
  spreadExtent,
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

describe('box profile', () => {
  it('converts width and height to metres, centred on the origin', () => {
    const p = boxProfile(archetype('cart-snes-na'))
    expect(p.w).toBeCloseTo(0.136, 6)
    expect(p.h).toBeCloseTo(0.088, 6)
  })

  it('uses the published corner radius, in metres', () => {
    const p = boxProfile(archetype('cart-nes'))
    expect(p.r).toBeCloseTo(0.004, 6)
  })

  it('never lets the radius exceed half the shorter side', () => {
    for (const a of Object.values(MEDIA_ARCHETYPES)) {
      const p = boxProfile(a)
      const shortSide = Math.min(a.dimensions.width, a.dimensions.height) * 0.001
      expect(p.r, a.id).toBeLessThanOrEqual(shortSide / 2 + 1e-9)
    }
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
      // A horizontal offset (the NES's ridge-clearing shift) must still
      // leave the label fully inside the shell's width.
      const right = Math.abs(plane.position[0]) + plane.width / 2
      expect(right, `${a.id} label overflows shell width`).toBeLessThanOrEqual(
        a.dimensions.width / 2000 + 1e-9,
      )
    }
  })

  it('offsets the NES label right of centre, clear of the connector ridge', () => {
    const plane = labelPlane(archetype('cart-nes'))!
    expect(plane.position[0]).toBeGreaterThan(0)
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

describe('spread layout', () => {
  const cart = archetype('cart-snes-na')

  it('splits ten games across two ranks as evenly as possible', () => {
    const slots = layoutSpread({ archetype: cart, count: 10 })
    expect(slots).toHaveLength(10)
    expect(new Set(slots.map((s) => s.rank)).size).toBe(2)
    expect(slots.filter((s) => s.rank === 0)).toHaveLength(5)
    expect(slots.filter((s) => s.rank === 1)).toHaveLength(5)
  })

  it('sends any remainder to the front rank first', () => {
    // 7 games over 2 ranks = 4 front, 3 back.
    const slots = layoutSpread({ archetype: cart, count: 7 })
    expect(slots.filter((s) => s.rank === 0)).toHaveLength(4)
    expect(slots.filter((s) => s.rank === 1)).toHaveLength(3)
  })

  it('never overlaps neighbouring boxes within a rank', () => {
    const slots = layoutSpread({ archetype: cart, count: 10 })
    const halfW = cart.dimensions.width / 2000
    const front = slots.filter((s) => s.rank === 0).sort((a, b) => a.position[0] - b.position[0])
    for (let i = 1; i < front.length; i++) {
      const gap = front[i].position[0] - halfW - (front[i - 1].position[0] + halfW)
      expect(gap, `boxes ${i - 1}/${i} overlap`).toBeGreaterThanOrEqual(-1e-9)
    }
  })

  it('centres each rank on its own occupancy', () => {
    const slots = layoutSpread({ archetype: cart, count: 7 })
    const back = slots.filter((s) => s.rank === 1)
    expect(back).toHaveLength(3)
    const xs = back.map((s) => s.position[0]).sort((a, b) => a - b)
    // Symmetric about the centre line, since the back rank's stagger is a
    // fixed offset applied to an otherwise-centred row.
    expect(xs[0] + xs[2]).toBeCloseTo(2 * xs[1], 6)
  })

  it('stands every box on the floor, never below it', () => {
    const slots = layoutSpread({ archetype: cart, count: 10 })
    const halfH = cart.dimensions.height / 2000
    for (const s of slots) {
      expect(s.position[1] - halfH).toBeGreaterThanOrEqual(-1e-9)
    }
  })

  it('pushes the back rank away from the front along Z', () => {
    const slots = layoutSpread({ archetype: cart, count: 10 })
    const front = slots.find((s) => s.rank === 0)!
    const back = slots.find((s) => s.rank === 1)!
    expect(back.position[2]).toBeGreaterThan(front.position[2])
  })

  it('rakes every box back by the same angle', () => {
    const slots = layoutSpread({ archetype: cart, count: 10, rakeDeg: 8 })
    for (const s of slots) {
      expect(s.rotation[0]).toBeCloseTo((8 * Math.PI) / 180, 6)
    }
  })

  it('staggers the back rank half a pitch from the front', () => {
    const slots = layoutSpread({ archetype: cart, count: 4, ranks: 2, gapMm: 4 })
    const front = slots.filter((s) => s.rank === 0).map((s) => s.position[0])
    const back = slots.filter((s) => s.rank === 1).map((s) => s.position[0])
    // Every back-rank x should differ from every front-rank x — nothing sits
    // directly behind anything else.
    for (const bx of back) {
      for (const fx of front) {
        expect(Math.abs(bx - fx)).toBeGreaterThan(0.001)
      }
    }
  })

  it('handles an empty and a single-item spread', () => {
    expect(layoutSpread({ archetype: cart, count: 0 })).toEqual([])
    const one = layoutSpread({ archetype: cart, count: 1 })
    expect(one).toHaveLength(1)
    expect(one[0].position[0]).toBeCloseTo(0, 9)
  })

  it('reports an extent that matches the laid-out boxes', () => {
    const slots = layoutSpread({ archetype: cart, count: 10 })
    const { width, depth, height } = spreadExtent(slots, cart)
    expect(width).toBeGreaterThan(0)
    expect(depth).toBeGreaterThan(0)
    expect(height).toBeCloseTo(cart.dimensions.height / 1000, 6)
  })

  it('lays out every archetype without throwing', () => {
    for (const a of Object.values(MEDIA_ARCHETYPES)) {
      expect(() => layoutSpread({ archetype: a, count: 10 })).not.toThrow()
    }
  })
})

describe('media anchor', () => {
  it('sits beside the console, clear of its own footprint', () => {
    const spec = snes.diorama
    const anchor = mediaAnchor(snes, spec)
    const consoleHalfWidth = snes.dimensions.width / 2000
    expect(anchor[0]).toBeGreaterThan(spec.consolePosition[0] + consoleHalfWidth)
  })

  it('stays on the console\'s own floor level', () => {
    const spec = snes.diorama
    const anchor = mediaAnchor(snes, spec)
    expect(anchor[1]).toBeCloseTo(spec.consolePosition[1], 9)
  })

  it('moves with the console when consolePosition moves', () => {
    const spec = { ...snes.diorama, consolePosition: [1, 0.5, -2] as [number, number, number] }
    const anchor = mediaAnchor(snes, spec)
    expect(anchor[2]).toBeCloseTo(-2, 6)
  })
})
