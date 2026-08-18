import { useEffect } from 'react'
import { CONSOLES, releaseYear } from '@/data/consoles'
import { useActiveConsole, useScene } from '@/store/scene'
import { BackArrowIcon, MenuIcon } from '@/components/icons'
import { ProductLogo } from './ProductLogo'

/**
 * The top bar of the console detail — the "you are here" strip.
 *
 * Search and the console list now live in the left sidebar (ConsoleSidebar);
 * this bar keeps the parts that belong above the room:
 *
 *   Console Chronicles   ◀  GENESIS · 1988  ▶
 *
 *   ◀ ▶      step chronologically through the roster (also ← / → keys)
 *   identity  the console you are looking at, with its release year
 *
 * Deliberately one row, deliberately spare: switching consoles is a single
 * motion, and the identity doubles as the "you are here" of the whole app.
 *
 * Mounted inside the pointer-events-none overlay, so only this bar captures
 * input; everything above and below it stays draggable by the orbit camera.
 */
export function ConsoleNav() {
  const entry = useActiveConsole()
  const layout = useScene((s) => s.layout)
  const sidebarOpen = useScene((s) => s.sidebarOpen)
  const setSidebarOpen = useScene((s) => s.setSidebarOpen)
  const setConsole = useScene((s) => s.setConsole)

  // Step order is the roster itself — release order, oldest first.
  const rawIdx = CONSOLES.findIndex((c) => c.id === entry.id)
  const idx = rawIdx === -1 ? 0 : rawIdx
  const prev = CONSOLES[(idx - 1 + CONSOLES.length) % CONSOLES.length]
  const next = CONSOLES[(idx + 1) % CONSOLES.length]

  /* Keyboard map, window-wide so the canvas never needs focus:
     ← / →      previous / next console
     (The sidebar owns `/` and Esc for its search box, and the search box
     owns its own keys while focused.) */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setConsole(prev.id)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        setConsole(next.id)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prev.id, next.id, setConsole])

  return (
    <header className="pointer-events-auto absolute inset-x-0 top-0 flex h-14 items-center gap-3 border-b border-ink/10 px-8">
      {/* The compact layout hides the sidebar rail behind this hamburger —
          the drawer slides in over the room. The wide layout shows the rail
          permanently, so the button does not exist there. */}
      {layout === 'compact' && (
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? 'Close console list' : 'Open console list'}
          aria-expanded={sidebarOpen}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink/55 transition hover:bg-ink/5 hover:text-ink"
        >
          <MenuIcon size={16} />
        </button>
      )}

      {/* The wordmark — pure branding now, not a button. */}
      <p className="shrink-0 text-[11px] uppercase tracking-[0.28em] text-ink/70">Console Chronicles</p>
      <span className="h-4 w-px shrink-0 bg-ink/15" aria-hidden />

      {/* Step back one console, chronologically. */}
      <button
        type="button"
        onClick={() => setConsole(prev.id)}
        title={`${prev.shortName} · ${releaseYear(prev)}`}
        aria-label={`Previous console: ${prev.shortName}`}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink/55 transition hover:bg-ink/5 hover:text-ink"
      >
        <BackArrowIcon size={15} />
      </button>

      {/* The identity — which console this room is. */}
      <p className="flex min-w-0 items-center gap-2">
        <ProductLogo entry={entry} height={16} />
        <span className="shrink-0 font-sans text-[11px] tabular-nums text-ink/45">{releaseYear(entry)}</span>
      </p>

      {/* Step forward one console. */}
      <button
        type="button"
        onClick={() => setConsole(next.id)}
        title={`${next.shortName} · ${releaseYear(next)}`}
        aria-label={`Next console: ${next.shortName}`}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink/55 transition hover:bg-ink/5 hover:text-ink"
      >
        <BackArrowIcon size={15} className="rotate-180" />
      </button>
    </header>
  )
}
