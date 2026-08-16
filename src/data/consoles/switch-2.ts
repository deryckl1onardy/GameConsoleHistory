import type { ConsoleEntry } from '@/types/console'

/**
 * The sequel to the best-selling console Nintendo has ever made, and a
 * deliberately unadventurous one: a bigger screen, considerably more power,
 * magnetic controllers, and the same idea. After the Wii-to-Wii-U collapse,
 * "the same thing but better" is itself the strategy.
 *
 * The newest entry in the atlas, and the one whose figures move fastest —
 * sales here are from its first months on sale and will date quickly. Sales
 * figures, dates and technical specs from Wikipedia (see `sources`).
 */
export const switch2: ConsoleEntry = {
  id: 'switch-2',
  name: 'Nintendo Switch 2',
  shortName: 'Switch 2',
  manufacturer: 'Nintendo',
  generation: 9,
  released: {
    jp: '2025-06-05',
    na: '2025-06-05',
    eu: '2025-06-05',
  },
  unitsSold: 23_680_000,
  msrpUsd: 449,
  msrpUsdAdjusted: 460,
  tagline: 'The same idea, sharpened.',
  summary:
    'Nintendo has a history of following a hit with something strange, and it has usually gone badly — the Wii U is the clearest example. The Switch 2 does the opposite: a 7.9-inch 1080p screen instead of a 6.2-inch 720p one, 4K when docked, magnetic Joy-Cons that attach with a satisfying snap instead of sliding down a rail, and a library that runs almost everything from the original console. The one genuinely new idea is mouse mode — set a Joy-Con on its edge on a table and it works as a mouse, which makes strategy games and shooters playable in a way no console pad manages. It sold faster in its first four days than any console in history.',

  specs: {
    cpu: 'Custom NVIDIA T239, eight ARM Cortex-A78C cores',
    cpuClockMhz: 1100,
    ram: '12 GB LPDDR5X',
    ramBytes: 12_884_901_888,
    resolution: '1920×1080 handheld, 3840×2160 docked',
    colors: '1.07 billion (HDR10)',
    audio: '3D audio, spatial sound over the built-in speakers',
    media: 'Game Card 2, up to 64 GB',
  },

  relatableSpecs: [
    {
      label: 'Launch pace',
      value: '3.5M in 4 days',
      comparison:
        'The fastest-selling console launch ever recorded, ahead of the PS4 and the original Switch. Nintendo had spent two years building stock specifically to avoid the shortages that defined the PS5\'s launch.',
    },
    {
      label: 'The screen',
      value: '7.9in, 1080p, 120 Hz',
      comparison:
        'Against the original\'s 6.2-inch 720p panel — roughly 62% more area and more than twice the pixels, on a console whose entire premise is that you look at it up close.',
    },
    {
      label: 'Mouse mode',
      value: 'A Joy-Con on its edge',
      comparison:
        'Stand a controller on a table and its optical sensor turns it into a mouse. It is the first credible answer to a problem consoles have had since the 1990s: strategy games and shooters that a thumbstick cannot really drive.',
    },
    {
      label: 'Backwards compatibility',
      value: 'Nearly the whole library',
      comparison:
        'Almost every original Switch game runs, most of them better, and the Game Cards still fit. After 150 million consoles sold, keeping that library was never really optional.',
    },
  ],

  mediaKind: 'card',
  mediaArchetype: 'switch-case',
  model: '/models/consoles/switch-2.glb',
  // Aspirational mesh targets — these name the parts the insert sequence and
  // failure states will drive once an authored model exists. Until then the
  // shell comes from the console form (see console-forms.ts), which generates
  // meshes under exactly these names. Like its predecessor, the dock-plus-
  // tablet split is the part a swept profile cannot express.
  animatedParts: {
    slot: 'card_slot',
    powerSwitch: 'power_button',
    led: 'dock_led',
  },
  // The DOCK, since that is what sits in the living room and what the diorama
  // stages: 181mm W x 116mm H x 51mm D. The tablet itself is 272 x 116 x 13.9mm.
  dimensions: { width: 181, height: 116, depth: 51 },

  variants: [],

  controllers: [
    {
      id: 'joy-con-2-pair',
      name: 'Joy-Con 2 pair (in grip)',
      model: '/models/controllers/joy-con-2-grip.glb',
      // The pair in the supplied grip: ~158mm across x 108mm front-to-back x
      // 62mm thick at the handles. Re-mapped to this project's convention:
      // width 158 (L-R), height 62 (thickness), depth 108 (front-to-back).
      dimensions: { width: 158, height: 62, depth: 108 },
      innovations: [
        'Magnetic attachment: the controllers snap onto the tablet and release with a button rather than sliding down a rail, which was the original\'s most-worn part.',
        'Mouse mode — an optical sensor on the inner edge, so standing a Joy-Con up on a table turns it into a mouse.',
        'A dedicated C button for GameChat, putting voice and screen sharing with friends into the system rather than a separate app.',
      ],
      buttons: [
        { id: 'stick-l', mesh: 'stick_l', label: 'Left stick', travel: [0, -0.001, 0], position: [-47, 18], shape: 'stick', sizeMm: 30 },
        { id: 'stick-r', mesh: 'stick_r', label: 'Right stick', travel: [0, -0.001, 0], position: [20, -16], shape: 'stick', sizeMm: 30 },
        { id: 'dpad-up', mesh: 'dpad', label: 'Up', key: 'ArrowUp', travel: [0, -0.0008, 0], position: [-20, -16], shape: 'cross', sizeMm: 23 },
        { id: 'dpad-down', mesh: 'dpad', label: 'Down', key: 'ArrowDown', travel: [0, -0.0008, 0] },
        { id: 'dpad-left', mesh: 'dpad', label: 'Left', key: 'ArrowLeft', travel: [0, -0.0008, 0] },
        { id: 'dpad-right', mesh: 'dpad', label: 'Right', key: 'ArrowRight', travel: [0, -0.0008, 0] },
        { id: 'a', mesh: 'btn_a', label: 'A', key: 'j', travel: [0, -0.0012, 0], position: [61, 18], shape: 'convex', sizeMm: 13 },
        { id: 'b', mesh: 'btn_b', label: 'B', key: 'k', travel: [0, -0.0012, 0], position: [49, 6], shape: 'convex', sizeMm: 13 },
        { id: 'x', mesh: 'btn_x', label: 'X', key: 'u', travel: [0, -0.0012, 0], position: [49, 30], shape: 'convex', sizeMm: 13 },
        { id: 'y', mesh: 'btn_y', label: 'Y', key: 'i', travel: [0, -0.0012, 0], position: [37, 18], shape: 'convex', sizeMm: 13 },
        { id: 'plus', mesh: 'btn_plus', label: '+', key: 'Enter', travel: [0, -0.0008, 0], position: [25, 34], shape: 'flat', sizeMm: 8 },
        { id: 'minus', mesh: 'btn_minus', label: '−', key: 'Backspace', travel: [0, -0.0008, 0], position: [-25, 34], shape: 'flat', sizeMm: 8 },
        { id: 'c', mesh: 'btn_c', label: 'C (GameChat)', key: 'c', travel: [0, -0.0008, 0], position: [37, -6], shape: 'flat', sizeMm: 8 },
        { id: 'trigger-l', mesh: 'trigger_l', label: 'ZL', key: 'q', travel: [0, -0.002, 0], position: [-56, 45], shape: 'trigger', sizeMm: 28 },
        { id: 'trigger-r', mesh: 'trigger_r', label: 'ZR', key: 'e', travel: [0, -0.002, 0], position: [56, 45], shape: 'trigger', sizeMm: 28 },
      ],
    },
  ],

  facts: [
    {
      id: 'iteration-not-reinvention',
      title: 'Nintendo chose not to be strange',
      body: 'Nintendo\'s pattern for thirty years was to answer a hit with something structurally different — and the Wii to Wii U transition cost it 87% of its audience. The Switch 2 is deliberately the same machine with better parts and a name that says so. For a company whose identity is built on doing the unexpected, shipping the obvious sequel was the genuinely unusual decision.',
    },
    {
      id: 'mouse-mode',
      title: 'The controller is also a mouse',
      body: 'Each Joy-Con 2 has an optical sensor on the edge that faces inward when attached. Stand the controller on its side on a table and it tracks like a mouse — which finally makes strategy games, shooters and drawing tools work properly on a console, a gap that has existed since the medium moved to living rooms.',
    },
    {
      id: 'magnets-not-rails',
      title: 'Magnets, because the rails wore out',
      body: 'The original Joy-Cons slid onto a rail, and both the rail lock and the sticks inside became the console\'s best-known faults. The Switch 2 attaches its controllers magnetically with a release button, removing the sliding mechanism entirely — a design change that reads as a direct answer to eight years of repair complaints.',
    },
    {
      id: 'fastest-launch',
      title: 'The fastest console launch ever recorded',
      body: 'Over 3.5 million units in four days, ahead of every previous console including the PS4 and the original Switch. Nintendo had spent roughly two years stockpiling hardware before launch specifically to avoid the extended shortages that shaped the PS5 and Xbox Series launches.',
    },
  ],

  failureStates: [
    {
      id: 'dock-thermal-throttle',
      name: 'Docked thermal throttling',
      body: 'The dock carries its own fan to sustain the higher docked clocks. In a poorly ventilated cabinet the console drops back toward handheld performance mid-session, and a 4K game quietly renders at a lower resolution rather than stopping.',
      target: 'dock_led',
      effect: 'dim',
    },
    {
      id: 'card-key-only',
      name: 'Game-Key Card with no game on it',
      body: 'Some retail cards are "Game-Key Cards": the cartridge holds a licence rather than the game, and the console must download the rest. Insert one without an internet connection and it will not play at all — a physical copy that is not, in itself, a copy.',
      target: 'card_slot',
      effect: 'no-signal',
    },
  ],

  diorama: {
    roomKit: 'living-2020s-na',
    footprint: [4.4, 3.8],
    props: [
      { kit: 'sofa', variant: 'corduroy-olive', position: [0, 0, 1.4], rotation: [0, Math.PI, 0] },
      { kit: 'rug', variant: 'berber-cream', position: [0, 0.002, 0.6], scale: 1.2 },
      { kit: 'tv-stand', variant: 'black-lacquer', position: [0, 0, -1.2] },
      { kit: 'side-table', variant: 'glass-chrome', position: [1.3, 0, 1.0] },
      { kit: 'lamp', variant: 'white-shade', position: [1.3, 0.52, 1.0] },
      { kit: 'plant', variant: 'rubber-tree', position: [1.8, 0, -1.1], scale: 1.05 },
      { kit: 'window', variant: 'blinds', position: [1.3, 1.4, -1.85] },
    ],
    tv: {
      id: 'oled-65-2025',
      model: '/models/tvs/oled-65.glb',
      label: '65-inch OLED, c. 2025',
      screenInches: 65,
      dimensions: { width: 1450, height: 835, depth: 42 },
      curvature: 0,
      bezelInsetMm: 3,
      aspect: '16:9',
    },
    lighting: {
      id: 'afternoon-2020s-bright',
      tempK: 4500,
      intensity: 3.0,
      keyPosition: [3.2, 2.4, 1.0],
      ambientIntensity: 0.4,
      backdrop: '#262a35',
    },
    tvPosition: [-0.3, 0.66, -1.2],
    tvRotation: [0, 0.1, 0],
    consolePosition: [0.5, 0.5, -1.05],
    consoleRotation: [0, -0.24, 0],
    controllerPosition: [-0.18, 0.014, 0.45],
    controllerRotation: [0, 0.5, 0],
    shelfPosition: [-1.4, 0.55, -1.58],
  },

  games: [
    { rank: 1, title: 'Mario Kart World', year: 2025, unitsSold: 20_620_000, developer: 'Nintendo EPD', publisher: 'Nintendo', blurb: 'The launch title and pack-in, opening the series into one continuous drivable world rather than separate tracks.' },
    { rank: 2, title: 'Donkey Kong Bananza', year: 2025, unitsSold: 3_490_000, developer: 'Nintendo EPD', publisher: 'Nintendo', blurb: 'A 3D Donkey Kong built around destroying terrain, from the team behind Super Mario Odyssey.' },
    { rank: 3, title: 'Super Mario Party Jamboree – Nintendo Switch 2 Edition', year: 2025, unitsSold: 1_950_000, developer: 'Nd Cube', publisher: 'Nintendo', blurb: 'Adds minigames built specifically around mouse mode and the console\'s camera support.' },
    { rank: 4, title: 'Kirby and the Forgotten Land – Nintendo Switch 2 Edition', year: 2025, unitsSold: 1_140_000, developer: 'HAL Laboratory', publisher: 'Nintendo', blurb: 'The Switch game rebuilt at higher resolution with a substantial new chapter attached.' },
    { rank: 5, title: 'The Legend of Zelda: Breath of the Wild – Nintendo Switch 2 Edition', year: 2025, unitsSold: 1_020_000, developer: 'Nintendo EPD', publisher: 'Nintendo', blurb: 'The 2017 game at a steady frame rate and higher resolution — its third console in eight years.' },
    { rank: 6, title: 'Cyberpunk 2077: Ultimate Edition', year: 2025, unitsSold: 900_000, developer: 'CD Projekt Red', publisher: 'CD Projekt', blurb: 'A launch-day port that served as the evidence the console could hold large third-party games.' },
    { rank: 7, title: 'Split Fiction', year: 2025, unitsSold: 780_000, developer: 'Hazelight Studios', publisher: 'Electronic Arts', blurb: 'Co-op only, with a free pass letting a second player join without buying a copy.' },
    { rank: 8, title: 'Street Fighter 6', year: 2025, unitsSold: 620_000, developer: 'Capcom', publisher: 'Capcom', blurb: 'Shipped with a mode using the Joy-Con\'s mouse sensor for a fighting game, which nobody expected to work.' },
    { rank: 9, title: 'Sid Meier\'s Civilization VII', year: 2025, unitsSold: 540_000, developer: 'Firaxis Games', publisher: '2K', blurb: 'The clearest argument for mouse mode: a strategy game that finally controls properly on a console.' },
    { rank: 10, title: 'Hogwarts Legacy', year: 2025, unitsSold: 480_000, developer: 'Avalanche Software', publisher: 'Warner Bros. Games', blurb: 'A port the original Switch could only manage via cloud streaming, running natively here.' },
  ],

  sources: [
    'https://en.wikipedia.org/wiki/Nintendo_Switch_2',
    'https://en.wikipedia.org/wiki/Joy-Con',
    'https://en.wikipedia.org/wiki/Mario_Kart_World',
    'https://en.wikipedia.org/wiki/List_of_Nintendo_Switch_2_games',
    'https://en.wikipedia.org/wiki/Nintendo_Switch_2_game_card',
  ],
}
