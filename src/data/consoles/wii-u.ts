import type { ConsoleEntry } from '@/types/console'

/**
 * The commercial failure that became the blueprint. The Wii U sold 13.5
 * million units against its predecessor's 101 million, largely because almost
 * nobody understood what it was — but its central idea, a screen in your hands
 * running the same game as the television, is the Switch, and the Switch sold
 * 150 million.
 *
 * Sales figures, dates and technical specs from Wikipedia (see `sources`).
 * Controller dimensions re-mapped onto this project's width/thickness/depth
 * convention (see the comment on the controller entry below).
 */
export const wiiU: ConsoleEntry = {
  id: 'wii-u',
  name: 'Nintendo Wii U',
  shortName: 'Wii U',
  manufacturer: 'Nintendo',
  generation: 8,
  released: {
    na: '2012-11-18',
    eu: '2012-11-30',
    jp: '2012-12-08',
  },
  discontinued: '2017-01-31',
  unitsSold: 13_560_000,
  msrpUsd: 299,
  msrpUsdAdjusted: 420,
  tagline: 'How U will play next.',
  summary:
    'The Wii U put a 6.2-inch touchscreen into a controller and let a game use it as a map, an inventory, an asymmetric second player\'s view, or a television substitute you could carry to another room. It is a genuinely good idea, and it sold 13.5 million units, less than a seventh of the Wii, because the marketing never made clear that this was a new console at all rather than an accessory for the old one. Nintendo\'s president Satoru Iwata took a 50% pay cut over its performance. Then, five years later, Nintendo shipped the same core idea as a machine where the screen simply detaches and goes with you, and it became one of the best-selling consoles ever made.',

  specs: {
    cpu: 'IBM PowerPC "Espresso", three cores',
    cpuClockMhz: 1240,
    ram: '2 GB DDR3, half reserved for the operating system',
    ramBytes: 2_147_483_648,
    resolution: '1920×1080',
    colors: '16.7 million',
    audio: '6-channel PCM, 48 kHz',
    media: 'Wii U Optical Disc, 25 GB',
  },

  relatableSpecs: [
    {
      label: 'Sales vs. the Wii',
      value: '13.5M vs 101.6M',
      comparison:
        'A drop of roughly 87% between one console and its direct successor: the steepest generational collapse any major platform holder has recorded.',
    },
    {
      label: 'The GamePad screen',
      value: '6.2 inches, in hand',
      comparison:
        'Streamed from the console over a private wireless link with almost no delay, so a game could show one thing on the television and something else entirely in your hands.',
    },
    {
      label: 'Memory reserved for the OS',
      value: '1 of 2 GB',
      comparison:
        'Half the console\'s memory was set aside for the system so it could suspend a game and switch to the browser instantly. Developers got the other half, which is a real part of why ports of big multi-platform games so rarely arrived.',
    },
    {
      label: 'What it became',
      value: 'The Switch',
      comparison:
        'Detach the screen instead of tethering it to the living room and the idea works. The Switch has now sold more than ten Wii Us.',
    },
  ],

  mediaKind: 'optical',
  // Not the smaller Blu-ray-case size despite the disc format — the Wii U's
  // actual retail case is the same 190x135x14mm DVD-sized case as the Wii's
  // (they shared shelf space), not the 171mm-tall Blu-ray case used by PS3/
  // PS4/PS5/Xbox One/Xbox Series. See dvd-keepcase's own entry in
  // media-archetypes.ts.
  mediaArchetype: 'dvd-keepcase',
  model: '/models/consoles/wii-u.glb',
  // Anchors measured against the rendered GLB (see snes.ts's hardwareDiagram
  // comment). The model lies flat with its front face along +x; the data's
  // `dimensions` (172 x 46 x 268.5) describe width along z and depth along x,
  // which the GLB matches, but the render measures 264 x 47 x 172 — wider
  // than the spec — so the bounds test validates against renderBox.
  hardwareDiagram: {
    renderBox: { x: [-0.132, 0.132], y: [0, 0.0474], z: [-0.086, 0.086] },
    callouts: [
      {
        label: 'Disc slot: upper centre of the front panel',
        anchor: [0.132, 0.03, -0.005],
        labelOffset: [0.03, 0.02, 0],
      },
      {
        label: 'Eject button: the top-left stack',
        anchor: [0.107, 0.033, -0.055],
        labelOffset: [0.03, 0.02, -0.01],
      },
      {
        label: 'Power button: below eject',
        anchor: [0.132, 0.022, -0.05],
        labelOffset: [0.03, 0.02, -0.01],
      },
      {
        label: 'Sync button: the little red LED',
        anchor: [0.132, 0.016, 0.005],
        labelOffset: [0.03, 0.02, 0],
      },
      {
        label: 'Wii U logo: bottom-right of the front',
        anchor: [0.132, 0.008, 0.05],
        labelOffset: [0.035, -0.015, 0.01],
      },
      {
        label: 'SD card door: right side of the front panel',
        anchor: [0.132, 0.012, 0.06],
        labelOffset: [0.035, 0.015, 0.01],
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
  // Wikipedia: 172mm W x 46mm H x 268.5mm D, lying horizontally.
  dimensions: { width: 172, height: 46, depth: 268.5 },

  variants: [],

  controllers: [
    {
      id: 'wii-u-gamepad',
      name: 'Wii U GamePad',
      model: '/models/controllers/wii-u-gamepad.glb',
      // Published: 255mm wide x 134mm tall x 235mm... no — the GamePad is
      // 255mm across x 134mm front-to-back x 23mm at its thinnest. Re-mapped
      // to this project's convention: width 255 (L-R), height 26 (thickness,
      // averaged over the grips), depth 134 (front-to-back).
      dimensions: { width: 255, height: 26, depth: 134 },
      innovations: [
        'A 6.2-inch resistive touchscreen in the middle of the controller, streaming live video from the console over its own wireless link.',
        'Off-television play: the console keeps running while the television is off or in use by somebody else, which is the Switch\'s whole premise five years early.',
        'A camera, microphone, gyroscope and NFC reader in a controller: hardware later split across the Switch\'s Joy-Cons and amiibo.',
      ],
      buttons: [
        { id: 'stick-l', mesh: 'stick_l', label: 'Left stick', travel: [0, -0.001, 0], position: [-104, 30], shape: 'stick', sizeMm: 30 },
        { id: 'stick-r', mesh: 'stick_r', label: 'Right stick', travel: [0, -0.001, 0], position: [104, 30], shape: 'stick', sizeMm: 30 },
        { id: 'dpad-up', mesh: 'dpad', label: 'D-pad Up', key: 'ArrowUp', travel: [0, -0.0008, 0], position: [-104, -8], shape: 'cross', sizeMm: 24 },
        { id: 'dpad-down', mesh: 'dpad', label: 'D-pad Down', key: 'ArrowDown', travel: [0, -0.0008, 0] },
        { id: 'dpad-left', mesh: 'dpad', label: 'D-pad Left', key: 'ArrowLeft', travel: [0, -0.0008, 0] },
        { id: 'dpad-right', mesh: 'dpad', label: 'D-pad Right', key: 'ArrowRight', travel: [0, -0.0008, 0] },
        { id: 'a', mesh: 'btn_a', label: 'A', key: 'j', travel: [0, -0.0012, 0], position: [116, -6], shape: 'convex', sizeMm: 13 },
        { id: 'b', mesh: 'btn_b', label: 'B', key: 'k', travel: [0, -0.0012, 0], position: [104, -18], shape: 'convex', sizeMm: 13 },
        { id: 'x', mesh: 'btn_x', label: 'X', key: 'u', travel: [0, -0.0012, 0], position: [104, 6], shape: 'convex', sizeMm: 13 },
        { id: 'y', mesh: 'btn_y', label: 'Y', key: 'i', travel: [0, -0.0012, 0], position: [92, -6], shape: 'convex', sizeMm: 13 },
        { id: 'start', mesh: 'btn_start', label: '+', key: 'Enter', travel: [0, -0.0008, 0], position: [72, 40], shape: 'flat', sizeMm: 8 },
        { id: 'select', mesh: 'btn_select', label: '−', key: 'Backspace', travel: [0, -0.0008, 0], position: [-72, 40], shape: 'flat', sizeMm: 8 },
        { id: 'trigger-l', mesh: 'trigger_l', label: 'ZL', key: 'q', travel: [0, -0.002, 0], position: [-108, 58], shape: 'trigger', sizeMm: 28 },
        { id: 'trigger-r', mesh: 'trigger_r', label: 'ZR', key: 'e', travel: [0, -0.002, 0], position: [108, 58], shape: 'trigger', sizeMm: 28 },
      ],
    },
  ],

  facts: [
    {
      id: 'nobody-knew-it-was-a-console',
      title: 'People thought it was a Wii accessory',
      body: 'The name kept "Wii" and added a letter, the console looked much like the old one, and the advertising led with the GamePad rather than the machine. Surveys through 2013 found large numbers of people who believed the Wii U was a tablet controller for the console they already owned. It is the most expensive naming decision in the industry\'s history.',
    },
    {
      id: 'iwata-pay-cut',
      title: 'The president cut his own salary',
      body: 'After the Wii U missed its forecasts badly, Satoru Iwata took a 50% pay cut, with other Nintendo executives taking 20–30%, rather than make layoffs. Iwata had argued publicly that firing developers to survive a bad year destroys the morale a creative company runs on.',
    },
    {
      id: 'blueprint-for-switch',
      title: 'It was the Switch, tethered',
      body: 'A screen in your hands running the console\'s game, so you can keep playing when the television is taken: the Wii U had it in 2012, but the screen only worked within range of the console sitting under the television. The Switch is that idea with the tether cut, and it outsold the Wii U more than tenfold.',
    },
    {
      id: 'best-games-rescued',
      title: 'Its library was mostly rescued later',
      body: 'Mario Kart 8, Super Mario 3D World, Splatoon, Bayonetta 2, Pikmin 3 and Donkey Kong Country: Tropical Freeze were all Wii U games first. Almost all of them were re-released on the Switch and sold several times better there: the same games, on a console people bought.',
    },
  ],

  failureStates: [
    {
      id: 'nand-corruption',
      name: 'Corrupted system memory',
      body: 'Cutting power during a system update can corrupt the internal storage and leave the console unable to boot at all, a failure common enough in the first year that Nintendo offered free repairs for it.',
      target: 'shell',
      effect: 'dim',
    },
    {
      id: 'gamepad-link-loss',
      name: 'GamePad out of range',
      body: 'The GamePad streams video over its own wireless link with a working range of roughly eight metres. Step past it and the screen in your hands drops to a blank panel and a reconnection prompt, while the game keeps running on the television.',
      target: 'slot_led',
      effect: 'blink-amber',
    },
  ],

  diorama: {
    roomKit: 'living-2010s-na',
    footprint: [4.4, 3.8],
    props: [
      { kit: 'sofa', variant: 'leather-black', position: [0, 0, 1.4], rotation: [0, Math.PI, 0] },
      { kit: 'rug', variant: 'berber-cream', position: [0, 0.002, 0.6], scale: 1.2 },
      { kit: 'tv-stand', variant: 'black-lacquer', position: [0, 0, -1.2] },
      { kit: 'side-table', variant: 'glass-chrome', position: [1.3, 0, 1.0] },
      { kit: 'lamp', variant: 'white-shade', position: [1.3, 0.52, 1.0] },
      { kit: 'plant', variant: 'rubber-tree', position: [1.8, 0, -1.1], scale: 1.05 },
      { kit: 'window', variant: 'blinds', position: [1.3, 1.4, -1.85] },
    ],
    tv: {
      id: 'lcd-46-2012',
      model: '/models/tvs/lcd-46.glb',
      label: '46-inch LED-LCD, c. 2012',
      screenInches: 46,
      dimensions: { width: 1080, height: 660, depth: 60 },
      curvature: 0,
      bezelInsetMm: 6,
      aspect: '16:9',
    },
    lighting: {
      id: 'evening-2010s-warm',
      tempK: 3200,
      intensity: 2.6,
      keyPosition: [3.4, 2.2, 1.1],
      ambientIntensity: 0.34,
      backdrop: '#eeeeea',
    },
    tvPosition: [-0.3, 0.62, -1.2],
    tvRotation: [0, 0.1, 0],
    consolePosition: [0.48, 0.5, -1.05],
    consoleRotation: [0, -0.28, 0],
    controllerPosition: [-0.18, 0.014, 0.45],
    controllerRotation: [0, 0.5, 0],
    shelfPosition: [-1.4, 0.55, -1.58],
  },

  games: [
    { rank: 1, title: 'Mario Kart 8', year: 2014, unitsSold: 8_460_000, developer: 'Nintendo EAD', publisher: 'Nintendo', blurb: 'Anti-gravity racing and the console\'s best-seller: then sold another 60 million on the Switch as Deluxe.' },
    { rank: 2, title: 'Super Mario 3D World', year: 2013, unitsSold: 5_860_000, developer: 'Nintendo EAD Tokyo', publisher: 'Nintendo', blurb: 'Four-player 3D Mario with a cat suit, widely called the best game almost nobody played at the time.' },
    { rank: 3, title: 'New Super Mario Bros. U', year: 2012, unitsSold: 5_800_000, developer: 'Nintendo EAD', publisher: 'Nintendo', blurb: 'The launch title, and one of the few games to use the GamePad as a genuine second role: placing blocks for the other players.' },
    { rank: 4, title: 'Super Smash Bros. for Wii U', year: 2014, unitsSold: 5_350_000, developer: 'Sora Ltd. / Bandai Namco', publisher: 'Nintendo', blurb: 'Eight-player matches, the largest the series had ever attempted.' },
    { rank: 5, title: 'Nintendo Land', year: 2012, unitsSold: 5_200_000, developer: 'Nintendo EAD', publisher: 'Nintendo', blurb: 'The pack-in, and the clearest demonstration of asymmetric play the console ever got: one player on the screen, everyone else on the television.' },
    { rank: 6, title: 'Splatoon', year: 2015, unitsSold: 4_930_000, developer: 'Nintendo EAD', publisher: 'Nintendo', blurb: 'A brand-new Nintendo franchise built around covering ground in ink rather than shooting people: the biggest new idea on the console.' },
    { rank: 7, title: 'Donkey Kong Country: Tropical Freeze', year: 2014, unitsSold: 1_720_000, developer: 'Retro Studios', publisher: 'Nintendo', blurb: 'A punishing platformer that found its real audience on the Switch four years later.' },
    { rank: 8, title: 'The Legend of Zelda: Breath of the Wild', year: 2017, unitsSold: 1_690_000, developer: 'Nintendo EPD', publisher: 'Nintendo', blurb: 'Released the same day as the Switch version, on a console being discontinued that month.' },
    { rank: 9, title: 'Pikmin 3', year: 2013, unitsSold: 1_150_000, developer: 'Nintendo EAD', publisher: 'Nintendo', blurb: 'Nine years after Pikmin 2, using the GamePad as the map the series had always wanted.' },
    { rank: 10, title: 'Bayonetta 2', year: 2014, unitsSold: 1_040_000, developer: 'PlatinumGames', publisher: 'Nintendo', blurb: 'Existed only because Nintendo funded it after other publishers passed: an unlikely exclusive for a family console.' },
  ],

  sources: [
    'https://en.wikipedia.org/wiki/Wii_U',
    'https://en.wikipedia.org/wiki/List_of_best-selling_Wii_U_video_games',
    'https://en.wikipedia.org/wiki/Wii_U_GamePad',
    'https://en.wikipedia.org/wiki/Satoru_Iwata',
    'https://en.wikipedia.org/wiki/Splatoon',
  ],
}
