import { describe, expect, it } from 'vitest'
import { CONSOLES } from '@/data/consoles'
import {
  SHELF_CONSTANTS,
  artifactAtX,
  generationNearestZ,
  layoutMuseum,
  rotatedFootprintX,
} from './shelf-layout'
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
          Math.abs(a.position[0] - bay.boardCenter[0]) + markerHalf,
          `${a.id} marker overhangs its plinth`,
        ).toBeLessThanOrEqual(bay.boardLength / 2)
      }
    }
  })

  /*
    `generationNearestZ` is what lets travelling the hall tell the rest of the
    app where it ended up — the fix for a rail and an accent light that both
    kept pointing at the station you had already left. It has to agree with the
    camera: it measures to the same point `bayShot` targets, so "nearest" means
    one thing to both.
  */
  describe('generationNearestZ', () => {
    it('returns each station when asked at that station’s own depth', () => {
      for (const bay of layout.bays) {
        expect(generationNearestZ(layout, bay.boardCenter[2]), `gen ${bay.generation}`).toBe(
          bay.generation,
        )
      }
    })

    it('clamps to the end stations beyond either end of the hall', () => {
      const first = layout.bays[0]
      const last = layout.bays[layout.bays.length - 1]
      // Stations recede along −Z, so the FIRST is nearest the entrance.
      expect(generationNearestZ(layout, first.boardCenter[2] + 100)).toBe(first.generation)
      expect(generationNearestZ(layout, last.boardCenter[2] - 100)).toBe(last.generation)
    })

    it('never answers with a generation that has no station', () => {
      const known = new Set(layout.bays.map((b) => b.generation))
      for (let z = 5; z >= layout.hall.farZ - 5; z -= 0.25) {
        expect(known.has(generationNearestZ(layout, z)), `z=${z.toFixed(2)}`).toBe(true)
      }
    })
  })

  it('orders stations oldest first, receding into the hall through time', () => {
    const gens = layout.bays.map((b) => b.generation)
    expect(gens).toEqual([...gens].sort((a, b) => a - b))
    // Walking deeper into the hall is walking forward through time, so each
    // successive station sits further along −Z than the one before it.
    for (let i = 1; i < layout.bays.length; i += 1) {
      expect(layout.bays[i].boardCenter[2], `station ${i}`).toBeLessThan(
        layout.bays[i - 1].boardCenter[2],
      )
    }
  })

  /*
    The reason stations alternate sides at all: on one centre line, every
    plinth would hide behind the one in front of it when you look down the
    hall. This is the mitigation, so it is worth pinning rather than trusting.
  */
  it('alternates stations to either side of the walkway', () => {
    for (let i = 1; i < layout.bays.length; i += 1) {
      expect(layout.bays[i].side, `station ${i}`).not.toBe(layout.bays[i - 1].side)
    }
    // And each really is off the centre line, not merely labelled.
    for (const bay of layout.bays) {
      expect(Math.abs(bay.boardCenter[0]), `gen ${bay.generation}`).toBeGreaterThan(0.5)
      const sign = bay.side === 'left' ? -1 : 1
      expect(Math.sign(bay.boardCenter[0]), `gen ${bay.generation} on the wrong side`).toBe(sign)
    }
  })

  it('keeps every station and its consoles inside the hall', () => {
    const halfWidth = layout.hall.width / 2
    for (const bay of layout.bays) {
      expect(bay.boardCenter[0] - bay.boardLength / 2, `gen ${bay.generation} through the left wall`)
        .toBeGreaterThan(-halfWidth)
      expect(bay.boardCenter[0] + bay.boardLength / 2, `gen ${bay.generation} through the right wall`)
        .toBeLessThan(halfWidth)
      expect(bay.boardY + bay.tallest, `gen ${bay.generation} through the ceiling`)
        .toBeLessThan(layout.hall.height)
      expect(bay.boardCenter[2], `gen ${bay.generation} past the far wall`)
        .toBeGreaterThan(layout.hall.farZ)
    }
  })

  it('stands every plinth on the floor at one height', () => {
    // A hall's plinths all rise from the same floor — that is most of what
    // separates it from the stacked wall this replaced, where a console's
    // height depended on which generation it belonged to.
    for (const bay of layout.bays) {
      expect(bay.boardY, `gen ${bay.generation}`).toBe(SHELF_CONSTANTS.PLINTH_TOP)
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
      const left = bay.boardCenter[0] - bay.boardLength / 2
      const right = bay.boardCenter[0] + bay.boardLength / 2
      for (const a of bay.artifacts) {
        expect(a.position[0] - a.footprintX / 2, `${a.id} off the left end`)
          .toBeGreaterThanOrEqual(left)
        expect(a.position[0] + a.footprintX / 2, `${a.id} off the right end`)
          .toBeLessThanOrEqual(right)
        expect(a.position[1], `${a.id} not resting on its plinth`).toBeCloseTo(bay.boardY, 9)
        expect(a.position[2], `${a.id} not on its station's line`)
          .toBeCloseTo(bay.boardCenter[2], 9)
      }
    }
  })

  it('never lets one station reach the next one down the hall', () => {
    // Replaces the old vertical version of this check. Stations no longer
    // stack, so what has to clear is DEPTH: a plinth's footprint plus the
    // console overhang must not run into the station behind it.
    for (let i = 1; i < layout.bays.length; i += 1) {
      const nearer = layout.bays[i - 1]
      const further = layout.bays[i]
      const nearerBack = nearer.boardCenter[2] - nearer.boardDepth / 2
      const furtherFront = further.boardCenter[2] + further.boardDepth / 2
      expect(furtherFront, `gen ${further.generation} runs into gen ${nearer.generation}`)
        .toBeLessThan(nearerBack)
    }
  })

  it('reads the PS5 as much taller than the PS4, with no special case', () => {
    const ps5Bay = layout.bays.find((b) => b.artifacts.some((a) => a.id === 'ps5'))!
    const ps4Bay = layout.bays.find((b) => b.artifacts.some((a) => a.id === 'ps4'))!
    // The standing PS5 is what makes its station's framing pull back, and that
    // comes only from the measured height the layout reads off the data.
    expect(ps5Bay.tallest).toBeGreaterThan(ps4Bay.tallest * 3)
  })

  it('sizes boards to their contents rather than a fixed width', () => {
    const crowded = layout.bays.find((b) => b.artifacts.length === 3)!
    const lonely = layout.bays.find((b) => b.artifacts.length === 1)!
    expect(crowded.boardLength).toBeGreaterThan(lonely.boardLength)
    // ...but a single artifact still gets a plinth, not a sliver.
    expect(lonely.boardLength).toBeGreaterThanOrEqual(SHELF_CONSTANTS.MIN_PLINTH)
    for (const bay of layout.bays) {
      expect(bay.boardLength, `gen ${bay.generation}`).toBeLessThanOrEqual(SHELF_CONSTANTS.MAX_PLINTH)
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
    expect(artifactAtX(bay, bay.boardCenter[0] - bay.boardLength)).toBeNull()
    expect(artifactAtX(bay, bay.boardCenter[0] + bay.boardLength)).toBeNull()
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
