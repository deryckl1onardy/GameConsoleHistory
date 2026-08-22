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
  /**
   * True when the case's own structural shell — front, spine AND back, not
   * just one face — is itself optically clear or translucent plastic, the
   * way it is engineered rather than a colour choice. Confirmed by research
   * before adding this, not guessed: a CD jewel case is a "3-piece" clear
   * polystyrene shell (Disc Makers, industry packaging spec) with a printed
   * insert and tray glimpsed BEHIND the plastic, not printed on it; the
   * original Nintendo Switch cartridge case is "clear polypropylene
   * plastic" with "a clear front film sleeve" the artwork sits behind
   * (genesysdtp.com / dualshockers.com), while Switch 2's is "translucent
   * RED plastic" — clear in construction, just tinted.
   *
   * This is a different fact from `clearSleeve`: that one is a thin clear
   * laminate over a paper insert on an otherwise OPAQUE keepcase shell (a
   * DVD/Blu-ray case is solid black plastic everywhere except that one thin
   * front window). `transparentShell` means there is no opaque plastic at
   * all — GameBox.tsx renders the whole shell as a genuinely transmissive
   * material and moves the printed art to separate inner planes floating
   * behind it, exactly so the tray (or, on a Switch case, the cartridge
   * nub) reads as visible THROUGH the case rather than painted on its
   * surface.
   */
  transparentShell: boolean
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
    transparentShell: false,
    precision: 'approximate',
    source: 'Collector consensus — black moulded shell, ribbed top face.',
  },
  'cart-nes': {
    body: '#b6b3a8',
    roughness: 0.58,
    recess: '#a9a69b',
    clearSleeve: false,
    transparentShell: false,
    precision: 'approximate',
    source: 'Collector consensus — light grey NES Game Pak shell.',
  },
  'box-sms': {
    // The box's face is nearly all printed cover art (edge to edge — see
    // `cartridgeLabel: null` in media-archetypes.ts), so this colour mostly
    // shows on the unprinted cardboard edges and as the base the print's
    // clearcoat sits over. Reference photos (Street Fighter II, Wonder Boy
    // III boxes) show a light, warm cardstock white behind SEGA's grid-paper
    // box art, not a stark plastic white — sampled from those photos.
    body: '#e7e2d4',
    // Matte printed cardboard, not moulded plastic — noticeably rougher
    // than every case archetype above (jewel-cd 0.15, dvd-keepcase 0.4).
    roughness: 0.78,
    clearSleeve: false,
    transparentShell: false,
    precision: 'approximate',
    source:
      'Sampled from reference photos of real SMS export boxes (Street Fighter II, Wonder Boy III: The ' +
      'Dragon\'s Trap) — warm off-white printed cardstock, not a manufacturer-specified colour.',
  },
  'cart-genesis': {
    body: '#141416',
    roughness: 0.42,
    recess: '#232326',
    clearSleeve: false,
    transparentShell: false,
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
    transparentShell: false,
    precision: 'approximate',
    source: 'Collector consensus — grey NTSC SNES Game Pak shell.',
  },
  'cart-snes-jp': {
    body: '#c9c6bc',
    roughness: 0.55,
    recess: '#bcb8ad',
    clearSleeve: false,
    transparentShell: false,
    precision: 'approximate',
    source: 'Collector consensus — lighter grey Super Famicom cassette shell.',
  },
  'cart-n64': {
    body: '#8e8b83',
    roughness: 0.5,
    recess: '#7d7a73',
    clearSleeve: false,
    transparentShell: false,
    precision: 'approximate',
    source: 'Collector consensus — grey N64 Game Pak shell.',
  },
  'jewel-cd': {
    // Near-colourless — the shell itself carries almost no tint (real jewel
    // cases read as clear glass, not frosted plastic); this mostly shows as
    // a faint highlight colour and on the transmitted-light attenuation.
    body: '#eef2f4',
    roughness: 0.06,
    tray: '#1a1a1a',
    clearSleeve: false,
    transparentShell: true,
    precision: 'approximate',
    source:
      'Disc Makers / industry packaging spec: "essential 3-piece construction" — clear polystyrene ' +
      'front cover, tray (black, white or clear), and rear tray card, protection and style built from ' +
      'genuinely transparent plastic, not a colour applied to an opaque shell.',
  },
  'jewel-square': {
    // Same clear polystyrene jewel-case construction as jewel-cd, just a
    // shorter, squarer shell — see media-archetypes.ts's `jewel-square`
    // entry for the shape sourcing. The dreamcast console override below
    // still supplies the white tray colour.
    body: '#eef2f4',
    roughness: 0.06,
    tray: '#1a1a1a',
    clearSleeve: false,
    transparentShell: true,
    precision: 'approximate',
    source:
      'Same clear polystyrene jewel-case construction as jewel-cd, scaled to the shorter Dreamcast ' +
      'square-case footprint — see media-archetypes.ts for the shape sourcing.',
  },
  'jewel-longbox': {
    // Same construction as jewel-cd — this is a jewel case, just a taller,
    // thicker NA variant (see media-archetypes.ts's `jewel-longbox` entry for
    // the size sourcing). Same near-colourless clear polystyrene shell over a
    // dark tray.
    body: '#eef2f4',
    roughness: 0.06,
    tray: '#1a1a1a',
    clearSleeve: false,
    transparentShell: true,
    precision: 'approximate',
    source:
      'Same clear polystyrene jewel-case construction as jewel-cd, scaled to the larger NA Saturn/Sega ' +
      'CD/PS1 longbox footprint — see media-archetypes.ts for the size sourcing.',
  },
  'dvd-keepcase': {
    body: '#111113',
    roughness: 0.4,
    clearSleeve: true,
    transparentShell: false,
    precision: 'approximate',
    source: 'Industry-standard black DVD keepcase, printed sleeve under clear front.',
  },
  'bluray-case': {
    body: '#141416',
    roughness: 0.38,
    clearSleeve: true,
    transparentShell: false,
    precision: 'approximate',
    source: 'Industry-standard black Blu-ray case, printed sleeve under clear front.',
  },
  'switch-case': {
    // This archetype's default is the SWITCH 2 case specifically — genuinely
    // translucent RED plastic, not an opaque colour choice (dualshockers.com,
    // describing Switch 2 vs Switch 1 packaging). The original Switch case is
    // a different, colourless-clear plastic — see the `switch` console
    // override below, which corrects this default rather than duplicating
    // the whole entry for one field.
    body: '#c8382f',
    roughness: 0.15,
    clearSleeve: false,
    transparentShell: true,
    precision: 'approximate',
    source:
      'genesysdtp.com: Switch cartridge cases are "clear polypropylene plastic" with "a clear front film ' +
      'sleeve" the artwork sits behind. dualshockers.com: Switch 2\'s case is "translucent red plastic" ' +
      'versus the "colorless, mostly transparent plastic of the original Switch" — both are structurally ' +
      'clear/translucent, this entry is the Switch 2 tint.',
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
    source: 'Wii U blue DVD-sized case — collector consensus.',
  },
  dreamcast: {
    tray: '#f2f2f0',
    precision: 'approximate',
    source: 'Dreamcast GD-ROM case — white tray behind the clear front, collector consensus.',
  },
  // switch-case's own archetype default IS the Switch 2 case (translucent
  // red) — this overrides just the colour for the original Switch, whose
  // case is colourless clear, not tinted. transparentShell/roughness/
  // clearSleeve all still correctly inherit from the archetype default.
  switch: {
    body: '#f4f6f7',
    precision: 'approximate',
    source:
      'genesysdtp.com, dualshockers.com: the original Switch cartridge case is "colorless, mostly ' +
      'transparent plastic", distinct from Switch 2\'s red — sampled near-white/colourless since the ' +
      'transmissive material renders the real tint from `body`, not a flat fill.',
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
