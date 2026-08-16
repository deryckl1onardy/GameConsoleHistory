import { useEffect, useRef } from 'react'
import { formatUnits } from '@/components/format'
import { useActiveConsole, useScene } from '@/store/scene'
import { COPY } from '../panel-copy'

/**
 * The ten best-selling games. Selecting one lifts that cartridge in the 3D
 * scene and back — the list and the shelf are two views of one selection.
 */
export function GamesTab() {
  const entry = useActiveConsole()
  const selected = useScene((s) => s.selectedGameRank)
  const selectGame = useScene((s) => s.selectGame)
  const listRef = useRef<HTMLUListElement>(null)

  // Keep the list in sync when the selection came from clicking a cartridge in
  // the 3D scene rather than from this list.
  useEffect(() => {
    if (selected === null) return
    listRef.current
      ?.querySelector(`[data-rank="${selected}"]`)
      ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [selected])

  if (entry.games.length === 0) {
    return <p className="text-[13px] text-parchment/60">{COPY.gamesNoGames}</p>
  }

  return (
    <div>
      <p className="mb-3 text-[12px] text-parchment/50">{COPY.gamesIntro}</p>
      <ul ref={listRef} className="space-y-0.5">
        {entry.games.map((g) => {
          const active = g.rank === selected
          return (
            <li key={g.rank} data-rank={g.rank}>
              <button
                onClick={() => selectGame(active ? null : g.rank)}
                aria-pressed={active}
                className={[
                  'flex w-full items-baseline gap-3 rounded-lg px-2 py-2 text-left transition',
                  active
                    ? 'bg-parchment/12 text-parchment'
                    : 'text-parchment/75 hover:bg-parchment/7 hover:text-parchment',
                ].join(' ')}
              >
                <span className="w-5 shrink-0 text-right text-[11px] tabular-nums text-amber/70">
                  {g.rank}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] leading-tight">{g.title}</span>
                  <span className="block text-[11px] opacity-55">
                    {g.developer} · {g.year}
                  </span>
                  {active && (
                    <span className="mt-1.5 block text-[12px] leading-snug opacity-75">
                      {g.blurb}
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-[11px] tabular-nums opacity-50">
                  {formatUnits(g.unitsSold)}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
