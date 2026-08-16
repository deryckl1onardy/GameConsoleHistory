import { ROOM_CHROME } from '@/frame'
import { useActiveConsole, useScene } from '@/store/scene'
import { ChevronDownIcon, ChevronUpIcon } from '@/components/icons'
import { PanelSummary } from './PanelSummary'
import { COPY, ROOM_TABS } from './panel-copy'
import { OverviewTab } from './tabs/OverviewTab'
import { GamesTab } from './tabs/GamesTab'
import { HardwareTab } from './tabs/HardwareTab'
import { HistoryTab } from './tabs/HistoryTab'

/**
 * The wide bottom panel. Sizes itself from the SAME fractions the camera
 * reads (ROOM_CHROME via frame.ts), so the console is always framed clear of
 * it and the two can never drift apart — collapsing the panel changes its
 * height, which recomputes the camera's frame offset, which is exactly the
 * coupling this file exists to keep honest.
 *
 * Wide: two columns — the summary left, the tabbed column right. Compact:
 * the same content stacked into one column at 45vh.
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
  const tab = useScene((s) => s.panelTab)
  const setTab = useScene((s) => s.setPanelTab)

  const chrome = layout === 'compact' ? ROOM_CHROME.compact : ROOM_CHROME
  const heightVh = (open ? chrome.panelH : chrome.collapsedPanelH) * 100
  const width = layout === 'compact' ? '94%' : '85%'

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
          className="flex h-full w-full items-center justify-center gap-2 rounded-t-2xl border border-b-0 border-parchment/12 bg-ink/80 text-[11px] uppercase tracking-[0.2em] text-parchment/60 backdrop-blur-xl transition hover:text-parchment"
          aria-expanded={false}
        >
          <ChevronUpIcon size={15} />
          {COPY.panelCollapsedHint}
        </button>
      </aside>
    )
  }

  return (
    <aside
      className="pointer-events-auto absolute bottom-0 left-1/2 flex -translate-x-1/2 flex-col overflow-hidden rounded-t-2xl border border-b-0 border-parchment/12 bg-ink/85 backdrop-blur-xl"
      style={{ width, height: `${heightVh}vh` }}
      aria-label={`${entry.shortName} details`}
    >
      <div
        className="min-h-0 flex-1"
        style={{
          display: 'grid',
          gridTemplateColumns: layout === 'wide' ? 'minmax(0, 2fr) minmax(0, 3fr)' : '1fr',
          gridTemplateRows: layout === 'wide' ? '1fr' : 'minmax(0, 2fr) minmax(0, 3fr)',
        }}
      >
        <div
          className={
            layout === 'wide'
              ? 'min-h-0 overflow-y-auto border-r border-parchment/10 px-7 py-5'
              : 'min-h-0 overflow-y-auto border-b border-parchment/10 px-5 py-4'
          }
        >
          <PanelSummary compact={layout === 'compact'} />
        </div>

        <div className="flex min-h-0 flex-col">
          <nav className="flex gap-0.5 border-b border-parchment/10 px-5 pt-3" role="tablist">
            {ROOM_TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={[
                  'rounded-t-md px-2.5 pb-2.5 pt-1 text-[11px] transition',
                  tab === t.id
                    ? 'border-b-2 border-amber text-parchment'
                    : 'border-b-2 border-transparent text-parchment/45 hover:text-parchment/80',
                ].join(' ')}
              >
                {t.label}
              </button>
            ))}
          </nav>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            {tab === 'overview' && <OverviewTab />}
            {tab === 'games' && <GamesTab />}
            {tab === 'hardware' && <HardwareTab />}
            {tab === 'history' && <HistoryTab />}
          </div>
        </div>
      </div>

      <footer className="flex h-8 shrink-0 items-center justify-center border-t border-parchment/10">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-parchment/45 transition hover:text-parchment"
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
