import { describe, expect, it } from 'vitest'
import { GENERATION_LABELS, ROSTER, rosterByGeneration, rosterEntry } from './roster'
import { CONSOLES } from './consoles'

/**
 * The roster is the only place in the app that claims a console exists. If it
 * drifts from the real data, the picker offers dioramas that cannot load.
 */

describe('console roster', () => {
  it('covers every mainline home console', () => {
    expect(ROSTER).toHaveLength(22)
  })

  it('has unique ids', () => {
    const ids = ROSTER.map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('spans generations 2 through 9 with no gaps', () => {
    const gens = [...new Set(ROSTER.map((r) => r.generation))].sort((a, b) => a - b)
    expect(gens).toEqual([2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('labels every generation it uses', () => {
    for (const r of ROSTER) {
      expect(GENERATION_LABELS[r.generation], `gen ${r.generation}`).toBeTruthy()
    }
  })

  it('marks built exactly for consoles that actually have data', () => {
    // The whole point of deriving `built`: the picker can never offer a diorama
    // that does not exist, and can never hide one that does.
    const built = ROSTER.filter((r) => r.built).map((r) => r.id).sort()
    const real = CONSOLES.map((c) => c.id).sort()
    expect(built).toEqual(real)
  })

  it('agrees with the full console data on shared fields', () => {
    for (const c of CONSOLES) {
      const r = rosterEntry(c.id)
      expect(r, `${c.id} missing from roster`).toBeDefined()
      expect(r!.generation, `${c.id} generation`).toBe(c.generation)
      expect(r!.unitsSold, `${c.id} units`).toBe(c.unitsSold)
      expect(r!.manufacturer, `${c.id} manufacturer`).toBe(c.manufacturer)
    }
  })

  it('gives every console a plausible year and positive sales', () => {
    for (const r of ROSTER) {
      expect(r.year, `${r.id} year`).toBeGreaterThanOrEqual(1972)
      expect(r.year, `${r.id} year`).toBeLessThanOrEqual(2026)
      expect(r.unitsSold, `${r.id} units`).toBeGreaterThan(0)
      expect(r.shortName.length, `${r.id} shortName`).toBeGreaterThan(0)
    }
  })

  it('never has a console released before its own generation predecessor', () => {
    // Generations must not interleave backwards: the earliest console of each
    // generation should not predate the earliest of the one before it.
    const earliest = new Map<number, number>()
    for (const r of ROSTER) {
      earliest.set(r.generation, Math.min(earliest.get(r.generation) ?? Infinity, r.year))
    }
    const gens = [...earliest.keys()].sort((a, b) => a - b)
    for (let i = 1; i < gens.length; i++) {
      expect(
        earliest.get(gens[i])!,
        `gen ${gens[i]} starts before gen ${gens[i - 1]}`,
      ).toBeGreaterThan(earliest.get(gens[i - 1])!)
    }
  })
})

describe('grouping', () => {
  it('groups by generation in ascending order', () => {
    const groups = rosterByGeneration()
    expect(groups.map((g) => g.generation)).toEqual([2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('orders consoles within a generation by release year', () => {
    for (const { generation, consoles } of rosterByGeneration()) {
      const years = consoles.map((c) => c.year)
      expect(years, `gen ${generation}`).toEqual([...years].sort((a, b) => a - b))
    }
  })

  it('loses no consoles in grouping', () => {
    const total = rosterByGeneration().reduce((n, g) => n + g.consoles.length, 0)
    expect(total).toBe(ROSTER.length)
  })

  it('puts the SNES in the fourth generation, beside the Genesis', () => {
    const gen4 = rosterByGeneration().find((g) => g.generation === 4)!
    expect(gen4.consoles.map((c) => c.id)).toEqual(['genesis', 'snes'])
  })
})
