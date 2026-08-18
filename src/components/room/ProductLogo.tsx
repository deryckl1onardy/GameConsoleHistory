import type { ConsoleEntry } from '@/types/console'
import { CONSOLE_LOGO_PATHS, CONSOLE_LOGO_SCALE } from '@/data/consoleLogos'

/**
 * The console's product logo, swapped in wherever the roster's plain
 * `shortName` text used to be — the sidebar rows, the top bar identity and
 * the title block. `height` is the target height in px for a normal-proportion
 * mark; the extreme PS3 wordmark draws smaller via CONSOLE_LOGO_SCALE. The
 * logo keeps its aspect via object-contain.
 *
 * `onDark` is the dark active sidebar row (bg-ink). Unlike the company marks,
 * product logos cannot be rescued by a colour filter — several mix black and
 * coloured ink (NES, GameCube, PS2, Wii U), and a filter fixes one at the
 * other's expense — so on the ink background the logo sits on a small light
 * chip instead, staying true to its original colours.
 *
 * Falls back to the plain name for any console without an asset, so a future
 * roster entry can never render a blank.
 */
export function ProductLogo({
  entry,
  height = 15,
  onDark = false,
}: {
  entry: ConsoleEntry
  height?: number
  onDark?: boolean
}) {
  const src = CONSOLE_LOGO_PATHS[entry.id]
  if (!src) {
    return <span>{entry.shortName}</span>
  }

  const size = Math.round(height * (CONSOLE_LOGO_SCALE[entry.id] ?? 1))
  const img = (
    <img
      src={src}
      alt={entry.shortName}
      draggable={false}
      style={{ height: size }}
      className="inline-block object-contain align-middle"
    />
  )

  if (!onDark) {
    return img
  }

  return (
    <span className="inline-flex items-center rounded bg-parchment px-1.5 py-0.5">{img}</span>
  )
}
