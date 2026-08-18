import { useId } from 'react'
import type { MediaArchetype } from '@/types/console'
import type { ShellStyle } from '@/data/kits/media-shells'
import { TALLEST_ARCHETYPE_HEIGHT_MM, WIDEST_ARCHETYPE_WIDTH_MM } from '@/data/kits/media-archetypes'

/**
 * A per-row figure drawn straight from the archetype's real dimensions and
 * shell colour — an accurate cross-platform miniature, not an icon.
 *
 * SVG rather than an offscreen WebGL render (see thumbnails.ts for that
 * pattern elsewhere in the app): crisp at any DPI, cheap for ten rows at
 * once, and it inherits the panel's own colour language directly.
 *
 * Every figure shares ONE mm-per-pixel scale — `heightPx` divided by
 * `TALLEST_ARCHETYPE_HEIGHT_MM` (the tallest archetype in the whole table,
 * currently the DVD keepcase at 190mm) — so a Genesis cartridge and a PS2
 * case read at their true size relative to EACH OTHER, not each cropped to
 * fill its own row. The slot itself is a fixed box sized from
 * `WIDEST_ARCHETYPE_WIDTH_MM` at that same scale, so every row reserves the
 * same footprint and a narrower archetype sits centred inside it rather than
 * pinned to one corner.
 */
export function MediaFigure({
  archetype,
  shell,
  coverUrl,
  heightPx = 76,
}: {
  archetype: MediaArchetype
  shell: ShellStyle
  coverUrl?: string | null
  heightPx?: number
}) {
  const clipId = useId()
  const scale = heightPx / TALLEST_ARCHETYPE_HEIGHT_MM
  const slotWidth = Math.ceil(WIDEST_ARCHETYPE_WIDTH_MM * scale)

  const w = archetype.dimensions.width * scale
  const h = archetype.dimensions.height * scale
  const r = Math.min(archetype.cornerRadiusMm * scale, Math.min(w, h) / 2)

  const label = archetype.cartridgeLabel
  const printRect = label
    ? {
        w: label.widthMm * scale,
        h: label.heightMm * scale,
        // offsetXMm is positive-right in the source data, same sense as SVG
        // x — the NES's label sits right of dead centre, clearing the
        // moulded connector-release ridge on the shell's left edge.
        x: (w - label.widthMm * scale) / 2 + (label.offsetXMm ?? 0) * scale,
        // offsetYMm is positive-up in the source data; SVG y grows downward,
        // so subtract it from the vertical centre rather than add it.
        y: h / 2 - label.offsetYMm * scale - (label.heightMm * scale) / 2,
        r: Math.min(2 * scale, (label.widthMm * scale) / 2),
      }
    : {
        // Cases print edge to edge — the full face, inset only enough to
        // read as printed material sitting inside the shell, not painted on
        // top of it.
        w: w * 0.94,
        h: h * 0.94,
        x: w * 0.03,
        y: h * 0.03,
        r,
      }

  const stock = shell.recess ?? '#f4efe6'

  return (
    <div
      className="flex shrink-0 items-center justify-center"
      style={{ height: heightPx, width: slotWidth }}
      aria-hidden="true"
    >
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        role="img"
        aria-label={`${archetype.label} case`}
      >
        <defs>
          <clipPath id={clipId}>
            <rect x={printRect.x} y={printRect.y} width={printRect.w} height={printRect.h} rx={printRect.r} />
          </clipPath>
        </defs>

        <rect x={0} y={0} width={w} height={h} rx={r} fill={shell.body} />

        {label && shell.recess && (
          <rect
            x={printRect.x - 1 * scale}
            y={printRect.y - 1 * scale}
            width={printRect.w + 2 * scale}
            height={printRect.h + 2 * scale}
            rx={printRect.r}
            fill={shell.recess}
          />
        )}

        {coverUrl ? (
          <image
            href={coverUrl}
            x={printRect.x}
            y={printRect.y}
            width={printRect.w}
            height={printRect.h}
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#${clipId})`}
          />
        ) : (
          <rect x={printRect.x} y={printRect.y} width={printRect.w} height={printRect.h} rx={printRect.r} fill={stock} />
        )}
      </svg>
    </div>
  )
}
