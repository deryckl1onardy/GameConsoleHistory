import { useMemo } from 'react'
import {
  GENERATION_ERAS,
  GENERATION_LABELS,
  rosterByGeneration,
} from '@/data/roster'
import { useScene } from '@/store/scene'

/**
 * The console picker, grouped by generation.
 *
 * Generations are the spine of the atlas — the console war, the jump to 3D, the
 * arrival of discs — so they are the navigation, not a filter applied to a flat
 * list. Unbuilt consoles are shown dimmed rather than hidden: the roadmap is
 * part of the story, and an atlas that silently omits the PlayStation would read
 * as broken rather than unfinished.
 */

function formatUnits(n: number): string {
  return `${(n / 1_000_000).toFixed(n >= 100_000_000 ? 0 : 1)}M sold`
}

export function ConsolePicker() {
  const open = useScene((s) => s.pickerOpen)
  const setOpen = useScene((s) => s.setPickerOpen)
  const consoleId = useScene((s) => s.consoleId)
  const setConsole = useScene((s) => s.setConsole)

  const groups = useMemo(() => rosterByGeneration(), [])
  const builtCount = useMemo(
    () => groups.reduce((n, g) => n + g.consoles.filter((c) => c.built).length, 0),
    [groups],
  )
  const total = useMemo(() => groups.reduce((n, g) => n + g.consoles.length, 0), [groups])

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="pointer-events-auto absolute left-6 top-1/2 -translate-y-1/2 rounded-full border border-parchment/15 bg-ink/70 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-parchment/70 backdrop-blur-md transition hover:border-parchment/35 hover:text-parchment"
        aria-expanded={false}
        aria-label="Open console library"
      >
        <span className="[writing-mode:vertical-rl]">Consoles</span>
      </button>
    )
  }

  return (
    <aside
      className="pointer-events-auto absolute bottom-6 left-6 top-6 flex w-[300px] flex-col rounded-2xl border border-parchment/12 bg-ink/80 backdrop-blur-xl"
      aria-label="Console library"
    >
      <header className="flex items-start justify-between gap-3 border-b border-parchment/10 px-5 py-4">
        <div>
          <h2 className="font-display text-xl leading-none text-parchment">Consoles</h2>
          <p className="mt-1.5 text-[11px] text-parchment/45">
            {builtCount} of {total} built
          </p>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="-mr-1 rounded-md px-2 py-1 text-parchment/50 transition hover:bg-parchment/10 hover:text-parchment"
          aria-label="Close console library"
        >
          ✕
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        {groups.map(({ generation, consoles }) => (
          <section key={generation} className="mb-5 last:mb-1">
            <div className="px-2 pb-2">
              <h3 className="text-[10px] uppercase tracking-[0.22em] text-amber/70">
                {GENERATION_LABELS[generation]}
              </h3>
              {GENERATION_ERAS[generation] && (
                <p className="mt-0.5 text-[11px] italic text-parchment/35">
                  {GENERATION_ERAS[generation]}
                </p>
              )}
            </div>

            <ul>
              {consoles.map((c) => {
                const active = c.id === consoleId
                return (
                  <li key={c.id}>
                    <button
                      disabled={!c.built}
                      onClick={() => setConsole(c.id)}
                      aria-current={active ? 'true' : undefined}
                      className={[
                        'group flex w-full items-baseline justify-between gap-3 rounded-lg px-2 py-2 text-left transition',
                        c.built
                          ? active
                            ? 'bg-parchment/12 text-parchment'
                            : 'text-parchment/75 hover:bg-parchment/7 hover:text-parchment'
                          : 'cursor-not-allowed text-parchment/22',
                      ].join(' ')}
                      title={c.built ? c.name : `${c.name} — not built yet`}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm">{c.shortName}</span>
                        <span className="block truncate text-[11px] text-current opacity-55">
                          {c.manufacturer} · {c.year}
                        </span>
                      </span>
                      <span className="shrink-0 text-[10px] tabular-nums opacity-45">
                        {c.built ? formatUnits(c.unitsSold) : 'soon'}
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
  )
}
