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
 *
 * All outlines below are read off reference photography and published
 * dimensions by eye, the same way the SNES pad was: extremes are anchored to
 * each controller's real width/depth footprint (see the matching console
 * data file's `Controller.dimensions`), but interior curvature is inferred,
 * not measured. Wound consistently with the SNES pad — far (button) edge
 * left-to-right first, then back along the near (grip) edge.
 *
 * `cx40` (Atari 2600 joystick) has no entry here: it's a vertical stick on a
 * small base, not a flat button-cap pad, and this sweep system has no shape
 * for that — the same reason its button is left unpositioned in
 * atari-2600.ts. A vertical-stick shape is a future kind, not a value to
 * fake here.
 */
export const CONTROLLER_FORMS: Record<string, ControllerForm> = {
  'snes-pad': {
    // A rounded dog-bone: the far edge runs nearly straight (it is where the
    // shoulder buttons sit), while the near edge swells into two grip lobes
    // with a shallow waist between them. That waist is the whole reason the
    // silhouette reads as "SNES pad" rather than "rounded brick".
    //
    // The previous outline described that shape in a comment but only gave it
    // eight points, so `shapeFromPoints` — which draws straight segments
    // between points, with no curve support — produced a flat-sided octagon.
    // Tracing it at ~30 points is what actually makes the curve exist. The
    // coordinates are read off the reference photographs by eye and are
    // approximate: the extremes are exact (±74 × ±30, the published pad
    // dimensions) but the lobe radii are inferred, not measured.
    //
    // Wound from the far edge left-to-right, then back along the near edge, so
    // the outer boundary keeps one consistent direction.
    plan: [
      [-56, -30],
      [56, -30],
      [64, -29],
      [70, -25],
      [73, -18],
      [74, -10],
      [74, 2],
      [72, 12],
      [66, 21],
      [57, 27],
      [46, 30],
      [36, 29],
      [28, 26],
      [18, 24],
      [8, 22.5],
      [0, 22],
      [-8, 22.5],
      [-18, 24],
      [-28, 26],
      [-36, 29],
      [-46, 30],
      [-57, 27],
      [-66, 21],
      [-72, 12],
      [-74, 2],
      [-74, -10],
      [-73, -18],
      [-70, -25],
      [-64, -29],
    ],
    thicknessMm: 25,
    domeMm: 3,
    bevelMm: 1.5,
    // accent = A/B, purple and convex. accent2 = X/Y, lavender and concave —
    // the whole reason the pad has two button shapes is so a thumb can feel
    // the difference; one colour for both would erase half of that.
    palette: { shell: '#c9c6bc', accent: '#584a8e', accent2: '#9a93c4', dark: '#3a3a3e' },
  },

  'nes-pad': {
    // A plain rounded rectangle, corners softened but the silhouette reading
    // as a slab first -- the NES pad predates every "grip" shape on this
    // list by a decade. Anchored to the published 123.4 x 53.2mm footprint.
    plan: [
      [-51, -26.6],
      [51, -26.6],
      [58, -25],
      [61.7, -20],
      [61.7, 20],
      [58, 25],
      [51, 26.6],
      [-51, 26.6],
      [-58, 25],
      [-61.7, 20],
      [-61.7, -20],
      [-58, -25],
    ],
    thicknessMm: 17.5,
    domeMm: 1,
    bevelMm: 1,
    palette: { shell: '#d6d3c8', accent: '#8b1c1c', dark: '#2a2a2a' },
  },

  'sms-pad': {
    // Estimated footprint (no published spec found -- see master-system.ts):
    // 120 x 55mm, rounder-cornered than the NES pad it followed by a year.
    plan: [
      [-48, -27.5],
      [48, -27.5],
      [55, -25],
      [60, -18],
      [60, 18],
      [55, 25],
      [48, 27.5],
      [-48, 27.5],
      [-55, 25],
      [-60, 18],
      [-60, -18],
      [-55, -25],
    ],
    thicknessMm: 20,
    domeMm: 1.5,
    bevelMm: 1.5,
    palette: { shell: '#1c1c1e', accent: '#a83232', dark: '#0d0d0e' },
  },

  'genesis-pad': {
    // The classic 3-button pad: a rounded hexagon that tapers slightly toward
    // the d-pad end and swells toward the button cluster. Anchored to the
    // published 165 x 98mm footprint.
    plan: [
      [-58, -49],
      [58, -49],
      [72, -40],
      [82.5, -20],
      [82.5, 10],
      [74, 32],
      [58, 44],
      [30, 49],
      [-30, 49],
      [-58, 44],
      [-74, 32],
      [-82.5, 10],
      [-82.5, -20],
      [-72, -40],
    ],
    thicknessMm: 40.6,
    domeMm: 4,
    bevelMm: 2,
    palette: { shell: '#141414', accent: '#b23838', dark: '#050505' },
  },

  'saturn-pad': {
    // A wider, flatter six-button evolution of the Genesis pad -- the ABC/XYZ
    // row runs nearly the full width. Anchored to the published 155 x 86mm
    // footprint.
    plan: [
      [-62, -43],
      [62, -43],
      [72, -34],
      [77.5, -16],
      [77.5, 10],
      [68, 28],
      [50, 39],
      [24, 43],
      [-24, 43],
      [-50, 39],
      [-68, 28],
      [-77.5, 10],
      [-77.5, -16],
      [-72, -34],
    ],
    thicknessMm: 45.7,
    domeMm: 3,
    bevelMm: 2,
    palette: { shell: '#8d8b92', accent: '#5b3b8c', accent2: '#c9c6cc', dark: '#26262b' },
  },

  dualshock: {
    // The pad that set the template every PlayStation controller since has
    // followed: two backward-swept grip handles with a shallow waist between
    // them, shoulder buttons riding the far edge. Anchored to the published
    // 157 x 95mm footprint. Grips extend past the nominal depth on the near
    // edge (the handles), matched here by letting the near-edge points run
    // past ±47.5.
    plan: [
      [-52, -47.5],
      [52, -47.5],
      [64, -44],
      [72, -34],
      [76, -20],
      [76, -4],
      [70, 12],
      [58, 30],
      [42, 44],
      [24, 52],
      [8, 54],
      [-8, 54],
      [-24, 52],
      [-42, 44],
      [-58, 30],
      [-70, 12],
      [-76, -4],
      [-76, -20],
      [-72, -34],
      [-64, -44],
    ],
    thicknessMm: 55,
    domeMm: 4,
    bevelMm: 2,
    palette: { shell: '#4a4a52', accent: '#2c2c31', dark: '#18181b' },
  },

  'n64-pad': {
    // The trident: a left handle, a centre prong carrying the analog stick
    // and d-pad, and a right handle -- unlike every other pad here, this
    // outline is genuinely non-convex. Anchored to the published 160 x
    // 152.6mm footprint (width x depth, the pad's deepest axis running
    // through the three prongs).
    plan: [
      [-80, -20],
      [-58, -20],
      [-52, 10],
      [-46, 40],
      [-34, 60],
      [-18, 68],
      [-14, 40],
      [-14, -20],
      [14, -20],
      [14, 40],
      [18, 68],
      [34, 60],
      [46, 40],
      [52, 10],
      [58, -20],
      [80, -20],
      [80, 6],
      [66, 30],
      [48, 46],
      [24, 56],
      [0, 58],
      [-24, 56],
      [-48, 46],
      [-66, 30],
      [-80, 6],
    ],
    thicknessMm: 66.7,
    domeMm: 3,
    bevelMm: 2,
    palette: { shell: '#c7c4bc', accent: '#e8c23a', accent2: '#3a7d4e', dark: '#232323' },
  },

  'dualshock-2': {
    // Same wing silhouette as the original DualShock -- Sony kept the shell
    // unchanged across the revision, only the internals (pressure-sensitive
    // buttons) differ. Anchored to the published 157 x 95mm footprint.
    plan: [
      [-52, -47.5],
      [52, -47.5],
      [64, -44],
      [72, -34],
      [76, -20],
      [76, -4],
      [70, 12],
      [58, 30],
      [42, 44],
      [24, 52],
      [8, 54],
      [-8, 54],
      [-24, 52],
      [-42, 44],
      [-58, 30],
      [-70, 12],
      [-76, -4],
      [-76, -20],
      [-72, -34],
      [-64, -44],
    ],
    thicknessMm: 54.9,
    domeMm: 4,
    bevelMm: 2,
    palette: { shell: '#3d3d43', accent: '#242428', dark: '#141416' },
  },

  'dualshock-3': {
    // The same wing shape carried forward again, now with the analog sticks
    // as the shell's only real change (concave rather than flat caps).
    // Anchored to the published 160 x 97mm footprint.
    plan: [
      [-53, -48.5],
      [53, -48.5],
      [65, -45],
      [73, -35],
      [77, -21],
      [77, -4],
      [71, 13],
      [59, 31],
      [43, 45],
      [25, 53],
      [8, 55],
      [-8, 55],
      [-25, 53],
      [-43, 45],
      [-59, 31],
      [-71, 13],
      [-77, -4],
      [-77, -21],
      [-73, -35],
      [-65, -45],
    ],
    thicknessMm: 55,
    domeMm: 4,
    bevelMm: 2,
    palette: { shell: '#232327', accent: '#121215', dark: '#0a0a0c' },
  },

  'dualshock-4': {
    // The first real shell redesign since the original DualShock: grips pull
    // wider and angle further back, and the light bar sits on the far edge
    // between the shoulder buttons. Anchored to the published 162 x 98mm
    // footprint.
    plan: [
      [-54, -49],
      [54, -49],
      [66, -45],
      [74, -34],
      [78, -18],
      [78, 0],
      [72, 18],
      [60, 36],
      [44, 50],
      [26, 58],
      [8, 60],
      [-8, 60],
      [-26, 58],
      [-44, 50],
      [-60, 36],
      [-72, 18],
      [-78, 0],
      [-78, -18],
      [-74, -34],
      [-66, -45],
    ],
    thicknessMm: 52,
    domeMm: 4,
    bevelMm: 2,
    // accent2 carries the light bar's colour identity separate from the
    // shell's own charcoal -- the light bar is the one part of this pad
    // that visibly changes colour at runtime (per-player, per-game-state).
    palette: { shell: '#26262b', accent: '#141417', accent2: '#1560ff', dark: '#0e0e10' },
  },

  dualsense: {
    // A wider, more sculpted grip than any prior DualShock, with a visible
    // two-tone split down the shell (black centre, white grips on the launch
    // colourway modelled here). Anchored to the published 160 x 106mm
    // footprint -- the deepest pad in the whole PlayStation lineage.
    plan: [
      [-56, -53],
      [56, -53],
      [68, -49],
      [76, -37],
      [80, -20],
      [80, 2],
      [74, 22],
      [61, 41],
      [44, 55],
      [25, 63],
      [8, 65],
      [-8, 65],
      [-25, 63],
      [-44, 55],
      [-61, 41],
      [-74, 22],
      [-80, 2],
      [-80, -20],
      [-76, -37],
      [-68, -49],
    ],
    thicknessMm: 66,
    domeMm: 5,
    bevelMm: 2,
    palette: { shell: '#e9e9ec', accent: '#1c1c1f', accent2: '#0070d1', dark: '#0a0a0c' },
  },

  'dreamcast-pad': {
    // A wide, shallow horseshoe: the far edge is nearly straight (the two
    // analog triggers ride behind it), and the near edge drops into two short
    // stubby grips with a deep, rounded notch between them — that notch is
    // the VMU window, and it is the reason this outline is non-convex on the
    // near edge where most pads of the era are not. Anchored to the published
    // 175 x 115mm footprint.
    plan: [
      [-62, -57.5],
      [62, -57.5],
      [74, -53],
      [83, -44],
      [87.5, -30],
      [87.5, -12],
      [82, 6],
      [70, 22],
      [54, 33],
      [38, 38],
      [26, 36],
      [18, 26],
      [12, 12],
      [0, 6],
      [-12, 12],
      [-18, 26],
      [-26, 36],
      [-38, 38],
      [-54, 33],
      [-70, 22],
      [-82, 6],
      [-87.5, -12],
      [-87.5, -30],
      [-83, -44],
      [-74, -53],
    ],
    thicknessMm: 78,
    domeMm: 6,
    bevelMm: 2,
    palette: { shell: '#e5e3dc', accent: '#c9c6bd', dark: '#8f8d87' },
  },

  'xbox-duke': {
    // The launch pad, and the largest controller in this kit by some margin:
    // a broad central body with two long grips swept well back, which is what
    // the "Duke" nickname is about. Anchored to the ~185 x 105mm footprint,
    // with the near-edge grip points running past ±52.5 the way the DualShock
    // handles do.
    plan: [
      [-58, -52.5],
      [58, -52.5],
      [72, -48],
      [84, -38],
      [92, -22],
      [92, -4],
      [84, 14],
      [70, 32],
      [52, 46],
      [32, 55],
      [12, 58],
      [-12, 58],
      [-32, 55],
      [-52, 46],
      [-70, 32],
      [-84, 14],
      [-92, -4],
      [-92, -22],
      [-84, -38],
      [-72, -48],
    ],
    thicknessMm: 65,
    domeMm: 6,
    bevelMm: 2.5,
    palette: { shell: '#1d1d20', accent: '#8ac43f', dark: '#0e0e11' },
  },

  'gamecube-pad': {
    // Smaller and rounder than its contemporaries, with three prongs rather
    // than two — the centre of the near edge bulges down into a short middle
    // lobe under the Z button rather than notching inward. Anchored to the
    // ~152 x 106mm footprint.
    plan: [
      [-48, -53],
      [48, -53],
      [60, -48],
      [70, -38],
      [76, -24],
      [76, -8],
      [70, 10],
      [58, 26],
      [42, 38],
      [26, 45],
      [12, 47],
      [0, 44],
      [-12, 47],
      [-26, 45],
      [-42, 38],
      [-58, 26],
      [-70, 10],
      [-76, -8],
      [-76, -24],
      [-70, -38],
      [-60, -48],
    ],
    thicknessMm: 62,
    domeMm: 7,
    bevelMm: 2,
    palette: { shell: '#585196', accent: '#57b89b', accent2: '#948dcb', dark: '#2e2b45' },
  },

  'xbox-360-pad': {
    // Rounder and considerably smaller than the Duke it replaced, with the
    // grips swept back and slightly outward. Anchored to the ~155 x 105mm
    // footprint; the near-edge grip points run past ±52.5 as the DualShock's
    // handles do.
    plan: [
      [-50, -52.5],
      [50, -52.5],
      [62, -48],
      [72, -38],
      [77.5, -22],
      [77.5, -4],
      [70, 14],
      [57, 31],
      [40, 44],
      [22, 52],
      [8, 55],
      [-8, 55],
      [-22, 52],
      [-40, 44],
      [-57, 31],
      [-70, 14],
      [-77.5, -4],
      [-77.5, -22],
      [-72, -38],
      [-62, -48],
    ],
    thicknessMm: 62,
    domeMm: 6,
    bevelMm: 2,
    palette: { shell: '#eceae4', accent: '#8ac43f', dark: '#3d3c39' },
  },

  'wii-remote': {
    // The one genuinely non-pad shape in this kit: a wand, not a controller.
    // The outline is a long rounded rectangle — 36.2mm across and 148mm along
    // its length — with the corners taken off at the nose (where the infrared
    // camera looks out) and a slight taper toward the tail. Wound the same way
    // as the pads: far edge left-to-right, then back along the near edge.
    plan: [
      [-15, -74],
      [15, -74],
      [18.1, -68],
      [18.1, 62],
      [16, 70],
      [10, 74],
      [-10, 74],
      [-16, 70],
      [-18.1, 62],
      [-18.1, -68],
    ],
    thicknessMm: 30.8,
    domeMm: 2,
    bevelMm: 1.5,
    palette: { shell: '#f2f1ed', accent: '#4aa8d8', dark: '#b9b7b1' },
  },

  'wii-u-gamepad': {
    // Not a pad but a tablet with handles: a wide, shallow rectangle carrying
    // the 6.2-inch screen, with short grips at each end. Much wider relative
    // to its depth than anything else in this kit — anchored to the 255 x
    // 134mm footprint.
    plan: [
      [-110, -67],
      [110, -67],
      [122, -60],
      [127.5, -46],
      [127.5, 40],
      [120, 56],
      [104, 65],
      [88, 67],
      [76, 60],
      [66, 46],
      [-66, 46],
      [-76, 60],
      [-88, 67],
      [-104, 65],
      [-120, 56],
      [-127.5, 40],
      [-127.5, -46],
      [-122, -60],
    ],
    thicknessMm: 26,
    domeMm: 3,
    bevelMm: 2,
    palette: { shell: '#f2f1ed', accent: '#4aa8d8', dark: '#3a3a3d' },
  },

  'xbox-one-pad': {
    // A near-iteration of the 360 pad: marginally smaller, with the grips
    // squared off a little more and the shoulders straighter. Anchored to the
    // ~152 x 103mm footprint.
    plan: [
      [-49, -51.5],
      [49, -51.5],
      [61, -47],
      [70, -37],
      [76, -21],
      [76, -4],
      [69, 14],
      [56, 30],
      [39, 43],
      [21, 51],
      [8, 54],
      [-8, 54],
      [-21, 51],
      [-39, 43],
      [-56, 30],
      [-69, 14],
      [-76, -4],
      [-76, -21],
      [-70, -37],
      [-61, -47],
    ],
    thicknessMm: 60,
    domeMm: 6,
    bevelMm: 2,
    palette: { shell: '#141416', accent: '#e8e8ea', dark: '#08080a' },
  },

  'joy-con-pair': {
    // The two Joy-Cons seated in the supplied grip. The outline is squarer
    // than a moulded pad because it is really three parts clipped together —
    // two flat rectangular controllers either side of a central bridge — so
    // the near edge stays much straighter than the DualShock's or the 360's.
    // Anchored to the ~152 x 106mm footprint.
    plan: [
      [-52, -53],
      [52, -53],
      [64, -48],
      [73, -38],
      [76, -24],
      [76, 22],
      [70, 38],
      [58, 48],
      [44, 53],
      [32, 50],
      [26, 40],
      [-26, 40],
      [-32, 50],
      [-44, 53],
      [-58, 48],
      [-70, 38],
      [-76, 22],
      [-76, -24],
      [-73, -38],
      [-64, -48],
    ],
    thicknessMm: 60,
    domeMm: 4,
    bevelMm: 2,
    // Neon red and blue are the console's signature, so both accents are used
    // rather than one — the two halves genuinely are different colours.
    palette: { shell: '#3a3a3f', accent: '#ff3c28', accent2: '#0ab9e6', dark: '#1a1a1d' },
  },
}

export function controllerForm(id: string): ControllerForm | undefined {
  return CONTROLLER_FORMS[id]
}
