import type { ConsoleEntry } from '@/types/console'

/**
 * The console that lost the US and won Brazil. Sega's 8-bit machine had
 * better hardware than the NES on paper — a faster VDP, more colours, a
 * cartridge slot AND a card slot — and it barely dented Nintendo's American
 * market because Nintendo's publisher contracts made "supporting Sega too"
 * something most studios simply weren't allowed to do. In Brazil, where
 * Nintendo never properly launched, it became the console instead — and
 * Tectoy still manufactures new units there today, in 2026, thirty-nine
 * years after release.
 *
 * Sales figures, dates and technical specs from Wikipedia (see `sources`).
 * Individual game sales for this console are comparatively undocumented —
 * where Wikipedia's own best-selling-NES-games table lists exact figures
 * sourced to Nintendo's own investor data, no equivalent exists for the
 * Master System. The games list below uses widely-cited retro-market
 * estimates rather than a single authoritative source; flagged here rather
 * than presented with false precision.
 */
export const masterSystem: ConsoleEntry = {
  id: 'master-system',
  name: 'Sega Master System',
  shortName: 'Master System',
  manufacturer: 'Sega',
  generation: 3,
  released: {
    jp: '1987-10-18', // as the Sega Mark III's successor
    na: '1986-09-01',
    eu: '1987-08-01',
  },
  discontinued: '1996-01-01',
  unitsSold: 13_000_000,
  msrpUsd: 200,
  msrpUsdAdjusted: 590,
  tagline: 'Better hardware. Worse contracts. It lost the war it should have won.',
  summary:
    'On paper the Master System beat the NES: a faster Zilog Z80A, more colours on screen, a proper FM sound chip available in Japan, and two ways to load software instead of one. It still barely registered in the United States, because Nintendo\'s publisher licensing terms effectively forced studios to choose sides: support the NES exclusively or risk losing access to it altogether, and the NES was the market that mattered. Sega placed second in a two-console race it had the hardware to win. Then Brazil happened: Nintendo never properly launched there, Tectoy became Sega\'s official partner, and the Master System became the definitive console of an entire country. It never stopped being made. Tectoy is still manufacturing new units in 2026.',

  specs: {
    cpu: 'Zilog Z80A',
    cpuClockMhz: 3.58,
    ram: '8 KB RAM, 16 KB VRAM',
    ramBytes: 8192,
    resolution: '256×192',
    colors: '32 on screen from a palette of 64',
    audio: 'Texas Instruments SN76489 PSG (Yamaha YM2413 FM chip standard in Japan)',
    media: 'ROM cartridge or Sega Card',
  },

  relatableSpecs: [
    {
      label: 'Two ways to load a game',
      value: 'Cartridge + Sega Card',
      comparison:
        'The credit-card-thin Sega Card was cheaper to manufacture than a cartridge shell, meant for budget titles: an idea Nintendo would not revisit until the Switch, four decades later.',
    },
    {
      label: 'CPU clock speed',
      value: '3.58 MHz',
      comparison:
        'Twice the clock speed of the NES sitting across the console war from it: the Master System was, quite literally, the faster chip.',
    },
    {
      label: 'FM sound chip',
      value: 'Standard in Japan only',
      comparison:
        'Japanese owners got a genuine synthesizer chip for music; everyone else got the same PSG beeper the NES used, because Sega cut the cost overseas.',
    },
    {
      label: 'Still in production',
      value: '39 years',
      comparison:
        'Tectoy is manufacturing brand-new Master System units in Brazil in 2026, the same year this sentence was written.',
    },
  ],

  // The retail unit is the printed cardboard box the cartridge ships
  // inside, not the bare cartridge shell — see box-sms in
  // media-archetypes.ts for the measured proportions and why 'card' (not
  // 'cartridge') is the right kind for it.
  mediaKind: 'card',
  mediaArchetype: 'box-sms',
  model: '/models/consoles/master-system.glb',
  // Measured against the actual rendered GLB — see snes.ts's hardwareDiagram
  // comment for the method. The render (354 x 72 x 169mm) matches the real
  // console closely (~3.6% per gltf-transforms.ts). The model names its
  // cartridge lid mesh (`sms_lid`), which sits on the top-right toward the
  // back — that anchor is measured from the mesh, not guessed.
  hardwareDiagram: {
    renderBox: { x: [-0.177, 0.177], y: [0, 0.0716], z: [-0.0845, 0.0845] },
    callouts: [
      {
        label: 'Card slot: the deep recess on the front',
        anchor: [0.1, 0.04, 0.083],
        labelOffset: [0.035, 0.045, 0.005],
      },
      {
        label: 'Controller ports (×2): front left',
        anchor: [-0.1, 0.025, 0.075],
        labelOffset: [-0.035, 0.04, 0.005],
      },
      {
        label: 'Cartridge slot: on the top, right side',
        anchor: [0.06, 0.069, -0.042],
        labelOffset: [0.03, 0.03, -0.01],
      },
      {
        label: 'Power switch: right side',
        anchor: [0.15, 0.05, 0.03],
        labelOffset: [0.03, 0.035, 0.01],
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
  // Dimensions.com / community consensus: 365mm W x 69mm H x 170mm D.
  dimensions: { width: 365, height: 69, depth: 170 },

  variants: [],

  controllers: [
    {
      id: 'sms-pad',
      name: 'Master System Control Pad',
      model: '/models/controllers/sms-pad.glb',
      // No published exact dimensions found — estimated from its
      // description as a compact rectangular pad similar in scale to the
      // contemporary NES controller. Flagged approximate rather than cited.
      dimensions: { width: 120, height: 20, depth: 55 },
      innovations: [
        'A rounder, more disc-like D-pad than the NES\'s sharp cross: aimed at arcade-style precision, though it read as "mushy" to many players used to Nintendo\'s tighter cross.',
        'No Start or Select: the console\'s own Pause button on the front of the shell did that job instead, keeping the pad itself to just direction and two buttons.',
      ],
      buttons: [
        { id: 'dpad-up', mesh: 'dpad', label: 'D-pad Up', key: 'ArrowUp', travel: [0, -0.0008, 0], position: [-35, 0], shape: 'cross', sizeMm: 24 },
        { id: 'dpad-down', mesh: 'dpad', label: 'D-pad Down', key: 'ArrowDown', travel: [0, -0.0008, 0] },
        { id: 'dpad-left', mesh: 'dpad', label: 'D-pad Left', key: 'ArrowLeft', travel: [0, -0.0008, 0] },
        { id: 'dpad-right', mesh: 'dpad', label: 'D-pad Right', key: 'ArrowRight', travel: [0, -0.0008, 0] },
        { id: '1', mesh: 'btn_1', label: '1', key: 'k', travel: [0, -0.0012, 0], position: [38, 10], shape: 'convex', sizeMm: 13 },
        { id: '2', mesh: 'btn_2', label: '2', key: 'l', travel: [0, -0.0012, 0], position: [52, -4], shape: 'convex', sizeMm: 13 },
      ],
    },
  ],

  facts: [
    {
      id: 'licensing-lockout',
      title: 'It lost on contracts, not hardware',
      body: 'Nintendo\'s publisher agreements required a degree of NES exclusivity that made supporting the Master System commercially risky for third parties: with the NES holding the overwhelming majority of the US market, most studios simply didn\'t. Sega had the faster chip and lost anyway.',
    },
    {
      id: 'brazil-forever',
      title: 'Brazil is where this console actually won',
      body: 'Nintendo never established an official presence in Brazil during the 8-bit era. Sega licensed the console to Tectoy, a local toy company, and the Master System became Brazil\'s default home console: a market Sega owned so completely that Tectoy is still building new hardware for it decades after every other Master System on Earth went out of production.',
    },
    {
      id: 'fm-chip-japan-only',
      title: 'Japanese owners heard a different console',
      body: 'The Japanese Master System shipped with a built-in Yamaha YM2413 FM synthesis chip as standard, giving its games genuinely richer music than the beeps and squares every other region got from the base PSG sound chip alone, the same soundtrack, playing on fundamentally different hardware, depending only on where you bought the console.',
    },
    {
      id: 'better-specs-worse-outcome',
      title: 'The more powerful console came second',
      body: 'Double the NES\'s clock speed, more simultaneous colours, and two media formats instead of one: the Master System was the technically superior machine of its generation almost across the board. It is one of the clearest examples in the industry\'s history that winning a console war is a distribution and licensing problem first, and a hardware problem a distant second.',
    },
  ],

  failureStates: [
    {
      id: 'vdp-color-bleed',
      name: 'VDP colour bleed',
      body: 'A degrading video display processor or a failing RF modulator produces streaking, colour bleed and horizontal noise across the picture, a slow failure that many units display for months before finally refusing to output a usable image at all.',
      target: 'shell',
      effect: 'screen-garbage',
    },
    {
      id: 'card-slot-corrosion',
      name: 'Card-edge corrosion',
      body: 'The thin card-edge contacts on both the cartridge slot and the rarely-used Sega Card slot corrode with age, producing the same garbled-boot symptom as a dirty NES connector: reseating usually clears it, permanently fixing it does not.',
      target: 'cart_slot',
      effect: 'screen-garbage',
    },
  ],

  diorama: {
    roomKit: 'living-80s-na',
    footprint: [4.2, 3.6],
    props: [
      { kit: 'sofa', variant: 'leather-black', position: [0, 0, 1.35], rotation: [0, Math.PI, 0] },
      { kit: 'rug', variant: 'geometric-90s', position: [0, 0.002, 0.55], scale: 1.15 },
      { kit: 'tv-stand', variant: 'black-lacquer', position: [0, 0, -1.15] },
      { kit: 'side-table', variant: 'glass-chrome', position: [1.25, 0, 0.95] },
      { kit: 'lamp', variant: 'white-shade', position: [1.25, 0.52, 0.95] },
      { kit: 'plant', variant: 'fern', position: [1.75, 0, -1.05], scale: 1.05 },
      { kit: 'poster', variant: 'arcade', position: [-2.06, 1.5, -0.4], rotation: [0, Math.PI / 2, 0] },
      { kit: 'window', variant: 'blinds', position: [1.25, 1.4, -1.78] },
    ],
    tv: {
      id: 'crt-20-1987',
      model: '/models/tvs/crt-20.glb',
      label: '20-inch consumer CRT, c. 1987',
      screenInches: 20,
      dimensions: { width: 530, height: 480, depth: 490 },
      curvature: 0.72,
      bezelInsetMm: 14,
      aspect: '4:3',
    },
    lighting: {
      id: 'afternoon-80s-cool',
      tempK: 3600,
      intensity: 2.8,
      keyPosition: [3.4, 2.1, 1.2],
      ambientIntensity: 0.34,
      backdrop: '#eeeeea',
    },
    tvPosition: [-0.28, 0.5, -1.15],
    tvRotation: [0, 0.12, 0],
    consolePosition: [0.44, 0.5, -1.02],
    consoleRotation: [0, -0.28, 0],
    controllerPosition: [-0.18, 0.014, 0.42],
    controllerRotation: [0, 0.45, 0],
    shelfPosition: [-1.35, 0.55, -1.52],
  },

  games: [
    { rank: 1, title: 'Alex Kidd in Miracle World', year: 1986, unitsSold: 1_600_000, developer: 'Sega', publisher: 'Sega', blurb: 'Sega\'s answer to Mario, and the console\'s pack-in mascot platformer for most of its life.' },
    { rank: 2, title: 'Sonic the Hedgehog (8-bit)', year: 1991, unitsSold: 700_000, developer: 'Ancient', publisher: 'Sega', blurb: 'A parallel, differently-designed 8-bit Sonic built alongside the Genesis original, for a console that had no business getting its own version at all.' },
    { rank: 3, title: 'Wonder Boy III: The Dragon\'s Trap', year: 1989, unitsSold: 450_000, developer: 'Westone', publisher: 'Sega', blurb: 'A platformer that turns into an open-world RPG mid-game, still cited as one of the finest games the hardware ever ran.' },
    { rank: 4, title: 'Phantasy Star', year: 1987, unitsSold: 400_000, developer: 'Sega', publisher: 'Sega', blurb: 'A genuine, ambitious RPG with a female lead in 1987, years ahead of what most 8-bit hardware attempted.' },
    { rank: 5, title: 'Golden Axe Warrior', year: 1991, unitsSold: 300_000, developer: 'Sega', publisher: 'Sega', blurb: 'An unabashed answer to Zelda, built specifically because the Master System had nothing like it.' },
    { rank: 6, title: 'R-Type', year: 1988, unitsSold: 280_000, developer: 'Irem / Sega', publisher: 'Sega', blurb: 'The brutal arcade shooter, ported down to a system that could not quite keep up with the original\'s scale, and was loved anyway.' },
    { rank: 7, title: 'Fantasy Zone', year: 1986, unitsSold: 260_000, developer: 'Sega', publisher: 'Sega', blurb: 'A candy-colored shoot-em-up that let you buy upgrades mid-run: an early example of a run\'s own economy as a game mechanic.' },
    { rank: 8, title: 'Ys', year: 1988, unitsSold: 220_000, developer: 'Nihon Falcom / Sega', publisher: 'Sega', blurb: 'A bump-to-attack action RPG port that introduced a generation of Master System owners to a whole different design philosophy.' },
    { rank: 9, title: 'Zillion', year: 1987, unitsSold: 200_000, developer: 'Sega', publisher: 'Sega', blurb: 'A stealth-action game tied to an anime made specifically to sell the console: merchandising built backward from a cartoon.' },
    { rank: 10, title: 'OutRun', year: 1987, unitsSold: 190_000, developer: 'Sega', publisher: 'Sega', blurb: 'The arcade racer\'s scaling-sprite road, rebuilt for hardware never designed to draw it.' },
  ],

  sources: [
    'https://en.wikipedia.org/wiki/Master_System',
    'https://en.wikipedia.org/wiki/Tectoy',
    'https://www.xda-developers.com/the-sega-master-system-is-still-being-made-and-sold-in-brazil-37-years-later/',
    'Individual game sales figures are widely-cited retro-market estimates, not a single authoritative source — no Wikipedia "best-selling Master System games" table exists to match the NES equivalent.',
  ],
}
