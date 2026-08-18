import type { ConsoleEntry, Game } from '@/types/console'

/**
 * Derived, verifiable game metrics — the free half of the games section's
 * richness, in the same spirit `relatableSpecs` already applies to hardware.
 *
 * Pure and React-free so the arithmetic is unit-tested; the panel formats the
 * numbers, these functions decide them. No new data is needed: everything
 * here falls out of fields the roster already carries.
 */

/** The year of a console's first release anywhere — the `released` map, earliest region. */
export function firstReleaseYear(entry: ConsoleEntry): number {
  const years = [entry.released.jp, entry.released.na, entry.released.eu]
    .filter((d): d is string => !!d)
    .map((d) => new Date(d).getFullYear())
  return years.length ? Math.min(...years) : 0
}

/**
 * Share of the console's install base that bought this game.
 *
 * Returns null above 1.0 on purpose: a very-early-life console (switch-2
 * today) can have a game approaching its own install base, and "1.2 of every
 * 1 owner" is nonsense. Callers drop the block rather than print it.
 */
export function attachRate(game: Game, entry: ConsoleEntry): number | null {
  if (!Number.isFinite(game.unitsSold) || !Number.isFinite(entry.unitsSold) || entry.unitsSold <= 0) {
    return null
  }
  const rate = game.unitsSold / entry.unitsSold
  return rate > 1 ? null : rate
}

/** Years between the console's first release and the game's year. 0 = launch title. */
export function yearsAfterLaunch(game: Game, entry: ConsoleEntry): number {
  const launch = firstReleaseYear(entry)
  if (launch === 0) return 0
  return Math.max(0, game.year - launch)
}

/** This game's share of the summed sales of the console's recorded top ten. */
export function shareOfTopTen(game: Game, entry: ConsoleEntry): number {
  const total = entry.games.reduce((sum, g) => sum + (Number.isFinite(g.unitsSold) ? g.unitsSold : 0), 0)
  if (total <= 0) return 0
  return (Number.isFinite(game.unitsSold) ? game.unitsSold : 0) / total
}
