import { useState } from 'react'
import { MUSEUM_LAYOUT } from '@/three/museum/layout'
import { useScene } from '@/store/scene'
import { ConsoleSearch } from './shelf/ConsoleSearch'
import { TimelineStrip } from './shelf/TimelineStrip'
import { useShelfKeyboard } from './shelf/useShelfKeyboard'

/**
 * The gallery's 2D chrome: a header saying where you are, a rail of the
 * generations down the right, and — at the bottom — the one line telling you
 * how to move, plus the way back out to the whole hall.
 *
 * Deliberately spare: the concept's own instruction is that this screen sells
 * itself on the collection, not on UI.
 *
 * Three things this fixes beyond inverting to ink-on-white for the bright hall
 * (parchment on white plaster left the entire header and rail invisible):
 *
 *   - **The rail said nothing.** Eight identical tracked-caps labels, with the
 *     dates hidden in `title` tooltips where nobody would find them. It now
 *     shows each generation's real year and how many consoles are on its
 *     plinth — the specifics are the content, and "1994 · 3 consoles" tells
 *     you more about where to go than "Fifth generation" does.
 *   - **Nothing said the screen could be navigated.** The room has a gesture
 *     legend; the shelf had nothing at all, which is most of why it read as
 *     unintuitive. There is now one line, in the same quiet register.
 *   - **One label treatment for everything.** The header's tracked caps, the
 *     rail, the buttons — all the same costume reads as a template. The rail's
 *     year is set in the display face and its label in plain sentence case, so
 *     the two registers are doing different jobs.
 *
 * Mirrors the room's discipline in App.tsx: this whole layer sits inside the
 * app's `pointer-events-none` overlay div, so each interactive piece opts back
 * in individually rather than one invisible full-screen div swallowing drags.
 */

/** Gallery ink — a soft near-black that belongs to warm plaster, not pure #000. */
const INK = '#2b2724'

export function ShelfOverlay() {
  const focusGeneration = useScene((s) => s.focusGeneration)
  const setFocusGeneration = useScene((s) => s.setFocusGeneration)
  const hallView = useScene((s) => s.hallView)
  const showHallOverview = useScene((s) => s.showHallOverview)
  // Fade the chrome out as the approach begins and in again after the retreat
  // lands: this is DOM, so the hall's lights cannot dim it — and the rail
  // popping out mid-flight would read as a UI jump rather than the world
  // changing.
  const approach = useScene((s) => s.approach)
  const show = approach === 'idle'
  const [searchOpen, setSearchOpen] = useState(false)
  const openSearch = () => setSearchOpen(true)
  const closeSearch = () => setSearchOpen(false)
  useShelfKeyboard(searchOpen, openSearch, closeSearch)

  return (
    <div
      className={[
        'transition-[opacity,visibility] duration-500',
        show ? 'opacity-100 visible' : 'opacity-0 invisible',
      ].join(' ')}
      style={{ color: INK }}
    >
      <header className="absolute left-8 top-8 max-w-sm">
        <p className="text-[11px] uppercase tracking-[0.25em] opacity-55">Console Chronicles</p>
        <h1 className="mt-2 font-display text-5xl leading-none">Shelf of History</h1>
        <p className="mt-3 text-sm italic opacity-55">
          Twenty-two machines, one hall, fifty years.
        </p>
      </header>

      {/* Reads top-to-bottom in the order the stations recede down the hall. */}
      <nav className="pointer-events-auto absolute right-8 top-1/2 flex -translate-y-1/2 flex-col items-end gap-2.5">
        {MUSEUM_LAYOUT.bays.map((bay) => {
          const active = hallView === 'station' && bay.generation === focusGeneration
          return (
            <button
              key={bay.generation}
              onClick={() => setFocusGeneration(bay.generation)}
              aria-current={active ? 'true' : undefined}
              className={[
                'group flex items-baseline gap-2.5 text-right transition-opacity duration-200',
                // Active reads as active through TYPE and weight, not through a
                // mark bolted on beside it.
                active ? 'opacity-100' : 'opacity-40 hover:opacity-75',
              ].join(' ')}
            >
              <span className="text-[10px] tabular-nums opacity-60">{bay.artifacts.length}</span>
              <span
                className={[
                  'font-display text-base leading-none tabular-nums',
                  active ? 'font-medium' : '',
                ].join(' ')}
              >
                {bay.firstYear}
              </span>
            </button>
          )
        })}
      </nav>

      {/*
        The bottom-left cluster: how to move, and the way back out. Balances the
        rail on the right and keeps the left column — header above, controls
        below — reading as one edge rather than four floating islands.
      */}
      <div className="absolute bottom-16 left-8 flex flex-col items-start gap-3">
        <p className="text-[11px] opacity-45">
          ← → or scroll to focus · / to search · click to focus · double-click or Enter to visit
        </p>
        {hallView === 'station' && (
          <button
            type="button"
            onClick={showHallOverview}
            className="pointer-events-auto text-[11px] uppercase tracking-[0.18em] opacity-55 transition-opacity hover:opacity-100"
          >
            See the whole hall
          </button>
        )}
      </div>

      <TimelineStrip />

      {searchOpen && <ConsoleSearch onClose={closeSearch} />}
    </div>
  )
}
