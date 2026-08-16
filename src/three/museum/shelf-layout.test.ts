import { describe, expect, it } from 'vitest'
import { CONSOLES } from '@/data/consoles'
import { SHELF_CONSTANTS, artifactAtX, layoutMuseum, rotatedFootprintX } from './shelf-layout'
import { mm } from '../lighting'

/**
 * Same posture as shots.test.ts: the point of the layout is that nothing is
 * authored per console. These tests hold that line — if someone starts
 * hard-coding positions, the "move the data, the shelf follows" cases break.
 */

const layout = layoutMuseum(CONSOLES)

describe('museum layout', () => {
  it('shelves every built console exactly once', () => {
    const ids = layout.bays.flatMap((b) => b.artifacts.map((a) => a.id))
    expect(ids).toHaveLength(CONSOLES.length)
    expect(new Set(ids).size).toBe(CONSOLES.length)
    for (const c of CONSOLES) expect(layout.byId[c.id], c.id).toBeDefined()
  })

  /*
    Preconditions for the current-console marker (ShelfBay's CurrentMarker,
    grand plan §13). The marker renders on whichever bay reports holding the
    active console, so if any id were ever shelved twice the shelf would show
    two "you are here" plates at once — and because the marker is 3D geometry
    inside a component, this is the layer where that can actually be caught.
  */
  it('gives every console exactly one home bay for the current marker', () => {
    for (const c of CONSOLES) {
      const holding = layout.bays.filter((b) => b.artifacts.some((a) => a.id === c.id))
      expect(holding, `${c.id} shelved in ${holding.length} bays`).toHaveLength(1)
    }
  })

  it('leaves room on the board for a marker under every artifact', () => {
    // MARKER_WIDTH in ShelfBay.tsx. Kept as a literal here on purpose: this
    // asserts the LAYOUT has room for a marker of that size, so importing the
    // constant would make the test agree with itself rather than check it.
    const markerHalf = 0.044 / 2
    for (const bay of layout.bays) {
      for (const a of bay.artifacts) {
        expect(
          Math.abs(a.position[0]) + markerHalf,
          `${a.id} marker overhangs its board`,
        ).toBeLessThanOrEqual(bay.boardLength / 2)
      }
    }
  })

  it('orders bays oldest generation first, reading downward through time', () => {
    const gens = layout.bays.map((b) => b.generation)
    expect(gens).toEqual([...gens].sort((a, b) => a - b))
    // Oldest at the top means each successive bay sits lower.
    for (let i = 1; i < layout.bays.length; i += 1) {
      expect(layout.bays[i].boardY, `bay ${i}`).toBeLessThan(layout.bays[i - 1].boardY)
    }
  })

  it('never overlaps two artifacts on the same board', () => {
    for (const bay of layout.bays) {
      const sorted = [...bay.artifacts].sort((a, b) => a.position[0] - b.position[0])
      for (let i = 1; i < sorted.length; i += 1) {
        const prevRight = sorted[i - 1].position[0] + sorted[i - 1].footprintX / 2
        const thisLeft = sorted[i].position[0] - sorted[i].footprintX / 2
        expect(thisLeft, `gen ${bay.generation}: ${sorted[i].id} overlaps ${sorted[i - 1].id}`)
          .toBeGreaterThanOrEqual(prevRight - 1e-9)
      }
    }
  })

  it('keeps every artifact on its own board, clear of the ends', () => {
    for (const bay of layout.bays) {
      const half = bay.boardLength / 2
      for (const a of bay.artifacts) {
        expect(a.position[0] - a.footprintX / 2, `${a.id} off the left end`)
          .toBeGreaterThanOrEqual(-half)
        expect(a.position[0] + a.footprintX / 2, `${a.id} off the right end`)
          .toBeLessThanOrEqual(half)
        expect(a.position[1], `${a.id} not resting on its board`).toBeCloseTo(bay.boardY, 9)
      }
    }
  })

  it('never lets an artifact reach the board above it', () => {
    // The PS5 case: 390mm standing next to bays of ~90mm consoles.
    for (let i = 1; i < layout.bays.length; i += 1) {
      const upper = layout.bays[i - 1]
      const lower = layout.bays[i]
      const topOfTallest = lower.boardY + lower.tallest
      const underside = upper.boardY - SHELF_CONSTANTS.BOARD_THICKNESS
      expect(topOfTallest, `gen ${lower.generation} hits gen ${upper.generation}`)
        .toBeLessThanOrEqual(underside + 1e-9)
    }
  })

  it('gives the PS5 more headroom than the PS4, with no special case', () => {
    const ps5Bay = layout.bays.find((b) => b.artifacts.some((a) => a.id === 'ps5'))!
    const ps4Bay = layout.bays.find((b) => b.artifacts.some((a) => a.id === 'ps4'))!
    // Both bays hold exactly one console, so the only thing separating their
    // pitch is the measured height the layout reads off the data.
    expect(ps5Bay.tallest).toBeGreaterThan(ps4Bay.tallest * 3)
  })

  it('sizes boards to their contents rather than a fixed width', () => {
    const crowded = layout.bays.find((b) => b.artifacts.length === 3)!
    const lonely = layout.bays.find((b) => b.artifacts.length === 1)!
    expect(crowded.boardLength).toBeGreaterThan(lonely.boardLength)
    // ...but a single artifact still gets a plinth, not a sliver.
    expect(lonely.boardLength).toBeGreaterThanOrEqual(SHELF_CONSTANTS.MIN_BOARD)
    for (const bay of layout.bays) {
      expect(bay.boardLength, `gen ${bay.generation}`).toBeLessThanOrEqual(SHELF_CONSTANTS.MAX_BOARD)
    }
  })

  it('derives spacing from real dimensions, not a constant', () => {
    // The Atari is the widest console in the collection and the PS4 among the
    // narrower; if spacing were hard-coded these would be equal.
    const atari = layout.byId['atari-2600']
    const ps4 = layout.byId.ps4
    expect(atari.footprintX).toBeGreaterThan(ps4.footprintX)
  })

  it('accounts for the console being turned, not just its width', () => {
    // Every console keeps its room yaw here, so its footprint is the rotated
    // extent. Spacing off raw width would silently overlap neighbours.
    const atari = layout.byId['atari-2600']
    expect(atari.rotation[1]).not.toBe(0)
    expect(atari.footprintX).toBeGreaterThan(mm(346.1))
  })

  it('is deterministic', () => {
    const again = layoutMuseum(CONSOLES)
    expect(again).toEqual(layout)
  })
})

describe('rotatedFootprintX', () => {
  it('returns the width when unrotated', () => {
    expect(rotatedFootprintX(0.3, 0.2, 0)).toBeCloseTo(0.3, 9)
  })

  it('returns the depth at a quarter turn', () => {
    expect(rotatedFootprintX(0.3, 0.2, Math.PI / 2)).toBeCloseTo(0.2, 9)
  })

  it('is symmetric in the direction of rotation', () => {
    expect(rotatedFootprintX(0.3, 0.2, 0.4)).toBeCloseTo(rotatedFootprintX(0.3, 0.2, -0.4), 9)
  })
})

describe('artifactAtX', () => {
  it('finds the artifact under its own centre, for every artifact', () => {
    for (const bay of layout.bays) {
      for (const a of bay.artifacts) {
        expect(artifactAtX(bay, a.position[0])?.id, a.id).toBe(a.id)
      }
    }
  })

  it('returns null past the end of the row', () => {
    const bay = layout.bays[0]
    expect(artifactAtX(bay, -bay.boardLength)).toBeNull()
    expect(artifactAtX(bay, bay.boardLength)).toBeNull()
  })

  it('returns null in the gap between two neighbours', () => {
    const bay = layout.bays.find((b) => b.artifacts.length > 1)!
    const sorted = [...bay.artifacts].sort((a, b) => a.position[0] - b.position[0])
    const gapMid =
      (sorted[0].position[0] + sorted[0].footprintX / 2 +
        (sorted[1].position[0] - sorted[1].footprintX / 2)) / 2
    expect(artifactAtX(bay, gapMid)).toBeNull()
  })
})
