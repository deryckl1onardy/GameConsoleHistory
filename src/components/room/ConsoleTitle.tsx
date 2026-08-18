import { GENERATION_BITS, GENERATION_LABELS } from '@/data/roster'
import { ROOM_CHROME } from '@/frame'
import { useActiveConsole, useScene } from '@/store/scene'
import { CompanyLogo } from './CompanyLogo'
import { ProductLogo } from './ProductLogo'

/**
 * The room's display title block — the museum-label identity of the console
 * you walked up to. The meta row names the generation the way the industry
 * actually marketed it: "16-bit console" for the SNES (GENERATION_BITS),
 * falling back to the plain ordinal label once bit-width stopped meaning
 * anything (gens 6+).
 *
 * Wide: a full left column, the title column of the mockups. Compact: a
 * single line tucked under the brand mark. Both read the SAME fractions
 * (ROOM_CHROME.titleW) the camera uses to dodge this column, so a title that
 * grows beyond the column would sit under the console's lift — the two sides
 * of the frame contract can't drift.
 */
export function ConsoleTitle() {
  const entry = useActiveConsole()
  const layout = useScene((s) => s.layout)

  const released = entry.released.jp ?? entry.released.na ?? entry.released.eu
  const year = released ? new Date(released).getFullYear() : undefined
  const meta = GENERATION_BITS[entry.generation] ?? GENERATION_LABELS[entry.generation]

  if (layout === 'compact') {
    return (
      <p className="pointer-events-none absolute left-8 top-[4.4rem] max-w-[calc(100vw-4rem)] truncate text-[12px] text-ink/70">
        <ProductLogo entry={entry} height={13} />
        <span className="mx-2 text-ink/30">·</span>
        {meta}
        {entry.manufacturer && (
          <>
            <span className="mx-2 text-ink/30">·</span>
            <CompanyLogo manufacturer={entry.manufacturer} />
            {year && <span className="mx-1.5 text-ink/30">·</span>}
            {year}
          </>
        )}
      </p>
    )
  }

  return (
    <div
      className="pointer-events-none absolute left-8 top-[16%]"
      style={{ width: `calc(${ROOM_CHROME.titleW * 100}vw - 4rem)` }}
    >
      <p className="text-[11px] uppercase tracking-[0.24em] text-ink/50">{meta}</p>
      <ProductLogo entry={entry} height={56} />
      <p className="mt-4 flex items-center gap-2 text-[13px] text-ink/55">
        <CompanyLogo manufacturer={entry.manufacturer} height={10} />
        {year ? <span className="text-ink/30">·</span> : null}
        {year}
      </p>
      <p className="mt-2 max-w-md text-[13px] italic leading-relaxed text-ink/65">
        {entry.tagline}
      </p>
    </div>
  )
}
