import type { MediaArchetype, MediaArchetypeId } from '@/types/console'

/**
 * The parametric media kit.
 *
 * A game box is a textured cuboid with known real-world dimensions. Rather than
 * modelling ~220 boxes across the full roster, we model these archetypes once and
 * swap only the cover texture per game. Adding a console usually adds zero
 * geometry here.
 *
 * All dimensions in millimetres, oriented as the box sits face-on to the camera:
 *   width  = horizontal extent
 *   height = vertical extent
 *   depth  = thickness front-to-back
 *
 * `precision` is deliberately visible. SNES — the vertical slice — is exact from
 * Nintendo's published spec. Several older carts are collector consensus because
 * no authoritative spec exists (NESdev's shell-dimension page is still marked
 * "TODO: measure and publish dimensions"). Those must be re-measured before their
 * console ships.
 */
export const MEDIA_ARCHETYPES: Record<MediaArchetypeId, MediaArchetype> = {
  'cart-atari-2600': {
    id: 'cart-atari-2600',
    kind: 'cartridge',
    label: 'Atari 2600 Game Program cartridge',
    dimensions: { width: 102, height: 70, depth: 16 },
    cornerRadiusMm: 3,
    cartridgeLabel: { widthMm: 64, heightMm: 44, offsetYMm: 6, precision: 'approximate' },
    hasBackArt: false,
    precision: 'approximate',
    source: 'Collector consensus — re-measure before Atari 2600 ships.',
  },

  'cart-nes': {
    id: 'cart-nes',
    kind: 'cartridge',
    label: 'NES Game Pak',
    dimensions: { width: 120, height: 134, depth: 20 },
    cornerRadiusMm: 4,
    cartridgeLabel: { widthMm: 55, heightMm: 97, offsetYMm: 6, offsetXMm: 9, precision: 'exact' },
    hasBackArt: false,
    precision: 'approximate',
    source:
      'Shell dimensions are collector consensus; NESdev wiki still lists them as TODO. Label size (55x97mm) is from NESdev. offsetXMm shifts the label right of dead-centre to clear the moulded connector-release ridge that runs down the shell\'s left edge — approximate, eyeballed against reference photos rather than a published spec.',
  },

  'cart-sms': {
    id: 'cart-sms',
    kind: 'cartridge',
    label: 'Sega Master System cartridge',
    dimensions: { width: 110, height: 100, depth: 15 },
    cornerRadiusMm: 3,
    cartridgeLabel: { widthMm: 72, heightMm: 66, offsetYMm: 4, precision: 'approximate' },
    hasBackArt: false,
    precision: 'approximate',
    source: 'Collector consensus — re-measure before Master System ships.',
  },

  'cart-genesis': {
    id: 'cart-genesis',
    kind: 'cartridge',
    label: 'Sega Genesis / Mega Drive cartridge',
    dimensions: { width: 108, height: 70, depth: 17 },
    cornerRadiusMm: 6,
    cartridgeLabel: { widthMm: 72, heightMm: 46, offsetYMm: 2, precision: 'approximate' },
    hasBackArt: false,
    precision: 'approximate',
    source:
      'Widest point 108mm, narrowing to 95mm, with chamfered edges — the true shape is not a plain cuboid. Re-measure before Genesis ships.',
  },

  'cart-snes-na': {
    id: 'cart-snes-na',
    kind: 'cartridge',
    label: 'SNES Game Pak (NTSC)',
    dimensions: { width: 136, height: 88, depth: 20 },
    cornerRadiusMm: 4,
    // 84 x 36mm — measured live off the actual rendered `label` decal mesh
    // (THREE.Box3 world-space size) added by
    // .img2threejs/cart/split-snes-label.mjs, which sits on the sourced
    // snes_cartridge.glb's own flat recessed panel. Must stay in sync with
    // that decal's real size: this field drives coverAspect() (the runtime
    // cover-fit crop for the 3D box) and MediaFigure's panel icon, neither
    // of which reads the GLB directly.
    cartridgeLabel: { widthMm: 84, heightMm: 36, offsetYMm: 6, precision: 'approximate' },
    hasBackArt: false,
    precision: 'exact',
    source:
      'Wikipedia, SNES Game Pak: 5.35in (136mm) W x 3.45in (88mm) H x 0.78in (20mm) D. Label rect measured from reference photos.',
  },

  'cart-snes-jp': {
    id: 'cart-snes-jp',
    kind: 'cartridge',
    label: 'Super Famicom Cassette (PAL/JP)',
    dimensions: { width: 130, height: 86, depth: 20 },
    cornerRadiusMm: 6,
    cartridgeLabel: { widthMm: 92, heightMm: 55, offsetYMm: 6, precision: 'approximate' },
    hasBackArt: false,
    precision: 'exact',
    source:
      'Wikipedia, SNES Game Pak: PAL/JP 5in (130mm) W x 3.39in (86mm) H x 0.79in (20mm) D.',
  },

  'cart-n64': {
    id: 'cart-n64',
    kind: 'cartridge',
    label: 'Nintendo 64 Game Pak',
    dimensions: { width: 116, height: 76.6, depth: 18.5 },
    cornerRadiusMm: 4,
    cartridgeLabel: { widthMm: 82, heightMm: 50, offsetYMm: 4, precision: 'approximate' },
    hasBackArt: false,
    precision: 'exact',
    source:
      'Wikipedia, Nintendo 64 Game Pak: 11.6cm W x 7.66cm H x 1.85cm D.',
  },

  'jewel-cd': {
    id: 'jewel-cd',
    kind: 'optical',
    label: 'CD jewel case',
    dimensions: { width: 125, height: 142, depth: 10 },
    cornerRadiusMm: 2,
    cartridgeLabel: null,
    hasBackArt: true,
    precision: 'exact',
    source: 'Industry standard jewel case: 142 x 125 x 10 mm.',
  },

  'dvd-keepcase': {
    id: 'dvd-keepcase',
    kind: 'optical',
    label: 'DVD keep case',
    // Also the GameCube retail case — the disc was mini-DVD, the box was not.
    // That discovery removed a whole archetype from this table.
    dimensions: { width: 135, height: 190, depth: 14 },
    cornerRadiusMm: 3,
    cartridgeLabel: null,
    hasBackArt: true,
    precision: 'exact',
    source:
      'Industry standard DVD keep case: 190 x 135 x 14 mm. GameCube retail cases used the same size.',
  },

  'bluray-case': {
    id: 'bluray-case',
    kind: 'optical',
    label: 'Blu-ray case',
    dimensions: { width: 135, height: 171, depth: 12 },
    cornerRadiusMm: 3,
    cartridgeLabel: null,
    hasBackArt: true,
    precision: 'exact',
    source: 'Industry standard Blu-ray case: 171 x 135 x 12 mm.',
  },

  'switch-case': {
    id: 'switch-case',
    kind: 'card',
    label: 'Nintendo Switch game case',
    dimensions: { width: 105, height: 170, depth: 11 },
    cornerRadiusMm: 4,
    cartridgeLabel: null,
    hasBackArt: true,
    precision: 'approximate',
    source: 'Commonly cited retail case size — verify before Switch ships.',
  },
}

/** Metres per millimetre. The scene works in metres; the data works in mm. */
export const MM = 0.001

export function archetype(id: MediaArchetypeId): MediaArchetype {
  const a = MEDIA_ARCHETYPES[id]
  if (!a) throw new Error(`Unknown media archetype: ${id}`)
  return a
}

/** Archetype dimensions converted to scene metres, as [w, h, d]. */
export function archetypeSizeMetres(
  id: MediaArchetypeId,
): [number, number, number] {
  const { width, height, depth } = archetype(id).dimensions
  return [width * MM, height * MM, depth * MM]
}

/**
 * The tallest archetype in the table, in mm. Derived rather than hardcoded so
 * it can never silently drift from the table it describes — used to give the
 * panel's per-row figures a single shared mm-per-pixel scale (see
 * MediaFigure.tsx), so a Genesis cart and a Blu-ray case read at their true
 * size relative to each other, not each cropped to fill its own row.
 */
export const TALLEST_ARCHETYPE_HEIGHT_MM = Math.max(
  ...Object.values(MEDIA_ARCHETYPES).map((a) => a.dimensions.height),
)

/** The widest archetype in the table, in mm — same reasoning as above, used
 * to size MediaFigure's fixed slot width so every row shares one box and the
 * object inside it can be centred rather than left hugging one edge. */
export const WIDEST_ARCHETYPE_WIDTH_MM = Math.max(
  ...Object.values(MEDIA_ARCHETYPES).map((a) => a.dimensions.width),
)
