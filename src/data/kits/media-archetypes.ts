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
    // Was 102 x 70 x 16 (landscape — wider than tall), which had the box
    // lying the wrong way: a real Atari 2600 Game Program cartridge is
    // portrait, like the NES and SNES carts. Corrected from the published
    // spec (Google's product panel, matching common references): 3.87 x
    // 3.25 x 0.75in = 98 x 83 x 19mm.
    dimensions: { width: 83, height: 98, depth: 19 },
    cornerRadiusMm: 3,
    // Real Atari carts print nearly edge-to-edge with a thin dark margin —
    // sized to most of the corrected portrait face, not the old landscape
    // rect. offsetYMm nudges it up slightly to leave a touch more margin at
    // the bottom edge than the top, matching reference photos.
    cartridgeLabel: { widthMm: 72, heightMm: 88, offsetYMm: 2, precision: 'approximate' },
    hasBackArt: false,
    precision: 'exact',
    source:
      'Google product spec / common references: 3.87in (98mm) H x 3.25in (83mm) W x 0.75in (19mm) D. ' +
      'Label rect approximated from reference photos.',
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

  'box-sms': {
    id: 'box-sms',
    // Not a bare cartridge — the Master System's actual retail unit is a
    // printed cardboard box (the cartridge itself ships inside it), edge to
    // edge box art like a Switch card case rather than a cartridge's small
    // label sticker on an otherwise plain shell. `kind: 'card'` gets that
    // construction for free: GameBox.tsx already prints edge to edge and
    // skips the label-recess plate whenever `cartridgeLabel` is null, which
    // is exactly this box's contract (see switch-case, the other `card`).
    kind: 'card',
    label: 'Sega Master System game box',
    // 12.9 x 17.8 x 2.6cm, from a dedicated collector measurement pass
    // (SMS Power forums, "Master System Box / Case / Inlay dimensions",
    // Bock, 21 Jul 2008) of the export/PAL cardboard box — the format shown
    // in reference photos (SEGA header, grid-paper background, printed
    // edge-to-edge box art, no separate label). That same source measured a
    // further +2.0cm of variance on height ("cardboard boxes tend to squash
    // and this usually takes more space") — the 178mm below is the base
    // figure, not the squashed high end.
    dimensions: { width: 129, height: 178, depth: 26 },
    // Cardboard folded and glued at the seams, not injection-moulded — a
    // much crisper edge than a plastic case's rounded corners (switch-case
    // is 4mm, dvd-keepcase 3mm). Reference photos show a near-square corner
    // with only a slight softening from the fold itself.
    cornerRadiusMm: 2,
    cartridgeLabel: null,
    hasBackArt: true,
    precision: 'approximate',
    source:
      'SMS Power forums, "Master System Box / Case / Inlay dimensions" (Bock, 21 Jul 2008): ' +
      'export/PAL cartridge box 12.9 x 17.8(+2.0) x 2.6cm. Collector-measured, not a manufacturer spec — ' +
      're-measure against a real box if the chance comes up.',
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
    // The standard music-CD-style jewel case: portrait, taller than wide,
    // used by PlayStation and Saturn's JP/PAL releases. Dreamcast used a
    // visibly different, squarer case — see `jewel-square` below, not this
    // one.
    dimensions: { width: 125, height: 142, depth: 10.4 },
    cornerRadiusMm: 2,
    cartridgeLabel: null,
    hasBackArt: true,
    precision: 'exact',
    source: 'Industry standard jewel case: 142 x 125 x 10.4 mm.',
  },

  'jewel-square': {
    id: 'jewel-square',
    kind: 'optical',
    label: 'Dreamcast square jewel case',
    // Dreamcast did NOT use the standard tall jewel-cd shell — collectors
    // consistently call the Dreamcast case a "square jewel case", distinct
    // from a taller "rectangular case" used only for two known exceptions
    // with oversized manuals (Eternal Arcadia, Love Hina: Smile Again —
    // dreamcast-talk.com, "Official Dreamcast Cases"). Two independent real
    // box scans confirm this visually: Wikipedia's Sonic Adventure cover art
    // file (explicitly captioned "the entire cover") is 300x297px, and
    // Phantasy Star Online's JP cover is 250x247px — both converge on an
    // essentially 1:1 face, not jewel-cd's 125x142 portrait. Sized off the
    // shared 125mm case width (the same shell-width convention as jewel-cd)
    // with height brought down to match that observed near-square ratio,
    // rather than a manufacturer spec sheet — no such sheet was found.
    dimensions: { width: 125, height: 126, depth: 10.4 },
    cornerRadiusMm: 2,
    cartridgeLabel: null,
    hasBackArt: true,
    precision: 'approximate',
    source:
      'Derived from two independent real box-art scans (Wikipedia: File:Sonic_Adventure.PNG, 300x297px; ' +
      'File:Phantasy_Star_Online_cover_art_jp.png, 250x247px) plus collector terminology ' +
      '("square jewel case" vs. Eternal Arcadia/Love Hina\'s taller "rectangular case", ' +
      'dreamcast-talk.com "Official Dreamcast Cases") — not a manufacturer spec; re-measure against a ' +
      'real case if the chance comes up.',
  },

  'jewel-longbox': {
    id: 'jewel-longbox',
    kind: 'optical',
    label: 'Sega Saturn / Sega CD / PS1 longbox jewel case',
    // The NA retail case for Saturn (and Sega CD, and early PS1) games was
    // NOT a standard 142mm jewel case — a Sega Saturn Forum moderator
    // (segasaturngroup.proboards.com, "US/UK saturn game case sizes")
    // describes the US case as "much larger, almost twice as thick and
    // taller" than the UK/PAL jewel case. Two independent acrylic-protector
    // listings sized to fit the real case agree closely: BSAcrylics' PS1 and
    // Saturn longbox protectors both list inner clearance "14.7 x 2.5 x
    // 21.2cm", and Kollector Protector's PS1/Sega CD/Saturn longbox display
    // case lists interior "5.8w x 1d x 8.3h in (14.8w x 2.4d x 21.0h cm)" —
    // width and height converge on ~147 x 210mm, and the ~24mm depth matches
    // "almost twice as thick" against the 10mm standard jewel case below.
    dimensions: { width: 147, height: 210, depth: 24 },
    cornerRadiusMm: 2,
    cartridgeLabel: null,
    hasBackArt: true,
    precision: 'approximate',
    source:
      'Cross-referenced from segasaturngroup.proboards.com ("US/UK saturn game case sizes") and two ' +
      'independent longbox acrylic-protector listings (BSAcrylics, Kollector Protector) sized to the real ' +
      'case — no single manufacturer spec found; re-measure against a real US Saturn case if the chance ' +
      'comes up.',
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
