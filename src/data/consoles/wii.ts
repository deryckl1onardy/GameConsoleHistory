import type { ConsoleEntry } from '@/types/console'

/**
 * The console that stopped competing on power and won anyway. Nintendo shipped
 * hardware barely stronger than the GameCube, put a motion-sensing wand in the
 * box instead, and sold it to a hundred million people — a large share of whom
 * had never bought a games console before in their lives.
 *
 * Sales figures, dates and technical specs from Wikipedia (see `sources`).
 * Controller dimensions re-mapped onto this project's width/thickness/depth
 * convention (see the comment on the controller entry below).
 */
export const wii: ConsoleEntry = {
  id: 'wii',
  name: 'Nintendo Wii',
  shortName: 'Wii',
  manufacturer: 'Nintendo',
  generation: 7,
  released: {
    na: '2006-11-19',
    jp: '2006-12-02',
    eu: '2006-12-08',
  },
  discontinued: '2013-10-20',
  unitsSold: 101_630_000,
  msrpUsd: 249,
  msrpUsdAdjusted: 390,
  tagline: 'Wii would like to play.',
  summary:
    'While Sony and Microsoft spent the generation competing on processing power, Nintendo shipped a console barely more capable than its own six-year-old GameCube and sold it on a single idea: you point the controller at the screen and swing it. The Wii Remote made the console legible to people who had never held a gamepad: it was bought by grandparents, put in nursing homes and hospital wards, and used for physiotherapy. Wii Sports, bundled in the box almost everywhere, became one of the best-selling games ever made. The machine sold over a hundred million units, more than the PS3 or the 360, and Nintendo made a profit on every single one, having never sold the hardware at a loss.',

  specs: {
    cpu: 'IBM PowerPC "Broadway"',
    cpuClockMhz: 729,
    ram: '24 MB 1T-SRAM, 64 MB GDDR3',
    ramBytes: 92_274_688,
    resolution: '640×480 (480p)',
    colors: '16.7 million',
    audio: 'Macronix DSP, Dolby Pro Logic II',
    media: '12cm Wii Optical Disc, 4.7 GB',
  },

  relatableSpecs: [
    {
      label: 'Resolution',
      value: '480p, no HD',
      comparison:
        'It was the only console of its generation that could not output high definition, launching the same year as the first widely affordable HDTVs, and it outsold both machines that could.',
    },
    {
      label: 'Wii Sports',
      value: '82.9M copies',
      comparison:
        'One of the best-selling games in history, and it reached that almost entirely by being in the box. For millions of households it was the only game they ever played on the console.',
    },
    {
      label: 'Profit per unit',
      value: 'Positive from day one',
      comparison:
        'Sony and Microsoft both sold their consoles at a loss and hoped to recover it on software. Nintendo used deliberately modest parts and made money on every Wii it sold.',
    },
    {
      label: 'Power draw',
      value: '~18 W',
      comparison:
        'Roughly a tenth of a launch PS3. The Wii is small enough and cool enough to run silently in a cabinet, which is a large part of why it ended up in so many living rooms.',
    },
  ],

  mediaKind: 'optical',
  mediaArchetype: 'dvd-keepcase',
  model: '/models/consoles/wii.glb',
  // Anchors measured against the rendered GLB (see snes.ts's hardwareDiagram
  // comment). The front face (disc slot, buttons, logo) is the +x face of the
  // console body. The GLB bundles console + stand + Wiimote + nunchuk as one
  // display composition (224 x 206 x 179mm), so the bounds test validates
  // against renderBox rather than the body-only `dimensions`.
  hardwareDiagram: {
    renderBox: { x: [-0.1122, 0.1122], y: [0, 0.2057], z: [-0.0893, 0.0893] },
    callouts: [
      {
        label: 'Disc slot: front face, right side',
        anchor: [0.09, 0.15, -0.04],
        labelOffset: [0.03, 0.03, -0.01],
      },
      {
        label: 'Eject button: just below the slot',
        anchor: [0.091, 0.115, -0.045],
        labelOffset: [0.03, 0.03, -0.01],
      },
      {
        label: 'Power button: bottom-left of the front',
        anchor: [0.105, 0.048, -0.07],
        labelOffset: [0.035, 0.02, -0.01],
      },
      {
        label: 'Reset button: beside the power',
        anchor: [0.105, 0.048, -0.05],
        labelOffset: [0.035, 0.02, -0.01],
      },
      {
        label: 'Wii Remote + Nunchuk: posed on their own stands',
        anchor: [0.031, 0.1, 0.012],
        labelOffset: [0.02, 0.04, 0.01],
      },
    ],
  },
  // Aspirational mesh targets — these name the parts the insert sequence and
  // failure states will drive once an authored model exists. Until then the
  // shell comes from the console form (see console-forms.ts), which generates
  // meshes under exactly these names.
  animatedParts: {
    slot: 'disc_slot',
    powerSwitch: 'power_button',
    resetButton: 'reset_button',
    ejectLever: 'eject_button',
    led: 'slot_led',
  },
  // Wikipedia: 44mm W x 157mm H x 215.4mm D, standing vertically on its stand
  // — the orientation Nintendo shows it in and the one this diorama uses.
  dimensions: { width: 44, height: 157, depth: 215.4 },

  variants: [],

  controllers: [
    {
      id: 'wii-remote',
      name: 'Wii Remote',
      model: '/models/controllers/wii-remote.glb',
      // Published: 148mm long x 36.2mm wide x 30.8mm thick. Re-mapped to this
      // project's convention for a wand held vertically in one hand: width
      // 36.2 (L-R), height 30.8 (thickness), depth 148 (the long axis, running
      // front-to-back away from the hand).
      dimensions: { width: 36.2, height: 30.8, depth: 148 },
      innovations: [
        'Held like a remote control rather than gripped in two hands: the single decision that made the console legible to people who had never played a game.',
        'An infrared camera in the nose that tracks two LEDs on a sensor bar, giving true absolute pointing at the screen rather than relative motion.',
        'A speaker in the controller itself, so a sound could come from your hand instead of the television.',
      ],
      buttons: [
        { id: 'dpad-up', mesh: 'dpad', label: 'D-pad Up', key: 'ArrowUp', travel: [0, -0.0008, 0], position: [0, 52], shape: 'cross', sizeMm: 20 },
        { id: 'dpad-down', mesh: 'dpad', label: 'D-pad Down', key: 'ArrowDown', travel: [0, -0.0008, 0] },
        { id: 'dpad-left', mesh: 'dpad', label: 'D-pad Left', key: 'ArrowLeft', travel: [0, -0.0008, 0] },
        { id: 'dpad-right', mesh: 'dpad', label: 'D-pad Right', key: 'ArrowRight', travel: [0, -0.0008, 0] },
        { id: 'a', mesh: 'btn_a', label: 'A', key: 'j', travel: [0, -0.0012, 0], position: [0, 24], shape: 'convex', sizeMm: 14 },
        { id: 'b', mesh: 'btn_b', label: 'B (trigger)', key: 'k', travel: [0, -0.0015, 0], position: [0, 10], shape: 'trigger', sizeMm: 16 },
        { id: 'one', mesh: 'btn_one', label: '1', key: '1', travel: [0, -0.001, 0], position: [0, -22], shape: 'convex', sizeMm: 10 },
        { id: 'two', mesh: 'btn_two', label: '2', key: '2', travel: [0, -0.001, 0], position: [0, -38], shape: 'convex', sizeMm: 10 },
        { id: 'home', mesh: 'btn_home', label: 'Home', travel: [0, -0.0008, 0], position: [0, -4], shape: 'convex', sizeMm: 9 },
        { id: 'plus', mesh: 'btn_plus', label: '+', key: 'Equal', travel: [0, -0.0008, 0], position: [9, 4], shape: 'flat', sizeMm: 7 },
        { id: 'minus', mesh: 'btn_minus', label: '−', key: 'Minus', travel: [0, -0.0008, 0], position: [-9, 4], shape: 'flat', sizeMm: 7 },
      ],
    },
  ],

  facts: [
    {
      id: 'not-competing-on-power',
      title: 'It deliberately lost the specification war',
      body: 'Nintendo\'s internal target for the Wii was not performance but disruption: the console had to be small, quiet, cheap to build and immediately understandable. It shipped without high-definition output in the year HDTVs went mainstream, and it outsold both of the machines that had it. The strategy has a name inside Nintendo: the "blue ocean" approach, competing where nobody else is rather than where everybody is.',
    },
    {
      id: 'pointing-not-waving',
      title: 'It points, it does not just wave',
      body: 'The Wii Remote is usually described as motion-sensing, but the part that made it feel magical is a small infrared camera in its nose. The "sensor bar" on the television emits no signal at all: it is just two clusters of infrared LEDs, and the remote looks at them to work out exactly where on screen it is aimed. You can replace it with two candles, and people did.',
    },
    {
      id: 'wii-sports-bundle',
      title: 'A pack-in game that outsold the industry',
      body: 'Wii Sports was bundled with the console everywhere except Japan, and went on to sell 82.9 million copies, for years the best-selling single-platform game ever made. Its five sports were designed as demonstrations of the controller rather than as a game, which is exactly why they worked on people who had never played one.',
    },
    {
      id: 'straps-and-tvs',
      title: 'Nintendo had to redesign the strap',
      body: 'Within weeks of launch, players swinging hard enough at virtual tennis balls were losing their grip and putting the remote through their televisions. Nintendo replaced the wrist strap with a thicker one, offered free replacements to everyone who already owned one, and later added a silicone sleeve: a hardware recall caused entirely by the console being played too enthusiastically.',
    },
  ],

  failureStates: [
    {
      id: 'disc-read-error',
      name: 'Unable to read disc',
      body: 'The slot-loading drive collects dust and its laser loses calibration with age. The console boots to its channel menu perfectly and then reports that the disc cannot be read: the failure that sent most Wiis to a repair shop.',
      target: 'disc_slot',
      effect: 'no-signal',
    },
    {
      id: 'bluetooth-pairing-loss',
      name: 'Remote will not sync',
      body: 'The console pairs its remotes over Bluetooth and stores the pairing internally. When that store is corrupted the remote\'s four player lights blink and never settle, and every controller in the house has to be re-synced by hand at the console.',
      target: 'slot_led',
      effect: 'blink-amber',
    },
  ],

  diorama: {
    roomKit: 'living-2010s-na',
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
      id: 'lcd-42-2007',
      model: '/models/tvs/lcd-42.glb',
      label: '42-inch LCD, c. 2007',
      screenInches: 42,
      dimensions: { width: 1030, height: 650, depth: 95 },
      curvature: 0,
      bezelInsetMm: 8,
      aspect: '16:9',
    },
    lighting: {
      id: 'afternoon-2000s-bright',
      tempK: 4600,
      intensity: 3.2,
      keyPosition: [3.2, 2.4, 1.0],
      ambientIntensity: 0.44,
      backdrop: '#eeeeea',
    },
    tvPosition: [-0.3, 0.62, -1.2],
    tvRotation: [0, 0.1, 0],
    consolePosition: [0.5, 0.5, -1.05],
    consoleRotation: [0, -0.26, 0],
    controllerPosition: [-0.18, 0.014, 0.45],
    controllerRotation: [0, 0.5, 0],
    shelfPosition: [-1.4, 0.55, -1.58],
  },

  games: [
    { rank: 1, title: 'Wii Sports', year: 2006, unitsSold: 82_900_000, developer: 'Nintendo EAD', publisher: 'Nintendo', blurb: 'Five sports built to explain the controller, bundled almost everywhere, and for years the best-selling single-platform game ever made.' },
    { rank: 2, title: 'Mario Kart Wii', year: 2008, unitsSold: 37_380_000, developer: 'Nintendo EAD', publisher: 'Nintendo', blurb: 'Shipped with a plastic steering wheel to slot the remote into, which sold tens of millions on its own.' },
    { rank: 3, title: 'Wii Sports Resort', year: 2009, unitsSold: 33_140_000, developer: 'Nintendo EAD', publisher: 'Nintendo', blurb: 'Bundled the MotionPlus accessory that finally gave the remote true one-to-one rotation tracking.' },
    { rank: 4, title: 'New Super Mario Bros. Wii', year: 2009, unitsSold: 30_320_000, developer: 'Nintendo EAD', publisher: 'Nintendo', blurb: 'Brought four-player simultaneous Mario to a console for the first time, mostly so players could shove each other into pits.' },
    { rank: 5, title: 'Wii Play', year: 2006, unitsSold: 28_020_000, developer: 'Nintendo EAD', publisher: 'Nintendo', blurb: 'Nine minigames sold at barely more than the price of the extra controller it came with, which is how it sold 28 million copies.' },
    { rank: 6, title: 'Wii Fit', year: 2007, unitsSold: 22_670_000, developer: 'Nintendo EAD', publisher: 'Nintendo', blurb: 'A pressure-sensing board you stand on, sold as exercise equipment, bought by people who did not consider themselves players at all.' },
    { rank: 7, title: 'Wii Fit Plus', year: 2009, unitsSold: 21_130_000, developer: 'Nintendo EAD', publisher: 'Nintendo', blurb: 'The follow-up that added routines and stricter tracking to the same board.' },
    { rank: 8, title: 'Super Smash Bros. Brawl', year: 2008, unitsSold: 13_320_000, developer: 'Sora Ltd.', publisher: 'Nintendo', blurb: 'Added third-party fighters: Snake and Sonic in a Nintendo game, which had been unthinkable.' },
    { rank: 9, title: 'Super Mario Galaxy', year: 2007, unitsSold: 12_800_000, developer: 'Nintendo EAD Tokyo', publisher: 'Nintendo', blurb: 'Built its levels as tiny spherical worlds with their own gravity, and is still regularly named among the best games ever made.' },
    { rank: 10, title: 'Wii Party', year: 2010, unitsSold: 9_350_000, developer: 'Nd Cube', publisher: 'Nintendo', blurb: 'Board games and minigames aimed squarely at the households the console had reached who owned nothing else.' },
  ],

  sources: [
    'https://en.wikipedia.org/wiki/Wii',
    'https://en.wikipedia.org/wiki/List_of_best-selling_Wii_video_games',
    'https://en.wikipedia.org/wiki/Wii_Remote',
    'https://en.wikipedia.org/wiki/Wii_Sports',
    'https://en.wikipedia.org/wiki/Blue_Ocean_Strategy',
  ],
}
