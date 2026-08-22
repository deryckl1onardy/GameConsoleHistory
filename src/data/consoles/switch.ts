import type { ConsoleEntry } from '@/types/console'

/**
 * The Wii U's idea with the tether cut. A tablet that slides into a dock for
 * the television and slides back out to leave with you, with controllers that
 * detach from its sides and become a pair. It arrived eight weeks after
 * Nintendo's worst-selling console was discontinued, and became one of the
 * best-selling machines ever made.
 *
 * Sales figures, dates and technical specs from Wikipedia (see `sources`).
 * Controller dimensions re-mapped onto this project's width/thickness/depth
 * convention (see the comment on the controller entry below).
 */
export const nintendoSwitch: ConsoleEntry = {
  id: 'switch',
  name: 'Nintendo Switch',
  shortName: 'Switch',
  manufacturer: 'Nintendo',
  generation: 8,
  released: {
    jp: '2017-03-03',
    na: '2017-03-03',
    eu: '2017-03-03',
  },
  unitsSold: 156_590_000,
  msrpUsd: 299,
  msrpUsdAdjusted: 390,
  tagline: 'Play anywhere.',
  summary:
    'The Switch is a tablet. Drop it into the dock and it plays on the television; lift it out mid-game and the same save keeps running in your hands; slide the controllers off its sides and there are two of them, one for each player, with no extra purchase. Nintendo had tried the second half of this idea on the Wii U and failed to explain it; here the explanation is the object itself, and the first advertisement was essentially a person picking the console up and walking out of the room. It launched alongside Breath of the Wild, sold more units than the Wii, and made the distinction between a home console and a handheld, a line Nintendo itself had drawn for thirty years, simply stop existing.',

  specs: {
    cpu: 'NVIDIA Tegra X1, four ARM Cortex-A57 cores',
    cpuClockMhz: 1020,
    ram: '4 GB LPDDR4',
    ramBytes: 4_294_967_296,
    resolution: '1280×720 handheld, 1920×1080 docked',
    colors: '16.7 million',
    audio: 'Linear PCM 5.1, supported over HDMI',
    media: 'Game Card, up to 32 GB',
  },

  relatableSpecs: [
    {
      label: 'Two consoles, one machine',
      value: 'Dock or handheld',
      comparison:
        'It downclocks itself when undocked and runs at a lower resolution on the smaller screen. The game does not restart, pause or reload: the transition happens while you are holding it.',
    },
    {
      label: 'Two controllers, in the box',
      value: 'Joy-Cons split',
      comparison:
        'Slide the two halves off the sides and each becomes a complete miniature controller. Every Switch ships able to play two-player without anyone buying anything.',
    },
    {
      label: 'The cartridge',
      value: 'Coated to taste awful',
      comparison:
        'Nintendo applies denatonium benzoate, one of the most bitter compounds known, to the Game Cards so that a child who puts one in their mouth spits it out immediately.',
    },
    {
      label: 'Sales vs. the Wii U',
      value: '156M vs 13.5M',
      comparison:
        'The same core idea, five years apart, and more than eleven times the sales. The difference is almost entirely that this version could leave the house.',
    },
  ],

  mediaKind: 'card',
  mediaArchetype: 'switch-case',
  model: '/models/consoles/switch.glb',
  // Anchors measured against the rendered GLB (see snes.ts's hardwareDiagram
  // comment). The model is the handheld in table-top mode: both Joy-Cons and
  // the deployed kickstand are fused into one mesh, and the screen faces -z
  // (the hero yaw carries the half-turn that shows it to the room). The data's
  // `dimensions` describe the tablet alone (173 x 104 x 54mm), but the render
  // is 243 x 101 x 51mm — the Joy-Cons widen it and the open kickstand
  // inflates the depth — so the bounds test validates against renderBox.
  hardwareDiagram: {
    renderBox: { x: [-0.1214, 0.1214], y: [0, 0.1008], z: [-0.0253, 0.0253] },
    callouts: [
      {
        label: '7-inch LCD: 1280×720, the console is also the screen',
        anchor: [0, 0.055, -0.009],
        labelOffset: [0, 0.04, -0.005],
      },
      {
        label: 'Left Joy-Con: stick, d-pad and capture button',
        anchor: [-0.105, 0.05, -0.013],
        labelOffset: [-0.035, 0.02, 0],
      },
      {
        label: 'Right Joy-Con: stick, face buttons and home',
        anchor: [0.105, 0.05, -0.01],
        labelOffset: [0.035, 0.02, 0],
      },
      {
        label: 'Kickstand: the whole console rests on this flap',
        anchor: [-0.07, 0.012, 0.024],
        labelOffset: [-0.01, 0.04, 0.01],
      },
      {
        label: 'USB-C port: bottom edge, centre',
        anchor: [0, 0.012, -0.024],
        labelOffset: [0, -0.035, -0.005],
      },
      {
        label: 'Game card slot: top edge, left of centre',
        anchor: [-0.04, 0.098, 0.005],
        labelOffset: [-0.03, 0.03, 0],
      },
    ],
  },
  // Aspirational mesh targets — these name the parts the insert sequence and
  // failure states will drive once an authored model exists. Until then the
  // shell comes from the console form (see console-forms.ts), which generates
  // meshes under exactly these names. The dock-plus-tablet split is the part a
  // swept profile cannot express — see the note on the form.
  animatedParts: {
    slot: 'card_slot',
    powerSwitch: 'power_button',
    led: 'dock_led',
  },
  // The DOCK's dimensions, since the dock is what sits in the living room and
  // what the diorama stages: 173mm W x 104mm H x 54mm D. The tablet itself is
  // 239 x 102 x 13.9mm.
  dimensions: { width: 173, height: 104, depth: 54 },

  variants: [],

  controllers: [
    {
      id: 'joy-con-pair',
      name: 'Joy-Con pair (in grip)',
      model: '/models/controllers/joy-con-grip.glb',
      // The pair held in the supplied grip: ~152mm across x 106mm
      // front-to-back x 60mm thick at the handles. Re-mapped to this project's
      // convention: width 152 (L-R), height 60 (thickness), depth 106.
      dimensions: { width: 152, height: 60, depth: 106 },
      innovations: [
        'They detach and become two independent controllers, so a second player costs nothing and needs no setup.',
        'HD Rumble: a linear resonant actuator precise enough to simulate individual objects, the standard demonstration is counting virtual ice cubes rolling inside a glass you cannot see.',
        'An infrared depth camera in the right Joy-Con that can read shapes and distance, and a gyroscope in each half for independent motion aiming.',
      ],
      buttons: [
        { id: 'stick-l', mesh: 'stick_l', label: 'Left stick', travel: [0, -0.001, 0], position: [-45, 18], shape: 'stick', sizeMm: 28 },
        { id: 'stick-r', mesh: 'stick_r', label: 'Right stick', travel: [0, -0.001, 0], position: [19, -16], shape: 'stick', sizeMm: 28 },
        { id: 'dpad-up', mesh: 'dpad', label: 'Up', key: 'ArrowUp', travel: [0, -0.0008, 0], position: [-19, -16], shape: 'cross', sizeMm: 22 },
        { id: 'dpad-down', mesh: 'dpad', label: 'Down', key: 'ArrowDown', travel: [0, -0.0008, 0] },
        { id: 'dpad-left', mesh: 'dpad', label: 'Left', key: 'ArrowLeft', travel: [0, -0.0008, 0] },
        { id: 'dpad-right', mesh: 'dpad', label: 'Right', key: 'ArrowRight', travel: [0, -0.0008, 0] },
        { id: 'a', mesh: 'btn_a', label: 'A', key: 'j', travel: [0, -0.0012, 0], position: [59, 18], shape: 'convex', sizeMm: 13 },
        { id: 'b', mesh: 'btn_b', label: 'B', key: 'k', travel: [0, -0.0012, 0], position: [47, 6], shape: 'convex', sizeMm: 13 },
        { id: 'x', mesh: 'btn_x', label: 'X', key: 'u', travel: [0, -0.0012, 0], position: [47, 30], shape: 'convex', sizeMm: 13 },
        { id: 'y', mesh: 'btn_y', label: 'Y', key: 'i', travel: [0, -0.0012, 0], position: [35, 18], shape: 'convex', sizeMm: 13 },
        { id: 'plus', mesh: 'btn_plus', label: '+', key: 'Enter', travel: [0, -0.0008, 0], position: [24, 34], shape: 'flat', sizeMm: 8 },
        { id: 'minus', mesh: 'btn_minus', label: '−', key: 'Backspace', travel: [0, -0.0008, 0], position: [-24, 34], shape: 'flat', sizeMm: 8 },
        { id: 'trigger-l', mesh: 'trigger_l', label: 'ZL', key: 'q', travel: [0, -0.002, 0], position: [-53, 44], shape: 'trigger', sizeMm: 28 },
        { id: 'trigger-r', mesh: 'trigger_r', label: 'ZR', key: 'e', travel: [0, -0.002, 0], position: [53, 44], shape: 'trigger', sizeMm: 28 },
      ],
    },
  ],

  facts: [
    {
      id: 'the-tether-cut',
      title: 'The Wii U, portable',
      body: 'A screen in your hands running the console\'s game is exactly what the Wii U offered in 2012, and it sold 13.5 million units. The Switch is the same proposition with the range limit removed, and it has sold over 150 million. The lesson Nintendo took was not that the idea was wrong but that it had to be obvious: you understand the Switch by watching somebody pick it up.',
    },
    {
      id: 'bitter-cartridges',
      title: 'The cartridges are deliberately foul',
      body: 'Nintendo coats Switch Game Cards in denatonium benzoate, among the bitterest substances known, specifically so that a small child who puts one in their mouth immediately spits it out. It works, and a minor genre of people tasting them on camera exists as a result.',
    },
    {
      id: 'joy-con-drift',
      title: 'A defect that ended in court',
      body: 'The Joy-Con analog sticks wear internally and start reporting movement that is not happening: "drift". It became widespread enough to draw class-action lawsuits and a formal European consumer-group complaint, and Nintendo eventually repaired affected controllers free of charge regardless of warranty status.',
    },
    {
      id: 'launch-with-zelda',
      title: 'It launched with a masterpiece',
      body: 'Breath of the Wild released the same day as the console and was scored as one of the best-reviewed games ever made. For a period after launch it had an attach rate above 100% in some regions: more copies sold than consoles existed, because people were buying it before they could find hardware.',
    },
  ],

  failureStates: [
    {
      id: 'joy-con-drift-state',
      name: 'Joy-Con drift',
      body: 'Dust and wear inside the analog stick module make it report input with nothing touching it, so a character walks slowly in one direction on its own. It is the defining hardware fault of this console and it affects the controller, not the machine.',
      target: 'stick_l',
      effect: 'dim',
    },
    {
      id: 'dock-screen-scratch',
      name: 'Dock scratching the screen',
      body: 'The original dock holds the tablet against a hard plastic lip with no give, and sliding it in and out repeatedly can score the unprotected screen: a design fault that launched an entire market in third-party docks and screen protectors.',
      target: 'dock_led',
      effect: 'dim',
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
      id: 'lcd-55-2017',
      model: '/models/tvs/lcd-55.glb',
      label: '55-inch 4K LED-LCD, c. 2017',
      screenInches: 55,
      dimensions: { width: 1240, height: 730, depth: 50 },
      curvature: 0,
      bezelInsetMm: 4,
      aspect: '16:9',
    },
    lighting: {
      id: 'afternoon-2020s',
      tempK: 4400,
      intensity: 3.0,
      keyPosition: [3.2, 2.4, 1.0],
      ambientIntensity: 0.42,
      backdrop: '#eeeeea',
    },
    tvPosition: [-0.3, 0.62, -1.2],
    tvRotation: [0, 0.1, 0],
    consolePosition: [0.5, 0.5, -1.05],
    // The GLB is authored back-first (screen on its -z face, kickstand + logo
    // on +z), so the yaw carries an extra half-turn to show the screen — the
    // reason the other consoles' yaw is just a small tilt.
    consoleRotation: [0, Math.PI - 0.24, 0],
    controllerPosition: [-0.18, 0.014, 0.45],
    controllerRotation: [0, 0.5, 0],
    shelfPosition: [-1.4, 0.55, -1.58],
  },

  games: [
    { rank: 1, title: 'Mario Kart 8 Deluxe', year: 2017, unitsSold: 69_180_000, developer: 'Nintendo EPD', publisher: 'Nintendo', blurb: 'A Wii U game given a second life, and now one of the best-selling games ever released on any platform.' },
    { rank: 2, title: 'Animal Crossing: New Horizons', year: 2020, unitsSold: 47_910_000, developer: 'Nintendo EPD', publisher: 'Nintendo', blurb: 'Released three days after much of the world went into lockdown, and became the year\'s defining social space.' },
    { rank: 3, title: 'Super Smash Bros. Ultimate', year: 2018, unitsSold: 36_310_000, developer: 'Sora Ltd. / Bandai Namco', publisher: 'Nintendo', blurb: 'Every fighter from every previous game in the series, all at once: an act of preservation as much as a sequel.' },
    { rank: 4, title: 'The Legend of Zelda: Breath of the Wild', year: 2017, unitsSold: 32_620_000, developer: 'Nintendo EPD', publisher: 'Nintendo', blurb: 'The launch title, built around letting you walk to anything you can see, including the final boss.' },
    { rank: 5, title: 'Super Mario Odyssey', year: 2017, unitsSold: 29_040_000, developer: 'Nintendo EPD', publisher: 'Nintendo', blurb: 'Mario throws his hat onto other creatures and becomes them, which turns the whole game into a toy box.' },
    { rank: 6, title: 'Pokémon Sword and Shield', year: 2019, unitsSold: 26_690_000, developer: 'Game Freak', publisher: 'Nintendo', blurb: 'The first mainline Pokémon built for a television as well as a handheld.' },
    { rank: 7, title: 'Pokémon Scarlet and Violet', year: 2022, unitsSold: 26_380_000, developer: 'Game Freak', publisher: 'Nintendo', blurb: 'The series\' first fully open world, shipped in a rough technical state that dominated its reception.' },
    { rank: 8, title: 'The Legend of Zelda: Tears of the Kingdom', year: 2023, unitsSold: 21_790_000, developer: 'Nintendo EPD', publisher: 'Nintendo', blurb: 'Let players glue arbitrary objects together into machines, and largely survived contact with what they built.' },
    { rank: 9, title: 'Super Mario Party', year: 2018, unitsSold: 21_040_000, developer: 'Nd Cube', publisher: 'Nintendo', blurb: 'Built around a single detached Joy-Con per player, which the console supplies two of by default.' },
    { rank: 10, title: 'New Super Mario Bros. U Deluxe', year: 2019, unitsSold: 18_170_000, developer: 'Nintendo EPD', publisher: 'Nintendo', blurb: 'Another Wii U rescue, and it outsold the original several times over.' },
  ],

  sources: [
    'https://en.wikipedia.org/wiki/Nintendo_Switch',
    'https://en.wikipedia.org/wiki/List_of_best-selling_Nintendo_Switch_video_games',
    'https://en.wikipedia.org/wiki/Joy-Con',
    'https://en.wikipedia.org/wiki/The_Legend_of_Zelda:_Breath_of_the_Wild',
    'https://en.wikipedia.org/wiki/Nintendo_Switch_game_card',
  ],
}
