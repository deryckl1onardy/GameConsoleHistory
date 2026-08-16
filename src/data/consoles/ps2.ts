import type { ConsoleEntry } from '@/types/console'

/**
 * The best-selling video game console ever built, by a margin nothing else
 * has closed since. Its killer feature at launch wasn't even a game — it
 * was a DVD player, at a moment when standalone DVD players cost more than
 * the console itself.
 *
 * Sales figures, dates and technical specs from Wikipedia (see `sources`).
 * Controller modelled is the DualShock 2, the pad bundled with the console
 * for its entire 13-year retail life.
 */
export const ps2: ConsoleEntry = {
  id: 'ps2',
  name: 'PlayStation 2',
  shortName: 'PS2',
  manufacturer: 'Sony',
  generation: 6,
  released: {
    jp: '2000-03-04',
    na: '2000-10-26',
    eu: '2000-11-24',
  },
  discontinued: '2013-01-04',
  unitsSold: 160_000_000,
  msrpUsd: 299,
  msrpUsdAdjusted: 555,
  tagline: 'It sold a DVD player and a games console for the price of the DVD player alone.',
  summary:
    'Standalone DVD players cost $300–$1,000 when the PlayStation 2 launched at $299 with one built in — for a lot of early buyers, the games console paid for itself before a single game was purchased. Full backward compatibility with the original PlayStation meant nobody had to abandon their existing library to upgrade, an option almost no console before it had offered. Thirteen years, over 3,800 games and 160 million units later, it remains the best-selling home console ever made, and nothing released since has come within reach of the number.',

  specs: {
    cpu: 'Emotion Engine',
    cpuClockMhz: 294.912,
    ram: '32 MB RDRAM',
    ramBytes: 33_554_432,
    resolution: '480i/480p (NTSC), some titles up to 1080i',
    colors: '16.7 million',
    audio: 'Dolby Digital, Dolby Pro Logic II, DTS Interactive',
    media: 'DVD-ROM and CD-ROM',
  },

  relatableSpecs: [
    {
      label: 'Lifetime sales',
      value: '160 million',
      comparison:
        'Still the best-selling home console ever built, by a wide margin — no console released since, on any platform, has caught up to the number.',
    },
    {
      label: 'Built-in DVD player',
      value: 'Cost less than a standalone one',
      comparison:
        'A dedicated DVD player alone often cost as much as the entire PS2 in 2000 — buying the console to watch movies wasn\'t a stretch, it was the cheaper option.',
    },
    {
      label: 'Games released',
      value: '3,800+',
      comparison:
        'One of the largest game libraries any single console has ever had — more titles exist for the PS2 than most people could play in a lifetime of weekends.',
    },
    {
      label: 'Backward compatibility',
      value: 'The whole PS1 library',
      comparison:
        'Every disc from the console before it still worked — upgrading did not mean abandoning what you already owned, which almost no console generation before it had offered.',
    },
  ],

  mediaKind: 'optical',
  mediaArchetype: 'dvd-keepcase',
  model: '/models/consoles/ps2.glb',
  // Aspirational mesh targets for a future authored model -- see the
  // Atari 2600 / NES entries for why the current dropped-in GLB can't be
  // targeted by name yet.
  animatedParts: {
    tray: 'disc_tray',
    powerSwitch: 'power_button',
  },
  // Dimensions.com: 302.3mm W x 78.7mm H x 182.9mm D (original "fat" model).
  dimensions: { width: 302.3, height: 78.7, depth: 182.9 },

  variants: [],

  controllers: [
    {
      id: 'dualshock-2',
      name: 'DualShock 2 Controller',
      model: '/models/controllers/dualshock-2.glb',
      // Dimensions.com: 157mm W x 95mm H x 54.9mm D.
      dimensions: { width: 157, height: 54.9, depth: 95 },
      innovations: [
        'Pressure-sensitive face and shoulder buttons — how hard you pressed became an input value in its own right, not just on or off.',
        'The same DualShock analog-stick layout the PS1\'s late-cycle pad had introduced, refined and bundled as standard from day one this time.',
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
      id: 'dvd-trojan-horse',
      title: 'The DVD player was the actual pitch',
      body: 'In 2000, a standalone DVD player often cost as much as the entire PS2. Sony priced the console at $299 with a DVD player built in, and a meaningful share of early buyers picked it up primarily to watch movies — the games console rode in on the back of a cheaper home theatre upgrade.',
    },
    {
      id: 'backward-compat-first',
      title: 'Nobody had to leave their library behind',
      body: 'The PS2 played original PlayStation discs natively, at a time when console generations typically meant starting your collection over. It was one of the first mainstream consoles to make backward compatibility a headline feature rather than an afterthought.',
    },
    {
      id: 'best-selling-ever',
      title: 'Still the best-selling console ever made',
      body: 'At 160 million units over thirteen years, the PS2 remains the best-selling home video game console in history. Every console released since — PS3, PS4, PS5, every Xbox, every Switch — has sold fewer units than a console that stopped being manufactured in 2013.',
    },
    {
      id: 'thirteen-year-run',
      title: 'It outlived its own successor\'s early years',
      body: 'Sony kept manufacturing new PS2 units until January 2013 — nearly seven years after the PS3 launched, and well into the PS4\'s own development. Its game library kept growing on both consoles at once for the better part of a decade.',
    },
  ],

  failureStates: [
    {
      id: 'disc-read-error-ps2',
      name: 'Disc read error',
      body: 'A worn spindle motor belt or a laser lens degraded by dust produces the PS2\'s signature failure — games and DVDs that spin up, fail to read, and eject with a "disc read error," a fault common enough on the original "fat" model that a whole aftermarket of replacement laser assemblies exists for it.',
      target: 'lid',
      effect: 'no-signal',
    },
    {
      id: 'memory-card-corruption',
      name: 'Memory card corruption',
      body: 'The console\'s proprietary memory cards corrupt more easily than later flash storage, especially if power is lost mid-save — a failure mode that could silently erase dozens of hours of progress with no warning.',
      target: 'shell',
      effect: 'dim',
    },
  ],

  diorama: {
    roomKit: 'den-2000s-na',
    footprint: [4.2, 3.6],
    props: [
      { kit: 'sofa', variant: 'leather-black', position: [0, 0, 1.35], rotation: [0, Math.PI, 0] },
      { kit: 'rug', variant: 'berber-cream', position: [0, 0.002, 0.55], scale: 1.15 },
      { kit: 'tv-stand', variant: 'black-lacquer', position: [0, 0, -1.15] },
      { kit: 'side-table', variant: 'glass-chrome', position: [1.25, 0, 0.95] },
      { kit: 'lamp', variant: 'white-shade', position: [1.25, 0.52, 0.95] },
      { kit: 'plant', variant: 'rubber-tree', position: [1.75, 0, -1.05], scale: 1.05 },
      { kit: 'poster', variant: 'band', position: [-2.06, 1.5, -0.4], rotation: [0, Math.PI / 2, 0] },
      { kit: 'window', variant: 'blinds', position: [1.25, 1.4, -1.78] },
    ],
    tv: {
      id: 'crt-27-2001',
      model: '/models/tvs/crt-27.glb',
      label: '27-inch consumer CRT, c. 2001',
      screenInches: 27,
      dimensions: { width: 640, height: 560, depth: 560 },
      curvature: 0.4,
      bezelInsetMm: 16,
      aspect: '4:3',
    },
    lighting: {
      id: 'evening-2000s',
      tempK: 3400,
      intensity: 2.7,
      keyPosition: [3.4, 2.1, 1.2],
      ambientIntensity: 0.32,
      backdrop: '#1e2028',
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
    { rank: 1, title: 'Grand Theft Auto: San Andreas', year: 2004, unitsSold: 17_330_000, developer: 'Rockstar North', publisher: 'Rockstar Games', blurb: 'An open world the size of three previous GTA games combined, and the best-selling PS2 game by a wide margin.' },
    { rank: 2, title: 'Gran Turismo 3: A-Spec', year: 2001, unitsSold: 14_890_000, developer: 'Polyphony Digital', publisher: 'Sony Computer Entertainment', blurb: 'The series\' generational leap in visuals, and a system-seller in its own right at launch.' },
    { rank: 3, title: 'Grand Theft Auto: Vice City', year: 2002, unitsSold: 14_200_000, developer: 'Rockstar North', publisher: 'Rockstar Games', blurb: 'An \'80s Miami pastiche that became as culturally dominant as the game underneath it.' },
    { rank: 4, title: 'Gran Turismo 4', year: 2004, unitsSold: 11_760_000, developer: 'Polyphony Digital', publisher: 'Sony Computer Entertainment', blurb: 'Over 700 cars, and one of the most detailed racing sims ever built for the hardware generation.' },
    { rank: 5, title: 'Grand Theft Auto III', year: 2001, unitsSold: 11_600_000, developer: 'DMA Design', publisher: 'Rockstar Games', blurb: 'The game that made "open-world 3D city" a genre, not just a setting.' },
    { rank: 6, title: 'Tekken 5', year: 2005, unitsSold: 9_430_000, developer: 'Namco', publisher: 'Namco', blurb: 'Widely regarded as a high point for the series on PS2 hardware.' },
    { rank: 7, title: 'Final Fantasy X', year: 2001, unitsSold: 8_600_000, developer: 'Square', publisher: 'Square / Square Electronic Arts', blurb: 'Full voice acting for the first time in the mainline series, on a launch-window PS2 disc.' },
    { rank: 8, title: 'Metal Gear Solid 2: Sons of Liberty', year: 2001, unitsSold: 7_030_000, developer: 'Konami Computer Entertainment Japan', publisher: 'Konami', blurb: 'A sequel infamous for swapping its own protagonist mid-story, on purpose, to make a point about the previous game\'s hero worship.' },
    { rank: 9, title: 'Final Fantasy XII', year: 2006, unitsSold: 6_400_000, developer: 'Square Enix', publisher: 'Square Enix', blurb: 'A late-cycle PS2 release with a real-time battle system that broke from a decade of the series\' own conventions.' },
    { rank: 10, title: 'Kingdom Hearts', year: 2002, unitsSold: 6_300_000, developer: 'Square', publisher: 'Square / Square Electronic Arts', blurb: 'Disney characters and Final Fantasy characters in one action-RPG — a pitch that should not have worked and became a franchise anyway.' },
  ],

  sources: [
    'https://en.wikipedia.org/wiki/PlayStation_2',
    'https://en.wikipedia.org/wiki/List_of_best-selling_PlayStation_2_video_games',
    'https://www.dimensions.com/element/playstation-2',
    'https://www.dimensions.com/element/dualshock-2-controller',
  ],
}
