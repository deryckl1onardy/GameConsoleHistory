import { ChipIcon, GlobeIcon, TagIcon } from '@/components/icons'
import { formatUnits } from '@/components/format'
import { useActiveConsole } from '@/store/scene'
import { COPY } from './panel-copy'

/**
 * The panel's lead column: the summary paragraph, one hero figure, and two
 * secondary stats underneath it — an editorial "at a glance", not a row of
 * three equal instrument-panel tiles.
 *
 * Units sold is always the hero: it is the one number every console in the
 * atlas has and the one that best answers "how big was this, really" at a
 * glance, so it stays consistent from console to console rather than being
 * picked per entry. Price and CPU clock are real numbers too, just quieter
 * ones — they read as supporting information, not as three peers competing
 * for the same attention.
 *
 * The numbers come FIRST, ahead of the paragraph, and are marked shrink-0.
 * The panel is short in BOTH layouts — 32% of the viewport's height on
 * wide, and on compact the summary sits in a 2-of-5 grid row inside a 45%
 * panel — which turned out to be the real constraint: with the numbers
 * below the paragraph, as they were originally, they were reliably pushed
 * out of view (wide) or cut off mid-value (compact) and needed a scroll
 * nobody would think to make. Putting them first fixed that, and the two
 * secondary stats sit in a 2-column grid in BOTH layouts — not just wide —
 * because compact's own column is nearly the full panel width (it stacks
 * ROWS, not side-by-side columns), so it has the width to spare even
 * though it is short on height, and a vertical stack there cost exactly
 * the extra row that pushed the second stat's value out of view.
 *
 * `min-h-[64px]` on the paragraph's own scroll region is the floor that
 * stops IT being squeezed to an unreadable sliver in turn. Short of the
 * outer column itself scrolling (DetailPanel's wrapper keeps its own
 * overflow-y-auto as the last resort), the numbers and a few lines of the
 * story are both always on screen at once, with neither eating the
 * other's space.
 *
 * The attribution footer moved inside the paragraph's own scroll region,
 * as its last line, rather than staying pinned at the very bottom on its
 * own — it is a citation for the prose above it, not content that needs to
 * be visible independent of the paragraph, and unpinning it is what freed
 * the paragraph's minimum in the first place.
 */

/**
 * Two-line by default (caption over value) — the wide layout has the
 * vertical room to let a caption breathe above its number. Compact does
 * not: its summary column is a short GRID ROW, not a tall left column
 * (see the file header), so `compact` collapses the pair to one line —
 * icon, caption, value — trading the caption's own line for guaranteed
 * visibility of the number it labels.
 */
function SecondaryStat({
  icon: Icon,
  caption,
  value,
  sub,
  compact = false,
}: {
  icon: typeof GlobeIcon
  caption: string
  value: string
  sub?: string
  compact?: boolean
}) {
  if (compact) {
    return (
      <p className="flex min-w-0 items-baseline gap-1.5 text-[12px] text-parchment/85">
        <Icon size={11} className="shrink-0 translate-y-[1px] text-phosphor/70" />
        <span className="shrink-0 text-[10px] uppercase tracking-[0.14em] text-parchment/40">
          {caption}
        </span>
        <span className="min-w-0 truncate tabular-nums">{value}</span>
      </p>
    )
  }
  return (
    <div className="min-w-0">
      <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-parchment/40">
        <Icon size={11} className="text-phosphor/70" />
        {caption}
      </p>
      <p className="mt-0.5 text-[13px] text-parchment/85">
        <span className="tabular-nums">{value}</span>
        {sub && <span className="text-parchment/40"> · {sub}</span>}
      </p>
    </div>
  )
}

export function PanelSummary({ compact = false }: { compact?: boolean }) {
  const entry = useActiveConsole()
  const released = entry.released.jp ?? entry.released.na ?? entry.released.eu

  return (
    <div className="flex h-full min-w-0 flex-col gap-3">
      <div className="shrink-0">
        <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-parchment/45">
          <GlobeIcon size={12} className="text-phosphor/80" />
          {COPY.statUnits} · {COPY.statUnitsSub}
        </p>
        <p
          className={[
            'font-display leading-none tabular-nums text-parchment',
            compact ? 'mt-1.5 text-3xl' : 'mt-2 text-4xl',
          ].join(' ')}
        >
          {formatUnits(entry.unitsSold)}
        </p>

        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 border-t border-parchment/10 pt-2.5">
          <SecondaryStat
            icon={TagIcon}
            caption={COPY.statPrice}
            value={`$${entry.msrpUsd}`}
            sub={`$${entry.msrpUsdAdjusted} today`}
            compact={compact}
          />
          <SecondaryStat
            icon={ChipIcon}
            caption={COPY.statCpu}
            value={`${entry.specs.cpuClockMhz} MHz`}
            sub={entry.specs.cpu}
            compact={compact}
          />
        </div>
      </div>

      <div className="min-h-[64px] flex-1 overflow-y-auto border-t border-parchment/10 pt-3">
        <p className="text-[13px] leading-relaxed text-parchment/75">{entry.summary}</p>
        <p className="mt-3 text-[10px] leading-relaxed text-parchment/25">
          {released ? `Released ${new Date(released).getFullYear()}. ` : ''}
          {COPY.footer}
        </p>
      </div>
    </div>
  )
}
