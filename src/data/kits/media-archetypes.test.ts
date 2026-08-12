import { describe, expect, it } from 'vitest'
import { MEDIA_ARCHETYPES, MM, archetype, archetypeSizeMetres } from './media-archetypes'
import { CONSOLES } from '@/data/consoles'
import type { MediaArchetypeId } from '@/types/console'

/**
 * Dimensional accuracy is a product requirement, not an implementation detail —
 * a cartridge that is the wrong size next to a correctly-sized console reads as
 * broken. These tests pin the published figures so a refactor cannot drift them.
 */

describe('media archetypes', () => {
  it('holds the exact published SNES Game Pak dimensions', () => {
    // Wikipedia / Nintendo spec: 5.35in x 3.45in x 0.78in.
    expect(archetype('cart-snes-na').dimensions).toEqual({
      width: 136,
      height: 88,
      depth: 20,
    })
    expect(archetype('cart-snes-na').precision).toBe('exact')
  })

  it('keeps the Super Famicom cartridge a distinct physical shape', () => {
    // The shells differ specifically so imports would not fit. If these ever
    // become equal, the region-lock story in the UI is a lie.
    const na = archetype('cart-snes-na').dimensions
    const jp = archetype('cart-snes-jp').dimensions
    expect(jp).not.toEqual(na)
    expect(jp.width).toBeLessThan(na.width)
    expect(jp.height).toBeLessThan(na.height)
  })

  it('holds the exact published N64 Game Pak dimensions', () => {
    expect(archetype('cart-n64').dimensions).toEqual({
      width: 116,
      height: 76.6,
      depth: 18.5,
    })
  })

  it('uses the industry-standard optical case sizes', () => {
    expect(archetype('jewel-cd').dimensions).toEqual({ width: 125, height: 142, depth: 10 })
    expect(archetype('dvd-keepcase').dimensions).toEqual({ width: 135, height: 190, depth: 14 })
    expect(archetype('bluray-case').dimensions).toEqual({ width: 135, height: 171, depth: 12 })
  })

  it('converts millimetres to scene metres', () => {
    const [w, h, d] = archetypeSizeMetres('cart-snes-na')
    expect(w).toBeCloseTo(0.136, 6)
    expect(h).toBeCloseTo(0.088, 6)
    expect(d).toBeCloseTo(0.02, 6)
    expect(MM).toBe(0.001)
  })

  it('gives every archetype plausible, positive dimensions', () => {
    for (const [id, a] of Object.entries(MEDIA_ARCHETYPES)) {
      expect(a.id, `${id} id mismatch`).toBe(id)
      for (const axis of ['width', 'height', 'depth'] as const) {
        expect(a.dimensions[axis], `${id}.${axis}`).toBeGreaterThan(0)
        expect(a.dimensions[axis], `${id}.${axis} implausibly large`).toBeLessThan(300)
      }
      // Corner radius cannot exceed half the smallest face dimension.
      const minFace = Math.min(a.dimensions.width, a.dimensions.height)
      expect(a.cornerRadiusMm, `${id} corner radius`).toBeLessThanOrEqual(minFace / 2)
      // Cartridges carry a sticker at its own real size; cases print to the edge.
      if (a.cartridgeLabel) {
        expect(a.kind, `${id} only cartridges have labels`).toBe('cartridge')
        expect(a.cartridgeLabel.widthMm, `${id} label width`).toBeGreaterThan(0)
        expect(a.cartridgeLabel.heightMm, `${id} label height`).toBeGreaterThan(0)
        expect(a.cartridgeLabel.widthMm, `${id} label wider than shell`).toBeLessThanOrEqual(
          a.dimensions.width,
        )
        expect(a.cartridgeLabel.heightMm, `${id} label taller than shell`).toBeLessThanOrEqual(
          a.dimensions.height,
        )
      } else {
        expect(a.kind, `${id} cases print edge to edge`).not.toBe('cartridge')
      }
      expect(a.source.length, `${id} needs a provenance note`).toBeGreaterThan(10)
    }
  })

  it('documents which dimensions are still unverified', () => {
    // Not a failure — a visible ledger. Anything approximate must be
    // re-measured before that console ships.
    const approximate = Object.values(MEDIA_ARCHETYPES)
      .filter((a) => a.precision === 'approximate')
      .map((a) => a.id)
    expect(approximate).toEqual([
      'cart-atari-2600',
      'cart-nes',
      'cart-sms',
      'cart-genesis',
      'switch-case',
    ])
  })
})

describe('console roster', () => {
  it('references only archetypes that exist', () => {
    for (const c of CONSOLES) {
      expect(MEDIA_ARCHETYPES[c.mediaArchetype], `${c.id}`).toBeDefined()
      for (const v of c.variants) {
        expect(MEDIA_ARCHETYPES[v.mediaArchetype], `${c.id}/${v.id}`).toBeDefined()
      }
    }
  })

  it('keeps mediaKind consistent with its archetype', () => {
    for (const c of CONSOLES) {
      expect(archetype(c.mediaArchetype).kind, `${c.id}`).toBe(c.mediaKind)
    }
  })

  it('ships exactly ten ranked games per console, in descending sales order', () => {
    for (const c of CONSOLES) {
      expect(c.games, `${c.id}`).toHaveLength(10)
      c.games.forEach((g, i) => {
        expect(g.rank, `${c.id} rank ${i}`).toBe(i + 1)
        if (i > 0) {
          expect(g.unitsSold, `${c.id} ${g.title} out of order`).toBeLessThanOrEqual(
            c.games[i - 1].unitsSold,
          )
        }
      })
    }
  })

  it('names animated meshes for every part its insert sequence needs', () => {
    for (const c of CONSOLES) {
      if (c.mediaKind === 'cartridge') {
        expect(c.animatedParts.slot, `${c.id} needs a slot mesh`).toBeTruthy()
      } else if (c.mediaKind === 'optical') {
        expect(
          c.animatedParts.tray ?? c.animatedParts.lid,
          `${c.id} needs a tray or lid mesh`,
        ).toBeTruthy()
      }
      expect(c.animatedParts.powerSwitch, `${c.id} needs a power switch`).toBeTruthy()
    }
  })

  it('gives controller buttons unique ids and non-conflicting keys', () => {
    for (const c of CONSOLES) {
      for (const pad of c.controllers) {
        const ids = pad.buttons.map((b) => b.id)
        expect(new Set(ids).size, `${c.id}/${pad.id} duplicate button id`).toBe(ids.length)

        const keys = pad.buttons.map((b) => b.key).filter(Boolean)
        expect(new Set(keys).size, `${c.id}/${pad.id} duplicate key binding`).toBe(keys.length)
      }
    }
  })

  it('cites sources for every console', () => {
    for (const c of CONSOLES) {
      expect(c.sources.length, `${c.id}`).toBeGreaterThan(0)
    }
  })
})

describe('SNES hardware facts', () => {
  const snes = CONSOLES.find((c) => c.id === 'snes')!

  it('uses the published console dimensions', () => {
    // Dimensions.com: 8in x 2.68in x 10in. An earlier draft had 200x72x242,
    // which was wrong on all three axes.
    expect(snes.dimensions).toEqual({ width: 203.2, height: 68, depth: 254 })
  })

  it('keeps the cartridge slot able to accept its own Game Pak', () => {
    // A console narrower than its cartridge is the kind of error that only
    // shows up once the insert animation runs.
    const cart = archetype(snes.mediaArchetype).dimensions
    expect(snes.dimensions.width).toBeGreaterThan(cart.width)
    expect(snes.dimensions.depth).toBeGreaterThan(cart.depth)
  })

  it('records the NA pad button shapes correctly', () => {
    // A and B are purple and convex; X and Y are lavender and concave. The two
    // shapes exist so a thumb can tell them apart, and the anatomy mode is
    // built to explain exactly that — so the data must not blur it.
    const pad = snes.controllers[0]
    const note = (id: string) => pad.buttons.find((b) => b.id === id)!.note ?? ''

    expect(note('a')).toMatch(/convex/i)
    expect(note('b')).toMatch(/convex/i)
    expect(note('x')).toMatch(/concave/i)
    expect(note('y')).toMatch(/concave/i)

    expect(note('a')).toMatch(/purple/i)
    expect(note('x')).toMatch(/lavender/i)
  })

  it('declares the shoulder buttons this generation introduced', () => {
    const pad = snes.controllers[0]
    expect(pad.buttons.map((b) => b.id)).toEqual(expect.arrayContaining(['l', 'r']))
    expect(pad.innovations.join(' ')).toMatch(/shoulder/i)
  })
})

describe('archetype lookup', () => {
  it('throws loudly on an unknown id rather than returning undefined', () => {
    expect(() => archetype('cart-does-not-exist' as MediaArchetypeId)).toThrow(
      /Unknown media archetype/,
    )
  })
})
