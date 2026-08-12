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
      // Corrected against Wikipedia's design section: the shell is a medium
      // grey, not the near-white the first procedural pass used.
      shell: '#b9b6ac',
      // Purple sliding switches, dark grey eject lever — this was backwards
      // in the original hand-built model.
      accent: '#6d5b9e',
      dark: '#4a4844',
    },
    intake: {
      kind: 'top-slot',
      // Centred on the raised rear deck, matching the corrected profile above.
      position: [0, 190],
      widthMm: 140,
      heightMm: 24,
    },
    controls: [
      // Power slider — purple, front-left. Was rendered grey; corrected.
      { mesh: 'power_switch', kind: 'slider', position: [-58, 41], sizeMm: 26, color: 'accent' },
      // Reset — small round button, grey (not purple, as the first pass had it).
      { mesh: 'reset_button', kind: 'round-button', position: [-24, 40], sizeMm: 16, color: 'dark' },
      // Eject — the larger lever on the right, dark grey.
      { mesh: 'eject_lever', kind: 'lever', position: [30, 41], sizeMm: 42, color: 'dark' },
    ],
    ports: [
      { mesh: 'controller_port_1', position: [-38, 29], widthMm: 26, heightMm: 13 },
      { mesh: 'controller_port_2', position: [38, 29], widthMm: 26, heightMm: 13 },
    ],
    vents: [
      { position: [0, 195], count: 7, slotWidthMm: 3, slotHeightMm: 60, gapMm: 6, direction: 'row' },
    ],
  },
}

export function consoleForm(id: string): ConsoleForm | undefined {
  return CONSOLE_FORMS[id]
}
