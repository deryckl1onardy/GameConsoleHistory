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
}

export function consoleForm(id: string): ConsoleForm | undefined {
  return CONSOLE_FORMS[id]
}
