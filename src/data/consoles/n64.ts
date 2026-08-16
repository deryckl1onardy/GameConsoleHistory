import type { ConsoleEntry } from '@/types/console'

/**
 * The last mainline Nintendo console to use cartridges, and the console
 * that put an analog stick in a controller for the first time in the
 * industry's history — a decision made specifically because cartridges
 * were too slow a medium for the 3D worlds Nintendo wanted to build, so
 * the controller had to be reinvented to move through them properly.
 *
 * Sales figures, dates and technical specs from Wikipedia (see `sources`).
 * Controller dimensions from Dimensions.com; the N64 pad's three-pronged
 * "trident" shape does not map cleanly onto a simple width/height/depth
 * box, and the mapping used here is a best approximation, not a precise
 * one.
 */
export const n64: ConsoleEntry = {
  id: 'n64',
  name: 'Nintendo 64',
  shortName: 'N64',
  manufacturer: 'Nintendo',
  generation: 5,
  released: {
    jp: '1996-06-23',
    na: '1996-09-29',
    eu: '1997-03-01',
  },
  discontinued: '2002-01-01',
  unitsSold: 32_930_000,
  msrpUsd: 199.99,
  msrpUsdAdjusted: 410,
  tagline: 'The first controller with a stick you could actually move through.',
  summary:
    'Nintendo committed to cartridges for the N64 at the exact moment the rest of the industry moved to CD — a choice that cost it Square, cost it storage capacity, and bought it load times close to zero. The console\'s real invention wasn\'t the cartridge fight, though; it was the controller. Genyo Takeda\'s team built the first analog stick ever shipped on a game controller, specifically because a D-pad could not move a character smoothly through a real 3D space, and the whole three-pronged "trident" shape existed to let one controller hold both an analog stick and a traditional D-pad without redesigning every existing 2D game\'s input scheme around it. Every analog stick on every controller made since, on any platform, descends from this one design decision.',

  specs: {
    cpu: 'NEC VR4300 (64-bit)',
    cpuClockMhz: 93.75,
    ram: '4 MB RDRAM (8 MB with the Expansion Pak)',
    ramBytes: 4_194_304,
    resolution: '256×224 up to 640×480 (most games at 320×240)',
    colors: 'Up to 16.8 million',
    audio: '16-bit, 44.1 kHz stereo, Dolby Pro Logic surround in select games',
    media: 'ROM cartridge (Game Pak), 4–64 MB; 64DD magnetic disc add-on in Japan',
  },

  relatableSpecs: [
    {
      label: 'The analog stick',
      value: 'A world first',
      comparison:
        'No controller before this one — on any console, from any company — had an analog stick. Every thumbstick on every controller made since traces back to this one design.',
    },
    {
      label: 'CPU architecture',
      value: '64-bit',
      comparison:
        'Named for its own processor width — the console\'s entire brand identity is a specification most players could not otherwise explain.',
    },
    {
      label: 'Cartridge load time',
      value: 'Near zero',
      comparison:
        'While CD-based competitors sat on loading screens, N64 cartridges read data almost instantly — the trade-off Nintendo picked storage capacity to lose.',
    },
    {
      label: 'Expansion Pak',
      value: '+4 MB RAM',
      comparison:
        'An entire memory upgrade sold as a physical cartridge-slot accessory — doubling the console\'s RAM was something you bought at a store, not a firmware update.',
    },
  ],

  mediaKind: 'cartridge',
  mediaArchetype: 'cart-n64',
  model: '/models/consoles/n64.glb',
  // Aspirational mesh targets for a future authored model -- see the
  // Atari 2600 / NES entries for why the current dropped-in GLB can't be
  // targeted by name yet.
  animatedParts: {
    slot: 'cart_slot',
    powerSwitch: 'power_switch',
    resetButton: 'reset_button',
  },
  // Wikipedia, Nintendo 64 Game Pak article context / console listings: 260mm W x 190mm D x 73mm H.
  dimensions: { width: 260, height: 73, depth: 190 },

  variants: [],

  controllers: [
    {
      id: 'n64-pad',
      name: 'Nintendo 64 Controller',
      model: '/models/controllers/n64-pad.glb',
      // Dimensions.com's own H/W/D (152.6 x 160 x 66.7mm) re-mapped for a
      // three-pronged shape that doesn't fit a simple box well: width 160
      // (prong-to-prong span), depth 152.6 (front-to-back prong length),
      // height 66.7 (thickness in the hand) — approximate, not precise.
      dimensions: { width: 160, height: 66.7, depth: 152.6 },
      innovations: [
        'The first analog stick on any game controller — built by Genyo Takeda\'s team specifically because a D-pad could not move a character smoothly through real 3D space.',
        'A three-pronged "trident" shape that let one controller hold both a D-pad and an analog stick without forcing every existing 2D input scheme to be redesigned around the new stick.',
        'The Z trigger, mounted on the underside of the centre prong — the first controller to put an input where the index finger already rested during 3D aiming.',
      ],
      buttons: [
        { id: 'dpad-up', mesh: 'dpad', label: 'D-pad Up', key: 'ArrowUp', travel: [0, -0.0008, 0], position: [-52, 10], shape: 'cross', sizeMm: 22 },
        { id: 'dpad-down', mesh: 'dpad', label: 'D-pad Down', key: 'ArrowDown', travel: [0, -0.0008, 0] },
        { id: 'dpad-left', mesh: 'dpad', label: 'D-pad Left', key: 'ArrowLeft', travel: [0, -0.0008, 0] },
        { id: 'dpad-right', mesh: 'dpad', label: 'D-pad Right', key: 'ArrowRight', travel: [0, -0.0008, 0] },
        { id: 'stick', mesh: 'analog_stick', label: 'Control Stick', key: 'w', travel: [0, 0, 0], position: [0, 20], shape: 'stick', sizeMm: 26 },
        { id: 'start', mesh: 'btn_start', label: 'Start', key: 'Enter', travel: [0, -0.0006, 0], position: [0, -4], shape: 'capsule', sizeMm: 9 },
        { id: 'a', mesh: 'btn_a', label: 'A', key: 'k', travel: [0, -0.0012, 0], position: [50, 6], shape: 'convex', sizeMm: 15 },
        { id: 'b', mesh: 'btn_b', label: 'B', key: 'j', travel: [0, -0.0012, 0], position: [38, -6], shape: 'convex', sizeMm: 12 },
        { id: 'c-up', mesh: 'btn_c_up', label: 'C-Up', key: 'i', travel: [0, -0.0008, 0], position: [64, 18], shape: 'convex', sizeMm: 9 },
        { id: 'c-down', mesh: 'btn_c_down', label: 'C-Down', key: 'comma', travel: [0, -0.0008, 0], position: [64, 2], shape: 'convex', sizeMm: 9 },
        { id: 'c-left', mesh: 'btn_c_left', label: 'C-Left', key: 'u', travel: [0, -0.0008, 0], position: [56, 10], shape: 'convex', sizeMm: 9 },
        { id: 'c-right', mesh: 'btn_c_right', label: 'C-Right', key: 'o', travel: [0, -0.0008, 0], position: [72, 10], shape: 'convex', sizeMm: 9 },
        { id: 'l', mesh: 'btn_l', label: 'L', key: 'q', travel: [0, 0, -0.0015], position: [-56, -30], shape: 'shoulder', sizeMm: 24 },
        { id: 'r', mesh: 'btn_r', label: 'R', key: 'e', travel: [0, 0, -0.0015], position: [56, -30], shape: 'shoulder', sizeMm: 24 },
        { id: 'z', mesh: 'btn_z', label: 'Z', key: 'z', travel: [0, -0.0015, 0], position: [0, -40], shape: 'trigger', sizeMm: 18 },
      ],
    },
  ],

  facts: [
    {
      id: 'first-analog-stick',
      title: 'It invented the analog stick',
      body: 'Every thumbstick on every controller made since — on PlayStation, Xbox, mobile controllers, all of it — descends from Genyo Takeda\'s design for the N64. Before this console, no home controller had ever shipped with one.',
    },
    {
      id: 'cartridges-cost-square',
      title: 'The cartridge decision cost Nintendo its biggest RPG studio',
      body: 'Square left for the PlayStation\'s CD format specifically because Final Fantasy VII needed more storage and cheaper media than N64 cartridges could offer. The game that resulted, on a rival console, became one of the best-selling RPGs of all time.',
    },
    {
      id: 'trident-shape-reason',
      title: 'The strange shape solved a real problem',
      body: 'A controller with only an analog stick would have broken every existing 2D-style game design overnight. The three-pronged trident let players grip either the D-pad-and-stick side or the stick-and-C-buttons side depending on what a given game actually needed — one controller, two effective layouts.',
    },
    {
      id: 'goldeneye-fps-standard',
      title: 'A licensed movie tie-in defined console first-person shooters',
      body: 'GoldenEye 007, built by Rare with no prior FPS experience on the team, established control conventions — aiming with C-buttons, strafing, objective-based level design — that shaped how console shooters were built for a decade afterward.',
    },
  ],

  failureStates: [
    {
      id: 'stick-wear',
      name: 'Analog stick wear',
      body: 'The N64\'s stick uses a mechanical gate with no self-centering spring assist the way later sticks do, and the plastic gear inside wears down with heavy use until the stick develops a permanent loose, wobbly drift — a fate that met an enormous number of Mario Party and GoldenEye controllers specifically.',
      target: 'shell',
      effect: 'dim',
    },
    {
      id: 'cartridge-dust',
      name: 'Cartridge slot dust buildup',
      body: 'The exposed top-loading slot collects household dust over years, producing an intermittently garbled or completely black screen on boot until the connector and cartridge edge are cleaned.',
      target: 'cart_slot',
      effect: 'screen-garbage',
    },
  ],

  diorama: {
    roomKit: 'den-90s-na',
    footprint: [4.2, 3.6],
    props: [
      { kit: 'sofa', variant: 'grey-modern', position: [0, 0, 1.35], rotation: [0, Math.PI, 0] },
      { kit: 'rug', variant: 'geometric-90s', position: [0, 0.002, 0.55], scale: 1.15 },
      { kit: 'tv-stand', variant: 'oak-veneer', position: [0, 0, -1.15] },
      { kit: 'side-table', variant: 'oak-veneer', position: [1.25, 0, 0.95] },
      { kit: 'lamp', variant: 'brass-shade', position: [1.25, 0.52, 0.95] },
      { kit: 'plant', variant: 'fern', position: [1.75, 0, -1.05], scale: 1.1 },
      { kit: 'poster', variant: 'band', position: [-2.06, 1.5, -0.4], rotation: [0, Math.PI / 2, 0] },
      { kit: 'window', variant: 'blinds', position: [1.25, 1.4, -1.78] },
    ],
    tv: {
      id: 'crt-20-1996',
      model: '/models/tvs/crt-20.glb',
      label: '20-inch consumer CRT, c. 1996',
      screenInches: 20,
      dimensions: { width: 530, height: 480, depth: 490 },
      curvature: 0.68,
      bezelInsetMm: 14,
      aspect: '4:3',
    },
    lighting: {
      id: 'evening-late-90s-2',
      tempK: 3300,
      intensity: 2.8,
      keyPosition: [3.4, 2.1, 1.2],
      ambientIntensity: 0.33,
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
    { rank: 1, title: 'Super Mario 64', year: 1996, unitsSold: 11_910_000, developer: 'Nintendo EAD', publisher: 'Nintendo', blurb: 'The launch title that defined what a 3D platformer even was, on hardware built specifically to run it.' },
    { rank: 2, title: 'Mario Kart 64', year: 1996, unitsSold: 9_870_000, developer: 'Nintendo EAD', publisher: 'Nintendo', blurb: 'Four-player split-screen racing, on a console with a controller port for every player at once.' },
    { rank: 3, title: 'GoldenEye 007', year: 1997, unitsSold: 8_090_000, developer: 'Rare', publisher: 'Nintendo', blurb: 'A licensed movie tie-in built by a team with no prior shooter experience, and one of the most influential console FPS games ever made.' },
    { rank: 4, title: 'The Legend of Zelda: Ocarina of Time', year: 1998, unitsSold: 7_600_000, developer: 'Nintendo EAD', publisher: 'Nintendo', blurb: 'Widely cited for decades as one of the greatest games ever made, and the template 3D Zelda still follows.' },
    { rank: 5, title: 'Super Smash Bros.', year: 1999, unitsSold: 5_550_000, developer: 'HAL Laboratory', publisher: 'Nintendo', blurb: 'A crossover fighting game nobody asked for that became one of Nintendo\'s biggest franchises.' },
    { rank: 6, title: 'Pokémon Stadium', year: 1999, unitsSold: 5_460_000, developer: 'Nintendo EAD / HAL Laboratory', publisher: 'Nintendo', blurb: 'Let Game Boy Pokémon battle in 3D via the Transfer Pak — a handheld franchise, finally on the TV.' },
    { rank: 7, title: 'Donkey Kong 64', year: 1999, unitsSold: 5_270_000, developer: 'Rare', publisher: 'Nintendo', blurb: 'A collectathon so dense it shipped with its own Expansion Pak requirement just to run.' },
    { rank: 8, title: 'Diddy Kong Racing', year: 1997, unitsSold: 4_880_000, developer: 'Rare', publisher: 'Rare', blurb: 'A kart racer with an adventure-game overworld wrapped around it, ambitious for a genre that rarely bothered.' },
    { rank: 9, title: 'Star Fox 64', year: 1997, unitsSold: 4_000_000, developer: 'Nintendo EAD', publisher: 'Nintendo', blurb: 'Rumble Pak support and full voice acting, both novelties for a console game in 1997.' },
    { rank: 10, title: 'Banjo-Kazooie', year: 1998, unitsSold: 3_650_000, developer: 'Rare', publisher: 'Nintendo', blurb: 'Rare\'s answer to Mario 64, and for many players the collectathon that rivaled it.' },
  ],

  sources: [
    'https://en.wikipedia.org/wiki/Nintendo_64',
    'https://en.wikipedia.org/wiki/List_of_best-selling_Nintendo_64_video_games',
    'https://www.dimensions.com/element/nintendo-64-controller',
  ],
}
