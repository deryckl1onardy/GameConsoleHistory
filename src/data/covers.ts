import type { Game } from '@/types/console'
import { COVERS } from './covers.generated'
import { SPINE_COVERS } from './covers-spine.generated'
import { BACK_COVERS } from './covers-back.generated'

/**
 * Resolves the real cover art URL for a game, if one exists.
 *
 * Order: `game.cover` (a hand-set override, currently unused across all 220
 * entries) → the generated manifest written by `scripts/fetch-covers.mjs`
 * from SteamGridDB → `null`. Callers fall back to the procedural label
 * (src/three/covers.ts for the 3D box, the inline SVG label in
 * MediaFigure.tsx for the panel row) when this returns `null` — a box is
 * never left blank waiting on a file.
 *
 * The sibling of `spineCoverFor` and `backCoverFor` below — this one is the
 * only face SteamGridDB can actually supply automatically; the other two are
 * hand-populated manifests (see their own generated files' doc comments).
 */
export function coverFor(consoleId: string, game: Game): string | null {
  if (game.cover) return game.cover
  return COVERS[`${consoleId}:${game.rank}`] ?? null
}

/**
 * Resolves the real SPINE art for a game — the narrow strip read on a
 * shelf — if one exists. `null` means GameBox keeps its existing flat
 * shell-colour spine; there is no procedural placeholder for a spine the way
 * there is for the front (a flat colour reads as a real, if plain, book
 * spine — an empty label would not).
 */
export function spineCoverFor(consoleId: string, game: Game): string | null {
  return SPINE_COVERS[`${consoleId}:${game.rank}`] ?? null
}

/**
 * Resolves the real BACK art for a game — the panel with screenshots, the
 * blurb, ratings badges — if one exists. `null` means GameBox renders no
 * extra back print at all; the shell's own moulded back cap already shows as
 * a plain surface, which is the honest default for a box nobody has scanned
 * the back of yet.
 */
export function backCoverFor(consoleId: string, game: Game): string | null {
  return BACK_COVERS[`${consoleId}:${game.rank}`] ?? null
}
