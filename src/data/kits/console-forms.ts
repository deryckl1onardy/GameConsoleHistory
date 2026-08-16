import type { ConsoleForm } from '@/types/console'

/**
 * Console form specs — the parametric console kit.
 *
 * A new console is ~50 lines of data here, not a new component. Roughly 16 of
 * the ~22-console roster are swept profiles (flat boxes, wedges, slabs) and
 * belong here; the handful of genuinely odd shapes (GameCube's handle, Xbox
 * 360's waist, PS5's fins, the Switch's dock) register `shell: {kind:
 * 'bespoke'}` and a registry override instead — see registry.tsx.
 *
 * Position convention, since form and control kinds mix front-face and
 * top-face placement and the type alone doesn't disambiguate it:
 *   - controls and ports:            (x = offset from shell centre-width mm,
 *                                      y = height above the floor mm)
 *                                     — placed on the FRONT face.
 *   - a 'top-slot' or 'top-lid' intake: (x = offset from shell centre-width mm,
 *                                      z = offset back from the front face mm)
 *                                     — placed on the TOP face.
 *   - a 'front-tray' or 'front-slot' intake uses the same convention as
 *     controls (front face, height-based).
 *
 * Profile points are (depthMm, heightMm), front-to-back then floor-to-ceiling
 * — see sweepProfileAlongX's derivation comment for why that produces the
 * correct final orientation.
 */
export const CONSOLE_FORMS: Record<string, ConsoleForm> = {
  snes: {
    shell: {
      kind: 'swept',
      // The defining SNES silhouette: a lower front control deck, then a
      // genuine curve — not a step — up into the raised rear deck holding the
      // cartridge bay. Lance Barr curved this on purpose: a flat top (the
      // NES's known weakness) invited drinks and food; a curve doesn't.
      profile: [
        [0, 0], // front-bottom
        [0, 40], // front face, control-deck height
        [48, 40], // flat control deck
        [72, 45], // curve begins
        [98, 56], // rising
        [122, 65], // nearly at the rear-deck height
        [142, 68], // full height — rear deck starts here
        [254, 68], // rear deck, flat to the back edge
        [254, 0], // back face straight down
      ],
      cornerRadiusMm: 3,
      bevelMm: 1.2,
    },
    finish: 'matte',
    palette: {
      // Read off three reference photographs of a clean NA unit rather than
      // from a written description: the shell is a light warm grey, roughly
      // two values above the medium grey a text source suggests. The earlier
      // #b9b6ac read as a dirty unit under the diorama's warm key light.
      // (A yellowed console is a real thing, but it belongs in the
      // `yellowing` failure state, not in the shell's own albedo.)
      shell: '#d2cfc8',
      accent: '#6f61a8',
      // The eject pad is a mid grey — clearly darker than the shell, nowhere
      // near the near-black the previous value used. The old #4a4844 made the
      // one grey control read as a hole in the front panel; a first correction
      // to #a5a199 then over-shot the other way and read as a pale sticker
      // under the diorama's warm key, so this sits between them.
      dark: '#8e8a81',
    },
    intake: {
      kind: 'top-slot',
      // Centred on the raised rear deck, matching the corrected profile above.
      position: [0, 190],
      widthMm: 140,
      heightMm: 24,
    },
    // Left to right the front reads POWER, EJECT, RESET — and both outer keys
    // are purple, not just the power switch. The reference photographs are
    // unambiguous on all three points; the previous layout had reset as a
    // small grey circle on the left and eject as a lever off to the right.
    //
    // Power and reset lie flat on TOP of the low front deck. Mounting them on
    // the vertical front face (the kit's only option before `face`) put two
    // purple plates on a panel that is bare plastic in every photograph.
    controls: [
      {
        mesh: 'power_switch',
        kind: 'slider',
        face: 'top',
        position: [-50, 14],
        sizeMm: 46,
        aspect: 0.3,
        color: 'accent',
      },
      {
        mesh: 'reset_button',
        kind: 'rect-button',
        face: 'top',
        position: [50, 14],
        sizeMm: 46,
        aspect: 0.3,
        color: 'accent',
      },
      // Eject stays on the front face — it is the one control you push
      // horizontally — and sits in the centre column between the two blocks.
      { mesh: 'eject_lever', kind: 'lever', position: [0, 20], sizeMm: 32, aspect: 0.72, color: 'dark' },
    ],
    // Centred on the two front blocks, low, where a controller lead hangs
    // straight down without fouling the eject column.
    ports: [
      { mesh: 'controller_port_1', position: [-58, 17], widthMm: 26, heightMm: 13 },
      { mesh: 'controller_port_2', position: [58, 17], widthMm: 26, heightMm: 13 },
    ],
    // No vent row. The previous spec cut a seven-slot grille across the top
    // deck; no such grille exists on the hardware — the top carries the
    // cartridge bay and its moulding seams and nothing else. It was the most
    // visible invented feature on the model.
    vents: [],
    // The two blocks carrying the keys and the controller ports. The narrower
    // EJECT column between them is the gap they leave, not a cut — see
    // ReliefSpec on why relief is additive only.
    reliefs: [
      { mesh: 'front_block_left', position: [-58, 20], widthMm: 80, heightMm: 40, protrusionMm: 2.5 },
      { mesh: 'front_block_right', position: [58, 20], widthMm: 80, heightMm: 40, protrusionMm: 2.5 },
    ],
  },

  dreamcast: {
    shell: {
      kind: 'swept',
      // A soft slab: the front face is cut back by a broad chamfer, the body
      // rises to a flat top carrying the circular GD-ROM lid, and the rear
      // edge falls away on a matching chamfer. The silhouette is much gentler
      // than the boxes either side of it in this generation — the whole shell
      // is a rounded square in plan with no hard top edge anywhere.
      profile: [
        [0, 0], // front-bottom
        [0, 54], // front face, up to the chamfer
        [13, 68], // chamfer rising
        [30, 76], // full height
        [168, 76], // flat top — the disc lid sits on this
        [186, 70], // rear chamfer begins
        [195.8, 58], // rear top edge
        [195.8, 0], // back face straight down
      ],
      cornerRadiusMm: 6,
      bevelMm: 1.5,
    },
    finish: 'matte',
    // Off-white with a warm cast rather than a clean white — the shell reads
    // as slightly cream even on a mint unit, and the accent is the swirl
    // orange used on NA and PAL machines (JP units carried a blue swirl).
    palette: { shell: '#e5e3dc', accent: '#d95a2b', dark: '#8f8d87' },
    intake: {
      // The lid is a disc, near-centred on the top face, opening upward.
      kind: 'top-lid',
      position: [0, 104],
      widthMm: 125,
      heightMm: 125,
    },
    controls: [
      { mesh: 'power_button', kind: 'round-button', position: [-72, 22], sizeMm: 13, color: 'dark' },
      // Open sits on the top deck beside the lid, not on the front face.
      { mesh: 'open_button', kind: 'round-button', face: 'top', position: [74, 44], sizeMm: 14, color: 'dark' },
      // No power_led control: ConsoleFromForm renders one unconditionally for
      // every console, and a second mesh under the same name would make
      // getObjectByName ambiguous for the failure states that target it.
    ],
    // Four ports in a row — the Dreamcast put all four on the front face at a
    // time when two was still normal.
    ports: [
      { mesh: 'controller_port_1', position: [-66, 24], widthMm: 30, heightMm: 15 },
      { mesh: 'controller_port_2', position: [-22, 24], widthMm: 30, heightMm: 15 },
      { mesh: 'controller_port_3', position: [22, 24], widthMm: 30, heightMm: 15 },
      { mesh: 'controller_port_4', position: [66, 24], widthMm: 30, heightMm: 15 },
    ],
    // The cooling grille is on the rear and underside, not the front face this
    // kit cuts into — so none here rather than an invented one.
    vents: [],
  },

  xbox: {
    shell: {
      kind: 'swept',
      // The largest console of its generation, and shaped to look it: the top
      // swells to a crown just behind the front edge and falls away toward the
      // back, so the box reads as bulging rather than flat.
      profile: [
        [0, 0], // front-bottom
        [0, 86], // front face
        [18, 94], // chamfer up
        [60, 99], // rising to the crown
        [120, 100], // crown — full height
        [200, 96], // falling away
        [240, 88],
        [260, 78], // rear chamfer
        [260, 0], // back face straight down
      ],
      cornerRadiusMm: 8,
      bevelMm: 1.5,
    },
    finish: 'matte',
    // Near-black with a slight warm lift so the shell does not read as a void
    // under the room's key light, and the green of the jewel as the accent.
    palette: { shell: '#1d1d20', accent: '#8ac43f', dark: '#0e0e11' },
    intake: {
      kind: 'front-tray',
      position: [-40, 54],
      widthMm: 148,
      heightMm: 22,
    },
    controls: [
      { mesh: 'power_button', kind: 'round-button', position: [-126, 40], sizeMm: 15, color: 'accent' },
      { mesh: 'eject_button', kind: 'round-button', position: [-126, 64], sizeMm: 13, color: 'dark' },
      // The illuminated X jewel sits on the top deck, centred — the single
      // most recognisable thing about the shell.
      { mesh: 'power_jewel', kind: 'jewel', face: 'top', position: [0, 120], sizeMm: 92, color: 'accent' },
    ],
    ports: [
      { mesh: 'controller_port_1', position: [-108, 18], widthMm: 34, heightMm: 16 },
      { mesh: 'controller_port_2', position: [-36, 18], widthMm: 34, heightMm: 16 },
      { mesh: 'controller_port_3', position: [36, 18], widthMm: 34, heightMm: 16 },
      { mesh: 'controller_port_4', position: [108, 18], widthMm: 34, heightMm: 16 },
    ],
    vents: [],
  },

  gamecube: {
    shell: {
      kind: 'swept',
      // Very nearly a cube, which is the whole point of the name: 150 across,
      // 161 deep, 110 tall, with only a small chamfer at the top edges. The
      // moulded carrying handle on the BACK is the one feature a swept profile
      // cannot express — a profile is constant across the sweep, and the
      // handle is a local feature on one face. It wants a bespoke registry
      // override (see registry.tsx); this form is the honest approximation
      // until then, and is dimensionally correct without it.
      profile: [
        [0, 0], // front-bottom
        [0, 100], // front face
        [6, 108], // top chamfer
        [14, 110], // full height — the lid sits on this
        [147, 110], // flat top
        [155, 108],
        [161, 100], // rear chamfer
        [161, 0], // back face straight down
      ],
      cornerRadiusMm: 5,
      bevelMm: 1.2,
    },
    finish: 'matte',
    // The launch "indigo" — a muted violet-blue, noticeably greyer than a
    // saturated purple. The lid button and LED carry the lighter tint.
    palette: { shell: '#585196', accent: '#948dcb', dark: '#2e2b45' },
    intake: {
      kind: 'top-lid',
      position: [0, 84],
      widthMm: 120,
      heightMm: 120,
    },
    controls: [
      { mesh: 'power_button', kind: 'slider', position: [-18, 84], sizeMm: 24, aspect: 0.45, color: 'accent' },
      { mesh: 'reset_button', kind: 'round-button', position: [16, 84], sizeMm: 12, color: 'dark' },
      { mesh: 'open_button', kind: 'round-button', face: 'top', position: [58, 26], sizeMm: 13, color: 'dark' },
      // No power_led control — see the note on the Dreamcast form.
    ],
    // Four controller ports in a row, with the two memory-card slots on their
    // own lower line — the arrangement is two rows, not one.
    ports: [
      { mesh: 'controller_port_1', position: [-54, 40], widthMm: 26, heightMm: 14 },
      { mesh: 'controller_port_2', position: [-18, 40], widthMm: 26, heightMm: 14 },
      { mesh: 'controller_port_3', position: [18, 40], widthMm: 26, heightMm: 14 },
      { mesh: 'controller_port_4', position: [54, 40], widthMm: 26, heightMm: 14 },
      { mesh: 'memory_slot_1', position: [-26, 18], widthMm: 30, heightMm: 9 },
      { mesh: 'memory_slot_2', position: [26, 18], widthMm: 30, heightMm: 9 },
    ],
    vents: [],
  },

  'xbox-360': {
    shell: {
      kind: 'swept',
      // Lying horizontally, the side silhouette is a shallow slab that swells
      // slightly toward the middle and tucks in at both ends.
      //
      // The 360's signature is its CONCAVE WAIST — the left and right faces
      // pinch inward at the middle, which is what makes it read as an hourglass
      // from the front. A swept profile is constant across the sweep, so this
      // form cannot express it: it produces the correct side silhouette with
      // flat sides. Dimensionally right, characteristically incomplete — the
      // waist wants a bespoke registry override (see registry.tsx).
      profile: [
        [0, 0], // front-bottom
        [0, 70], // front face
        [16, 79], // chamfer up
        [70, 83], // full height
        [190, 83], // flat top
        [240, 78],
        [258, 66], // rear chamfer
        [258, 0], // back face straight down
      ],
      cornerRadiusMm: 7,
      bevelMm: 1.5,
    },
    finish: 'gloss',
    // The launch console was glossy off-white with a chrome disc tray and a
    // green power ring — not the matte black of the later Slim revision.
    palette: { shell: '#eceae4', accent: '#8ac43f', dark: '#7e7c77' },
    intake: {
      kind: 'front-tray',
      position: [-52, 46],
      widthMm: 150,
      heightMm: 24,
    },
    controls: [
      // The ring of light around the power button is the console's face, and
      // the target of its most famous failure state.
      { mesh: 'power_button', kind: 'round-button', position: [96, 44], sizeMm: 26, color: 'dark' },
      { mesh: 'power_ring', kind: 'jewel', position: [96, 44], sizeMm: 40, color: 'accent' },
      { mesh: 'eject_button', kind: 'round-button', position: [40, 22], sizeMm: 12, color: 'dark' },
    ],
    ports: [
      { mesh: 'memory_slot_1', position: [-118, 22], widthMm: 26, heightMm: 10 },
      { mesh: 'memory_slot_2', position: [-88, 22], widthMm: 26, heightMm: 10 },
      { mesh: 'usb_port_1', position: [136, 22], widthMm: 16, heightMm: 8 },
    ],
    vents: [],
  },

  wii: {
    shell: {
      kind: 'swept',
      // Authored STANDING, the orientation Nintendo shows it in and the one
      // the data's dimensions describe: 44mm across, 157mm tall, 215.4mm deep.
      // The silhouette is a plain slab with softened top and bottom edges —
      // the Wii's character is in how small it is, not in its outline.
      profile: [
        [0, 0], // front-bottom
        [0, 148], // front face, nearly full height
        [7, 157], // top front chamfer
        [208, 157], // flat top
        [215.4, 148], // top rear chamfer
        [215.4, 0], // back face straight down
      ],
      cornerRadiusMm: 4,
      bevelMm: 1.2,
    },
    finish: 'gloss',
    // Glossy white with a pale blue slot light — the console is almost
    // entirely one colour, and the slot's glow is the only accent it has.
    palette: { shell: '#f2f1ed', accent: '#4aa8d8', dark: '#b9b7b1' },
    intake: {
      // Standing, the disc slot is a vertical letterbox on the front face.
      kind: 'front-slot',
      position: [0, 96],
      widthMm: 18,
      heightMm: 128,
    },
    controls: [
      { mesh: 'power_button', kind: 'round-button', position: [-13, 40], sizeMm: 12, color: 'dark' },
      { mesh: 'eject_button', kind: 'rect-button', position: [-13, 22], sizeMm: 12, aspect: 0.55, color: 'dark' },
      { mesh: 'reset_button', kind: 'round-button', position: [13, 40], sizeMm: 9, color: 'dark' },
      // The slot itself glows blue for a message waiting — the console's one
      // piece of ambient communication.
      { mesh: 'slot_led', kind: 'jewel', position: [0, 30], sizeMm: 7, color: 'accent' },
    ],
    // SD card slot behind the front flap; the GameCube ports are under the
    // top flap and are not modelled on the front face.
    ports: [{ mesh: 'sd_slot', position: [13, 22], widthMm: 14, heightMm: 7 }],
    vents: [],
  },

  'wii-u': {
    shell: {
      kind: 'swept',
      // A long, low, heavily rounded slab — deliberately close to the original
      // Wii's silhouette, which is a large part of why so many people never
      // realised it was a different console.
      profile: [
        [0, 0], // front-bottom
        [0, 36], // front face
        [10, 44], // front chamfer
        [26, 46], // full height
        [242, 46], // flat top
        [258, 44],
        [268.5, 36], // rear chamfer
        [268.5, 0], // back face straight down
      ],
      cornerRadiusMm: 8,
      bevelMm: 1.4,
    },
    finish: 'gloss',
    // Glossy black (the Premium set); the disc slot glows the same pale blue
    // the Wii used, which is the only colour on the shell.
    palette: { shell: '#17171a', accent: '#4aa8d8', dark: '#0b0b0d' },
    intake: {
      kind: 'front-slot',
      position: [-16, 26],
      widthMm: 132,
      heightMm: 14,
    },
    controls: [
      { mesh: 'power_button', kind: 'round-button', position: [72, 22], sizeMm: 12, color: 'dark' },
      { mesh: 'eject_button', kind: 'round-button', position: [72, 38], sizeMm: 10, color: 'dark' },
      { mesh: 'reset_button', kind: 'round-button', position: [56, 22], sizeMm: 8, color: 'dark' },
      { mesh: 'slot_led', kind: 'jewel', position: [-16, 14], sizeMm: 8, color: 'accent' },
    ],
    ports: [
      { mesh: 'usb_port_1', position: [-72, 12], widthMm: 16, heightMm: 8 },
      { mesh: 'usb_port_2', position: [-50, 12], widthMm: 16, heightMm: 8 },
      { mesh: 'sd_slot', position: [40, 12], widthMm: 16, heightMm: 7 },
    ],
    vents: [],
  },

  'xbox-one': {
    shell: {
      kind: 'swept',
      // A plain rectangular slab, and unusually literal about it: the launch
      // console is a hard-edged box with almost no chamfer, which is exactly
      // what made it read as a set-top box rather than a games machine.
      profile: [
        [0, 0], // front-bottom
        [0, 74], // front face, near-vertical
        [8, 79], // small top chamfer
        [266, 79], // flat top, edge to edge
        [274, 74], // rear chamfer
        [274, 0], // back face straight down
      ],
      cornerRadiusMm: 3,
      bevelMm: 1,
    },
    finish: 'matte',
    // Half matte, half gloss on the real shell; matte is the dominant read.
    // The accent is the white backlight behind the logo, not a colour.
    palette: { shell: '#141416', accent: '#e8e8ea', dark: '#08080a' },
    intake: {
      kind: 'front-slot',
      position: [-64, 40],
      widthMm: 136,
      heightMm: 14,
    },
    controls: [
      // The touch-sensitive power logo — no travel, and the console's only
      // light.
      { mesh: 'power_button', kind: 'touch', position: [126, 40], sizeMm: 22, color: 'dark' },
      { mesh: 'power_logo', kind: 'jewel', position: [126, 40], sizeMm: 16, color: 'accent' },
      { mesh: 'eject_button', kind: 'round-button', position: [20, 22], sizeMm: 10, color: 'dark' },
    ],
    ports: [{ mesh: 'usb_port_1', position: [148, 18], widthMm: 16, heightMm: 8 }],
    vents: [],
  },

  switch: {
    shell: {
      kind: 'swept',
      // This form describes the DOCK — the part that lives in the living room
      // and the object the diorama stages. The console is really two objects
      // (a dock and a tablet that slides into it), and a single swept profile
      // cannot express that split or the slot the tablet drops into; the
      // tablet-in-dock assembly wants a bespoke registry override (see
      // registry.tsx). The dock alone is a small rounded slab, and this is
      // dimensionally correct for it.
      profile: [
        [0, 0], // front-bottom
        [0, 96], // front face
        [6, 104], // top front chamfer
        [48, 104], // flat top — the tablet slot runs along this
        [54, 96], // top rear chamfer
        [54, 0], // back face straight down
      ],
      cornerRadiusMm: 6,
      bevelMm: 1.2,
    },
    finish: 'matte',
    // Matte near-black, with the Joy-Con neon red and blue as the accents the
    // console is actually known by.
    palette: { shell: '#1a1a1d', accent: '#ff3c28', dark: '#0c0c0e' },
    intake: {
      // The Game Card slot is on the TABLET, not the dock — but the tablet is
      // what the insert sequence loads a card into, so the slot is placed on
      // the top face where the tablet sits.
      kind: 'dock',
      position: [0, 26],
      widthMm: 128,
      heightMm: 12,
    },
    controls: [
      { mesh: 'power_button', kind: 'round-button', position: [-64, 60], sizeMm: 10, color: 'dark' },
      { mesh: 'card_slot', kind: 'rect-button', position: [0, 76], sizeMm: 26, aspect: 0.3, color: 'dark' },
      { mesh: 'dock_led', kind: 'jewel', position: [-64, 44], sizeMm: 6, color: 'accent' },
    ],
    ports: [
      { mesh: 'usb_port_1', position: [-58, 22], widthMm: 16, heightMm: 8 },
      { mesh: 'usb_port_2', position: [-36, 22], widthMm: 16, heightMm: 8 },
    ],
    vents: [],
  },
}

export function consoleForm(id: string): ConsoleForm | undefined {
  return CONSOLE_FORMS[id]
}
