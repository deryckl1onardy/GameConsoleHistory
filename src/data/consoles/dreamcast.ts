import type { ConsoleEntry } from '@/types/console'

/**
 * Sega's last console, and the one that arrived with the next decade's ideas
 * already built in: a modem in every box, a memory card with its own screen,
 * and arcade-quality 3D two years before its competition. It sold well, then
 * stopped — Sega left the hardware business eighteen months after the North
 * American launch, while the machine was still winning its reviews.
 *
 * Sales figures, dates and technical specs from Wikipedia (see `sources`).
 * Controller dimensions re-mapped onto this project's width/thickness/depth
 * convention (see the comment on the controller entry below).
 */
export const dreamcast: ConsoleEntry = {
  id: 'dreamcast',
  name: 'Sega Dreamcast',
  shortName: 'Dreamcast',
  manufacturer: 'Sega',
  generation: 6,
  released: {
    jp: '1998-11-27',
    na: '1999-09-09',
    eu: '1999-10-14',
  },
  discontinued: '2001-03-31',
  unitsSold: 9_130_000,
  msrpUsd: 199,
  msrpUsdAdjusted: 380,
  tagline: 'It\'s thinking.',
  summary:
    'The Dreamcast shipped in 1999 with a 56k modem in every single box, at a time when "online console gaming" was a thing almost nobody had done. Sega ran the network itself, mailed out the dial-up software, and let players compete across the country over a phone line. Its memory card was a tiny handheld computer with an LCD screen you could unplug and take with you. Its launch day in North America, 9/9/99, took $98 million in twenty-four hours. And then it stopped: eighteen months later Sega announced it was leaving the hardware business entirely, killing a console that was still reviewing better than anything else on the shelf. It is the rare machine remembered almost entirely for what it started rather than what it finished.',

  specs: {
    cpu: 'Hitachi SH-4',
    cpuClockMhz: 200,
    ram: '16 MB main RAM, 8 MB video RAM, 2 MB audio RAM',
    ramBytes: 16_777_216,
    resolution: '640×480 (VGA-capable)',
    colors: '16.7 million',
    audio: 'Yamaha AICA with an ARM7 core, 64 channels',
    media: 'GD-ROM, 1.2 GB',
  },

  relatableSpecs: [
    {
      label: 'Modem, included',
      value: '56 kbit/s',
      comparison:
        'Every Dreamcast ever sold had one in the box. The PS2 charged extra for a network adapter, and the Xbox launched two years later. Sega simply assumed the internet was part of a console and priced it in.',
    },
    {
      label: 'The memory card',
      value: 'Its own screen',
      comparison:
        'The VMU had an LCD, a d-pad, buttons and a battery. You could unplug your save file and it became a tiny handheld game. Nothing before or since has treated a memory card as a device in its own right.',
    },
    {
      label: 'Launch day takings',
      value: '$98.4M in 24h',
      comparison:
        'Sega\'s 9/9/99 launch out-grossed every film opening weekend of that year. The console was not failing when Sega discontinued it.',
    },
    {
      label: 'Time on sale',
      value: '~18 months',
      comparison:
        'From the North American launch to Sega\'s exit from hardware. The PS2, announced during that window, outlived it by more than a decade.',
    },
  ],

  mediaKind: 'optical',
  // Not the standard tall jewel-cd shell — Dreamcast used a visibly
  // shorter, squarer case. See the `jewel-square` archetype in
  // media-archetypes.ts for the sourcing.
  mediaArchetype: 'jewel-square',
  model: '/models/consoles/dreamcast.glb',
  // Measured against the actual rendered GLB (see snes.ts's hardwareDiagram
  // comment for the method). The front face (ports + SEGA logo) is the +x
  // face; the box is 197 x 67 x 189mm, close enough to the spec that the
  // bounds test uses the published dimensions.
  hardwareDiagram: {
    callouts: [
      {
        label: 'Controller ports (×4): the VMU lives in the pad, not the console',
        anchor: [0.082, 0.045, 0],
        labelOffset: [0.03, 0.025, 0],
      },
      {
        label: 'SEGA logo: embossed above the port panel',
        anchor: [0.081, 0.055, 0],
        labelOffset: [0.045, 0.005, 0],
      },
      {
        label: 'Disc lid: the GD-ROM loads through the top',
        anchor: [0, 0.0668, 0.02],
        labelOffset: [0, 0.03, 0.02],
      },
      {
        label: 'Power button: top deck, front-left',
        anchor: [0.055, 0.061, -0.05],
        labelOffset: [0.015, 0.03, -0.015],
      },
    ],
  },
  // Aspirational mesh targets — these name the parts the insert sequence and
  // failure states will drive once an authored model exists. Until then the
  // shell comes from the console form (see console-forms.ts), which generates
  // meshes under exactly these names.
  animatedParts: {
    lid: 'disc_lid',
    powerSwitch: 'power_button',
    led: 'power_led',
  },
  // Wikipedia: 190mm W x 76mm H x 195.8mm D.
  dimensions: { width: 190, height: 76, depth: 195.8 },

  variants: [],

  controllers: [
    {
      id: 'dreamcast-pad',
      name: 'Dreamcast Controller',
      model: '/models/controllers/dreamcast-pad.glb',
      // Published footprint is ~175mm across the grips x 115mm front-to-back,
      // 78mm thick at the handles — re-mapped to this project's convention:
      // width 175 (L-R), height 78 (thickness), depth 115 (front-to-back).
      dimensions: { width: 175, height: 78, depth: 115 },
      innovations: [
        'Two analog triggers on the back: pressure-sensitive rather than on/off, which is why racing games on this console had genuinely progressive braking.',
        'A window in the middle of the pad holding one or two VMUs, so a game could put a second screen in your hands without any extra hardware.',
      ],
      buttons: [
        { id: 'dpad-up', mesh: 'dpad', label: 'D-pad Up', key: 'ArrowUp', travel: [0, -0.0008, 0], position: [-48, 12], shape: 'cross', sizeMm: 26 },
        { id: 'dpad-down', mesh: 'dpad', label: 'D-pad Down', key: 'ArrowDown', travel: [0, -0.0008, 0] },
        { id: 'dpad-left', mesh: 'dpad', label: 'D-pad Left', key: 'ArrowLeft', travel: [0, -0.0008, 0] },
        { id: 'dpad-right', mesh: 'dpad', label: 'D-pad Right', key: 'ArrowRight', travel: [0, -0.0008, 0] },
        { id: 'stick', mesh: 'analog_stick', label: 'Analog stick', travel: [0, -0.001, 0], position: [-20, -18], shape: 'stick', sizeMm: 30 },
        { id: 'a', mesh: 'btn_a', label: 'A', key: 'j', travel: [0, -0.0012, 0], position: [48, 2], shape: 'convex', sizeMm: 15 },
        { id: 'b', mesh: 'btn_b', label: 'B', key: 'k', travel: [0, -0.0012, 0], position: [64, 12], shape: 'convex', sizeMm: 15 },
        { id: 'x', mesh: 'btn_x', label: 'X', key: 'u', travel: [0, -0.0012, 0], position: [34, 16], shape: 'convex', sizeMm: 15 },
        { id: 'y', mesh: 'btn_y', label: 'Y', key: 'i', travel: [0, -0.0012, 0], position: [50, 26], shape: 'convex', sizeMm: 15 },
        { id: 'start', mesh: 'btn_start', label: 'Start', key: 'Enter', travel: [0, -0.0008, 0], position: [0, 20], shape: 'capsule', sizeMm: 10 },
        { id: 'trigger-l', mesh: 'trigger_l', label: 'L Trigger', key: 'q', travel: [0, -0.002, 0], position: [-62, 40], shape: 'trigger', sizeMm: 30 },
        { id: 'trigger-r', mesh: 'trigger_r', label: 'R Trigger', key: 'e', travel: [0, -0.002, 0], position: [62, 40], shape: 'trigger', sizeMm: 30 },
      ],
    },
  ],

  facts: [
    {
      id: 'vmu-second-screen',
      title: 'The memory card was a handheld console',
      body: 'The Visual Memory Unit slotted into the controller, but pull it out and it was a self-contained device: LCD screen, d-pad, two buttons, a battery and a clock. Games wrote miniature versions of themselves onto it. You could raise a Chao from Sonic Adventure on the bus and plug it back in at home. It also faced the player through a window in the pad, so a game could show you private information the other player could not see.',
    },
    {
      id: 'online-in-the-box',
      title: 'Online, included, in 1999',
      body: 'Every Dreamcast shipped with a 56k modem and Sega ran the service itself. Phantasy Star Online, in 2000, was the first console game to put strangers from different countries into the same persistent world, and it solved the language problem with a built-in word-selection chat system that let players who shared no language still coordinate.',
    },
    {
      id: 'shenmue-budget',
      title: 'The most expensive game ever made, at the time',
      body: 'Shenmue reportedly cost around $47 million to develop, a figure so far beyond any game before it that it was widely reported as impossible to recoup on a console with nine million owners. It simulated a whole Japanese town with weather, shops that kept opening hours, and hundreds of individually voiced residents.',
    },
    {
      id: 'discontinued-while-winning',
      title: 'Cancelled while it was still good',
      body: 'Sega announced its exit from hardware in January 2001, barely sixteen months after the North American launch. The company had lost the previous two generations and could not absorb the cost of fighting the PS2, so it became a software publisher instead, and started making Sonic games for Nintendo, which would have been unthinkable a year earlier.',
    },
  ],

  failureStates: [
    {
      id: 'gd-rom-laser',
      name: 'GD-ROM drive failure',
      body: 'The Dreamcast\'s drive spins its disc considerably faster than a CD player and is audible from across the room. As the laser assembly ages it loses the ability to read the high-density area of a GD-ROM, so the console boots, shows its swirl, and then simply reports no disc, with the drive still audibly trying.',
      target: 'disc_lid',
      effect: 'no-signal',
    },
    {
      id: 'dead-clock-battery',
      name: 'Dead clock battery',
      body: 'A rechargeable cell on the board keeps the date and time. Once it stops holding charge, and after twenty-five years most have, every boot stops at the date-entry screen, and any game that reads the clock behaves as though it is permanently 1998.',
      target: 'shell',
      effect: 'dim',
    },
  ],

  diorama: {
    roomKit: 'den-90s-na',
    footprint: [4.2, 3.6],
    props: [
      { kit: 'sofa', variant: 'leather-black', position: [0, 0, 1.35], rotation: [0, Math.PI, 0] },
      { kit: 'rug', variant: 'berber-cream', position: [0, 0.002, 0.55], scale: 1.15 },
      { kit: 'tv-stand', variant: 'black-lacquer', position: [0, 0, -1.15] },
      { kit: 'side-table', variant: 'glass-chrome', position: [1.25, 0, 0.95] },
      { kit: 'lamp', variant: 'white-shade', position: [1.25, 0.52, 0.95] },
      { kit: 'plant', variant: 'rubber-tree', position: [1.75, 0, -1.05], scale: 1.05 },
      { kit: 'poster', variant: 'band', position: [-2.06, 1.5, -0.4], rotation: [0, Math.PI / 2, 0] },
      { kit: 'window', variant: 'blinds', position: [1.25, 1.4, -1.78] },
    ],
    tv: {
      id: 'crt-27-1999',
      model: '/models/tvs/crt-27.glb',
      label: '27-inch consumer CRT, c. 1999',
      screenInches: 27,
      dimensions: { width: 640, height: 560, depth: 560 },
      curvature: 0.46,
      bezelInsetMm: 16,
      aspect: '4:3',
    },
    lighting: {
      id: 'evening-1999',
      tempK: 3300,
      intensity: 2.8,
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
    { rank: 1, title: 'Sonic Adventure', year: 1998, unitsSold: 2_500_000, developer: 'Sonic Team', publisher: 'Sega', blurb: 'The launch title, and the first fully 3D Sonic: it also introduced the Chao you raised on the memory card\'s own screen.' },
    { rank: 2, title: 'Shenmue', year: 1999, unitsSold: 1_200_000, developer: 'Sega AM2', publisher: 'Sega', blurb: 'A revenge story wrapped around a town simulator so detailed it tracked the weather of a real 1986 winter.' },
    { rank: 3, title: 'Crazy Taxi', year: 1999, unitsSold: 1_160_000, developer: 'Hitmaker', publisher: 'Sega', blurb: 'An arcade port that kept its licensed soundtrack and its stopwatch, and became the console\'s shorthand for "pick up and play".' },
    { rank: 4, title: 'Resident Evil – Code: Veronica', year: 2000, unitsSold: 1_140_000, developer: 'Capcom', publisher: 'Capcom', blurb: 'The first Resident Evil built with real-time 3D backgrounds instead of pre-rendered stills.' },
    { rank: 5, title: 'Sonic Adventure 2', year: 2001, unitsSold: 1_000_000, developer: 'Sonic Team', publisher: 'Sega', blurb: 'Released in the console\'s final months, and the last Sonic game Sega ever made for its own hardware.' },
    { rank: 6, title: 'Soulcalibur', year: 1999, unitsSold: 1_000_000, developer: 'Namco', publisher: 'Namco', blurb: 'Widely held to have surpassed its own arcade original, a claim almost no home port could make at the time.' },
    { rank: 7, title: 'Phantasy Star Online', year: 2000, unitsSold: 900_000, developer: 'Sonic Team', publisher: 'Sega', blurb: 'The first console game to put players from different countries in one persistent world, with a word-selection chat system to bridge the languages.' },
    { rank: 8, title: 'NFL 2K1', year: 2000, unitsSold: 900_000, developer: 'Visual Concepts', publisher: 'Sega', blurb: 'Online console football a full generation before it was normal, priced deliberately under the market leader.' },
    { rank: 9, title: 'Jet Set Radio', year: 2000, unitsSold: 500_000, developer: 'Smilebit', publisher: 'Sega', blurb: 'The game that put cel-shading on the map: flat ink outlines over 3D geometry, copied everywhere afterwards.' },
    { rank: 10, title: 'Marvel vs. Capcom 2', year: 2000, unitsSold: 500_000, developer: 'Capcom', publisher: 'Capcom', blurb: 'Fifty-six characters and three-on-three tag fighting, still played competitively decades later.' },
  ],

  sources: [
    'https://en.wikipedia.org/wiki/Dreamcast',
    'https://en.wikipedia.org/wiki/List_of_best-selling_Dreamcast_video_games',
    'https://en.wikipedia.org/wiki/VMU',
    'https://en.wikipedia.org/wiki/Shenmue',
    'https://en.wikipedia.org/wiki/Phantasy_Star_Online',
  ],
}
