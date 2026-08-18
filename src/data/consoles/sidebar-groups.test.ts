import { describe, expect, it } from 'vitest'
import { CONSOLES, matchesConsole, releaseYear, sidebarGroups } from './index'

/**
 * The sidebar's whole navigation contract in one place: every console in
 * release order, grouped by generation (2..9), each group ordered by release
 * year, and a search that filters across the three fields a visitor would
 * plausibly type.
 */
describe('sidebar groups', () => {
  it('lists every console exactly once', () => {
    const groups = sidebarGroups('')
    const ids = groups.flatMap((g) => g.consoles.map((c) => c.id))
    expect(ids).toHaveLength(CONSOLES.length)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('groups chronologically by generation, oldest first', () => {
    const groups = sidebarGroups('')
    const gens = groups.map((g) => g.generation)
    // Sorted ascending and covers the full span the roster claims.
    expect(gens).toEqual([...gens].sort((a, b) => a - b))
    expect(gens[0]).toBe(2)
    expect(gens[gens.length - 1]).toBe(9)
  })

  it('keeps every group in release order', () => {
    for (const group of sidebarGroups('')) {
      const years = group.consoles.map(releaseYear)
      expect(years, `generation ${group.generation} out of order`).toEqual([...years].sort((a, b) => a - b))
    }
  })

  it('matches name, short name and manufacturer', () => {
    const snes = CONSOLES.find((c) => c.id === 'snes')!
    expect(matchesConsole(snes, 'super nintendo')).toBe(true)
    expect(matchesConsole(snes, 'snes')).toBe(true)
    expect(matchesConsole(snes, 'nintendo')).toBe(true)
    expect(matchesConsole(snes, 'sega')).toBe(false)
  })

  it('filters the list in place, keeping the group structure', () => {
    const groups = sidebarGroups('nintendo')
    const ids = groups.flatMap((g) => g.consoles.map((c) => c.id))
    // Every match is a real match…
    for (const id of ids) {
      const c = CONSOLES.find((x) => x.id === id)!
      expect(matchesConsole(c, 'nintendo')).toBe(true)
    }
    // …and the results span several generations.
    expect(new Set(groups.map((g) => g.generation)).size).toBeGreaterThan(1)
  })

  it('returns no groups for a query nothing matches', () => {
    expect(sidebarGroups('zzzzzz')).toEqual([])
  })
})
