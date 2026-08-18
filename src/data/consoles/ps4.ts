import type { ConsoleEntry } from '@/types/console'

/**
 * The console Sony won the generation with almost entirely on message: no
 * always-online requirement, no restrictive used-game DRM, a straightforward
 * $399 price against a $499 rival bundling a camera nobody asked for. It
 * shipped a million units on North American launch day alone and never
 * really lost the lead after that.
 *
 * Sales figures, dates and technical specs from Wikipedia (see `sources`).
 * Controller modelled is the DualShock 4, standard across the console's
 * entire retail life.
 */
export const ps4: ConsoleEntry = {
  id: 'ps4',
  name: 'PlayStation 4',
  shortName: 'PS4',
  manufacturer: 'Sony',
  generation: 8,
  released: {
    na: '2013-11-15',
    eu: '2013-11-29',
    jp: '2014-02-22',
  },
  discontinued: '2024-03-28',
  unitsSold: 117_200_000,
  msrpUsd: 399.99,
  msrpUsdAdjusted: 535,
  tagline: 'It won the generation mostly by promising to leave players alone.',
  summary:
    'Sony spent its PS4 reveal cycle drawing a straight line against Microsoft\'s Xbox One: no requirement to check in online every 24 hours, no restrictions on selling or lending used games, and a $399 price a full hundred dollars under a rival console bundling a camera few people wanted. The pitch worked immediately — a million units sold on North American launch day alone, 250,000 more in the UK within 48 hours — and the lead it opened in November 2013 never meaningfully closed. Across its decade on shelves the PS4 became host to some of the best-reviewed exclusives Sony ever published, Spider-Man and God of War and Horizon Zero Dawn among them, each moving upward of 19 million copies in its own right.',

  specs: {
    cpu: 'AMD Jaguar (8-core)',
    cpuClockMhz: 1600,
    ram: '8 GB GDDR5',
    ramBytes: 8_589_934_592,
    resolution: 'Up to 1080p (upscaled 4K on PS4 Pro)',
    colors: '16.7 million (AMD GCN GPU, 18 compute units @ 800 MHz, 1.84 TFLOPS)',
    audio: 'Dolby Digital 5.1, DTS 5.1, up to 7.1 channel LPCM',
    media: 'Blu-ray Disc, Blu-ray 3D, DVD, digital download',
  },

  relatableSpecs: [
    {
      label: 'Launch-day sales',
      value: '1 million units, North America alone',
      comparison:
        'Sold out within hours of release in a single region — a pace no prior PlayStation launch had matched.',
    },
    {
      label: 'Price vs. the rival console',
      value: '$399 vs. $499',
      comparison:
        'Undercut the Xbox One by a full hundred dollars at launch, while that price included features (an always-bundled camera) the PS4 made optional.',
    },
    {
      label: 'No always-online requirement',
      value: 'Reversed a proposed industry-wide policy',
      comparison:
        'Microsoft had floated a 24-hour online check-in requirement and used-game restrictions for the Xbox One; Sony\'s public rejection of both at its own reveal reshaped the entire generation\'s messaging before either console shipped.',
    },
    {
      label: 'Lifetime sales',
      value: '117+ million',
      comparison:
        'One of the best-selling consoles ever made, trailing only the PS2 and a small handful of others in all of gaming history.',
    },
  ],

  mediaKind: 'optical',
  mediaArchetype: 'bluray-case',
  model: '/models/consoles/ps4.glb',
  // Measured against the actual rendered GLB — see snes.ts's hardwareDiagram
  // comment for the method. The model's own meshes locate the power button
  // (+X front-top), eject (-X front-top) and USB ports (front centre) exactly;
  // the anchors below are measured from those meshes.
  hardwareDiagram: {
    renderBox: { x: [-0.1556, 0.1556], y: [0, 0.0497], z: [-0.1438, 0.1438] },
    callouts: [
      {
        label: 'Touch power button — front right',
        anchor: [0.128, 0.04, 0.121],
        labelOffset: [0.03, 0.035, 0.005],
      },
      {
        label: 'Eject button — front left',
        anchor: [-0.122, 0.04, 0.121],
        labelOffset: [-0.03, 0.035, 0.005],
      },
      {
        label: 'USB ports (×2) — front centre',
        anchor: [0.007, 0.025, 0.119],
        labelOffset: [0.025, 0.035, 0.005],
      },
      {
        label: 'Disc slot — front left',
        anchor: [-0.06, 0.028, 0.142],
        labelOffset: [-0.03, 0.035, 0.005],
      },
    ],
  },
  // Aspirational mesh targets for a future authored model -- see the
  // Atari 2600 / NES entries for why the current dropped-in GLB can't be
  // targeted by name yet.
  animatedParts: {
    tray: 'disc_slot',
    powerSwitch: 'power_button',
  },
  // Dimensions.com / gltf-transforms.ts (launch CUH-1000): 275 x 53 x 305mm.
  dimensions: { width: 275, height: 53, depth: 305 },

  variants: [],

  controllers: [
    {
      id: 'dualshock-4',
      name: 'DualShock 4 Controller',
      model: '/models/controllers/dualshock-4.glb',
      // Dimensions.com: 162mm W x 52mm H x 98mm D.
      dimensions: { width: 162, height: 52, depth: 98 },
      innovations: [
        'A touchpad above the face buttons — clickable, trackable, used for anything from menu navigation to sliding a bomb-defusal wire in specific games.',
        'A light bar on the front edge that identified players in split-screen and, in a handful of titles, changed color to reflect in-game state (health, alerts).',
        'A built-in mono speaker and a 3.5mm headphone jack, giving the pad its own audio output independent of the TV or headset dongle.',
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
        { id: 'share', mesh: 'btn_share', label: 'Share', key: 'Shift', travel: [0, -0.0006, 0], position: [-14, 10], shape: 'capsule', sizeMm: 8 },
        { id: 'options', mesh: 'btn_options', label: 'Options', key: 'Enter', travel: [0, -0.0006, 0], position: [14, 10], shape: 'capsule', sizeMm: 8 },
        { id: 'ps', mesh: 'btn_ps', label: 'PS Button', key: 'p', travel: [0, -0.0006, 0], position: [0, 10], shape: 'convex', sizeMm: 10 },
        { id: 'touchpad', mesh: 'touchpad', label: 'Touchpad', key: 't', travel: [0, -0.0008, 0], position: [0, 24], shape: 'flat', sizeMm: 55 },
        { id: 'l-stick', mesh: 'stick_l', label: 'Left Stick', key: 'a', travel: [0, 0, 0], position: [-20, -14], shape: 'stick', sizeMm: 20 },
        { id: 'r-stick', mesh: 'stick_r', label: 'Right Stick', key: 'd', travel: [0, 0, 0], position: [20, -14], shape: 'stick', sizeMm: 20 },
      ],
    },
  ],

  facts: [
    {
      id: 'rejected-drm',
      title: 'It won a generation on a policy reversal',
      body: 'Microsoft floated an always-online check-in requirement and used-game restrictions for the Xbox One before launch. Sony\'s public rejection of both at its own E3 reveal — with no changes needed to match — became one of the most consequential pieces of messaging in console history, and shaped buyer sentiment before either machine had shipped a single unit.',
    },
    {
      id: 'launch-day-million',
      title: 'A million units, one region, one day',
      body: 'The PS4 sold a million units in North America on launch day alone, a pace no previous PlayStation had matched, and followed it with 250,000 more in the UK within 48 hours.',
    },
    {
      id: 'best-selling-exclusives',
      title: 'Its exclusives sold like third-party blockbusters',
      body: 'Spider-Man, God of War and Horizon Zero Dawn each sold north of 19 million copies — first-party exclusives moving at a scale usually reserved for annualized franchises like Call of Duty.',
    },
    {
      id: 'second-best-selling-ever',
      title: 'The second-best-selling console Sony has made',
      body: 'At over 117 million units, the PS4 trails only the PS2 among every console Sony has ever released — and sits among the handful of best-selling consoles in the industry\'s entire history.',
    },
  ],

  failureStates: [
    {
      id: 'blue-line-of-death',
      name: 'Blue Line of Death',
      body: 'A GPU or motherboard fault that produces a thin blue horizontal line across the display and prevents the console from booting past its startup screen — the PS4\'s best-known hardware failure.',
      target: 'power_led',
      effect: 'blink-amber',
    },
    {
      id: 'stick-drift-ps4',
      name: 'Analog stick drift',
      body: 'Worn potentiometers in the DualShock 4\'s analog sticks register phantom input over time, a wear pattern common enough across the generation to draw class-action attention industry-wide.',
      target: 'shell',
      effect: 'dim',
    },
  ],

  diorama: {
    roomKit: 'living-2010s-na',
    footprint: [4.2, 3.6],
    props: [
      { kit: 'sofa', variant: 'grey-modern', position: [0, 0, 1.35], rotation: [0, Math.PI, 0] },
      { kit: 'rug', variant: 'geometric-90s', position: [0, 0.002, 0.55], scale: 1.15 },
      { kit: 'tv-stand', variant: 'ikea-white', position: [0, 0, -1.15] },
      { kit: 'side-table', variant: 'glass-chrome', position: [1.25, 0, 0.95] },
      { kit: 'lamp', variant: 'white-shade', position: [1.25, 0.52, 0.95] },
      { kit: 'plant', variant: 'rubber-tree', position: [1.75, 0, -1.05], scale: 1.05 },
      { kit: 'poster', variant: 'band', position: [-2.06, 1.5, -0.4], rotation: [0, Math.PI / 2, 0] },
      { kit: 'window', variant: 'blinds', position: [1.25, 1.4, -1.78] },
    ],
    tv: {
      id: 'lcd-50-2015',
      model: '/models/tvs/lcd-50.glb',
      label: '50-inch flat-panel LED, c. 2015',
      screenInches: 50,
      dimensions: { width: 1120, height: 650, depth: 45 },
      curvature: 0,
      bezelInsetMm: 14,
      aspect: '16:9',
    },
    lighting: {
      id: 'evening-2010s',
      tempK: 3600,
      intensity: 2.6,
      keyPosition: [3.4, 2.1, 1.2],
      ambientIntensity: 0.34,
      backdrop: '#eeeeea',
    },
    tvPosition: [-0.28, 0.62, -1.15],
    tvRotation: [0, 0.12, 0],
    consolePosition: [0.5, 0.5, -1.0],
    consoleRotation: [0, -0.28, 0],
    controllerPosition: [-0.18, 0.014, 0.42],
    controllerRotation: [0, 0.5, 0],
    shelfPosition: [-1.35, 0.55, -1.52],
  },

  games: [
    { rank: 1, title: 'Grand Theft Auto V', year: 2014, unitsSold: 24_660_000, developer: 'Rockstar North', publisher: 'Rockstar Games', blurb: 'A cross-generation re-release of an already record-setting game, and still the best-selling title the PS4 ever hosted.' },
    { rank: 2, title: "Marvel's Spider-Man", year: 2018, unitsSold: 22_680_000, developer: 'Insomniac Games', publisher: 'Sony Interactive Entertainment', blurb: 'Traversal built around swinging through Manhattan became the game\'s defining feeling, and a system-seller in its own right.' },
    { rank: 3, title: 'God of War', year: 2018, unitsSold: 21_020_000, developer: 'Santa Monica Studio', publisher: 'Sony Interactive Entertainment', blurb: 'A full reinvention of the series, trading arcade combat for a one-shot camera and a father-son story.' },
    { rank: 4, title: 'Horizon Zero Dawn', year: 2017, unitsSold: 19_290_000, developer: 'Guerrilla Games', publisher: 'Sony Interactive Entertainment', blurb: 'Robotic dinosaurs and a post-post-apocalyptic world from the studio previously known for Killzone.' },
    { rank: 5, title: "Uncharted 4: A Thief's End", year: 2016, unitsSold: 18_650_000, developer: 'Naughty Dog', publisher: 'Sony Interactive Entertainment', blurb: 'Closed out Nathan Drake\'s story with the series\' most technically ambitious set pieces yet.' },
    { rank: 6, title: 'The Last of Us Remastered', year: 2014, unitsSold: 18_200_000, developer: 'Naughty Dog', publisher: 'Sony Computer Entertainment', blurb: 'A PS3 game rebuilt at higher fidelity, and it found an even larger audience the second time around.' },
    { rank: 7, title: 'Minecraft: PlayStation 4 Edition', year: 2014, unitsSold: 17_000_000, developer: '4J Studios', publisher: 'Sony Computer Entertainment', blurb: 'The console port of the best-selling game of all time, proving its appeal translated to any platform it touched.' },
    { rank: 8, title: 'Call of Duty: Black Ops III', year: 2015, unitsSold: 15_000_000, developer: 'Treyarch', publisher: 'Activision', blurb: 'A fully wall-running, boost-jumping entry that leaned into the franchise\'s most futuristic era.' },
    { rank: 9, title: 'Call of Duty: WWII', year: 2017, unitsSold: 13_400_000, developer: 'Sledgehammer Games', publisher: 'Activision', blurb: 'Brought the series back to its historical roots after several straight years of near-future settings.' },
    { rank: 10, title: 'Gran Turismo Sport', year: 2017, unitsSold: 12_720_000, developer: 'Polyphony Digital', publisher: 'Sony Interactive Entertainment', blurb: 'Leaned harder into esports and online racing than any prior entry in the series.' },
  ],

  sources: [
    'https://en.wikipedia.org/wiki/PlayStation_4',
    'https://en.wikipedia.org/wiki/List_of_best-selling_PlayStation_4_video_games',
    'https://www.dimensions.com/element/dualshock-4-controller',
  ],
}
