import { ChipIcon, GlobeIcon, TagIcon } from '@/components/icons'
import { formatUnits } from '@/components/format'
import { useActiveConsole } from '@/store/scene'
import { COPY } from './panel-copy'

/**
 * The left column of the detail panel: the summary paragraph and the three
 * stat blocks. Every figure is DERIVED from existing per-console fields —
 * this adds zero new data. The stat icons are the bespoke set's three
 * technical marks, and phosphor is the annotation accent, so the numbers
 * read as instrument readouts rather than marketing chips.
 */

function StatBlock({
  icon: Icon,
  value,
  caption,
  sub,
}: {
  icon: typeof GlobeIcon
  value: string
  caption: string
  sub?: string | null
}) {
  return (
    <div className="min-w-0">
      <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-parchment/45">
        <Icon size={13} className="text-phosphor/80" />
        {caption}
      </p>
      <p className="mt-1.5 truncate font-display text-2xl leading-none tabular-nums text-parchment">
        {value}
      </p>
      {sub && <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-parchment/35">{sub}</p>}
    </div>
  )
}

export function PanelSummary({ compact = false }: { compact?: boolean }) {
  const entry = useActiveConsole()
  const released = entry.released.jp ?? entry.released.na ?? entry.released.eu

  return (
    <div
      className={compact ? 'flex min-w-0 flex-col gap-3' : 'flex h-full min-w-0 flex-col gap-4'}
    >
      <p className="text-[13px] leading-relaxed text-parchment/75">{entry.summary}</p>
      <div
        className={[
          'grid grid-cols-3 gap-4 border-t border-parchment/10 pt-4',
          compact ? '' : 'mt-auto',
        ].join(' ')}
      >
        <StatBlock
          icon={GlobeIcon}
          value={formatUnits(entry.unitsSold)}
          caption={COPY.statUnits}
          sub={COPY.statUnitsSub}
        />
        <StatBlock
          icon={TagIcon}
          value={`$${entry.msrpUsd}`}
          caption={COPY.statPrice}
          sub={`$${entry.msrpUsdAdjusted} today`}
        />
        <StatBlock
          icon={ChipIcon}
          value={`${entry.specs.cpuClockMhz} MHz`}
          caption={COPY.statCpu}
          sub={entry.specs.cpu}
        />
      </div>
      <p className="text-[10px] leading-relaxed text-parchment/25">
        {released ? `Released ${new Date(released).getFullYear()}. ` : ''}
        {COPY.footer}
      </p>
    </div>
  )
}
