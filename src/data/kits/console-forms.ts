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
}

export function consoleForm(id: string): ConsoleForm | undefined {
  return CONSOLE_FORMS[id]
}
