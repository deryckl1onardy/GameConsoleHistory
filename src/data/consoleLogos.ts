/**
 * Product logos that replace the console's plain name text in the sidebar
 * rows, the top bar and the title block (see ProductLogo.tsx).
 *
 * Like the company logos, the assets are processed copies of the
 * user-supplied originals in `public/Console Logo/Product/`, living in
 * `transparent/`: the originals are opaque white/gray PNGs and JPGs (a few
 * are already transparent) whose backgrounds have been removed and which
 * have been cropped to their content. Originals are untouched.
 *
 * `xbox-series` uses the Series X logo — that entry describes the flagship,
 * which the Series S is a variant of.
 *
 * Paths are URL-encoded because the folder names contain spaces.
 */
export const CONSOLE_LOGO_PATHS: Record<string, string> = {
  'atari-2600': '/Console%20Logo/Product/transparent/ATARI2600.png',
  nes: '/Console%20Logo/Product/transparent/NES.png',
  'master-system': '/Console%20Logo/Product/transparent/Master%20System.png',
  genesis: '/Console%20Logo/Product/transparent/Sega%20Genesis.png',
  snes: '/Console%20Logo/Product/transparent/SNES.png',
  saturn: '/Console%20Logo/Product/transparent/SEGA_Saturn_logo.png',
  playstation: '/Console%20Logo/Product/transparent/Playstation.png',
  n64: '/Console%20Logo/Product/transparent/Nintendo64.png',
  dreamcast: '/Console%20Logo/Product/transparent/Sega_Dreamcast_logo.png',
  ps2: '/Console%20Logo/Product/transparent/PS2.png',
  xbox: '/Console%20Logo/Product/transparent/xbox.png',
  gamecube: '/Console%20Logo/Product/transparent/Gamecube.png',
  'xbox-360': '/Console%20Logo/Product/transparent/xbox360.png',
  ps3: '/Console%20Logo/Product/transparent/PS3.png',
  wii: '/Console%20Logo/Product/transparent/wii.png',
  'wii-u': '/Console%20Logo/Product/transparent/wiiu.png',
  ps4: '/Console%20Logo/Product/transparent/ps4.png',
  'xbox-one': '/Console%20Logo/Product/transparent/xbox-one-logo.png',
  switch: '/Console%20Logo/Product/transparent/switch.png',
  ps5: '/Console%20Logo/Product/transparent/PS5.png',
  'xbox-series': '/Console%20Logo/Product/transparent/xboxseriesx.png',
  'switch-2': '/Console%20Logo/Product/transparent/switch%202.png',
}

/**
 * Relative display size per console.
 *   ps3      — a ~18:1 strip; at any readable height it would be wider than
 *              the sidebar column, so it is drawn proportionally smaller.
 *   nes, genesis — squat badge-style marks (≈2.6:1) that render narrow next
 *              to the wider wordmarks, so they draw proportionally larger.
 */
export const CONSOLE_LOGO_SCALE: Record<string, number> = {
  ps3: 0.45,
  nes: 1.5,
  genesis: 1.5,
}
