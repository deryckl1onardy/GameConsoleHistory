import { ChipIcon, GlobeIcon, TagIcon } from '@/components/icons'
import { formatUnits } from '@/components/format'
import { useActiveConsole, useScene } from '@/store/scene'
import { COPY } from '../panel-copy'

/**
 * The Overview tab: the console's "at a glance" figures (units sold, launch
 * price, CPU clock), its one-paragraph summary, then the relatable-spec grid
 * that turns those raw numbers into a sentence.
 *
 * This used to be split in two: a persistent "PanelSummary" column that sat
 * to the LEFT of the tab nav in the wide layout (or stacked above it in
 * compact), bordered off from the tabbed body beside it. Visually that read
 * as two unrelated boxes glued together by a divider — and the stats stayed
 * on screen even while looking at Hardware or History, where they add
 * nothing. It is now just the first thing Overview itself shows, in the same
 * single content column as everything else, so switching to another tab
 * naturally replaces it instead of leaving it stranded.
 */

function Stat({
  icon: Icon,
  caption,
  value,
  sub,
}: {
  icon: typeof GlobeIcon
  caption: string
  value: string
  sub?: string
}) {
  return (
    <div className="min-w-0">
      <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-ink/40">
        <Icon size={11} className="text-amber/70" />
        {caption}
      </p>
      <p className="mt-1.5 font-display text-2xl leading-none tabular-nums text-ink">{value}</p>
      {sub && <p className="mt-1 text-[11px] text-ink/45">{sub}</p>}
    </div>
  )
}

export function OverviewTab() {
  const entry = useActiveConsole()
  const layout = useScene((s) => s.layout)
  const released = entry.released.jp ?? entry.released.na ?? entry.released.eu

  const units = (
    <Stat
      icon={GlobeIcon}
      caption={COPY.statUnits}
      value={formatUnits(entry.unitsSold)}
      sub={COPY.statUnitsSub}
    />
  )
  const price = (
    <Stat
      icon={TagIcon}
      caption={COPY.statPrice}
      value={`$${entry.msrpUsd}`}
      sub={`$${entry.msrpUsdAdjusted} today`}
    />
  )
  const cpu = (
    <Stat
      icon={ChipIcon}
      caption={COPY.statCpu}
      value={`${entry.specs.cpuClockMhz} MHz`}
      sub={entry.specs.cpu}
    />
  )

  return (
    <div className="space-y-6">
      <section>
        {layout === 'wide' ? (
          <div className="grid grid-cols-3 gap-x-6 gap-y-3">
            {units}
            {price}
            {cpu}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <div className="col-span-2">{units}</div>
            {price}
            {cpu}
          </div>
        )}

        <div className="mt-4 border-t border-ink/10 pt-4">
          <p className="text-[13px] leading-relaxed text-ink/75">{entry.summary}</p>
          <p className="mt-3 text-[10px] leading-relaxed text-ink/25">
            {released ? `Released ${new Date(released).getFullYear()}. ` : ''}
            {COPY.footer}
          </p>
        </div>
      </section>

      <section className="border-t border-ink/10 pt-5">
        <h4 className="mb-3 text-[10px] uppercase tracking-[0.18em] text-amber/70">
          {COPY.sectionNumbers}
        </h4>
        <div className={layout === 'wide' ? 'grid grid-cols-2 gap-x-6 gap-y-5' : 'space-y-4'}>
          {entry.relatableSpecs.map((s) => (
            <div key={s.label} className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.14em] text-ink/40">{s.label}</p>
              <p className="mt-0.5 font-display text-xl leading-tight tabular-nums text-ink">
                {s.value}
              </p>
              <p className="mt-1.5 text-[12px] leading-relaxed text-ink/65">{s.comparison}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
