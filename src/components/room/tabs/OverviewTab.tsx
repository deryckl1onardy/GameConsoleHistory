import { useActiveConsole, useScene } from '@/store/scene'
import { COPY } from '../panel-copy'

/**
 * The overview column's PanelSummary carries the summary and the hero
 * figure; this tab carries what the raw numbers MEAN — the relatable-spec
 * comparisons that turn a clock speed into a sentence.
 *
 * Laid out as an "at a glance" grid rather than a single-column list: each
 * value gets real typographic weight of its own (font-display, set large),
 * so the tab reads as a set of small facts with numbers in them rather than
 * a wall of prose. Two columns on the wide layout, where there is room for
 * them to breathe; one on compact, where there is not.
 */
export function OverviewTab() {
  const entry = useActiveConsole()
  const layout = useScene((s) => s.layout)

  return (
    <section>
      <h4 className="mb-3 text-[10px] uppercase tracking-[0.18em] text-amber/70">
        {COPY.sectionNumbers}
      </h4>
      <div className={layout === 'wide' ? 'grid grid-cols-2 gap-x-6 gap-y-5' : 'space-y-4'}>
        {entry.relatableSpecs.map((s) => (
          <div key={s.label} className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.14em] text-parchment/40">{s.label}</p>
            <p className="mt-0.5 font-display text-xl leading-tight tabular-nums text-parchment">
              {s.value}
            </p>
            <p className="mt-1.5 text-[12px] leading-relaxed text-parchment/65">{s.comparison}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
