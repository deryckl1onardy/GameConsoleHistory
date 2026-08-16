import { useScene } from '@/store/scene'
import { BackArrowIcon } from '@/components/icons'
import { COPY } from './panel-copy'

/**
 * The brand mark, top-left. Doubles as the back-to-shelf action — the museum
 * is the browse surface now, so the way out of the room is the wordmark
 * itself, not a navigation bar. With the picker sidebar gone this is the only
 * chrome in the top-left corner, so there is nothing to collide with.
 */
export function BrandMark() {
  const retreatToShelf = useScene((s) => s.retreatToShelf)

  return (
    <button
      type="button"
      onClick={retreatToShelf}
      title={COPY.brandBack}
      aria-label={COPY.brandBack}
      className="pointer-events-auto absolute left-8 top-7 flex items-center gap-2.5 text-left"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-parchment/15 text-parchment/60 transition hover:border-parchment/35 hover:text-parchment">
        <BackArrowIcon size={14} />
      </span>
      <span>
        <span className="block text-[11px] uppercase tracking-[0.28em] text-parchment/70">
          {COPY.brand}
        </span>
        <span className="block text-[9px] uppercase tracking-[0.22em] text-parchment/35">
          {COPY.brandEyebrow}
        </span>
      </span>
    </button>
  )
}
