import {
  COMPANY_LOGO_DARK_BRIGHTEN,
  COMPANY_LOGO_DARK_INVERT,
  COMPANY_LOGO_PATHS,
  COMPANY_LOGO_SCALE,
} from '@/data/companyLogos'

/**
 * The manufacturer's logo, swapped in wherever the roster's plain
 * `manufacturer` text used to be — the sidebar rows and the console title
 * block. `height` is the target height in px for a normal-proportion logo;
 * wide wordmarks (Sony, Microsoft) draw smaller via COMPANY_LOGO_SCALE, so
 * they never dominate the rail. The logo keeps its aspect via object-contain.
 *
 * `onDark` is the dark active sidebar row (bg-ink): monochrome marks are
 * inverted to white and the dark Sega navy is brightened, since black ink is
 * invisible on the ink background.
 *
 * Falls back to the plain text for any manufacturer without an asset, so a
 * future roster entry can never render a blank.
 */
export function CompanyLogo({
  manufacturer,
  height = 7,
  onDark = false,
}: {
  manufacturer: string
  height?: number
  onDark?: boolean
}) {
  const src = COMPANY_LOGO_PATHS[manufacturer]
  if (!src) {
    return <span>{manufacturer}</span>
  }

  const size = Math.round(height * (COMPANY_LOGO_SCALE[manufacturer] ?? 1))

  const tone = onDark
    ? COMPANY_LOGO_DARK_INVERT.has(manufacturer)
      ? 'invert'
      : COMPANY_LOGO_DARK_BRIGHTEN.has(manufacturer)
        ? 'brightness-200'
        : undefined
    : undefined

  return (
    <img
      src={src}
      alt={manufacturer}
      draggable={false}
      style={{ height: size }}
      className={['inline-block object-contain align-middle', tone]
        .filter(Boolean)
        .join(' ')}
    />
  )
}
