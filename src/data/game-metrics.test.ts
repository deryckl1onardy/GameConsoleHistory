import { describe, expect, it } from 'vitest'
import type { ConsoleEntry, Game } from '@/types/console'
import { nes } from '@/data/consoles/nes'
import { attachRate, firstReleaseYear, shareOfTopTen, yearsAfterLaunch } from './game-metrics'

/**
 * The games section's left column is derived maths, not authored data — so it
 * must be pinned the same way the shot system is. The three interesting cases:
 * the >1 attach rate that must become null rather than nonsense, the launch
 * title that must read "0 years after launch", and the top-ten shares that
 * must always sum to 1 so the per-game figure is a real proportion.
 */

function game(overrides: Partial<Game>): Game {
  return {
    rank: 99,
    title: 'Test',
    year: 1985,
    unitsSold: 1_000_000,
    developer: 'Test',
    publisher: 'Test',
    blurb: 'Test',
    ...overrides,
  }
}

describe('attachRate', () => {
  it('is the game\'s share of the console\'s install base', () => {
    const rate = attachRate(nes.games[0], nes)
    expect(rate).not.toBeNull()
    expect(rate).toBeCloseTo(40_240_000 / 61_910_000, 4)
  })

  it('returns null above 1.0 instead of printing "1.2 of every 1 owner"', () => {
    // A very-early-life console can have a game approaching its own install
    // base; the caller drops the block rather than render the nonsense.
    const early: ConsoleEntry = { ...nes, unitsSold: 100_000 }
    expect(attachRate(game({ unitsSold: 200_000 }), early)).toBeNull()
  })

  it('returns null when the console has no recorded install base', () => {
    const zero: ConsoleEntry = { ...nes, unitsSold: 0 }
    expect(attachRate(game({ unitsSold: 1 }), zero)).toBeNull()
  })
})

describe('yearsAfterLaunch', () => {
  it('uses the console\'s first release anywhere, not the US date', () => {
    // NES launched in Japan in 1983; a 1985 game is 2 years in, not 0.
    expect(firstReleaseYear(nes)).toBe(1983)
    expect(yearsAfterLaunch(game({ year: 1985 }), nes)).toBe(2)
  })

  it('returns 0 for a launch title', () => {
    expect(yearsAfterLaunch(game({ year: 1983 }), nes)).toBe(0)
  })

  it('never goes negative for a game predating the launch year', () => {
    expect(yearsAfterLaunch(game({ year: 1980 }), nes)).toBe(0)
  })
})

describe('shareOfTopTen', () => {
  it('sums to 1 across a console\'s recorded ten', () => {
    const total = nes.games.reduce((sum, g) => sum + shareOfTopTen(g, nes), 0)
    expect(total).toBeCloseTo(1, 9)
  })

  it('is 0 for a game on a console with no recorded games', () => {
    const empty: ConsoleEntry = { ...nes, games: [] }
    expect(shareOfTopTen(game({ unitsSold: 5_000_000 }), empty)).toBe(0)
  })
})
