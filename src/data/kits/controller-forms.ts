import type { ControllerForm } from '@/types/console'

/**
 * Controller form specs — the parametric controller kit.
 *
 * A polygon plan outline swept vertically (see
 * src/three/geometry/profiles.ts#sweepPlanVertically) covers the NES
 * rectangle, the SNES dog bone, the N64 trident and the Wii Remote with no
 * special cases — organic pad shapes are all "draw the outline from above."
 *
 * Keyed by `Controller.id`, not console id — a console can carry more than one
 * controller across its life (a pack-in pad and a later revision), and this
 * keeps the two independent.
 */
export const CONTROLLER_FORMS: Record<string, ControllerForm> = {
  'snes-pad': {
    // A rounded dog-bone: the centre section (where the buttons live) reads
    // narrower front-to-back than the two grips, which flare out slightly —
    // the actual reason the shape reads as "SNES pad" and not "rounded brick".
    plan: [
      [-74, -22],
      [-58, -30],
      [58, -30],
      [74, -22],
      [74, 22],
      [58, 30],
      [-58, 30],
      [-74, 22],
    ],
    thicknessMm: 25,
    domeMm: 3,
    bevelMm: 1.5,
    // accent = A/B, purple and convex. accent2 = X/Y, lavender and concave —
    // the whole reason the pad has two button shapes is so a thumb can feel
    // the difference; one colour for both would erase half of that.
    palette: { shell: '#c9c6bc', accent: '#584a8e', accent2: '#9a93c4', dark: '#3a3a3e' },
  },
}

export function controllerForm(id: string): ControllerForm | undefined {
  return CONTROLLER_FORMS[id]
}
