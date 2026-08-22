import type { Game } from '@/types/console'
import { LOGOS } from './logos.generated'

/**
 * Resolves a game's real title-logo graphic (the stylised wordmark — e.g.
 * the "PAC-MAN" logotype — never the box art) if one exists.
 *
 * Manifest written by `scripts/fetch-logos.mjs` from SteamGridDB's `/logos`
 * endpoint. Callers fall back to the plain-text title (the `<h3>` in
 * GameArtifactBody) when this returns `null` — a game's name is never left
 * blank waiting on a file. The sibling of `coverFor` in covers.ts, which
 * resolves the box/case art instead.
 */
export function logoFor(consoleId: string, game: Game): string | null {
  return LOGOS[`${consoleId}:${game.rank}`] ?? null
}
