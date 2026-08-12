import { useEffect, useRef } from 'react'
import type { PanelTab } from '@/store/scene'
import { useActiveConsole, useScene } from '@/store/scene'

/**
 * The floating info panel — where everything the data files already contain
 * finally becomes reachable.
 *
 * Selecting the Games tab moves the camera to the shelf, and selecting a game
 * lifts that cartridge in the scene. The reverse is wired too: clicking a
 * cartridge in 3D opens this panel on that row. The list and the shelf are two
 * views of one selection.
 */

const TABS: { id: PanelTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'games', label: 'Games' },
  { id: 'controller', label: 'Controller' },
  { id: 'facts', label: 'Facts' },
]

function millions(n: number) {
  return `${(n / 1_000_000).toFixed(2)}M`
}

function Overview() {
  const entry = useActiveConsole()
  const released = entry.released.jp ?? entry.released.na ?? entry.released.eu

  return (
    <div className="space-y-6">
      <p className="text-[13px] leading-relaxed text-parchment/75">{entry.summary}</p>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
        {[
          ['Released', released ? new Date(released).getFullYear() : '—'],
          ['Units sold', millions(entry.unitsSold)],
          ['Launch price', `$${entry.msrpUsd}`],
          ['In 2025 dollars', `$${entry.msrpUsdAdjusted}`],
        ].map(([k, v]) => (
          <div key={k}>
            <dt className="text-[10px] uppercase tracking-[0.16em] text-parchment/40">{k}</dt>
            <dd className="mt-0.5 text-sm tabular-nums text-parchment">{v}</dd>
          </div>
        ))}
      </dl>

      <section>
        <h4 className="mb-2 text-[10px] uppercase tracking-[0.18em] text-amber/70">
          What the numbers mean
        </h4>
        <ul className="space-y-3">
          {entry.relatableSpecs.map((s) => (
            <li key={s.label}>
              <p className="text-[11px] text-parchment/50">
                {s.label} — <span className="tabular-nums text-parchment/80">{s.value}</span>
              </p>
              <p className="mt-0.5 text-[13px] leading-snug text-parchment/70">{s.comparison}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h4 className="mb-2 text-[10px] uppercase tracking-[0.18em] text-amber/70">
          Specifications
        </h4>
        <dl className="space-y-1.5">
          {Object.entries({
            CPU: `${entry.specs.cpu} @ ${entry.specs.cpuClockMhz} MHz`,
            Memory: entry.specs.ram,
            Resolution: entry.specs.resolution,
            Colours: entry.specs.colors,
            Audio: entry.specs.audio,
            Media: entry.specs.media,
          }).map(([k, v]) => (
            <div key={k} className="flex gap-3 text-[12px]">
              <dt className="w-20 shrink-0 text-parchment/40">{k}</dt>
              <dd className="text-parchment/80">{v}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  )
}

function Games() {
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

  return (
    <div>
      <p className="mb-3 text-[12px] text-parchment/50">
        The ten best-selling games, shown on the shelf at their real box size.
      </p>
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
                  {millions(g.unitsSold)}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function ControllerTab() {
  const entry = useActiveConsole()
  const pad = entry.controllers[0]
  if (!pad) return <p className="text-[13px] text-parchment/60">No controller recorded.</p>

  return (
    <div className="space-y-5">
      <div>
        <h4 className="text-sm text-parchment">{pad.name}</h4>
        <p className="mt-0.5 text-[11px] tabular-nums text-parchment/40">
          {pad.dimensions.width} × {pad.dimensions.height} × {pad.dimensions.depth} mm
        </p>
      </div>

      <section>
        <h4 className="mb-2 text-[10px] uppercase tracking-[0.18em] text-amber/70">
          What it introduced
        </h4>
        <ul className="space-y-2">
          {pad.innovations.map((i) => (
            <li key={i} className="text-[13px] leading-snug text-parchment/75">
              {i}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h4 className="mb-2 text-[10px] uppercase tracking-[0.18em] text-amber/70">Buttons</h4>
        <ul className="space-y-1">
          {pad.buttons
            .filter((b) => !b.id.startsWith('dpad-') || b.id === 'dpad-up')
            .map((b) => (
              <li key={b.id} className="flex gap-3 text-[12px]">
                <span className="w-16 shrink-0 text-parchment/80">
                  {b.id.startsWith('dpad') ? 'D-pad' : b.label}
                </span>
                <span className="text-parchment/50">{b.note ?? '—'}</span>
              </li>
            ))}
        </ul>
      </section>
    </div>
  )
}

function Facts() {
  const entry = useActiveConsole()
  return (
    <div className="space-y-6">
      {entry.facts.map((f) => (
        <article key={f.id}>
          <h4 className="text-[13px] font-medium leading-snug text-parchment">{f.title}</h4>
          <p className="mt-1.5 text-[13px] leading-relaxed text-parchment/70">{f.body}</p>
        </article>
      ))}

      {entry.failureStates.length > 0 && (
        <section className="border-t border-parchment/10 pt-5">
          <h4 className="mb-3 text-[10px] uppercase tracking-[0.18em] text-amber/70">
            How they failed
          </h4>
          {entry.failureStates.map((f) => (
            <article key={f.id} className="mb-4 last:mb-0">
              <h5 className="text-[13px] font-medium text-parchment">{f.name}</h5>
              <p className="mt-1 text-[13px] leading-relaxed text-parchment/70">{f.body}</p>
            </article>
          ))}
        </section>
      )}

      {entry.variants.map((v) => (
        <section key={v.id} className="border-t border-parchment/10 pt-5">
          <h4 className="mb-2 text-[10px] uppercase tracking-[0.18em] text-amber/70">
            {v.name}
          </h4>
          <p className="text-[13px] leading-relaxed text-parchment/70">{v.note}</p>
        </section>
      ))}
    </div>
  )
}

export function InfoPanel() {
  const entry = useActiveConsole()
  const open = useScene((s) => s.panelOpen)
  const setOpen = useScene((s) => s.setPanelOpen)
  const tab = useScene((s) => s.panelTab)
  const setTab = useScene((s) => s.setPanelTab)

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="pointer-events-auto absolute right-6 top-1/2 -translate-y-1/2 rounded-full border border-parchment/15 bg-ink/70 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-parchment/70 backdrop-blur-md transition hover:border-parchment/35 hover:text-parchment"
        aria-label="Open details panel"
      >
        <span className="[writing-mode:vertical-rl]">Details</span>
      </button>
    )
  }

  return (
    <aside
      className="pointer-events-auto absolute bottom-6 right-6 top-6 flex w-[360px] flex-col rounded-2xl border border-parchment/12 bg-ink/80 backdrop-blur-xl"
      aria-label={`${entry.shortName} details`}
    >
      <header className="flex items-center justify-between gap-2 border-b border-parchment/10 px-4 pt-3">
        <nav className="flex gap-0.5" role="tablist">
          {TABS.map((t) => (
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
        <button
          onClick={() => setOpen(false)}
          className="mb-1.5 rounded-md px-2 py-1 text-parchment/50 transition hover:bg-parchment/10 hover:text-parchment"
          aria-label="Close details panel"
        >
          ✕
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        {tab === 'overview' && <Overview />}
        {tab === 'games' && <Games />}
        {tab === 'controller' && <ControllerTab />}
        {tab === 'facts' && <Facts />}
      </div>

      <footer className="border-t border-parchment/10 px-5 py-3">
        <p className="text-[10px] leading-relaxed text-parchment/30">
          Sales and dates from Wikipedia. Cover art shown is placeholder.
        </p>
      </footer>
    </aside>
  )
}
