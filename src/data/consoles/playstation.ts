import type { ConsoleEntry } from '@/types/console'

/**
 * The CD drive Nintendo commissioned, then abandoned at a trade show
 * without telling its own partner — and Sony finished building it anyway.
 * The console that resulted did not just compete with Nintendo and Sega,
 * it ended the cartridge era for mainline home consoles entirely.
 *
 * Sales figures, dates and technical specs from Wikipedia (see `sources`).
 * Controller modelled here is the DualShock (1997), the pad that defined
 * the layout every PlayStation controller since has kept — the original
 * launch pad had no analog sticks at all, noted in the facts below.
 */
export const playstation: ConsoleEntry = {
  id: 'playstation',
  name: 'Sony PlayStation',
  shortName: 'PlayStation',
  manufacturer: 'Sony',
  generation: 5,
  released: {
    jp: '1994-12-03',
    na: '1995-09-09',
    eu: '1995-09-29',
  },
  discontinued: '2006-03-23',
  unitsSold: 102_490_000,
  msrpUsd: 299,
  msrpUsdAdjusted: 630,
  tagline: 'The add-on Nintendo walked away from, turned into a company.',
  summary:
    'Sony was building a CD-ROM drive for the Super Nintendo. Nintendo announced a rival deal with Philips instead, at a trade show, without warning Sony beforehand. Sony finished the hardware anyway and shipped it as its own console. What resulted was not a niche upstart — the original PlayStation sold over 102 million units, more than the SNES, Genesis and Saturn combined, and turned 3D polygonal graphics from a novelty into the industry default. Its 1995 North American price announcement was, famously, one word: "$299," delivered on stage by Sony executive Steve Race seconds after Sega tried to steal the moment with a surprise Saturn launch. The room laughed. Sony had already won it.',

  specs: {
    cpu: 'MIPS R3000A (LSI CoreWare CW33300)',
    cpuClockMhz: 33.87,
    ram: '2 MB main RAM, 1 MB video RAM',
    ramBytes: 2_097_152,
    resolution: '256×224 up to 640×480',
    colors: '16.7 million, 32 levels of transparency',
    audio: 'Sony SPU, 24-channel ADPCM',
    media: 'CD-ROM',
  },

  relatableSpecs: [
    {
      label: 'The price announcement',
      value: '"$299"',
      comparison:
        'Sony\'s entire E3 1995 price reveal was one word, spoken on stage — no slide, no ceremony — delivered right after a competitor\'s surprise launch tried to steal the room.',
    },
    {
      label: 'Lifetime sales',
      value: '102.49 million',
      comparison:
        'More units than the SNES, Genesis and Saturn sold combined — the console built from Nintendo\'s abandoned CD add-on outsold the company that walked away from it.',
    },
    {
      label: 'Colour depth',
      value: '16.7 million colours',
      comparison:
        'The same true-colour depth used in professional photo editing today, running on a 1994 console chip.',
    },
    {
      label: 'CD-ROM capacity',
      value: '~650 MB per disc',
      comparison:
        'More storage in one disc than every SNES cartridge released for the entire console generation, combined, fit into all of them.',
    },
  ],

  mediaKind: 'optical',
  mediaArchetype: 'jewel-cd',
  model: '/models/consoles/playstation.glb',
  // Measured against the actual rendered GLB — see snes.ts's hardwareDiagram
  // comment for the method. The render (282 x 60 x 202mm) matches the real
  // SCPH-1000 well (~9% per gltf-transforms.ts); anchors track the render box.
  hardwareDiagram: {
    renderBox: { x: [-0.1411, 0.1411], y: [0, 0.0596], z: [-0.101, 0.101] },
    callouts: [
      {
        label: 'Disc lid — the whole top flips open',
        anchor: [0, 0.057, 0.01],
        labelOffset: [0, 0.03, 0.015],
      },
      {
        label: 'Power button — front right',
        anchor: [0.1, 0.04, 0.099],
        labelOffset: [0.035, 0.045, 0.005],
      },
      {
        label: 'Open button — front left',
        anchor: [-0.1, 0.04, 0.099],
        labelOffset: [-0.035, 0.045, 0.005],
      },
      {
        label: 'Controller + memory card ports (×4) — front',
        anchor: [0, 0.015, 0.099],
        labelOffset: [0, 0.03, 0.01],
      },
    ],
  },
  // Aspirational mesh targets for a future authored model -- see the
  // Atari 2600 / NES entries for why the current dropped-in GLB can't be
  // targeted by name yet.
  animatedParts: {
    lid: 'disc_lid',
    powerSwitch: 'power_switch',
  },
  // Dimensions.com: 275mm W x 65mm H x 190mm D.
  dimensions: { width: 275, height: 65, depth: 190 },

  variants: [],

  controllers: [
    {
      id: 'dualshock',
      name: 'DualShock Controller',
      model: '/models/controllers/dualshock.glb',
      dimensions: { width: 157, height: 55, depth: 95 },
      innovations: [
        'Twin analog sticks, positioned symmetrically below the face buttons and shoulder buttons — the layout every PlayStation, and most of its competitors, still use.',
        'Dual vibration motors of two different sizes gave the controller its name, and its own physical feedback for the first time on a Sony pad.',
      ],
      buttons: [
        { id: 'dpad-up', mesh: 'dpad', label: 'D-pad Up', key: 'ArrowUp', travel: [0, -0.0008, 0], position: [-46, 14], shape: 'cross', sizeMm: 24 },
        { id: 'dpad-down', mesh: 'dpad', label: 'D-pad Down', key: 'ArrowDown', travel: [0, -0.0008, 0] },
        { id: 'dpad-left', mesh: 'dpad', label: 'D-pad Left', key: 'ArrowLeft', travel: [0, -0.0008, 0] },
        { id: 'dpad-right', mesh: 'dpad', label: 'D-pad Right', key: 'ArrowRight', travel: [0, -0.0008, 0] },
        { id: 'triangle', mesh: 'btn_triangle', label: 'Triangle', key: 'i', travel: [0, -0.0012, 0], position: [46, 26], shape: 'convex', sizeMm: 12 },
        { id: 'circle', mesh: 'btn_circle', label: 'Circle', key: 'l', travel: [0, -0.0012, 0], position: [58, 14], shape: 'convex', sizeMm: 12 },
        { id: 'cross', mesh: 'btn_cross', label: 'Cross', key: 'k', travel: [0, -0.0012, 0], position: [46, 2], shape: 'convex', sizeMm: 12 },
        { id: 'square', mesh: 'btn_square', label: 'Square', key: 'j', travel: [0, -0.0012, 0], position: [34, 14], shape: 'convex', sizeMm: 12 },
        { id: 'l1', mesh: 'btn_l1', label: 'L1', key: 'q', travel: [0, 0, -0.0015], position: [-46, -30], shape: 'shoulder', sizeMm: 26 },
        { id: 'r1', mesh: 'btn_r1', label: 'R1', key: 'e', travel: [0, 0, -0.0015], position: [46, -30], shape: 'shoulder', sizeMm: 26 },
        { id: 'l2', mesh: 'btn_l2', label: 'L2', key: 'u', travel: [0.5, 0, 0], position: [-46, -38], shape: 'trigger', sizeMm: 22 },
        { id: 'r2', mesh: 'btn_r2', label: 'R2', key: 'o', travel: [0.5, 0, 0], position: [46, -38], shape: 'trigger', sizeMm: 22 },
        { id: 'select', mesh: 'btn_select', label: 'Select', key: 'Shift', travel: [0, -0.0006, 0], position: [-14, 10], shape: 'capsule', sizeMm: 8 },
        { id: 'start', mesh: 'btn_start', label: 'Start', key: 'Enter', travel: [0, -0.0006, 0], position: [14, 10], shape: 'capsule', sizeMm: 8 },
        { id: 'l-stick', mesh: 'stick_l', label: 'Left Stick', key: 'a', travel: [0, 0, 0], position: [-20, -14], shape: 'stick', sizeMm: 20 },
        { id: 'r-stick', mesh: 'stick_r', label: 'Right Stick', key: 'd', travel: [0, 0, 0], position: [20, -14], shape: 'stick', sizeMm: 20 },
      ],
    },
  ],

  facts: [
    {
      id: 'nintendo-abandoned-deal',
      title: 'It began as an SNES add-on Nintendo walked away from',
      body: 'Sony was under contract to build a CD-ROM drive for the Super Nintendo. Nintendo then announced a competing deal with Philips at the 1991 Consumer Electronics Show — the same show where Sony was set to unveil the joint project — without telling Sony first. Sony finished the hardware anyway and turned it into its own console.',
    },
    {
      id: 'no-analog-at-launch',
      title: 'It launched with no analog sticks at all',
      body: 'The original 1994 PlayStation controller had a D-pad, four face buttons and four shoulder buttons — no analog sticks, no vibration. The Dual Analog Controller (1997) and then the DualShock (1997) added both, and the DualShock\'s layout has been the PlayStation standard ever since.',
    },
    {
      id: 'e3-price-ambush',
      title: 'The whole price announcement was one word',
      body: 'Minutes after Sega ambushed E3 1995 with a surprise same-day Saturn launch, Sony\'s Steve Race walked on stage, said "$299," and walked off — undercutting the Saturn\'s $399 price by a hundred dollars in the shortest, most quoted moment of the console\'s launch.',
    },
    {
      id: 'outsold-everyone',
      title: 'It outsold its entire generation combined',
      body: 'At 102.49 million units, the original PlayStation sold more than the SNES, Genesis and Saturn added together — the console born from a cancelled Nintendo side-project ended up defining the generation that followed it.',
    },
  ],

  failureStates: [
    {
      id: 'disc-read-error',
      name: 'The tilted-lens disc read error',
      body: 'A worn spindle motor or a laser lens that drifts out of alignment produces the console\'s most notorious failure — a game that refuses to read past the startup screen, often "fixable" for a while by physically tilting the console during boot, a workaround an entire generation of owners discovered independently.',
      target: 'lid',
      effect: 'no-signal',
    },
    {
      id: 'cd-skip',
      name: 'CD skipping and freezing',
      body: 'Dust and age on the optical pickup cause mid-game freezes and audio skipping that worsen over years, especially in the disc drive\'s later production runs, which used a cheaper mechanism than the original 1994 units.',
      target: 'shell',
      effect: 'screen-garbage',
    },
  ],

  diorama: {
    roomKit: 'den-90s-na',
    footprint: [4.2, 3.6],
    props: [
      { kit: 'sofa', variant: 'leather-black', position: [0, 0, 1.35], rotation: [0, Math.PI, 0] },
      { kit: 'rug', variant: 'berber-cream', position: [0, 0.002, 0.55], scale: 1.15 },
      { kit: 'tv-stand', variant: 'black-lacquer', position: [0, 0, -1.15] },
      { kit: 'side-table', variant: 'glass-chrome', position: [1.25, 0, 0.95] },
      { kit: 'lamp', variant: 'white-shade', position: [1.25, 0.52, 0.95] },
      { kit: 'plant', variant: 'fern', position: [1.75, 0, -1.05], scale: 1.05 },
      { kit: 'poster', variant: 'band', position: [-2.06, 1.5, -0.4], rotation: [0, Math.PI / 2, 0] },
      { kit: 'window', variant: 'blinds', position: [1.25, 1.4, -1.78] },
    ],
    tv: {
      id: 'crt-20-1996',
      model: '/models/tvs/crt-20.glb',
      label: '20-inch consumer CRT, c. 1996',
      screenInches: 20,
      dimensions: { width: 530, height: 480, depth: 490 },
      curvature: 0.65,
      bezelInsetMm: 14,
      aspect: '4:3',
    },
    lighting: {
      id: 'evening-late-90s',
      tempK: 3200,
      intensity: 2.8,
      keyPosition: [3.4, 2.1, 1.2],
      ambientIntensity: 0.32,
      backdrop: '#eeeeea',
    },
    tvPosition: [-0.28, 0.5, -1.15],
    tvRotation: [0, 0.12, 0],
    consolePosition: [0.44, 0.5, -1.02],
    consoleRotation: [0, -0.28, 0],
    controllerPosition: [-0.18, 0.014, 0.42],
    controllerRotation: [0, 0.5, 0],
    shelfPosition: [-1.35, 0.55, -1.52],
  },

  games: [
    { rank: 1, title: 'Gran Turismo', year: 1997, unitsSold: 10_850_000, developer: 'Polyphony Digital', publisher: 'Sony Computer Entertainment', blurb: 'A racing simulator with hundreds of real, licensed cars — the game that made "sim racer" a mainstream console genre.' },
    { rank: 2, title: 'Final Fantasy VII', year: 1997, unitsSold: 10_022_228, developer: 'Square', publisher: 'Square / Sony Computer Entertainment', blurb: 'The RPG that moved millions of PlayStations on its own, and the reason Square left Nintendo\'s cartridge platform behind entirely.' },
    { rank: 3, title: 'Gran Turismo 2', year: 1999, unitsSold: 9_370_000, developer: 'Polyphony Digital', publisher: 'Sony Computer Entertainment', blurb: 'Doubled the car count and the ambition, and doubled the sales of the original.' },
    { rank: 4, title: 'Final Fantasy VIII', year: 1999, unitsSold: 8_600_000, developer: 'Square', publisher: 'Square', blurb: 'Photorealistic-for-its-time character models and a junction-based system that split the fanbase and sold anyway.' },
    { rank: 5, title: 'Tekken 3', year: 1998, unitsSold: 8_300_000, developer: 'Namco', publisher: 'Namco', blurb: 'Widely considered the high point of the PS1 fighting-game library, arcade-perfect and then some.' },
    { rank: 6, title: 'Harry Potter and the Philosopher\'s Stone', year: 2001, unitsSold: 8_000_000, developer: 'Argonaut Games', publisher: 'Electronic Arts', blurb: 'A late-cycle licensed tie-in that outsold most of the console\'s original franchises through sheer brand pull.' },
    { rank: 7, title: 'Crash Bandicoot 2: Cortex Strikes Back', year: 1997, unitsSold: 7_580_000, developer: 'Naughty Dog', publisher: 'Sony Computer Entertainment', blurb: 'Sony\'s answer to a console mascot, refined into the platformer that defined the PS1\'s early identity.' },
    { rank: 8, title: 'Crash Bandicoot: Warped', year: 1998, unitsSold: 7_130_000, developer: 'Naughty Dog', publisher: 'Sony Computer Entertainment', blurb: 'The third entry, and the one most players remember as the series\' peak.' },
    { rank: 9, title: 'Tomb Raider', year: 1996, unitsSold: 7_100_000, developer: 'Core Design', publisher: 'Eidos Interactive', blurb: 'Lara Croft\'s debut, and one of the first 3D-platformer icons to rival Mario and Sonic in mainstream recognition.' },
    { rank: 10, title: 'Metal Gear Solid', year: 1998, unitsSold: 7_000_000, developer: 'Konami Computer Entertainment Japan', publisher: 'Konami', blurb: 'Stealth as a genre in its own right, directed by Hideo Kojima with a cinematic ambition few consoles had attempted before.' },
  ],

  sources: [
    'https://en.wikipedia.org/wiki/PlayStation_(console)',
    'https://en.wikipedia.org/wiki/List_of_best-selling_PlayStation_video_games',
    'https://en.wikipedia.org/wiki/DualShock',
    'https://www.dimensions.com/element/playstation',
  ],
}
