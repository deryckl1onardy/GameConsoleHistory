import type { ConsoleEntry } from '@/types/console'

/**
 * The console that beat Nintendo by refusing to be polite about it. Sega
 * launched two years ahead of the SNES with a faster processor and an
 * advertising campaign built entirely around attacking the market leader by
 * name — something the console industry had simply never done before.
 *
 * Sales figures, dates and technical specs from Wikipedia (see `sources`).
 * Controller dimensions from Dimensions.com, re-mapped onto this project's
 * width/thickness/depth convention (see the comment on the controller
 * entry below).
 */
export const genesis: ConsoleEntry = {
  id: 'genesis',
  name: 'Sega Genesis / Mega Drive',
  shortName: 'Genesis',
  manufacturer: 'Sega',
  generation: 4,
  released: {
    jp: '1988-10-29', // as the Mega Drive
    na: '1989-08-01',
    eu: '1990-09-01',
  },
  discontinued: '1997-01-01',
  unitsSold: 30_750_000,
  msrpUsd: 189,
  msrpUsdAdjusted: 480,
  tagline: 'Genesis does what Nintendon\'t.',
  summary:
    'Sega had a two-year head start on the SNES and a processor that was, on paper, simply faster. Under Tom Kalinske, Sega of America decided the way to spend that lead was to attack Nintendo directly, by name, in national advertising. "Genesis does what Nintendon\'t" was blunt in a market that had never been blunt before, and it worked: Sega took real market share from a company that had spent most of the decade unchallenged. The console\'s biggest weapon didn\'t exist yet at launch: Sonic the Hedgehog arrived two years in, bundled in place of the pack-in game everyone had been using, and gave the whole marketing campaign a mascot fast enough to make the point without saying a word.',

  specs: {
    cpu: 'Motorola 68000',
    cpuClockMhz: 7.6,
    ram: '64 KB work RAM, 64 KB VRAM, 8 KB audio RAM',
    ramBytes: 65_536,
    resolution: '320×224 or 256×224 (NTSC)',
    colors: '61 on screen from a palette of 512',
    audio: 'Yamaha YM2612 FM synthesis + Texas Instruments SN76489 PSG',
    media: 'ROM cartridge',
  },

  relatableSpecs: [
    {
      label: 'CPU clock speed',
      value: '7.6 MHz',
      comparison:
        'More than twice the SNES\'s 3.58 MHz: the entire "Sega is faster" marketing claim was, on this one number, simply true.',
    },
    {
      label: 'The tagline',
      value: '"...Nintendon\'t"',
      comparison:
        'The first time a console maker had named its market leader in an ad, rather than talking around it: an entire genre of confrontational tech marketing traces back to this one campaign.',
    },
    {
      label: 'Sonic, the pack-in',
      value: '15M sold',
      comparison:
        'Bundling a fast platformer instead of a launch-era arcade port doubled as a technology demo: the whole game was built to prove the hardware could keep up with its own mascot.',
    },
    {
      label: 'FM synthesis chip',
      value: 'Yamaha YM2612',
      comparison:
        'The same family of chip used in real electronic keyboards of the era: the Genesis sound library is full of tones that were never designed for a game console at all.',
    },
  ],

  mediaKind: 'cartridge',
  mediaArchetype: 'cart-genesis',
  model: '/models/consoles/genesis.glb',
  // Measured against the actual rendered GLB — see snes.ts's hardwareDiagram
  // comment for the method. The render (272 x 60 x 207mm) matches the real
  // Model 1 closely (~5% per gltf-transforms.ts), so anchors track the render
  // box recorded below.
  hardwareDiagram: {
    renderBox: { x: [-0.1362, 0.1362], y: [0, 0.0604], z: [-0.1037, 0.1037] },
    callouts: [
      {
        label: 'Power switch: front left',
        anchor: [-0.1, 0.045, 0.07],
        labelOffset: [-0.035, 0.045, 0.005],
      },
      {
        label: 'Reset button: front right',
        anchor: [0.1, 0.045, 0.07],
        labelOffset: [0.035, 0.045, 0.005],
      },
      {
        label: 'Cartridge slot: top, toward the back',
        anchor: [0, 0.058, -0.05],
        labelOffset: [0, 0.03, -0.01],
      },
      {
        label: 'Controller ports (×3): across the front bottom',
        anchor: [0, 0.013, 0.102],
        labelOffset: [0, 0.03, 0.01],
      },
    ],
  },
  // Aspirational mesh targets for a future authored model -- see the
  // Atari 2600 / NES entries for why the current dropped-in GLB can't be
  // targeted by name yet.
  animatedParts: {
    slot: 'cart_slot',
    powerSwitch: 'power_switch',
    resetButton: 'reset_button',
  },
  // Dimensions.com: 278.1mm W x 57.2mm H x 214.6mm D (Model 1).
  dimensions: { width: 278.1, height: 57.2, depth: 214.6 },

  variants: [],

  controllers: [
    {
      id: 'genesis-pad',
      name: 'Genesis 3-Button Control Pad',
      model: '/models/controllers/genesis-pad.glb',
      // Dimensions.com's own axes (98 x 165 x 40.6mm) don't match this
      // project's width/thickness/depth convention for a flat handheld
      // pad — re-mapped: width 165 (L-R, the largest value), height 40.6
      // (thickness, the smallest), depth 98 (front-to-back in the hand).
      dimensions: { width: 165, height: 40.6, depth: 98 },
      innovations: [
        'Three face buttons in a row (A, B, C) instead of two: built for the arcade-style games Sega\'s own arcade division was already making.',
        'A rounded, contoured "wing" grip shape, a real departure from the flat rectangular brick every 8-bit pad before it had used.',
      ],
      buttons: [
        { id: 'dpad-up', mesh: 'dpad', label: 'D-pad Up', key: 'ArrowUp', travel: [0, -0.0008, 0], position: [-42, 0], shape: 'cross', sizeMm: 26 },
        { id: 'dpad-down', mesh: 'dpad', label: 'D-pad Down', key: 'ArrowDown', travel: [0, -0.0008, 0] },
        { id: 'dpad-left', mesh: 'dpad', label: 'D-pad Left', key: 'ArrowLeft', travel: [0, -0.0008, 0] },
        { id: 'dpad-right', mesh: 'dpad', label: 'D-pad Right', key: 'ArrowRight', travel: [0, -0.0008, 0] },
        { id: 'a', mesh: 'btn_a', label: 'A', key: 'j', travel: [0, -0.0012, 0], position: [30, 14], shape: 'convex', sizeMm: 13 },
        { id: 'b', mesh: 'btn_b', label: 'B', key: 'k', travel: [0, -0.0012, 0], position: [44, 6], shape: 'convex', sizeMm: 13 },
        { id: 'c', mesh: 'btn_c', label: 'C', key: 'l', travel: [0, -0.0012, 0], position: [58, -3], shape: 'convex', sizeMm: 13 },
        { id: 'start', mesh: 'btn_start', label: 'Start', key: 'Enter', travel: [0, -0.0008, 0], position: [44, 22], shape: 'capsule', sizeMm: 9 },
      ],
    },
  ],

  facts: [
    {
      id: 'attack-ads',
      title: 'It said the competitor\'s name on television',
      body: 'Before "Genesis does what Nintendon\'t," console advertising simply did not name the competition. Tom Kalinske\'s marketing team broke that norm deliberately, and it defined an entire era of tech advertising that followed: attacking a market leader by name became a normal thing to do only after Sega proved it worked.',
    },
    {
      id: 'sonic-mid-cycle',
      title: 'The mascot arrived two years late, on purpose',
      body: 'Sonic the Hedgehog did not launch with the console: it replaced Altered Beast as the pack-in game in 1991, two years into the Genesis\'s life, once Sega had a character built specifically to demonstrate the hardware\'s speed. Swapping the bundled game mid-cycle was itself unusual; doing it to double as a walking tech demo was more unusual still.',
    },
    {
      id: 'two-year-head-start',
      title: 'A two-year head start Nintendo had to answer from behind',
      body: 'The Genesis reached Japan in October 1988 and North America the following August, nearly two full years before the SNES existed anywhere. It is the only console generation in which Nintendo entered as the follower rather than the incumbent.',
    },
    {
      id: 'faster-chip-real-claim',
      title: 'The marketing claim was also just true',
      body: 'At 7.6 MHz, the Genesis\'s Motorola 68000 ran at more than double the SNES\'s clock speed. Sega\'s advertising leaned hard on raw speed as a selling point specifically because, unlike most console marketing hyperbole, the number backing it up was real.',
    },
  ],

  failureStates: [
    {
      id: 'sega-scream-static',
      name: 'Cartridge connector static',
      body: 'A worn 64-pin cartridge connector produces the same corrupted-graphics symptom nearly every cartridge console of this era shared: flickering, scrambled sprites, or a game that hangs at boot until reseated.',
      target: 'cart_slot',
      effect: 'screen-garbage',
    },
    {
      id: 'ym2612-drift',
      name: 'Sound chip degradation',
      body: 'Capacitors around the YM2612 FM synthesis chip age and dry out over decades, and the console\'s music slowly drifts from crisp synthesizer tones toward muffled, distorted or silent audio, a slow failure many owners do not notice until it is already severe.',
      target: 'shell',
      effect: 'dim',
    },
  ],

  diorama: {
    roomKit: 'den-90s-na',
    footprint: [4.2, 3.6],
    props: [
      { kit: 'sofa', variant: 'corduroy-olive', position: [0, 0, 1.35], rotation: [0, Math.PI, 0] },
      { kit: 'rug', variant: 'geometric-90s', position: [0, 0.002, 0.55], scale: 1.15 },
      { kit: 'tv-stand', variant: 'black-lacquer', position: [0, 0, -1.15] },
      { kit: 'side-table', variant: 'glass-chrome', position: [1.25, 0, 0.95] },
      { kit: 'lamp', variant: 'brass-shade', position: [1.25, 0.52, 0.95] },
      { kit: 'plant', variant: 'rubber-tree', position: [1.75, 0, -1.05], scale: 1.1 },
      { kit: 'poster', variant: 'band', position: [-2.06, 1.5, -0.4], rotation: [0, Math.PI / 2, 0] },
      { kit: 'window', variant: 'blinds', position: [1.25, 1.4, -1.78] },
    ],
    tv: {
      id: 'crt-20-1990',
      model: '/models/tvs/crt-20.glb',
      label: '20-inch consumer CRT, c. 1990',
      screenInches: 20,
      dimensions: { width: 530, height: 480, depth: 490 },
      curvature: 0.72,
      bezelInsetMm: 14,
      aspect: '4:3',
    },
    lighting: {
      id: 'evening-90s',
      tempK: 3100,
      intensity: 2.9,
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
    { rank: 1, title: 'Sonic the Hedgehog', year: 1991, unitsSold: 15_000_000, developer: 'Sonic Team', publisher: 'Sega', blurb: 'Replaced the launch pack-in game two years into the console\'s life, and became the reason most people remember the Genesis at all.' },
    { rank: 2, title: 'Sonic the Hedgehog 2', year: 1992, unitsSold: 7_550_000, developer: 'Sonic Team', publisher: 'Sega', blurb: 'Added Tails and the spin dash, and shipped alongside a genuinely global simultaneous release event: "Sonic 2sday."' },
    { rank: 3, title: 'Sonic the Hedgehog 3 & Knuckles', year: 1994, unitsSold: 6_000_000, developer: 'Sonic Team', publisher: 'Sega', blurb: 'Originally one game, split in two by disc-cost and deadline pressure, then reunited by a cartridge that could physically lock onto its predecessor.' },
    { rank: 4, title: 'Mortal Kombat', year: 1993, unitsSold: 4_330_000, developer: 'Probe Entertainment', publisher: 'Acclaim', blurb: 'Sold with its blood intact via a cheat code, while the SNES version shipped censored, a real reason some households picked Sega.' },
    { rank: 5, title: 'Disney\'s Aladdin', year: 1993, unitsSold: 4_000_000, developer: 'Virgin Games', publisher: 'Sega', blurb: 'Animated in part by actual Disney animators, and widely considered to have beaten its SNES counterpart on visuals alone.' },
    { rank: 6, title: 'Sonic Spinball', year: 1993, unitsSold: 3_200_000, developer: 'Sega Technical Institute', publisher: 'Sega', blurb: 'A pinball game wearing a platformer\'s mascot, built fast to fill a holiday release gap.' },
    { rank: 7, title: 'Streets of Rage 2', year: 1992, unitsSold: 2_500_000, developer: 'Sega', publisher: 'Sega', blurb: 'A beat-em-up soundtrack so good it is still cited as one of the finest FM-synth scores ever written for a console.' },
    { rank: 8, title: 'John Madden Football \'93', year: 1992, unitsSold: 2_200_000, developer: 'EA Sports', publisher: 'Electronic Arts', blurb: 'The Genesis, not the SNES, was where EA Sports built its early sports-game dominance.' },
    { rank: 9, title: 'NBA Jam', year: 1993, unitsSold: 2_000_000, developer: 'Iguana Entertainment', publisher: 'Acclaim', blurb: 'Arcade two-on-two basketball, "he\'s on fire" and all, ported nearly intact.' },
    { rank: 10, title: 'Golden Axe', year: 1989, unitsSold: 1_800_000, developer: 'Sega', publisher: 'Sega', blurb: 'A launch-window arcade brawler that helped define what "a Genesis game" felt like before Sonic existed.' },
  ],

  sources: [
    'https://en.wikipedia.org/wiki/Sega_Genesis',
    'https://en.wikipedia.org/wiki/List_of_best-selling_Sega_Genesis_games',
    'https://en.wikipedia.org/wiki/Tom_Kalinske',
    'https://www.dimensions.com/element/sega-genesis',
    'https://www.dimensions.com/element/sega-genesis-controller-3-button',
  ],
}
