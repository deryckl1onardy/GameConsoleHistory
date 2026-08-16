import { describe, expect, it } from 'vitest'
import { CONSOLES } from '@/data/consoles'
import {
  SHELF_CONSTANTS,
  artifactAtX,
  layoutMuseum,
  rotatedFootprintX,
} from './shelf-layout'
import {
  consoleAtYear,
  consoleOrder,
  firstOfGeneration,
  nextConsole,
  nextGeneration,
  prevConsole,
  prevGeneration,
  yearOf,
} from './hall-glide'
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
    `generationNearestZ` — "which station is the camera in front of" — was
    deleted with the travelling camera it served (the camera no longer
    travels; the hall presents instead). Its coverage migrated to the console
    order helpers above: next/prev generation stepping, firstOfGeneration and
    the walk order are the navigation facts the hall now exposes.
  */
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
    The reason stations recede along a diagonal at all: on one centre line,
    every plinth would hide behind the one in front of it when you look down
    the hall. The diagonal is the mitigation — it guarantees each station its
    own screen column — so it is worth pinning rather than trusting.
  */
  it('recedes along a shallow diagonal with no shared screen column', () => {
    // Each station sits further right than the one before it — a monotonic
    // run across the hall, not a zigzag.
    for (let i = 1; i < layout.bays.length; i += 1) {
      expect(layout.bays[i].boardCenter[0], `station ${i}`).toBeGreaterThan(
        layout.bays[i - 1].boardCenter[0],
      )
    }
    // The run is shallow: the whole diagonal stays well inside the walls...
    for (const bay of layout.bays) {
      expect(Math.abs(bay.boardCenter[0]), `gen ${bay.generation} through a wall`).toBeLessThan(
        layout.hall.width / 2 - bay.boardLength / 2,
      )
    }
    // ...and crosses the centre line somewhere in the middle (it is a line
    // of history, not a corridor hugging one wall).
    expect(layout.bays[0].boardCenter[0]).toBeLessThan(0)
    expect(layout.bays[layout.bays.length - 1].boardCenter[0]).toBeGreaterThan(0)
    // `side` still describes which half of the hall a station sits in.
    for (const bay of layout.bays) {
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

  /*
    The rail shows each station's year and console count instead of eight
    identical labels, so the year has to be real and has to be the
    generation's own — derived from the roster, never authored.
  */
  it('dates every station from its own earliest console', () => {
    for (const bay of layout.bays) {
      const years = bay.artifacts.map((a) => {
        const entry = CONSOLES.find((c) => c.id === a.id)!
        return Math.min(
          ...Object.values(entry.released)
            .filter(Boolean)
            .map((d) => new Date(d as string).getFullYear()),
        )
      })
      expect(bay.firstYear, `gen ${bay.generation}`).toBe(Math.min(...years))
    }
  })

  it('dates the stations in the order you walk past them', () => {
    for (let i = 1; i < layout.bays.length; i += 1) {
      expect(layout.bays[i].firstYear, `station ${i}`).toBeGreaterThanOrEqual(
        layout.bays[i - 1].firstYear,
      )
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

  /*
    The order helpers are the replacement for `generationNearestZ`'s job —
    "where should navigation go next" — once the camera stops travelling and
    the collection presents itself instead. The timeline strip, the keyboard
    map and every focus transition read this one ordering, so it has to be
    the same walk the hall physically offers.
  */
  describe('console order helpers', () => {
    it('walks every console exactly once, station by station', () => {
      const order = consoleOrder(layout)
      expect(order.map((a) => a.id)).toHaveLength(CONSOLES.length)
      expect(new Set(order.map((a) => a.id)).size).toBe(CONSOLES.length)
      // Stations first, oldest first; within a station, left to right.
      for (let i = 1; i < order.length; i += 1) {
        const prev = layout.byId[order[i - 1].id]
        const curr = layout.byId[order[i].id]
        expect(curr.generation, `step ${i}`).toBeGreaterThanOrEqual(prev.generation)
      }
    })

    it('wraps next/prev around the ends of the hall', () => {
      const order = consoleOrder(layout)
      const first = order[0].id
      const last = order[order.length - 1].id
      expect(prevConsole(layout, first)).toBe(last)
      expect(nextConsole(layout, last)).toBe(first)
      expect(nextConsole(layout, first)).toBe(order[1].id)
      expect(prevConsole(layout, last)).toBe(order[order.length - 2].id)
    })

    it('steps generations one station at a time, clamped at both ends', () => {
      const gens = layout.bays.map((b) => b.generation)
      expect(prevGeneration(layout, gens[0])).toBe(gens[0])
      expect(nextGeneration(layout, gens[gens.length - 1])).toBe(gens[gens.length - 1])
      expect(nextGeneration(layout, gens[0])).toBe(gens[1])
      expect(prevGeneration(layout, gens[gens.length - 1])).toBe(gens[gens.length - 2])
    })

    it('firstOfGeneration returns the walk-first console of each station', () => {
      for (const bay of layout.bays) {
        expect(firstOfGeneration(layout, bay.generation)).toBe(bay.artifacts[0].id)
      }
    })

    it('consoleAtYear finds a console released in that year', () => {
      for (const artifact of consoleOrder(layout)) {
        const entry = CONSOLES.find((c) => c.id === artifact.id)!
        const found = consoleAtYear(layout, yearOf(entry))
        expect(found, `${artifact.id} (${yearOf(entry)})`).not.toBeNull()
        const foundEntry = CONSOLES.find((c) => c.id === found)!
        expect(yearOf(foundEntry)).toBe(yearOf(entry))
      }
    })

    it('returns null for a year no console shipped in', () => {
      expect(consoleAtYear(layout, 1900)).toBeNull()
    })

    it('yearOf returns 0 for a console with no release dates, never NaN', () => {
      const bare = { ...CONSOLES[0], released: {} }
      expect(yearOf(bare)).toBe(0)
      expect(Number.isFinite(yearOf(bare))).toBe(true)
    })
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
