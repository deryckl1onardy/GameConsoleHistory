import type { ConsoleEntry } from '@/types/console'

/**
 * The console Nintendo designed to be picked up and carried. It has a handle
 * moulded into the back, it plays a disc too small to hold a film, and it is
 * the only machine of its generation that made no attempt whatsoever to be
 * the living room's media centre — a decision that cost it the generation and
 * produced some of the best-liked games Nintendo has ever shipped.
 *
 * Sales figures, dates and technical specs from Wikipedia (see `sources`).
 * Controller dimensions re-mapped onto this project's width/thickness/depth
 * convention (see the comment on the controller entry below).
 */
export const gamecube: ConsoleEntry = {
  id: 'gamecube',
  name: 'Nintendo GameCube',
  shortName: 'GameCube',
  manufacturer: 'Nintendo',
  generation: 6,
  released: {
    jp: '2001-09-14',
    na: '2001-11-18',
    eu: '2002-05-03',
  },
  discontinued: '2007-02-01',
  unitsSold: 21_740_000,
  msrpUsd: 199,
  msrpUsdAdjusted: 360,
  tagline: 'The one with the handle.',
  summary:
    'Every other console of its generation was trying to become the living room\'s media hub — the PS2 played DVDs, the Xbox had a hard drive and an ethernet port. Nintendo built a small purple box with a carrying handle on the back that played 8cm discs and deliberately could not play films, on the reasoning that a games machine should be good at games and cheap to buy. It finished last of the three. It also produced Super Smash Bros. Melee, Metroid Prime, Wind Waker and Resident Evil 4, and its controller is still manufactured today because competitive players refuse to use anything else — a console remembered far more fondly than its sales ever justified.',

  specs: {
    cpu: 'IBM PowerPC "Gekko"',
    cpuClockMhz: 485,
    ram: '24 MB 1T-SRAM main, 16 MB DRAM auxiliary',
    ramBytes: 25_165_824,
    resolution: '640×480 (480p capable)',
    colors: '16.7 million',
    audio: 'Macronix DSP, 64 channels, Dolby Pro Logic II',
    media: '8cm miniDVD, 1.5 GB',
  },

  relatableSpecs: [
    {
      label: 'The disc',
      value: '8cm, 1.5 GB',
      comparison:
        'Two-thirds the diameter of a normal DVD and about a third the capacity. Nintendo chose it partly to deter piracy and partly because it flatly did not want to sell a film player.',
    },
    {
      label: 'The handle',
      value: 'Moulded in',
      comparison:
        'No other home console of any generation has one. It says exactly what Nintendo thought this machine was: something a child carries to a friend\'s house, not furniture.',
    },
    {
      label: 'Controller lifespan',
      value: 'Still in production',
      comparison:
        'Over twenty years after the console was discontinued, the pad is still manufactured — Super Smash Bros. players never accepted a replacement, so Nintendo kept making adapters for it.',
    },
    {
      label: 'Main memory',
      value: '1T-SRAM',
      comparison:
        'Unusually fast memory rather than unusually large — the GameCube had less RAM than the Xbox but reached it more quickly, which is why its games load and stream so smoothly for the era.',
    },
  ],

  mediaKind: 'optical',
  mediaArchetype: 'dvd-keepcase',
  model: '/models/consoles/gamecube.glb',
  // Aspirational mesh targets — these name the parts the insert sequence and
  // failure states will drive once an authored model exists. Until then the
  // shell comes from the console form (see console-forms.ts), which generates
  // meshes under exactly these names. The moulded rear handle is the part a
  // swept profile cannot express — see the note on the form.
  animatedParts: {
    lid: 'disc_lid',
    powerSwitch: 'power_button',
    resetButton: 'reset_button',
    led: 'power_led',
  },
  // Wikipedia: 150mm W x 110mm H x 161mm D.
  dimensions: { width: 150, height: 110, depth: 161 },

  variants: [],

  controllers: [
    {
      id: 'gamecube-pad',
      name: 'GameCube Controller',
      model: '/models/controllers/gamecube-pad.glb',
      // Footprint is ~152mm across the grips x 106mm front-to-back, ~62mm
      // thick at the handles — re-mapped to this project's convention:
      // width 152 (L-R), height 62 (thickness), depth 106 (front-to-back).
      dimensions: { width: 152, height: 62, depth: 106 },
      innovations: [
        'Buttons sized and shaped by importance rather than symmetry — a huge green A with a kidney-shaped B curled around it, so your thumb finds the right one without looking.',
        'An octagonal gate around the analog stick, giving eight physical notches the thumb can feel — the reason competitive players still refuse to replace this pad.',
        'Analog shoulder triggers with a click at the bottom of the travel, so one button reads both a gradual press and a definite press.',
      ],
      buttons: [
        { id: 'stick', mesh: 'analog_stick', label: 'Control stick', travel: [0, -0.001, 0], position: [-48, 10], shape: 'stick', sizeMm: 34 },
        { id: 'c-stick', mesh: 'c_stick', label: 'C-stick', travel: [0, -0.001, 0], position: [30, -20], shape: 'stick', sizeMm: 26 },
        { id: 'dpad-up', mesh: 'dpad', label: 'D-pad Up', key: 'ArrowUp', travel: [0, -0.0008, 0], position: [-30, -24], shape: 'cross', sizeMm: 22 },
        { id: 'dpad-down', mesh: 'dpad', label: 'D-pad Down', key: 'ArrowDown', travel: [0, -0.0008, 0] },
        { id: 'dpad-left', mesh: 'dpad', label: 'D-pad Left', key: 'ArrowLeft', travel: [0, -0.0008, 0] },
        { id: 'dpad-right', mesh: 'dpad', label: 'D-pad Right', key: 'ArrowRight', travel: [0, -0.0008, 0] },
        { id: 'a', mesh: 'btn_a', label: 'A', key: 'j', travel: [0, -0.0012, 0], position: [50, 8], shape: 'convex', sizeMm: 21 },
        { id: 'b', mesh: 'btn_b', label: 'B', key: 'k', travel: [0, -0.0012, 0], position: [34, -2], shape: 'convex', sizeMm: 12 },
        { id: 'x', mesh: 'btn_x', label: 'X', key: 'u', travel: [0, -0.0012, 0], position: [66, 12], shape: 'capsule', sizeMm: 13 },
        { id: 'y', mesh: 'btn_y', label: 'Y', key: 'i', travel: [0, -0.0012, 0], position: [48, 27], shape: 'capsule', sizeMm: 13 },
        { id: 'start', mesh: 'btn_start', label: 'Start/Pause', key: 'Enter', travel: [0, -0.0008, 0], position: [0, 6], shape: 'convex', sizeMm: 10 },
        { id: 'trigger-l', mesh: 'trigger_l', label: 'L Trigger', key: 'q', travel: [0, -0.002, 0], position: [-56, 42], shape: 'trigger', sizeMm: 30 },
        { id: 'trigger-r', mesh: 'trigger_r', label: 'R Trigger', key: 'e', travel: [0, -0.002, 0], position: [56, 42], shape: 'trigger', sizeMm: 30 },
        { id: 'z', mesh: 'btn_z', label: 'Z', key: 'r', travel: [0, -0.0012, 0], position: [66, 40], shape: 'shoulder', sizeMm: 20 },
      ],
    },
  ],

  facts: [
    {
      id: 'the-handle',
      title: 'A console with a carrying handle',
      body: 'The GameCube has a handle moulded into the back of the shell, and no other home console has ever shipped with one. It is the clearest possible statement of what Nintendo thought the machine was for: at 150mm across and under 2.5kg, it was designed to be unplugged, carried to a friend\'s house, and plugged in there.',
    },
    {
      id: 'no-dvd-on-purpose',
      title: 'It refused to play films',
      body: 'The PS2 sold heavily in its first year to people who wanted a cheap DVD player. Nintendo went the other way deliberately, using an 8cm disc that physically could not hold a feature film, on the argument that every dollar spent on media playback was a dollar not spent on making games cheaper. Panasonic, who made the drive, sold a hybrid called the Q that did play DVDs — and it sold poorly.',
    },
    {
      id: 'octagonal-gate',
      title: 'Eight notches you can feel',
      body: 'The plastic ring around the control stick is an octagon, not a circle, so the stick clicks lightly into eight positions. It gives a thumb reliable, repeatable angles without looking down, and it is the single biggest reason Super Smash Bros. Melee players still use this controller decades after the console it came with was discontinued.',
    },
    {
      id: 'wind-waker-backlash',
      title: 'The art style everyone hated, then didn\'t',
      body: 'The Legend of Zelda: The Wind Waker was revealed in cel-shaded cartoon style after Nintendo had shown a realistic Zelda tech demo the year before, and the reaction was severe enough that it is widely blamed for hurting the game\'s sales. It has since become one of the best-regarded entries in the series, and its flat-shaded look has aged conspicuously better than the realistic games of its generation.',
    },
  ],

  failureStates: [
    {
      id: 'laser-drift',
      name: 'Optical drive laser drift',
      body: 'The GameCube\'s drive spins its small disc very fast, and as the laser assembly ages it loses calibration. The console boots to its menu normally and then fails to read the game — often intermittently at first, working again if the console is turned on its side.',
      target: 'disc_lid',
      effect: 'no-signal',
    },
    {
      id: 'analog-drift',
      name: 'Control stick drift',
      body: 'The potentiometers under the control stick wear where the plastic gate rubs them, and the console starts reading movement the player is not making — a character walking slowly in one direction with the stick untouched.',
      target: 'analog_stick',
      effect: 'dim',
    },
  ],

  diorama: {
    roomKit: 'den-2000s-na',
    footprint: [4.2, 3.6],
    props: [
      { kit: 'sofa', variant: 'corduroy-olive', position: [0, 0, 1.35], rotation: [0, Math.PI, 0] },
      { kit: 'rug', variant: 'berber-cream', position: [0, 0.002, 0.55], scale: 1.15 },
      { kit: 'tv-stand', variant: 'black-lacquer', position: [0, 0, -1.15] },
      { kit: 'side-table', variant: 'glass-chrome', position: [1.25, 0, 0.95] },
      { kit: 'lamp', variant: 'white-shade', position: [1.25, 0.52, 0.95] },
      { kit: 'plant', variant: 'rubber-tree', position: [1.75, 0, -1.05], scale: 1.05 },
      { kit: 'poster', variant: 'band', position: [-2.06, 1.5, -0.4], rotation: [0, Math.PI / 2, 0] },
      { kit: 'window', variant: 'blinds', position: [1.25, 1.4, -1.78] },
    ],
    tv: {
      id: 'crt-27-2001-gc',
      model: '/models/tvs/crt-27.glb',
      label: '27-inch consumer CRT, c. 2001',
      screenInches: 27,
      dimensions: { width: 640, height: 560, depth: 560 },
      curvature: 0.4,
      bezelInsetMm: 16,
      aspect: '4:3',
    },
    lighting: {
      id: 'afternoon-2000s',
      tempK: 4200,
      intensity: 3.0,
      keyPosition: [3.2, 2.3, 1.0],
      ambientIntensity: 0.38,
      backdrop: '#eeeeea',
    },
    tvPosition: [-0.28, 0.5, -1.15],
    tvRotation: [0, 0.12, 0],
    consolePosition: [0.44, 0.5, -1.02],
    consoleRotation: [0, -0.32, 0],
    controllerPosition: [-0.18, 0.014, 0.42],
    controllerRotation: [0, 0.5, 0],
    shelfPosition: [-1.35, 0.55, -1.52],
  },

  games: [
    { rank: 1, title: 'Super Smash Bros. Melee', year: 2001, unitsSold: 7_410_000, developer: 'HAL Laboratory', publisher: 'Nintendo', blurb: 'Sold to roughly a third of everyone who owned the console, and is still played competitively on original hardware today.' },
    { rank: 2, title: 'Mario Kart: Double Dash!!', year: 2003, unitsSold: 6_950_000, developer: 'Nintendo EAD', publisher: 'Nintendo', blurb: 'Put two drivers on every kart, one steering and one throwing — the only entry in the series to try it.' },
    { rank: 3, title: 'Super Mario Sunshine', year: 2002, unitsSold: 6_310_000, developer: 'Nintendo EAD', publisher: 'Nintendo', blurb: 'Strapped a water cannon to Mario and set the whole game on one tropical island, which nothing in the series had done before.' },
    { rank: 4, title: 'The Legend of Zelda: The Wind Waker', year: 2002, unitsSold: 4_600_000, developer: 'Nintendo EAD', publisher: 'Nintendo', blurb: 'Cel-shaded, ocean-going, and widely disliked on announcement — now among the most admired games Nintendo has made.' },
    { rank: 5, title: 'Luigi\'s Mansion', year: 2001, unitsSold: 3_600_000, developer: 'Nintendo EAD', publisher: 'Nintendo', blurb: 'The launch title, and a Mario game with no Mario in it — a haunted house cleared with a vacuum cleaner.' },
    { rank: 6, title: 'Metroid Prime', year: 2002, unitsSold: 2_840_000, developer: 'Retro Studios', publisher: 'Nintendo', blurb: 'Turned a 2D series into a first-person game without turning it into a shooter, largely by making the visor itself part of the fiction.' },
    { rank: 7, title: 'Pokémon Colosseum', year: 2003, unitsSold: 2_440_000, developer: 'Genius Sonority', publisher: 'Nintendo', blurb: 'A home-console Pokémon with a darker story than the handhelds, built around stealing other trainers\' Pokémon.' },
    { rank: 8, title: 'Star Fox Adventures', year: 2002, unitsSold: 1_850_000, developer: 'Rare', publisher: 'Nintendo', blurb: 'Began life as an original Rare game called Dinosaur Planet, and was the studio\'s last release before Microsoft bought it.' },
    { rank: 9, title: 'Resident Evil 4', year: 2005, unitsSold: 1_600_000, developer: 'Capcom Production Studio 4', publisher: 'Capcom', blurb: 'A GameCube exclusive at launch that reinvented the third-person shooter with its over-the-shoulder camera.' },
    { rank: 10, title: 'The Legend of Zelda: Twilight Princess', year: 2006, unitsSold: 1_530_000, developer: 'Nintendo EAD', publisher: 'Nintendo', blurb: 'Released simultaneously on the GameCube and the launching Wii, and mirrored left-to-right on one of them.' },
  ],

  sources: [
    'https://en.wikipedia.org/wiki/GameCube',
    'https://en.wikipedia.org/wiki/List_of_best-selling_GameCube_video_games',
    'https://en.wikipedia.org/wiki/GameCube_controller',
    'https://en.wikipedia.org/wiki/The_Legend_of_Zelda:_The_Wind_Waker',
    'https://en.wikipedia.org/wiki/Panasonic_Q',
  ],
}
