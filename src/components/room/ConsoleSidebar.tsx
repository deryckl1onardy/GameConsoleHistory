import { useEffect, useMemo, useRef, useState } from 'react'
import type { Generation } from '@/types/console'
import { releaseYear, sidebarGroups } from '@/data/consoles'
import { GENERATION_BITS, GENERATION_ERAS, GENERATION_LABELS } from '@/data/roster'
import { useActiveConsole, useScene } from '@/store/scene'
import { CompanyLogo } from './CompanyLogo'
import { ModelThumbnail } from './ModelThumbnail'
import { ProductLogo } from './ProductLogo'

/**
 * The app's primary navigation: a full-height left rail listing every console
 * in release order, separated by generation.
 *
 * The shelf is gone and this rail is how the atlas is browsed — it replaces
 * the old left title column AND the top-bar search:
 *
 *   [ search consoles…                    ]
 *   ──────────────────────────────────────
 *   SECOND GENERATION       1977 — cartridges arrive
 *   [▦] Atari 2600     1977
 *       Atari
 *   ──────────────────────────────────────
 *   THIRD GENERATION        1983 — the crash, and the recovery
 *   [▦] NES             1983
 *       Nintendo
 *   ...
 *
 * Each row's snippet is the console's ACTUAL 3D model, rendered offscreen
 * (ModelThumbnail / thumbnails.ts), so the rail doubles as a visual index of
 * the museum. Clicking a row, or stepping with ← / →, switches the room;
 * the active row is scrolled into view so the rail always shows where you
 * are. `/` focuses the search from anywhere; a query filters the list in
 * place, still grouped by generation.
 *
 * Mounted as a static flex sibling of the 3D canvas (see App.tsx) — it is
 * real layout, not an overlay, so the scene simply starts where the rail
 * ends and the two never overlap.
 */
export function ConsoleSidebar() {
  const entry = useActiveConsole()
  const layout = useScene((s) => s.layout)
  const sidebarOpen = useScene((s) => s.sidebarOpen)
  const setSidebarOpen = useScene((s) => s.setSidebarOpen)
  const setConsole = useScene((s) => s.setConsole)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const isCompact = layout === 'compact'
  const drawerClosed = isCompact && !sidebarOpen

  const groups = useMemo(() => sidebarGroups(query), [query])
  const total = useMemo(() => groups.reduce((n, g) => n + g.consoles.length, 0), [groups])

  // Switching consoles (row click, or the top bar's ← / → keys) keeps the
  // active row in view inside the rail — and opening the compact drawer
  // re-scrolls to it, since the list may have been scrolled elsewhere the
  // last time it was open.
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-console-id="${entry.id}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [entry.id, sidebarOpen])

  // Window-wide: `/` jumps into the search (opening the drawer first in the
  // compact layout, where the search is hidden until it is), Esc leaves it —
  // clearing a query first, then closing the drawer. The ← / → console
  // stepping lives in ConsoleNav (the top bar); both avoid firing while the
  // search box itself owns the keys.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return
      if (e.key === '/') {
        e.preventDefault()
        if (drawerClosed) setSidebarOpen(true)
        // Deferred so focus lands after the inert flag lifts with the re-render.
        window.setTimeout(() => inputRef.current?.focus(), 0)
      } else if (e.key === 'Escape') {
        if (query) {
          setQuery('')
        } else if (isCompact && sidebarOpen) {
          setSidebarOpen(false)
        }
        inputRef.current?.blur()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [query, isCompact, sidebarOpen, drawerClosed, setSidebarOpen])

  return (
    <>
      {/* Backdrop — only exists in the compact layout while the drawer is
          open, and only there; in the wide layout the rail is real layout
          and needs no backdrop. Clicking it closes the drawer. */}
      {isCompact && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/25 backdrop-blur-[2px]"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}
      <aside
        aria-label="Console list"
        // A closed compact drawer is slid off-screen but still in the DOM;
        // inert takes it out of the tab order and the accessibility tree so
        // its rows cannot be reached by keyboard while hidden.
        inert={drawerClosed || undefined}
        className={
          isCompact
            ? [
                'fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col overflow-hidden border-r border-ink/10 bg-paper shadow-2xl transition-transform duration-300 ease-out',
                sidebarOpen ? 'translate-x-0' : '-translate-x-full',
              ].join(' ')
            : 'flex h-full w-[280px] shrink-0 flex-col overflow-hidden border-r border-ink/10 bg-paper'
        }
      >
      <div className="shrink-0 px-4 pb-3 pt-4">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search consoles…"
          aria-label="Search consoles"
          className="w-full border-b border-ink/25 bg-transparent px-0.5 pb-1.5 font-display text-sm text-ink outline-none placeholder:italic placeholder:opacity-40"
        />
        {query.trim().length > 0 && (
          <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-ink/40">
            {total} {total === 1 ? 'console' : 'consoles'}
          </p>
        )}
      </div>

      <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto pb-6">
        {groups.length === 0 && (
          <p className="px-4 pt-2 text-xs italic text-ink/50">
            No consoles match “{query.trim()}”.
          </p>
        )}

        {groups.map((group) => (
          <section key={group.generation}>
            <GenerationGroup generation={group.generation} />
            <ul className="px-2">
              {group.consoles.map((c) => {
                const active = c.id === entry.id
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      data-console-id={c.id}
                      onClick={() => {
                        setConsole(c.id)
                        // A drawer pick closes it — the selection is made.
                        if (isCompact) setSidebarOpen(false)
                      }}
                      aria-current={active ? 'true' : undefined}
                      className={[
                        'flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition',
                        active ? 'bg-ink text-parchment' : 'hover:bg-ink/5',
                      ].join(' ')}
                    >
                      <ModelThumbnail entry={c} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          {/* The manufacturer's logo on top, with the year;
                              `onDark` keeps it legible on the active row's ink
                              background. */}
                          <CompanyLogo manufacturer={c.manufacturer} onDark={active} />
                          <span
                            className={[
                              'shrink-0 text-[10px] tabular-nums',
                              active ? 'text-parchment/60' : 'text-ink/40',
                            ].join(' ')}
                          >
                            {releaseYear(c)}
                          </span>
                        </span>
                        <span className="block">
                          {/* The console's product logo beneath; `onDark` puts
                              it on a light chip so mixed-colour marks stay
                              legible. */}
                          <ProductLogo entry={c} onDark={active} />
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>
    </aside>
    </>
  )
}

/** One generation's heading: the ordinal label plus its era caption. */
function GenerationGroup({ generation }: { generation: Generation }) {
  const meta = GENERATION_BITS[generation] ?? GENERATION_LABELS[generation]
  const era = GENERATION_ERAS[generation]
  return (
    <h2 className="flex items-baseline justify-between gap-2 px-4 pb-1 pt-4">
      <span className="text-[10px] uppercase tracking-[0.22em] text-ink/50">{meta}</span>
      {era && <span className="shrink-0 text-[9px] italic text-ink/35">{era}</span>}
    </h2>
  )
}
