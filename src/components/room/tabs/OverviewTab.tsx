import { useActiveConsole } from '@/store/scene'
import { COPY } from '../panel-copy'

/**
 * The overview column's PanelSummary carries the summary and the stat blocks;
 * this tab carries what the raw numbers MEAN — the relatable-spec comparisons
 * that turn a clock speed into a sentence.
 */
export function OverviewTab() {
  const entry = useActiveConsole()

  return (
    <section>
      <h4 className="mb-2.5 text-[10px] uppercase tracking-[0.18em] text-amber/70">
        {COPY.sectionNumbers}
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
  )
}
