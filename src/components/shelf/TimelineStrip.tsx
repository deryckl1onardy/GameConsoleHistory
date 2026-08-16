import { getConsole } from '@/data/consoles'
import { useScene } from '@/store/scene'
import { consoleOrder, yearOf } from '@/three/museum/hall-glide'
import { MUSEUM_LAYOUT } from '@/three/museum/layout'

/**
 * The shelf's bottom chrome: twenty-two marks, one per console, positioned
 * BY YEAR along a single strip — 1977 on the left, 2025 on the right — not
 * by index.
 *
 * This is the answer to \"you cannot find a console by name\": the whole
 * index is 8 year-numbers, so finding the N64 requires already knowing it is
 * the \"1994\" generation. A year-positioned strip is a timeline you can read:
 * gaps cluster where nothing shipped, 1994 and 2001 and 2013 stack their
 * consoles visibly, and a mark is a console you can click without knowing
 * which generation it belongs to.
 *
 * The strip is real chrome, so the shelf camera is framed clear of it (see
 * shelfFrameOffsetFor in frame.ts) — this component and that function are
 * the two halves of one layout decision, kept in sync by hand because they
 * live on opposite sides of the DOM/canvas boundary.
 */

/** Ink, matching the rest of the shelf chrome (ShelfOverlay). */
const INK = '#2b2724'

export function TimelineStrip() {
  const focusedId = useScene((s) => s.focusedId)
  const setFocusedConsole = useScene((s) => s.setFocusedConsole)

  const order = consoleOrder(MUSEUM_LAYOUT)
  const years = order.map((a) => yearOf(getConsole(a.id)!))
  const minYear = Math.min(...years)
  const maxYear = Math.max(...years)
  const span = Math.max(1, maxYear - minYear)

  return (
    <div className="pointer-events-auto absolute inset-x-6 bottom-4">
      {/* The rail the marks sit on — a hairline, not a bar. */}
      <div
        className="absolute bottom-2 left-0 right-0 h-px"
        style={{ backgroundColor: INK, opacity: 0.25 }}
      />
      <div className="relative h-9">
        {order.map((a) => {
          const entry = getConsole(a.id)!
          const year = yearOf(entry)
          // Guard the timeline's one fragility: a console with no release
          // dates yields year 0 (see yearOf) and must clamp rather than
          // push a mark off the strip.
          const left = Math.max(0, Math.min(100, ((year - minYear) / span) * 100))
          const active = a.id === focusedId
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => setFocusedConsole(a.id)}
              aria-label={`${entry.shortName} (${year})`}
              aria-current={active ? 'true' : undefined}
              className="group absolute -translate-x-1/2"
              style={{ left: `${left}%`, bottom: 0 }}
            >
              {/* The mark itself. Active is larger and full-strength; the
                  rest are quiet dots you can still hit. */}
              <span
                className={[
                  'block rounded-full transition-all duration-200',
                  active
                    ? 'h-[9px] w-[9px]'
                    : 'h-[5px] w-[5px] opacity-45 group-hover:opacity-90',
                ].join(' ')}
                style={{ backgroundColor: INK }}
              />
              {/* The museum label, revealed on hover/focus so the strip stays
                  spare at rest — but every mark is a real, clickable console. */}
              <span className="pointer-events-none absolute bottom-5 left-1/2 hidden -translate-x-1/2 flex-col items-center whitespace-nowrap group-hover:flex group-focus-visible:flex">
                <span className="font-display text-sm leading-none">{entry.shortName}</span>
                <span className="mt-0.5 text-[9px] uppercase tracking-[0.2em] opacity-60">
                  {year}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
