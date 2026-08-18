import { useMemo } from 'react'
import { ROOM_CHROME } from '@/frame'
import { formatUnits } from '@/components/format'
import { useActiveArchetypeId, useActiveConsole, useScene } from '@/store/scene'
import { archetype as getArchetype } from '@/data/kits/media-archetypes'
import { shellFor } from '@/data/kits/media-shells'
import { coverFor } from '@/data/covers'
import { MediaFigure } from './MediaFigure'
import { COPY } from './panel-copy'

/**
 * The games section's floating list, hung at the left edge of the viewport —
 * beside the sidebar, the way the console rail sits beside the room.
 *
 * The list is the games section's navigation: picking a row lifts that one
 * box in the 3D scene and flies the camera onto it. It floats over the scene
 * (pointer-events-auto inside the chrome's pointer-events-none overlay) and
 * is sized from the SAME frame fractions the camera reads, so it occupies
 * exactly the clear band between the header strip and the bottom panel and
 * can never slide under either.
 *
 * Only the games section shows it; the console section's panel keeps its
 * three tabs, and the list is not a tab any more.
 */
export function GameList() {
  const entry = useActiveConsole()
  const archetypeId = useActiveArchetypeId()
  const layout = useScene((s) => s.layout)
  const section = useScene((s) => s.section)
  const selected = useScene((s) => s.selectedGameRank)
  const selectGame = useScene((s) => s.selectGame)

  const archetype = useMemo(() => getArchetype(archetypeId), [archetypeId])
  const shell = useMemo(() => shellFor(archetypeId, entry.id), [archetypeId, entry.id])

  if (section !== 'games') return null

  const chrome = layout === 'compact' ? ROOM_CHROME.compact : ROOM_CHROME
  const compact = layout === 'compact'

  return (
    <aside
      aria-label={`${entry.shortName} games`}
      className={[
        'pointer-events-auto absolute flex flex-col overflow-hidden rounded-2xl border border-ink/12 bg-paper/90 backdrop-blur-xl',
        compact ? 'left-4 right-4' : 'left-4 w-[264px]',
      ].join(' ')}
      style={{
        top: `calc(${chrome.topH} * 100vh + 10px)`,
        bottom: `calc(${chrome.panelH} * 100vh + 10px)`,
      }}
    >
      <div className="shrink-0 border-b border-ink/10 px-4 pb-2.5 pt-3">
        <p className="text-[10px] uppercase tracking-[0.22em] text-amber/80">
          {COPY.gamesListHeading} · {entry.shortName}
        </p>
        <p className="mt-1 text-[12px] leading-snug text-ink/55">{COPY.gamesIntro}</p>
      </div>

      {entry.games.length === 0 ? (
        <p className="px-4 py-3 text-[13px] text-ink/60">{COPY.gamesNoGames}</p>
      ) : (
        <ul className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
          {entry.games.map((g) => {
            const active = g.rank === selected
            return (
              <li key={g.rank}>
                <button
                  type="button"
                  onClick={() => selectGame(g.rank)}
                  aria-pressed={active}
                  title={g.title}
                  className={[
                    'flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition',
                    active ? 'bg-ink/8 text-ink' : 'text-ink/75 hover:bg-ink/5 hover:text-ink',
                  ].join(' ')}
                >
                  <MediaFigure
                    archetype={archetype}
                    shell={shell}
                    coverUrl={coverFor(entry.id, g)}
                    heightPx={compact ? 40 : 48}
                  />
                  <span className="w-5 shrink-0 text-right text-[11px] tabular-nums text-amber/70">{g.rank}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] leading-tight">{g.title}</span>
                    <span className="block truncate text-[11px] opacity-55">
                      {g.developer} · {g.year}
                    </span>
                  </span>
                  <span className="shrink-0 text-[11px] tabular-nums opacity-50">{formatUnits(g.unitsSold)}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </aside>
  )
}
