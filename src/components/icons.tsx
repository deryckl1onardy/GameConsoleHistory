import type { SVGProps } from 'react'

/**
 * The room chrome's bespoke icon set — 1.5px strokes, currentColor, no icon
 * library. Deliberately small: the chrome is quiet chrome, and the stat icons
 * (globe/tag/chip) must not outshout the numbers they carry.
 */

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function base({ size = 16, ...props }: IconProps): SVGProps<SVGSVGElement> {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    ...props,
  }
}

export function GlobeIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z" />
    </svg>
  )
}

export function TagIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 12V5a2 2 0 0 1 2-2h7l9 9-7 7-9-9Z" />
      <circle cx="8.5" cy="8.5" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function ChipIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
      <rect x="10.5" y="10.5" width="3" height="3" rx="0.5" />
      <path d="M9 3v4M15 3v4M9 17v4M15 17v4M3 9h4M3 15h4M17 9h4M17 15h4" />
    </svg>
  )
}

export function RotateIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M20 12a8 8 0 1 1-2.6-5.9" />
      <path d="M20 3v4h-4" />
    </svg>
  )
}

export function PanIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M9 11V5a1.5 1.5 0 0 1 3 0v5m0-6.5V5a1.5 1.5 0 0 1 3 0v5m0-3.5a1.5 1.5 0 0 1 3 0V12" />
      <path d="M12 16v-4a1.5 1.5 0 0 1 3 0v4m0-1.5a1.5 1.5 0 0 1 3 0V16a5 5 0 0 1-5 5h-1.5a5 5 0 0 1-4-2l-2.2-3a1.5 1.5 0 0 1 2.4-1.8L9 16" />
    </svg>
  )
}

export function ZoomIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5 21 21" />
      <path d="M10.5 8v5M8 10.5h5" />
    </svg>
  )
}

export function ChevronUpIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m5 15 7-7 7 7" />
    </svg>
  )
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m5 9 7 7 7-7" />
    </svg>
  )
}

/** Back-to-shelf arrow, used by the brand mark. */
export function BackArrowIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M19 12H5" />
      <path d="m11 6-6 6 6 6" />
    </svg>
  )
}
