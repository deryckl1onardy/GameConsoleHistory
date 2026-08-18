import type { MediaArchetypeId } from '@/types/console'

/**
 * Per-platform physical shell colour and construction.
 *
 * `MEDIA_ARCHETYPES` (media-archetypes.ts) gets the *shape* right — real
 * published dimensions, real corner radii. It cannot get the *colour* right,
 * because case colour is a per-CONSOLE fact, not a per-archetype one: the
 * `bluray-case` archetype alone covers a black PS3, a blue PS4, a white PS5,
 * a green Xbox One and a blue Wii U. Flattening all of those to one grey box
 * (the old by-`kind` SHELL map in GameBox.tsx) made every cartridge and every
 * case on the site read as the same object.
 *
 * Two tables plus a resolver, mirroring the honesty convention
 * media-archetypes.ts already sets: values that are not from a manufacturer
 * spec are marked `precision: 'approximate'` with a `source` saying so.
 */

export type ShellStyle = {
  /** Main plastic body colour. */
  body: string
  roughness: number
  /** Cartridge label recess, or a case's inner leaf — omitted where flat. */
  recess?: string
  /** The dark tray visible behind a clear jewel-case front. */
  tray?: string
  /** A printed sleeve held under clear polypropylene, as on a keepcase. */
  clearSleeve: boolean
  precision: 'exact' | 'approximate'
  source: string
}

/** Fallback colour and construction per archetype, before any console override. */
export const ARCHETYPE_SHELLS: Record<MediaArchetypeId, ShellStyle> = {
  'cart-atari-2600': {
    body: '#1b1b1d',
    roughness: 0.55,
    recess: '#2b2b2e',
    clearSleeve: false,
    precision: 'approximate',
    source: 'Collector consensus — black moulded shell, ribbed top face.',
  },
  'cart-nes': {
    body: '#b6b3a8',
    roughness: 0.58,
    recess: '#a9a69b',
    clearSleeve: false,
    precision: 'approximate',
    source: 'Collector consensus — light grey NES Game Pak shell.',
  },
  'cart-sms': {
    body: '#1a1a1c',
    roughness: 0.5,
    recess: '#28282b',
    clearSleeve: false,
    precision: 'approximate',
    source: 'Collector consensus — black Sega cartridge shell.',
  },
  'cart-genesis': {
    body: '#141416',
    roughness: 0.42,
    recess: '#232326',
    clearSleeve: false,
    precision: 'approximate',
    source: 'Collector consensus — matte black Genesis/Mega Drive shell.',
  },
  'cart-snes-na': {
    // #b0acbc, sampled from reference photos of the real SNES Game Pak —
    // kept identical here so the parametric fallback (used only if that GLB
    // is ever unavailable) never disagrees with the real cartridge model on
    // shell colour.
    body: '#b0acbc',
    roughness: 0.55,
    recess: '#a19da8',
    clearSleeve: false,
    precision: 'approximate',
    source: 'Collector consensus — grey NTSC SNES Game Pak shell.',
  },
  'cart-snes-jp': {
    body: '#c9c6bc',
    roughness: 0.55,
    recess: '#bcb8ad',
    clearSleeve: false,
    precision: 'approximate',
    source: 'Collector consensus — lighter grey Super Famicom cassette shell.',
  },
  'cart-n64': {
    body: '#8e8b83',
    roughness: 0.5,
    recess: '#7d7a73',
    clearSleeve: false,
    precision: 'approximate',
    source: 'Collector consensus — grey N64 Game Pak shell.',
  },
  'jewel-cd': {
    body: '#e8ecef',
    roughness: 0.15,
    tray: '#1a1a1a',
    clearSleeve: false,
    precision: 'approximate',
    source: 'Industry-standard clear polystyrene jewel case over a black tray.',
  },
  'dvd-keepcase': {
    body: '#111113',
    roughness: 0.4,
    clearSleeve: true,
    precision: 'approximate',
    source: 'Industry-standard black DVD keepcase, printed sleeve under clear front.',
  },
  'bluray-case': {
    body: '#141416',
    roughness: 0.38,
    clearSleeve: true,
    precision: 'approximate',
    source: 'Industry-standard black Blu-ray case, printed sleeve under clear front.',
  },
  'switch-case': {
    body: '#c8382f',
    roughness: 0.42,
    clearSleeve: false,
    precision: 'approximate',
    source: 'Nintendo Switch retail case — red, opaque, edge-printed.',
  },
}

/**
 * Where a specific console's case colour departs from its archetype default.
 * Only the fields that differ need to be listed — `shellFor` merges the rest
 * from the archetype.
 */
export const CONSOLE_SHELL_OVERRIDES: Partial<Record<string, Partial<ShellStyle>>> = {
  ps2: {
    body: '#1a3ea8',
    precision: 'approximate',
    source: 'PS2 Greatest Hits/standard blue keepcase — collector consensus.',
  },
  xbox: {
    body: '#0e7a1b',
    precision: 'approximate',
    source: 'Original Xbox green keepcase — collector consensus.',
  },
  wii: {
    body: '#e9e9e6',
    precision: 'approximate',
    source: 'Wii white keepcase — collector consensus.',
  },
  'xbox-360': {
    body: '#107c10',
    precision: 'approximate',
    source: 'Xbox 360 green keepcase — collector consensus.',
  },
  ps4: {
    body: '#1c4fbb',
    precision: 'approximate',
    source: 'PS4 blue Blu-ray case — collector consensus.',
  },
  ps5: {
    body: '#f0f0ee',
    precision: 'approximate',
    source: 'PS5 white Blu-ray case — collector consensus.',
  },
  'xbox-one': {
    body: '#107c10',
    precision: 'approximate',
    source: 'Xbox One green Blu-ray case — collector consensus.',
  },
  'wii-u': {
    body: '#2e6fd4',
    precision: 'approximate',
    source: 'Wii U blue Blu-ray case — collector consensus.',
  },
  dreamcast: {
    tray: '#f2f2f0',
    precision: 'approximate',
    source: 'Dreamcast GD-ROM case — white tray behind the clear front, collector consensus.',
  },
}

/**
 * The shell to actually draw for a given archetype on a given console —
 * archetype defaults with the console's own overrides layered on top.
 */
export function shellFor(archetypeId: MediaArchetypeId, consoleId: string): ShellStyle {
  const base = ARCHETYPE_SHELLS[archetypeId]
  const override = CONSOLE_SHELL_OVERRIDES[consoleId]
  return override ? { ...base, ...override } : base
}
