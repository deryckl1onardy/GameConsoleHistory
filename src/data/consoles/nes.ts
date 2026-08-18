import type { ConsoleEntry } from '@/types/console'

/**
 * The console that rebuilt the industry after 1983 by refusing to look like
 * one. It launched as a toy — a "control deck," sold with a robot and a
 * light gun, deliberately avoiding the word "video game" on the box after
 * every major retailer had been burned by the crash two years earlier.
 *
 * Sales figures, dates and technical specs from Wikipedia (see `sources`).
 * Controller dimensions from Dimensions.com — its own width/height/depth
 * axes did not match this project's convention (width / thickness / depth)
 * and were re-mapped by value, smallest to thickness, largest remaining to
 * depth; noted below.
 */
export const nes: ConsoleEntry = {
  id: 'nes',
  name: 'Nintendo Entertainment System',
  shortName: 'NES',
  manufacturer: 'Nintendo',
  generation: 3,
  released: {
    jp: '1983-07-15', // as the Family Computer (Famicom)
    na: '1985-10-18', // New York test market; nationwide 1986-02
    eu: '1986-09-01',
  },
  discontinued: '1995-08-14',
  unitsSold: 61_910_000,
  msrpUsd: 180,
  msrpUsdAdjusted: 540,
  tagline: 'A robot and a light gun, so nobody had to call it a video game.',
  summary:
    'Nintendo brought the NES to America a year after the industry\'s biggest retailers had watched the video game business collapse. Their solution was not a better pitch — it was to stop selling a video game console at all. The box said "Control Deck." It came with R.O.B., a plastic robot that reacted to on-screen flashes, and the Zapper, a light gun, so retailers could stock it in the toy aisle instead of the section everyone had just stopped trusting. Underneath the theater was real hardware: the 10NES lockout chip that let Nintendo control which cartridges could be published at all, a licensing model the entire industry still uses in some form. Nintendo tested the whole strategy in New York first, with a full buy-back guarantee for any store that didn\'t sell through — it worked, and the console that "wasn\'t a video game" went on to outsell every console before it.',

  specs: {
    cpu: 'Ricoh 2A03',
    cpuClockMhz: 1.79,
    ram: '2 KB work RAM, 2 KB video RAM, 256 bytes sprite RAM',
    ramBytes: 2048,
    resolution: '256×240',
    colors: 'Up to 25 on screen from a palette of 54',
    audio: 'Ricoh APU, 5 channels (2 pulse, triangle, noise, DPCM)',
    media: 'ROM cartridge (Game Pak)',
  },

  relatableSpecs: [
    {
      label: 'Working memory',
      value: '2 KB',
      comparison:
        'A single text message near its character limit already holds more data than the NES kept in working memory while running an entire game.',
    },
    {
      label: 'The lockout chip',
      value: '10NES',
      comparison:
        'A single chip decided which cartridges were allowed to exist — the direct ancestor of every "certified accessory" and platform approval process still used in games and phones today.',
    },
    {
      label: 'Duck Hunt, the pack-in',
      value: '28.31M sold',
      comparison:
        'A game bundled for free with the console outsold nearly every stand-alone game ever made for it, simply by being in the box.',
    },
    {
      label: 'The word Nintendo avoided',
      value: '"Video game"',
      comparison:
        'The console shipped as a "Control Deck" with a robot toy, specifically so it would not be filed in the part of the store everyone had just stopped trusting.',
    },
  ],

  mediaKind: 'cartridge',
  mediaArchetype: 'cart-nes',
  model: '/models/consoles/nes.glb',
  // Measured against the actual rendered GLB — see snes.ts's hardwareDiagram
  // comment for the method. The bundled controller is fused into the body
  // mesh and extends toward +z, so the console's own front face sits at
  // z ≈ -0.019, near the middle of the total box (gltf-transforms.ts's NES
  // notes). Anchors on the front use that face, not the spec's depth.
  hardwareDiagram: {
    renderBox: { x: [-0.1254, 0.1254], y: [0, 0.0874], z: [-0.2304, 0.2304] },
    callouts: [
      {
        label: 'Power switch — front left',
        anchor: [-0.06, 0.035, -0.017],
        labelOffset: [-0.035, 0.045, 0.01],
      },
      {
        label: 'Reset switch — front right',
        anchor: [0.06, 0.035, -0.017],
        labelOffset: [0.035, 0.045, 0.01],
      },
      {
        label: 'Cartridge door — the whole top flips open',
        anchor: [0, 0.086, -0.13],
        labelOffset: [0, 0.035, -0.01],
      },
      {
        label: 'Controller ports (×2) — front right',
        anchor: [0.1, 0.028, -0.016],
        labelOffset: [0.03, 0.04, 0.01],
      },
    ],
  },
  // Same as Atari 2600: dropped-in mesh names (Object_4, Object_5...) carry
  // no semantic meaning -- these are aspirational targets for a future
  // authored model, matching the convention snes.ts already established.
  animatedParts: {
    slot: 'cart_door',
    powerSwitch: 'power_switch',
    resetButton: 'reset_button',
  },
  // Dimensions.com: 10.08in (256mm) W x 3.5in (88.9mm) H x 8in (203.2mm) D.
  dimensions: { width: 256, height: 88.9, depth: 203.2 },

  variants: [],

  controllers: [
    {
      id: 'nes-pad',
      name: 'NES Controller',
      model: '/models/controllers/nes-pad.glb',
      // Dimensions.com gives 123.4 x 53.2 x 17.5mm on axes that don't match
      // this project's width/thickness/depth convention for a flat handheld
      // pad — the smallest value is almost certainly thickness, not the
      // largest. Re-mapped: width 123.4 (L-R), height 17.5 (thickness),
      // depth 53.2 (front-to-back in the hand).
      dimensions: { width: 123.4, height: 17.5, depth: 53.2 },
      innovations: [
        'The D-pad — Gunpei Yokoi adapted it from the Game & Watch handhelds, replacing a joystick with a thumb-sized cross that has been the default directional input on nearly every controller since.',
        'The first rectangular "brick" gamepad shape, small enough for a child\'s hands, that most competitors would spend the next decade converging back toward.',
      ],
      // Approximate layout, not measured from a reference photo — see the
      // convention already established on the SNES pad (which was measured
      // against real photographs) for how this should eventually be
      // corrected. Real NES ordering: D-pad left, B then A left-to-right on
      // the right, Select then Start between them, all in one row.
      buttons: [
        { id: 'dpad-up', mesh: 'dpad', label: 'D-pad Up', key: 'ArrowUp', travel: [0, -0.0008, 0], position: [-38, 0], shape: 'cross', sizeMm: 22 },
        { id: 'dpad-down', mesh: 'dpad', label: 'D-pad Down', key: 'ArrowDown', travel: [0, -0.0008, 0] },
        { id: 'dpad-left', mesh: 'dpad', label: 'D-pad Left', key: 'ArrowLeft', travel: [0, -0.0008, 0] },
        { id: 'dpad-right', mesh: 'dpad', label: 'D-pad Right', key: 'ArrowRight', travel: [0, -0.0008, 0] },
        { id: 'select', mesh: 'btn_select', label: 'Select', key: 'Shift', travel: [0, -0.0008, 0], position: [-6, 22], shape: 'capsule', sizeMm: 8 },
        { id: 'start', mesh: 'btn_start', label: 'Start', key: 'Enter', travel: [0, -0.0008, 0], position: [8, 22], shape: 'capsule', sizeMm: 8 },
        { id: 'b', mesh: 'btn_b', label: 'B', key: 'k', travel: [0, -0.0012, 0], position: [40, 8], shape: 'convex', sizeMm: 12 },
        { id: 'a', mesh: 'btn_a', label: 'A', key: 'l', travel: [0, -0.0012, 0], position: [54, 8], shape: 'convex', sizeMm: 12 },
      ],
    },
  ],

  facts: [
    {
      id: 'toy-not-console',
      title: 'It was sold as a toy on purpose',
      body: 'Every major US retailer had just been burned by the 1983 crash and did not want "video games" on their shelves. Nintendo\'s answer was R.O.B., a robot accessory that reacted to on-screen flashes, and the Zapper light gun — props that let the whole system be pitched, and stocked, as a toy rather than the thing that had just failed.',
    },
    {
      id: 'lockout-chip',
      title: 'One chip controlled the entire library',
      body: 'The 10NES lockout chip checked every cartridge on boot and refused to run anything it did not recognise. It is the reason Nintendo could require its "Seal of Quality," cap how many games a publisher released per year, and take a cut of every cartridge manufactured — the first real version of a licensing model every console maker since has used in some form.',
    },
    {
      id: 'duck-hunt-pack-in',
      title: 'The pack-in game nearly outsold Mario',
      body: 'Duck Hunt shipped free with most NES bundles and still sold 28.3 million copies — a number stand-alone software almost never reaches. It is a reminder that "best-selling game" charts are really measuring what was in the box, not what people chose.',
    },
    {
      id: 'nyc-test-market',
      title: 'New York decided whether the console shipped at all',
      body: 'Before committing to a nationwide launch, Nintendo tested the NES in New York City for the 1985 holiday season, offering nervous retailers a full buy-back guarantee on anything unsold. It worked. The nationwide rollout that followed in 1986 became the console that ended the industry\'s worst year.',
    },
  ],

  failureStates: [
    {
      id: 'blinking-red-light',
      name: 'The blinking red light',
      body: 'A worn or bent 72-pin connector loses contact with the cartridge, and the console\'s power light blinks steadily instead of holding steady — with no picture at all. The famous "fix" of blowing into the cartridge did not repair anything; it just briefly disturbed the dust and oxidation enough for the pins to reconnect.',
      target: 'power_led',
      effect: 'blink-red',
    },
    {
      id: 'zif-wear',
      name: 'Zero-insertion-force connector wear',
      body: 'The front-loading tray pushes the cartridge down onto a 72-pin connector every time it is used, and that connector\'s spring tension degrades with thousands of insertions — the mechanical reason so many original units eventually need the cartridge wiggled, reseated, or the connector replaced outright.',
      target: 'cart_slot',
      effect: 'screen-garbage',
    },
  ],

  diorama: {
    roomKit: 'living-80s-na',
    footprint: [4.2, 3.6],
    props: [
      { kit: 'sofa', variant: 'grey-modern', position: [0, 0, 1.35], rotation: [0, Math.PI, 0] },
      { kit: 'rug', variant: 'berber-cream', position: [0, 0.002, 0.55], scale: 1.15 },
      { kit: 'tv-stand', variant: 'oak-veneer', position: [0, 0, -1.15] },
      { kit: 'side-table', variant: 'oak-veneer', position: [1.25, 0, 0.95] },
      { kit: 'lamp', variant: 'white-shade', position: [1.25, 0.52, 0.95] },
      { kit: 'plant', variant: 'rubber-tree', position: [1.75, 0, -1.05], scale: 1.05 },
      { kit: 'poster', variant: 'arcade', position: [-2.06, 1.5, -0.4], rotation: [0, Math.PI / 2, 0] },
      { kit: 'window', variant: 'blinds', position: [1.25, 1.4, -1.78] },
    ],
    tv: {
      id: 'crt-20-1986',
      model: '/models/tvs/crt-20.glb',
      label: '20-inch consumer CRT, c. 1986',
      screenInches: 20,
      dimensions: { width: 530, height: 480, depth: 490 },
      curvature: 0.72,
      bezelInsetMm: 14,
      aspect: '4:3',
    },
    lighting: {
      id: 'afternoon-80s',
      tempK: 3400,
      intensity: 2.9,
      keyPosition: [3.4, 2.1, 1.2],
      ambientIntensity: 0.34,
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
    { rank: 1, title: 'Super Mario Bros.', year: 1985, unitsSold: 40_240_000, developer: 'Nintendo R&D4', publisher: 'Nintendo', blurb: 'The pack-in that redefined what a platformer was, bundled with enough units to become the best-selling NES game by a wide margin.' },
    { rank: 2, title: 'Duck Hunt', year: 1984, unitsSold: 28_310_000, developer: 'Nintendo R&D1', publisher: 'Nintendo', blurb: 'A light-gun pack-in that quietly became the second best-selling NES game of all time, on distribution alone.' },
    { rank: 3, title: 'Super Mario Bros. 3', year: 1988, unitsSold: 18_000_000, developer: 'Nintendo R&D4', publisher: 'Nintendo', blurb: 'A world map, a raccoon suit, and a level of polish that Nintendo delayed the game a full year to get right.' },
    { rank: 4, title: 'Tetris', year: 1989, unitsSold: 8_000_000, developer: 'Nintendo R&D1', publisher: 'Nintendo', blurb: 'A Soviet puzzle game that became a global phenomenon after a licensing fight involving three companies and one government.' },
    { rank: 5, title: 'Super Mario Bros. 2', year: 1988, unitsSold: 7_460_000, developer: 'Nintendo R&D4', publisher: 'Nintendo', blurb: 'A reskinned Japanese game called Doki Doki Panic, swapped in because the real Mario 2 was judged too hard for Western players.' },
    { rank: 6, title: 'The Legend of Zelda', year: 1986, unitsSold: 6_510_000, developer: 'Nintendo R&D4', publisher: 'Nintendo', blurb: 'A battery save chip inside the gold cartridge let a game remember your progress for the first time on a home console.' },
    { rank: 7, title: 'Dr. Mario', year: 1990, unitsSold: 4_850_000, developer: 'Nintendo R&D1', publisher: 'Nintendo', blurb: 'Falling pills and viruses, built on the puzzle-craze momentum Tetris had just proven the console could ride.' },
    { rank: 8, title: 'Zelda II: The Adventure of Link', year: 1987, unitsSold: 4_380_000, developer: 'Nintendo R&D4', publisher: 'Nintendo', blurb: 'A side-scrolling detour from its own predecessor, divisive then and still argued about now.' },
    { rank: 9, title: 'Excitebike', year: 1984, unitsSold: 4_160_000, developer: 'Nintendo R&D1', publisher: 'Nintendo', blurb: 'A launch-era racer with a built-in track editor, letting players design and save their own courses.' },
    { rank: 10, title: 'Golf', year: 1984, unitsSold: 4_010_000, developer: 'Nintendo R&D1', publisher: 'Nintendo', blurb: 'A quietly enormous seller for a sports sim, and reportedly one of Satoshi Tajiri\'s favourite games years before he created Pokémon.' },
  ],

  sources: [
    'https://en.wikipedia.org/wiki/Nintendo_Entertainment_System',
    'https://en.wikipedia.org/wiki/List_of_best-selling_Nintendo_Entertainment_System_video_games',
    'https://en.wikipedia.org/wiki/CIC_(Nintendo)',
    'https://en.wikipedia.org/wiki/NES_Zapper',
    'https://www.dimensions.com/element/nintendo-entertainment-system-nes',
    'https://www.dimensions.com/element/nes-controller',
  ],
}
