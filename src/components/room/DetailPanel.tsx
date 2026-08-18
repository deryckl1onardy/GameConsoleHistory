import { useMemo } from 'react'
import { ROOM_CHROME } from '@/frame'
import { useActiveConsole, useScene } from '@/store/scene'
import { enrichmentFor } from '@/data/game-facts'
import { ChevronDownIcon, ChevronUpIcon } from '@/components/icons'
import { PanelSummary } from './PanelSummary'
import { FunFactCard } from './FunFactCard'
import { COPY, ROOM_TABS } from './panel-copy'
import { OverviewTab } from './tabs/OverviewTab'
import { HardwareTab } from './tabs/HardwareTab'
import { HistoryTab } from './tabs/HistoryTab'
import { GameArtifact, GameArtifactBody, GameArtifactFact, GameArtifactSummary } from './tabs/GameArtifact'

/**
 * The wide bottom panel. Sizes itself from the SAME fractions the camera
 * reads (ROOM_CHROME via frame.ts), so the console is always framed clear of
 * it and the two can never drift apart — collapsing the panel changes its
 * height, which recomputes the camera's frame offset, which is exactly the
 * coupling this file exists to keep honest.
 *
 * The two layouts are structurally different, not just resized, because a
 * user pass found stacking two independently-scrolling boxes on top of each
 * other reads as broken on a phone in a way two side-by-side scrolling
 * COLUMNS on a desktop does not — side by side, each is legibly its own
 * pane; stacked, it looks like the page failed to load the rest of itself.
 *
 *   Wide: three columns — the lead summary, the tabbed column, and the fun
 *   fact as a genuine third region — each with its OWN scroll, since they
 *   sit beside each other and scrolling one has no bearing on the others.
 *
 *   Compact: ONE scroll for the whole body. The summary, the tab nav (kept
 *   sticky so switching tabs never needs a scroll back to the top) and the
 *   active tab's content all flow down a single column, in a single
 *   overflow-y-auto — never two. The fun fact has nowhere to go at this
 *   width and is left out, same as before.
 *
 * The panel now serves BOTH sections. The console section keeps its three
 * tabs (Overview / Hardware / History — Games left to become a Section) and
 * the summary + fun fact. The games section shows the selected game's
 * artifact in the same three regions (summary | body | fun fact); the game
 * list itself is no longer panel content — it is the floating GameList,
 * hung beside the sidebar (see GameList.tsx), and the panel is always the
 * artifact of the picked game. The shell is never reshaped — only the
 * content that fills it changes.
 *
 * The chevron at the bottom-centre collapses the panel to its slim bar.
 * `panelOpen` is expanded-vs-collapsed (the old side-rail open/close is gone
 * with the picker).
 */
export function DetailPanel() {
  const entry = useActiveConsole()
  const layout = useScene((s) => s.layout)
  const open = useScene((s) => s.panelOpen)
  const setOpen = useScene((s) => s.setPanelOpen)
  const section = useScene((s) => s.section)
  const tab = useScene((s) => s.panelTab)
  const setTab = useScene((s) => s.setPanelTab)
  const selectedRank = useScene((s) => s.selectedGameRank)

  const chrome = layout === 'compact' ? ROOM_CHROME.compact : ROOM_CHROME
  const heightVh = (open ? chrome.panelH : chrome.collapsedPanelH) * 100
  const width = layout === 'compact' ? '94%' : '85%'

  const inConsoleSection = section === 'console'
  const game = useMemo(() => {
    if (inConsoleSection || selectedRank === null) return null
    return entry.games.find((g) => g.rank === selectedRank) ?? null
  }, [inConsoleSection, selectedRank, entry])

  // The fun-fact column renders only when there IS a fact to show: the
  // console's facts for the console section, the game's own researched fact
  // for the artifact view. Absence is a designed state.
  const artifactHasFact = game ? !!enrichmentFor(entry.id, game.rank)?.fact : false
  const showAside = layout === 'wide' && (inConsoleSection ? entry.facts.length > 0 : artifactHasFact)

  if (!open) {
    return (
      <aside
        className="pointer-events-auto absolute bottom-0 left-1/2 -translate-x-1/2"
        style={{ width, height: `${heightVh}vh` }}
        aria-label={`${entry.shortName} details — collapsed`}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-full w-full items-center justify-center gap-2 rounded-t-2xl border border-b-0 border-ink/12 bg-paper/90 text-[11px] uppercase tracking-[0.2em] text-ink/60 backdrop-blur-xl transition hover:text-ink"
          aria-expanded={false}
        >
          <ChevronUpIcon size={15} />
          {COPY.panelCollapsedHint}
        </button>
      </aside>
    )
  }

  const tabNav = (
    <nav className="flex gap-0.5 border-b border-ink/10 px-5 pt-3" role="tablist">
      {ROOM_TABS.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={tab === t.id}
          onClick={() => setTab(t.id)}
          className={[
            'rounded-t-md px-2.5 pb-2.5 pt-1 text-[11px] transition',
            tab === t.id
              ? 'border-b-2 border-amber text-ink'
              : 'border-b-2 border-transparent text-ink/45 hover:text-ink/80',
          ].join(' ')}
        >
          {t.label}
        </button>
      ))}
    </nav>
  )

  const tabBody = (
    <>
      {tab === 'overview' && <OverviewTab />}
      {tab === 'hardware' && <HardwareTab />}
      {tab === 'history' && <HistoryTab />}
    </>
  )

  return (
    <aside
      className="pointer-events-auto absolute bottom-0 left-1/2 flex -translate-x-1/2 flex-col overflow-hidden rounded-t-2xl border border-b-0 border-ink/12 bg-paper/92 backdrop-blur-xl"
      style={{ width, height: `${heightVh}vh` }}
      aria-label={`${entry.shortName} details`}
    >
      {layout === 'compact' ? (
        // ONE scroll for the whole body — see the file header for why this
        // isn't just the wide layout's grid resized down.
        <div className="min-h-0 flex-1 overflow-y-auto">
          {inConsoleSection ? (
            <>
              <div className="px-5 pt-4">
                <PanelSummary compact />
              </div>
              {/* Sticky so a scroll deep into a tab's content never strands the
                  nav above the fold — switching tabs stays a zero-scroll action. */}
              <div className="sticky top-0 z-10 bg-paper/95 backdrop-blur-xl">{tabNav}</div>
              <div className="px-5 py-4">{tabBody}</div>
            </>
          ) : (
            <div className="px-5 py-4">
              {game ? (
                <GameArtifact compact />
              ) : (
                <p className="text-[13px] text-ink/60">{COPY.gamesListHint}</p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div
          className="min-h-0 flex-1"
          style={{
            display: 'grid',
            gridTemplateColumns: showAside
              ? 'minmax(0, 3fr) minmax(0, 4fr) minmax(0, 3fr)'
              : 'minmax(0, 2fr) minmax(0, 3fr)',
            gridTemplateRows: '1fr',
          }}
        >
          <div className="min-h-0 overflow-y-auto border-r border-ink/10 px-7 py-5">
            {inConsoleSection ? <PanelSummary /> : game ? <GameArtifactSummary /> : <GameListHint />}
          </div>

          <div
            className={[
              'flex min-h-0 flex-col',
              showAside ? 'border-r border-ink/10' : '',
            ].join(' ')}
          >
            {inConsoleSection && tabNav}
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {inConsoleSection ? tabBody : game ? <GameArtifactBody /> : <GameListHint />}
            </div>
          </div>

          {showAside && (
            <div className="min-h-0 overflow-y-auto px-6 py-5">
              {game ? <GameArtifactFact /> : <FunFactCard />}
            </div>
          )}
        </div>
      )}

      <footer className="flex h-8 shrink-0 items-center justify-center border-t border-ink/10">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-ink/45 transition hover:text-ink"
          aria-expanded={true}
          aria-label={COPY.panelCollapse}
        >
          <ChevronDownIcon size={13} />
          {COPY.panelCollapse}
        </button>
      </footer>
    </aside>
  )
}

/** The games section with no selection (transient — entering the section
 * auto-selects the first game). Kept as a legible prompt rather than a blank
 * pane so a stale selection can never render an empty-looking room. */
function GameListHint() {
  return <p className="text-[13px] text-ink/60">{COPY.gamesListHint}</p>
}
