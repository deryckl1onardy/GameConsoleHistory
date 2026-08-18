import type { Game } from '@/types/console'
import { COVERS } from './covers.generated'

/**
 * Resolves the real cover art URL for a game, if one exists.
 *
 * Order: `game.cover` (a hand-set override, currently unused across all 220
 * entries) → the generated manifest written by `scripts/fetch-covers.mjs`
 * from SteamGridDB → `null`. Callers fall back to the procedural label
 * (src/three/covers.ts for the 3D box, the inline SVG label in
 * MediaFigure.tsx for the panel row) when this returns `null` — a box is
 * never left blank waiting on a file.
 */
export function coverFor(consoleId: string, game: Game): string | null {
  if (game.cover) return game.cover
  return COVERS[`${consoleId}:${game.rank}`] ?? null
}
