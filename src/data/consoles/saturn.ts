import type { ConsoleEntry } from '@/types/console'

/**
 * The console Sega ambushed its own retailers with. Announced for
 * availability that same day at E3 1995, four months ahead of the date
 * every store had been told to plan around — the surprise worked for about
 * an hour, until Sony took the same stage and undercut the Saturn's price
 * by a hundred dollars on the spot.
 *
 * Sales figures, dates and technical specs from Wikipedia (see `sources`).
 * Controller dimensions from Dimensions.com, re-mapped onto this project's
 * width/thickness/depth convention.
 */
export const saturn: ConsoleEntry = {
  id: 'saturn',
  name: 'Sega Saturn',
  shortName: 'Saturn',
  manufacturer: 'Sega',
  generation: 5,
  released: {
    jp: '1994-11-22',
    na: '1995-05-11',
    eu: '1995-07-08',
  },
  discontinued: '1998-03-01',
  unitsSold: 9_260_000,
  msrpUsd: 399.99,
  msrpUsdAdjusted: 830,
  tagline: 'It won the surprise launch and lost the room.',
  summary:
    'Sega tried to steal a march on Sony by quietly shipping the Saturn to a handful of retailers and then announcing, on stage at E3 1995, that it was already on shelves — four months ahead of the date every other store had been told to expect. It should have been a coup. Instead Sony walked on stage immediately afterward and simply said the PlayStation\'s price: $299, a hundred dollars under the Saturn, delivered in nine words and no slide. Retailers left out of the surprise launch were furious, and the console never fully recovered the relationship. Underneath the marketing disaster sat genuinely strange hardware — two CPUs and a total of eight processors, extraordinary at 2D and famously difficult to program for 3D, at the exact moment the industry turned toward 3D. It is remembered as Sega\'s failure. It is also the console Virtua Fighter, Panzer Dragoon and Nights into Dreams called home.',

  specs: {
    cpu: 'Two Hitachi SH-2',
    cpuClockMhz: 28.6,
    ram: '2 MB work RAM (cartridge-expandable), plus dedicated video and sound RAM',
    ramBytes: 2_097_152,
    resolution: '320×224 up to 704×224',
    colors: 'Up to 16.78 million',
    audio: 'Yamaha YMF292 (SCSP)',
    media: 'CD-ROM',
  },

  relatableSpecs: [
    {
      label: 'Total processors',
      value: '8',
      comparison:
        'Two main CPUs, a sound chip, two video processors and more besides — coordinating all of them at once was exactly what made the Saturn so hard to develop 3D games for.',
    },
    {
      label: 'Surprise launch window',
      value: '4 months early',
      comparison:
        'Sega shipped the console to select stores and announced it live on stage — the same trick a modern company might call a "stealth drop," except retailers who were not in on it found out from the news.',
    },
    {
      label: 'Sony\'s reply',
      value: '9 spoken words',
      comparison:
        'Sony\'s entire response to the surprise launch was announcing the PlayStation\'s price on the same stage, minutes later — no slide, no video, just a number a hundred dollars lower.',
    },
    {
      label: 'Colour depth',
      value: '16.78 million',
      comparison:
        'True 24-bit colour, the same depth a modern image editor works in — on a console whose library is still remembered mostly for 2D sprite work.',
    },
  ],

  mediaKind: 'optical',
  mediaArchetype: 'jewel-cd',
  model: '/models/consoles/saturn.glb',
  // Measured against the actual rendered GLB — see snes.ts's hardwareDiagram
  // comment for the method. The model names its disc-lid cover mesh
  // (`cover_07`), confirming the top-loading lid and giving its exact extent.
  hardwareDiagram: {
    renderBox: { x: [-0.1461, 0.1461], y: [0, 0.0771], z: [-0.1102, 0.1102] },
    callouts: [
      {
        label: 'Disc lid — the whole top lifts open',
        anchor: [0, 0.075, 0.01],
        labelOffset: [0, 0.03, 0.015],
      },
      {
        label: 'Power button — front left',
        anchor: [-0.1, 0.045, 0.108],
        labelOffset: [-0.035, 0.045, 0.005],
      },
      {
        label: 'Open button — front, beside power',
        anchor: [-0.01, 0.045, 0.108],
        labelOffset: [-0.03, 0.05, 0.005],
      },
      {
        label: 'Controller ports (×2) — front right',
        anchor: [0.09, 0.025, 0.108],
        labelOffset: [0.035, 0.04, 0.005],
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
  // Dimensions.com: 260mm W x 83mm H x 230mm D.
  dimensions: { width: 260, height: 83, depth: 230 },

  variants: [],

  controllers: [
    {
      id: 'saturn-pad',
      name: 'Saturn Control Pad (Model 2)',
      model: '/models/controllers/saturn-pad.glb',
      // Dimensions.com's own axes (86 x 155 x 45.7mm) re-mapped: width 155
      // (L-R), height 45.7 (thickness), depth 86 (front-to-back).
      dimensions: { width: 155, height: 45.7, depth: 86 },
      innovations: [
        'Six face buttons in two rows of three (ABC over XYZ), inherited from the Genesis\'s own six-button pad — built for the fighting games the Saturn leaned on hardest.',
        'Widely regarded, then and since, as one of the best D-pads ever shipped on a console controller — precise enough that fighting-game players sought the pad out long after the console itself was gone.',
      ],
      buttons: [
        { id: 'dpad-up', mesh: 'dpad', label: 'D-pad Up', key: 'ArrowUp', travel: [0, -0.0008, 0], position: [-44, 0], shape: 'cross', sizeMm: 26 },
        { id: 'dpad-down', mesh: 'dpad', label: 'D-pad Down', key: 'ArrowDown', travel: [0, -0.0008, 0] },
        { id: 'dpad-left', mesh: 'dpad', label: 'D-pad Left', key: 'ArrowLeft', travel: [0, -0.0008, 0] },
        { id: 'dpad-right', mesh: 'dpad', label: 'D-pad Right', key: 'ArrowRight', travel: [0, -0.0008, 0] },
        { id: 'a', mesh: 'btn_a', label: 'A', key: 'j', travel: [0, -0.0012, 0], position: [26, 16], shape: 'convex', sizeMm: 12 },
        { id: 'b', mesh: 'btn_b', label: 'B', key: 'k', travel: [0, -0.0012, 0], position: [40, 10], shape: 'convex', sizeMm: 12 },
        { id: 'c', mesh: 'btn_c', label: 'C', key: 'l', travel: [0, -0.0012, 0], position: [54, 4], shape: 'convex', sizeMm: 12 },
        { id: 'x', mesh: 'btn_x', label: 'X', key: 'u', travel: [0, -0.0012, 0], position: [30, 30], shape: 'convex', sizeMm: 11 },
        { id: 'y', mesh: 'btn_y', label: 'Y', key: 'i', travel: [0, -0.0012, 0], position: [44, 24], shape: 'convex', sizeMm: 11 },
        { id: 'z', mesh: 'btn_z', label: 'Z', key: 'o', travel: [0, -0.0012, 0], position: [58, 18], shape: 'convex', sizeMm: 11 },
        { id: 'l', mesh: 'btn_l', label: 'L', key: 'q', travel: [0, 0, -0.0015], position: [-46, -30], shape: 'shoulder', sizeMm: 28 },
        { id: 'r', mesh: 'btn_r', label: 'R', key: 'e', travel: [0, 0, -0.0015], position: [46, -30], shape: 'shoulder', sizeMm: 28 },
        { id: 'start', mesh: 'btn_start', label: 'Start', key: 'Enter', travel: [0, -0.0008, 0], position: [0, 18], shape: 'capsule', sizeMm: 9 },
      ],
    },
  ],

  facts: [
    {
      id: 'ambush-launch',
      title: 'The launch that ambushed its own retailers',
      body: 'Sega quietly shipped Saturn units to a handful of retailers and then announced, live on the E3 1995 keynote stage, that it was already on sale — four months before the date every other store had been told to prepare for. Chains left out of the early shipment, including Kmart and Best Buy, were reportedly furious enough to scale back their support for the console entirely.',
    },
    {
      id: 'sony-nine-words',
      title: 'Sony\'s entire reply was one sentence',
      body: 'Minutes after Sega\'s surprise announcement, Sony\'s Steve Race walked on stage, said "299" and walked off. No slide, no explanation needed — the PlayStation undercut the Saturn by a hundred dollars, announced in the shortest keynote moment in console history.',
    },
    {
      id: 'eight-processors',
      title: 'Eight processors, and famously hard to use them all',
      body: 'Two Hitachi SH-2 CPUs, two video display processors, a sound chip and more besides made the Saturn extraordinarily capable at 2D sprite work and genuinely difficult to program for the 3D graphics the industry was pivoting toward — a hardware philosophy built for the generation that was ending, arriving right as the next one began.',
    },
    {
      id: 'sonic-xtreme-cancelled',
      title: 'The Saturn never got a mainline 3D Sonic',
      body: 'Sonic X-treme, intended as the Saturn\'s answer to Super Mario 64, went through multiple redesigns and was cancelled before release. The console that launched Sega\'s mascot never got him in a fully 3D game of his own.',
    },
  ],

  failureStates: [
    {
      id: 'laser-lens-wear',
      name: 'CD laser lens wear',
      body: 'The optical pickup\'s laser diode weakens with age, and discs that once read instantly begin skipping, refusing to spin up, or triggering a repeated tray-open error — the same slow failure every CD-based console of this era eventually develops.',
      target: 'lid',
      effect: 'no-signal',
    },
    {
      id: 'battery-backup-death',
      name: 'Backup battery leak',
      body: 'The internal battery that preserves save data and the clock corrodes and leaks after enough years, sometimes damaging the board around it — a quiet failure that erases save files long before it is ever noticed.',
      target: 'shell',
      effect: 'dim',
    },
  ],

  diorama: {
    roomKit: 'den-90s-na',
    footprint: [4.2, 3.6],
    props: [
      { kit: 'sofa', variant: 'grey-modern', position: [0, 0, 1.35], rotation: [0, Math.PI, 0] },
      { kit: 'rug', variant: 'geometric-90s', position: [0, 0.002, 0.55], scale: 1.15 },
      { kit: 'tv-stand', variant: 'black-lacquer', position: [0, 0, -1.15] },
      { kit: 'side-table', variant: 'glass-chrome', position: [1.25, 0, 0.95] },
      { kit: 'lamp', variant: 'white-shade', position: [1.25, 0.52, 0.95] },
      { kit: 'plant', variant: 'rubber-tree', position: [1.75, 0, -1.05], scale: 1.05 },
      { kit: 'poster', variant: 'arcade', position: [-2.06, 1.5, -0.4], rotation: [0, Math.PI / 2, 0] },
      { kit: 'window', variant: 'blinds', position: [1.25, 1.4, -1.78] },
    ],
    tv: {
      id: 'crt-20-1995',
      model: '/models/tvs/crt-20.glb',
      label: '20-inch consumer CRT, c. 1995',
      screenInches: 20,
      dimensions: { width: 530, height: 480, depth: 490 },
      curvature: 0.68,
      bezelInsetMm: 14,
      aspect: '4:3',
    },
    lighting: {
      id: 'evening-mid-90s',
      tempK: 3300,
      intensity: 2.7,
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
    { rank: 1, title: 'Virtua Fighter 2', year: 1995, unitsSold: 2_500_000, developer: 'Sega AM2', publisher: 'Sega', blurb: 'The console\'s defining hit and a near-perfect home version of a genuinely groundbreaking arcade fighter.' },
    { rank: 2, title: 'Sakura Wars', year: 1996, unitsSold: 1_150_000, developer: 'Red Company', publisher: 'Sega', blurb: 'A tactical RPG/dating-sim hybrid that became a defining Japan-only franchise for the console.' },
    { rank: 3, title: 'Virtua Cop 2', year: 1996, unitsSold: 1_000_000, developer: 'Sega AM2', publisher: 'Sega', blurb: 'Light-gun arcade action, ported with the Saturn\'s trademark 2D-and-sprite-scaling strength intact.' },
    { rank: 4, title: 'Virtua Fighter', year: 1994, unitsSold: 950_000, developer: 'Sega AM2', publisher: 'Sega', blurb: 'The original 3D fighter, and the game the Saturn was arguably designed around from day one.' },
    { rank: 5, title: 'Sega Rally Championship', year: 1995, unitsSold: 900_000, developer: 'Sega AM3', publisher: 'Sega', blurb: 'An arcade rally racer whose surface-dependent handling was, for years, unmatched on any home console.' },
    { rank: 6, title: 'Nights into Dreams', year: 1996, unitsSold: 800_000, developer: 'Sonic Team', publisher: 'Sega', blurb: 'A flight-based dream-world game still cited as one of the Saturn\'s most original works.' },
    { rank: 7, title: 'Panzer Dragoon', year: 1995, unitsSold: 700_000, developer: 'Team Andromeda', publisher: 'Sega', blurb: 'An on-rails dragon-riding shooter that showcased the Saturn\'s 3D capability at its most stylish.' },
    { rank: 8, title: 'Virtua Cop', year: 1995, unitsSold: 650_000, developer: 'Sega AM2', publisher: 'Sega', blurb: 'The light-gun genre\'s console breakthrough, arcade-accurate down to the reload animation.' },
    { rank: 9, title: 'Daytona USA', year: 1995, unitsSold: 600_000, developer: 'Sega AM2', publisher: 'Sega', blurb: 'A launch-title arcade racer whose soundtrack became as memorable as the game itself.' },
    { rank: 10, title: 'Panzer Dragoon Saga', year: 1998, unitsSold: 250_000, developer: 'Team Andromeda', publisher: 'Sega', blurb: 'A late-cycle RPG released in tiny numbers, now one of the most sought-after and expensive Saturn discs.' },
  ],

  sources: [
    'https://en.wikipedia.org/wiki/Sega_Saturn',
    'https://en.wikipedia.org/wiki/List_of_best-selling_Sega_Saturn_games',
    'https://www.dimensions.com/element/sega-saturn',
    'https://www.dimensions.com/element/sega-saturn-controller-model-2',
  ],
}
