import type { ConsoleEntry } from '@/types/console'

/**
 * Launched at $499–$599 into a firestorm over its own price, carrying a
 * genuinely exotic processor that took years for most studios to use well.
 * It lost the early sales race badly, then clawed back with exclusives and
 * cheaper hardware revisions until it closed out competitive with the
 * generation it started behind in.
 *
 * Sales figures, dates and technical specs from Wikipedia (see `sources`).
 * Controller modelled is the DualShock 3, the pad standardized across the
 * console's life once Sony restored rumble to the original Sixaxis design.
 */
export const ps3: ConsoleEntry = {
  id: 'ps3',
  name: 'PlayStation 3',
  shortName: 'PS3',
  manufacturer: 'Sony',
  generation: 7,
  released: {
    jp: '2006-11-11',
    na: '2006-11-17',
    eu: '2007-03-23',
  },
  discontinued: '2017-05-29',
  unitsSold: 87_400_000,
  msrpUsd: 599.99,
  msrpUsdAdjusted: 900,
  tagline: 'The most expensive console launch Sony ever ran, and the one that took the longest to win back.',
  summary:
    'A $499 base model and a $599 flagship model made the PlayStation 3 the most expensive console launch of its generation, at a moment Sony itself admitted it was losing money on every unit sold. The Cell Broadband Engine inside it was a genuinely unusual piece of silicon, co-developed with IBM and Toshiba, and it took years before most studios learned to extract its real performance. Early sales trailed the Xbox 360 badly. By the time Sony had cut the price twice and shipped a slimmer, cheaper redesign, exclusives like Uncharted, The Last of Us and Metal Gear Solid 4 had turned the reputation around: the console closed out its eleven-year run essentially even with the generation it opened behind in.',

  specs: {
    cpu: 'Cell Broadband Engine',
    cpuClockMhz: 3200,
    ram: '256 MB XDR DRAM (system) + 256 MB GDDR3 (graphics)',
    ramBytes: 536_870_912,
    resolution: 'Up to 1080p',
    colors: '16.7 million (RSX "Reality Synthesizer" GPU @ 500 MHz)',
    audio: 'Dolby Digital, DTS, up to 7.1 channel LPCM',
    media: 'Blu-ray Disc, DVD, CD',
  },

  relatableSpecs: [
    {
      label: 'Launch price',
      value: '$499 / $599',
      comparison:
        'The most expensive console launch of its generation: Sony has said it lost money on every unit sold at that price, betting the loss back on software and the Blu-ray format.',
    },
    {
      label: 'Cell processor',
      value: 'Co-developed with IBM and Toshiba',
      comparison:
        'An architecture unlike anything in a home console before or since: powerful on paper, but so unusual that most studios took years to figure out how to use it well.',
    },
    {
      label: 'Built-in Blu-ray player',
      value: 'Helped win the format war',
      comparison:
        'The PS3 becoming a cheap way to own a Blu-ray player is widely credited as a deciding factor in Blu-ray beating HD DVD outright.',
    },
    {
      label: 'Eleven-year production run',
      value: '2006 to 2017',
      comparison:
        'Sony kept making PS3 units for over a decade: long enough to open the generation behind and still close it out selling in the same range as its rival.',
    },
  ],

  mediaKind: 'optical',
  mediaArchetype: 'bluray-case',
  model: '/models/consoles/ps3.glb',
  // Measured against the actual rendered GLB — see snes.ts's hardwareDiagram
  // comment for the method. Best fit of the batch (~2% per gltf-transforms.ts);
  // anchors track the render box recorded below.
  hardwareDiagram: {
    renderBox: { x: [-0.139, 0.139], y: [0, 0.096], z: [-0.1635, 0.1635] },
    callouts: [
      {
        label: 'Disc slot: front, right of centre',
        anchor: [0.03, 0.055, 0.162],
        labelOffset: [0.035, 0.04, 0.005],
      },
      {
        label: 'USB + memory card slots: front left',
        anchor: [-0.09, 0.03, 0.162],
        labelOffset: [-0.035, 0.04, 0.005],
      },
      {
        label: 'Touch power button: front right',
        anchor: [0.12, 0.078, 0.162],
        labelOffset: [0.03, 0.035, 0.005],
      },
      {
        label: 'Eject: below the power button',
        anchor: [0.12, 0.05, 0.162],
        labelOffset: [0.03, 0.04, 0.005],
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
  // Dimensions.com / gltf-transforms.ts (fat CECHA01 launch model): 325 x 98 x 274mm.
  dimensions: { width: 325, height: 98, depth: 274 },

  variants: [],

  controllers: [
    {
      id: 'dualshock-3',
      name: 'DualShock 3 Controller',
      model: '/models/controllers/dualshock-3.glb',
      // Dimensions.com: 160mm W x 97mm H x 55mm D.
      dimensions: { width: 160, height: 55, depth: 97 },
      innovations: [
        'Sixaxis motion sensing built into the same shell: the first PlayStation pad that could read tilt and rotation, not just button presses.',
        'Rumble returned after a one-year absence (dropped from the launch Sixaxis pad over a patent dispute with Immersion), restoring force feedback without giving up the motion sensor.',
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
        { id: 'ps', mesh: 'btn_ps', label: 'PS Button', key: 'p', travel: [0, -0.0006, 0], position: [0, 10], shape: 'convex', sizeMm: 10 },
        { id: 'l-stick', mesh: 'stick_l', label: 'Left Stick', key: 'a', travel: [0, 0, 0], position: [-20, -14], shape: 'stick', sizeMm: 20 },
        { id: 'r-stick', mesh: 'stick_r', label: 'Right Stick', key: 'd', travel: [0, 0, 0], position: [20, -14], shape: 'stick', sizeMm: 20 },
      ],
    },
  ],

  facts: [
    {
      id: 'losing-money-per-unit',
      title: 'Sony lost money on every console sold',
      body: 'The $499 and $599 launch prices didn\'t cover manufacturing cost: Sony has publicly acknowledged taking a loss on PS3 hardware for years after launch, betting it back on software sales and licensing.',
    },
    {
      id: 'cell-processor',
      title: 'A processor built with IBM and Toshiba',
      body: 'The Cell Broadband Engine was co-developed across three companies and used an architecture unlike any prior console chip: one general-purpose core plus eight specialized "synergistic" cores. It was powerful in the right hands, but so unusual that many studios spent years learning to use it well.',
    },
    {
      id: 'blu-ray-format-war',
      title: 'It helped decide the Blu-ray vs. HD DVD war',
      body: 'Bundling a Blu-ray player into every console at a price cheaper than most standalone players put Blu-ray players in millions of living rooms almost overnight, widely credited as a deciding factor in Blu-ray winning the format war against HD DVD.',
    },
    {
      id: 'rumble-came-back',
      title: 'The first PS3 pads couldn\'t rumble',
      body: 'The launch Sixaxis controller dropped force feedback entirely, reportedly due to a patent dispute with Immersion Corporation and to make room for its new motion sensor. Rumble returned about a year later with the DualShock 3, which kept the motion sensing and added the vibration motors back in.',
    },
  ],

  failureStates: [
    {
      id: 'yellow-light-of-death',
      name: 'Yellow Light of Death',
      body: 'A hardware fault (commonly traced to solder joints cracking under heat cycling on early "fat" models) that flashes the power LED yellow before the console refuses to boot, PS3\'s equivalent of the Xbox 360\'s Red Ring of Death.',
      target: 'power_led',
      effect: 'blink-amber',
    },
    {
      id: 'bluray-laser-wear',
      name: 'Blu-ray laser wear',
      body: 'The optical laser assembly degrades with age and heavy use, producing longer load times and eventual disc read failures, a wear pattern shared with every optical-drive console before it.',
      target: 'lid',
      effect: 'no-signal',
    },
  ],

  diorama: {
    roomKit: 'den-2000s-na',
    footprint: [4.2, 3.6],
    props: [
      { kit: 'sofa', variant: 'grey-modern', position: [0, 0, 1.35], rotation: [0, Math.PI, 0] },
      { kit: 'rug', variant: 'geometric-90s', position: [0, 0.002, 0.55], scale: 1.15 },
      { kit: 'tv-stand', variant: 'black-lacquer', position: [0, 0, -1.15] },
      { kit: 'side-table', variant: 'glass-chrome', position: [1.25, 0, 0.95] },
      { kit: 'lamp', variant: 'brass-shade', position: [1.25, 0.52, 0.95] },
      { kit: 'plant', variant: 'fern', position: [1.75, 0, -1.05], scale: 1.05 },
      { kit: 'poster', variant: 'arcade', position: [-2.06, 1.5, -0.4], rotation: [0, Math.PI / 2, 0] },
      { kit: 'window', variant: 'curtains', position: [1.25, 1.4, -1.78] },
    ],
    tv: {
      id: 'lcd-40-2008',
      model: '/models/tvs/lcd-40.glb',
      label: '40-inch flat-panel LCD, c. 2008',
      screenInches: 40,
      dimensions: { width: 960, height: 570, depth: 60 },
      curvature: 0,
      bezelInsetMm: 22,
      aspect: '16:9',
    },
    lighting: {
      id: 'evening-2000s',
      tempK: 3400,
      intensity: 2.7,
      keyPosition: [3.4, 2.1, 1.2],
      ambientIntensity: 0.32,
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
    { rank: 1, title: 'Grand Theft Auto V', year: 2013, unitsSold: 29_520_000, developer: 'Rockstar North', publisher: 'Rockstar Games', blurb: 'Released in the console\'s twilight years and still became its best-selling game by a wide margin.' },
    { rank: 2, title: 'Gran Turismo 5', year: 2010, unitsSold: 11_950_000, developer: 'Polyphony Digital', publisher: 'Sony Computer Entertainment', blurb: 'A five-year development cycle produced over 1,000 cars and the series\' best-selling entry on PS3.' },
    { rank: 3, title: "Uncharted 3: Drake's Deception", year: 2011, unitsSold: 9_000_000, developer: 'Naughty Dog', publisher: 'Sony Computer Entertainment', blurb: 'The series\' cinematic set-piece design at its most ambitious, capping the trilogy\'s PS3 run.' },
    { rank: 4, title: 'The Last of Us', year: 2013, unitsSold: 8_400_000, developer: 'Naughty Dog', publisher: 'Sony Computer Entertainment', blurb: 'A late-generation release that became one of the most acclaimed games of the era, on hardware seven years old by then.' },
    { rank: 5, title: 'Uncharted 2: Among Thieves', year: 2009, unitsSold: 6_500_000, developer: 'Naughty Dog', publisher: 'Sony Computer Entertainment', blurb: 'Widely credited as the game that proved the Cell processor\'s potential once studios learned to use it.' },
    { rank: 6, title: 'Metal Gear Solid 4: Guns of the Patriots', year: 2008, unitsSold: 6_000_000, developer: 'Kojima Productions', publisher: 'Konami', blurb: 'A PS3 console exclusive that closed out Solid Snake\'s storyline across a disc-swapping, cutscene-heavy epic.' },
    { rank: 7, title: 'Batman: Arkham City', year: 2011, unitsSold: 5_480_000, developer: 'Rocksteady Studios', publisher: 'Warner Bros. Games', blurb: 'Expanded the freeform combat and stealth of Arkham Asylum into a full open district of Gotham.' },
    { rank: 8, title: 'Gran Turismo 5 Prologue', year: 2007, unitsSold: 5_350_000, developer: 'Polyphony Digital', publisher: 'Sony Computer Entertainment', blurb: 'A paid preview build that outsold most full games of its era while fans waited years for the real Gran Turismo 5.' },
    { rank: 9, title: 'Gran Turismo 6', year: 2013, unitsSold: 5_220_000, developer: 'Polyphony Digital', publisher: 'Sony Computer Entertainment', blurb: 'Released after the PS4 had already launched, still moved millions on the console it was built for.' },
    { rank: 10, title: 'God of War III', year: 2010, unitsSold: 5_180_000, developer: 'Santa Monica Studio', publisher: 'Sony Computer Entertainment', blurb: 'Kratos\'s finale against the Greek pantheon, built as a technical showcase for the hardware\'s late-cycle ceiling.' },
  ],

  sources: [
    'https://en.wikipedia.org/wiki/PlayStation_3',
    'https://en.wikipedia.org/wiki/List_of_best-selling_PlayStation_3_video_games',
    'https://www.dimensions.com/element/dualshock-3-controller',
    'https://en.wikipedia.org/wiki/DualShock',
  ],
}
