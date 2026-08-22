import { useMemo } from 'react'
import { ROOM_CHROME, TOP_CHROME_PX } from '@/frame'
import { formatUnits } from '@/components/format'
import { useActiveArchetypeId, useActiveConsole, useScene } from '@/store/scene'
import { archetype as getArchetype } from '@/data/kits/media-archetypes'
import { shellFor } from '@/data/kits/media-shells'
import { coverFor } from '@/data/covers'
import { MediaFigure } from './MediaFigure'
import { COPY } from './panel-copy'

/**
 * The games section's floating list.
 *
 * Wide: hung at the left edge of the viewport, beside the sidebar, the way
 * the console rail sits beside the room — a narrow 264px column, sized from
 * the SAME frame fractions the camera reads so it occupies exactly the clear
 * band between the header strip and the bottom panel. The 3D view fills the
 * rest of the width beside it, so the two coexist without either shrinking
 * the other.
 *
 * Compact: a REAL BUG lived here — this used to render the exact same
 * full-clear-band layout, just stretched `left-4 right-4`. On wide that's a
 * narrow column with the 3D view visible beside it; at full viewport width
 * on a phone, "the full clear band" IS the entire area the 3D camera was
 * also trying to frame the cartridge into, so the list sat directly on top
 * of it — the games section's 3D art was never visible on a phone, not
 * cropped or small, just entirely covered by an opaque panel every time.
 * Compact instead renders a short horizontal filmstrip of cover thumbnails,
 * docked just under the header (`ROOM_CHROME.compact.gamesStripH` — see
 * frame.ts's `topHFor`, which the camera's clear-band math also reads, so
 * the 3D box frames itself into the space actually left under this strip
 * rather than behind it).
 *
 * Only the games section shows it; the console section's panel keeps its
 * three tabs, and the list is not a tab any more.
 *
 * ALWAYS mounted, in both layouts — a REAL BUG lived here too: returning
 * `null` outside the games section meant the console → games handoff was a
 * hard cut, and (worse) meant "hidden" and "gone" were the same state, so
 * there was nothing to transition FROM. It now stays in the DOM the whole
 * time and the games section toggles a fade-plus-slide via CSS transition —
 * `inert` when hidden takes it out of the tab order and the accessibility
 * tree (the same pattern ConsoleSidebar's compact drawer already uses), and
 * `pointer-events-none` stops its footprint from stealing orbit-drags over
 * the console section's 3D view once it's invisible.
 */

/** Shared with the compact filmstrip's own top offset below, so the gap
 *  above this list and the gap below it (wide) — and the gap above it
 *  alone (compact) — all read as the SAME breathing room, not three
 *  different numbers that happen to be close. */
const GAP_PX = 12

/** How long the appear/dismiss transition takes. Matches the sidebar
 *  drawer's own slide (`ConsoleSidebar.tsx`), so the app's motion reads as
 *  one considered speed rather than a different one per panel. */
const TRANSITION = 'transition-[opacity,transform] duration-300 ease-out'

export function GameList() {
  const entry = useActiveConsole()
  const archetypeId = useActiveArchetypeId()
  const layout = useScene((s) => s.layout)
  const section = useScene((s) => s.section)
  const selected = useScene((s) => s.selectedGameRank)
  const selectGame = useScene((s) => s.selectGame)

  const archetype = useMemo(() => getArchetype(archetypeId), [archetypeId])
  const shell = useMemo(() => shellFor(archetypeId, entry.id), [archetypeId, entry.id])

  const inGames = section === 'games'
  const compact = layout === 'compact'

  if (compact) {
    // Docked against the REAL chrome height (TOP_CHROME_PX), not the padded
    // topH fraction the camera reads — two real bugs, fixed together:
    //
    // 1. Position: topH carries deliberate slack for the camera's framing
    //    ("held with margin" — see its own doc comment), so anchoring the
    //    filmstrip to it left a ~75px dead gap between the tabs and the
    //    strip. TOP_CHROME_PX is the tabs' own actual measured bottom edge;
    //    GAP_PX is the only slack added, and it's the same value on both
    //    edges (see #2), so the strip sits genuinely flush under the tabs.
    //
    // 2. Symmetry: the old `top: topH + 8px` / `height: gamesStripH - 8px`
    //    pairing looks symmetric but isn't — the "+8" and "-8" CANCEL in
    //    the sum, so the card's bottom edge landed exactly on the
    //    gamesStripH boundary with NO gap at all, while the top kept its
    //    8px. One edge had breathing room, the other had none. A fixed
    //    height with the SAME gap only ever applied once (at the top) reads
    //    correctly on its own terms — nothing below this card depends on
    //    where its bottom edge falls, unlike the top, which has to clear
    //    the tabs specifically.
    const STRIP_HEIGHT_PX = 88
    return (
      <aside
        aria-label={`${entry.shortName} games`}
        inert={!inGames || undefined}
        className={[
          'absolute left-4 right-4 flex flex-col justify-center overflow-hidden rounded-2xl border border-ink/12 bg-paper/90 backdrop-blur-xl',
          TRANSITION,
          inGames ? 'pointer-events-auto opacity-100 translate-y-0' : 'pointer-events-none opacity-0 -translate-y-2',
        ].join(' ')}
        style={{
          top: `${TOP_CHROME_PX + GAP_PX}px`,
          height: `${STRIP_HEIGHT_PX}px`,
        }}
      >
        {entry.games.length === 0 ? (
          <p className="px-4 text-[12px] text-ink/60">{COPY.gamesNoGames}</p>
        ) : (
          <ul className="flex h-full items-center gap-2 overflow-x-auto px-2.5">
            {entry.games.map((g) => {
              const active = g.rank === selected
              return (
                <li key={g.rank} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => selectGame(g.rank)}
                    aria-pressed={active}
                    title={g.title}
                    className={[
                      'flex items-center justify-center rounded-xl border p-1 transition',
                      active
                        ? 'border-amber/70 bg-amber/12'
                        : 'border-transparent hover:border-ink/12 hover:bg-ink/5',
                    ].join(' ')}
                  >
                    <MediaFigure
                      archetype={archetype}
                      shell={shell}
                      coverUrl={coverFor(entry.id, g)}
                      heightPx={52}
                    />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </aside>
    )
  }

  return (
    <aside
      aria-label={`${entry.shortName} games`}
      inert={!inGames || undefined}
      className={[
        'absolute left-4 w-[264px] flex flex-col overflow-hidden rounded-2xl border border-ink/12 bg-paper/90 backdrop-blur-xl',
        TRANSITION,
        inGames ? 'pointer-events-auto opacity-100 translate-x-0' : 'pointer-events-none opacity-0 -translate-x-3',
      ].join(' ')}
      style={{
        // TOP_CHROME_PX is the tab strip's own real, measured bottom edge —
        // see the compact branch above for why the vh-fraction alternative
        // (ROOM_CHROME.topH) is the wrong tool here: it carries deliberate
        // extra slack for the CAMERA's framing, so anchoring to it left this
        // rail's top gap roughly four times wider than its bottom gap (the
        // bug the user actually spotted — the top float came from that
        // slack, the bottom didn't, because panelH has none of its own).
        // Both edges now add the SAME GAP_PX to a real chrome edge, so the
        // two gaps are the same number for the same reason on both sides.
        top: `${TOP_CHROME_PX + GAP_PX}px`,
        bottom: `calc(${ROOM_CHROME.panelH} * 100vh + ${GAP_PX}px)`,
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
                  <MediaFigure archetype={archetype} shell={shell} coverUrl={coverFor(entry.id, g)} heightPx={48} />
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
