/**
 * Company logos that replace the plain manufacturer text in the sidebar rows
 * and the console title block (see CompanyLogo.tsx).
 *
 * The assets are transparent-background copies of the user-supplied originals
 * in `public/Console Logo/Company/` — the originals are opaque white/gray PNGs
 * that would render as boxes on the light `paper` surfaces and vanish on the
 * dark active sidebar row, so the copies in `transparent/` have had their
 * backgrounds removed (luminance-based, feathered) and been cropped to their
 * content. Originals are untouched.
 *
 * Paths are URL-encoded because the folder name contains spaces.
 */
export const COMPANY_LOGO_PATHS: Record<string, string> = {
  Atari: '/Console%20Logo/Company/transparent/Atari-Logo.wine.png',
  Microsoft: '/Console%20Logo/Company/transparent/Microsoft.png',
  Nintendo: '/Console%20Logo/Company/transparent/Nintendo.png',
  Sega: '/Console%20Logo/Company/transparent/Sega.png',
  Sony: '/Console%20Logo/Company/transparent/Sony.png',
}

/**
 * Extra treatment for logos on the dark active sidebar row (bg-ink), where
 * black ink vanishes and the Sega navy reads as near-black:
 *   invert    — monochrome (black-ink) marks are flipped to white
 *   brighten  — the dark Sega navy is lifted so it clears the ink
 * Logos with their own bright colour (Atari red, Nintendo red) are fine as-is.
 */
export const COMPANY_LOGO_DARK_INVERT = new Set(['Microsoft', 'Sony'])
export const COMPANY_LOGO_DARK_BRIGHTEN = new Set(['Sega'])

/**
 * Relative display size per manufacturer. The Sony and Microsoft marks are
 * wide wordmarks (~5.5:1), nearly twice the aspect of the rest of the pack
 * (Sega 3.3:1, Nintendo 3.9:1, Atari 4.1:1), so at the same height they
 * dominate the rail — they are drawn smaller instead (Sony most, Microsoft
 * a bit). Anything not listed renders at the caller's full size.
 */
export const COMPANY_LOGO_SCALE: Record<string, number> = {
  Sony: 0.7,
  Microsoft: 0.8,
}
