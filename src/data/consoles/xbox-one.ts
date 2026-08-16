import type { ConsoleEntry } from '@/types/console'

/**
 * A console announced as a television box that happened to play games, in
 * front of an audience who wanted the opposite. Microsoft reversed nearly
 * every policy from that announcement within a month, and spent the rest of
 * the generation recovering from an hour of stage time.
 *
 * Sales figures, dates and technical specs from Wikipedia (see `sources`).
 * Controller dimensions re-mapped onto this project's width/thickness/depth
 * convention (see the comment on the controller entry below).
 */
export const xboxOne: ConsoleEntry = {
  id: 'xbox-one',
  name: 'Xbox One',
  shortName: 'Xbox One',
  manufacturer: 'Microsoft',
  generation: 8,
  released: {
    na: '2013-11-22',
    eu: '2013-11-22',
    jp: '2014-09-04',
  },
  discontinued: '2020-07-01',
  unitsSold: 58_000_000,
  msrpUsd: 499,
  msrpUsdAdjusted: 680,
  tagline: 'All in one, input one.',
  summary:
    'Microsoft announced the Xbox One in 2013 as a living-room hub: television passthrough, a Kinect camera required to be plugged in at all times, a mandatory daily internet check, and restrictions on lending or reselling your own games. It also cost $100 more than the PS4 because the camera was not optional. The reaction was severe enough that Microsoft reversed the online and used-game policies within a week, unbundled Kinect within a year, and eventually abandoned the television ambitions entirely. What was left was a good console that spent a generation in second place — and the platform quietly rebuilt itself around things that outlasted the hardware: Game Pass, backwards compatibility running three generations deep, and play across Xbox and PC from one purchase.',

  specs: {
    cpu: 'AMD "Jaguar", eight cores',
    cpuClockMhz: 1750,
    ram: '8 GB DDR3, plus 32 MB ESRAM',
    ramBytes: 8_589_934_592,
    resolution: '1920×1080',
    colors: '16.7 million (10-bit HDR on later models)',
    audio: '7.1 surround, Dolby Atmos on later models',
    media: 'Blu-ray, 50 GB',
  },

  relatableSpecs: [
    {
      label: 'Launch price gap',
      value: '$499 vs $399',
      comparison:
        'A hundred dollars more than the PS4, because Kinect was in every box and could not be removed from the price. Microsoft unbundled it within a year, by which point the generation\'s shape was set.',
    },
    {
      label: 'Policy reversal',
      value: '8 days',
      comparison:
        'Between announcing that games would require a daily online check and reversing it. Almost nothing in consumer electronics has been walked back that fast, or that publicly.',
    },
    {
      label: 'Backwards compatibility',
      value: 'Three generations',
      comparison:
        'By the end of its life it ran a curated library of original Xbox and Xbox 360 games from disc or download, at higher resolution than the hardware they were written for — something no competitor attempted.',
    },
    {
      label: 'Graphics scratchpad',
      value: '32 MB ESRAM',
      comparison:
        'A workaround for slower main memory than the PS4\'s, and awkward enough to program that many multi-platform games ran at a lower resolution on this console for years.',
    },
  ],

  mediaKind: 'optical',
  mediaArchetype: 'bluray-case',
  model: '/models/consoles/xbox-one.glb',
  // Aspirational mesh targets — these name the parts the insert sequence and
  // failure states will drive once an authored model exists. Until then the
  // shell comes from the console form (see console-forms.ts), which generates
  // meshes under exactly these names.
  animatedParts: {
    slot: 'disc_slot',
    powerSwitch: 'power_button',
    ejectLever: 'eject_button',
    led: 'power_logo',
  },
  // Wikipedia: 333mm W x 79mm H x 274mm D (original model).
  dimensions: { width: 333, height: 79, depth: 274 },

  variants: [],

  controllers: [
    {
      id: 'xbox-one-pad',
      name: 'Xbox One Wireless Controller',
      model: '/models/controllers/xbox-one-pad.glb',
      // ~152mm across the grips x 103mm front-to-back, ~60mm thick at the
      // handles — re-mapped to this project's convention: width 152 (L-R),
      // height 60 (thickness), depth 103 (front-to-back).
      dimensions: { width: 152, height: 60, depth: 103 },
      innovations: [
        'Impulse triggers — a separate rumble motor inside each trigger, so a gun\'s recoil or a tyre losing grip is felt under the fingertip rather than through the whole pad.',
        'A d-pad rebuilt as a four-way cross with a real click, replacing the widely disliked disc of the 360 pad.',
        'A 3.5mm headphone jack added in the 2015 revision, ending the proprietary headset adapter.',
      ],
      buttons: [
        { id: 'stick-l', mesh: 'stick_l', label: 'Left stick', travel: [0, -0.001, 0], position: [-45, 16], shape: 'stick', sizeMm: 31 },
        { id: 'stick-r', mesh: 'stick_r', label: 'Right stick', travel: [0, -0.001, 0], position: [19, -16], shape: 'stick', sizeMm: 31 },
        { id: 'dpad-up', mesh: 'dpad', label: 'D-pad Up', key: 'ArrowUp', travel: [0, -0.0008, 0], position: [-19, -16], shape: 'cross', sizeMm: 25 },
        { id: 'dpad-down', mesh: 'dpad', label: 'D-pad Down', key: 'ArrowDown', travel: [0, -0.0008, 0] },
        { id: 'dpad-left', mesh: 'dpad', label: 'D-pad Left', key: 'ArrowLeft', travel: [0, -0.0008, 0] },
        { id: 'dpad-right', mesh: 'dpad', label: 'D-pad Right', key: 'ArrowRight', travel: [0, -0.0008, 0] },
        { id: 'a', mesh: 'btn_a', label: 'A', key: 'j', travel: [0, -0.0012, 0], position: [47, 6], shape: 'convex', sizeMm: 14 },
        { id: 'b', mesh: 'btn_b', label: 'B', key: 'k', travel: [0, -0.0012, 0], position: [60, 18], shape: 'convex', sizeMm: 14 },
        { id: 'x', mesh: 'btn_x', label: 'X', key: 'u', travel: [0, -0.0012, 0], position: [34, 18], shape: 'convex', sizeMm: 14 },
        { id: 'y', mesh: 'btn_y', label: 'Y', key: 'i', travel: [0, -0.0012, 0], position: [47, 30], shape: 'convex', sizeMm: 14 },
        { id: 'menu', mesh: 'btn_menu', label: 'Menu', key: 'Enter', travel: [0, -0.0008, 0], position: [19, 12], shape: 'capsule', sizeMm: 9 },
        { id: 'view', mesh: 'btn_view', label: 'View', key: 'Backspace', travel: [0, -0.0008, 0], position: [-19, 12], shape: 'capsule', sizeMm: 9 },
        { id: 'guide', mesh: 'btn_guide', label: 'Xbox', travel: [0, -0.0008, 0], position: [0, 30], shape: 'convex', sizeMm: 16 },
        { id: 'trigger-l', mesh: 'trigger_l', label: 'LT', key: 'q', travel: [0, -0.002, 0], position: [-53, 43], shape: 'trigger', sizeMm: 30 },
        { id: 'trigger-r', mesh: 'trigger_r', label: 'RT', key: 'e', travel: [0, -0.002, 0], position: [53, 43], shape: 'trigger', sizeMm: 30 },
      ],
    },
  ],

  facts: [
    {
      id: 'the-reversal',
      title: 'Eight days from policy to reversal',
      body: 'The Xbox One was announced requiring an internet check every 24 hours and placing publisher-controlled restrictions on lending or reselling discs. After a sustained public backlash — and a competitor video explaining how to share a PS4 game that consisted of one person handing a disc to another — Microsoft reversed both policies within about a week of E3, before a single console had shipped.',
    },
    {
      id: 'kinect-required',
      title: 'A camera you were not allowed to unplug',
      body: 'The console originally would not function without Kinect connected, an always-listening camera and microphone in the living room announced in the same year as widespread revelations about state surveillance. Microsoft made it optional in a firmware update, then removed it from the box in 2014 to drop the price to match the PS4\'s.',
    },
    {
      id: 'backwards-compatibility',
      title: 'It learned to run its own history',
      body: 'From 2015 the Xbox One could run original Xbox and Xbox 360 games, from the original discs, often at higher resolution and with steadier frame rates than the hardware they were written for. It was done game by game with rights cleared individually, and it is the reason a 2001 Xbox disc still works on hardware sold today.',
    },
    {
      id: 'game-pass-pivot',
      title: 'The platform outgrew the box',
      body: 'Game Pass launched in 2017 as a subscription library, and Microsoft began releasing its own games to Xbox and PC simultaneously, included on day one. It was the beginning of a strategy that treats the console as one way in rather than the product itself — the position the company still holds.',
    },
  ],

  failureStates: [
    {
      id: 'disc-drive-grinding',
      name: 'Disc drive grinding',
      body: 'A batch of launch consoles shipped with drives that made a loud grinding noise and refused to load discs. Microsoft acknowledged it within days and sent replacement consoles along with a free download of the affected game.',
      target: 'disc_slot',
      effect: 'no-signal',
    },
    {
      id: 'power-brick-amber',
      name: 'Power supply amber light',
      body: 'The external power supply shows amber instead of white when it has failed or overheated, and the console will not start. The brick, not the console, is the part that has aged worst.',
      target: 'power_logo',
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
      id: 'lcd-50-2013',
      model: '/models/tvs/lcd-50.glb',
      label: '50-inch LED-LCD, c. 2013',
      screenInches: 50,
      dimensions: { width: 1150, height: 690, depth: 55 },
      curvature: 0,
      bezelInsetMm: 5,
      aspect: '16:9',
    },
    lighting: {
      id: 'evening-2010s-cool',
      tempK: 3700,
      intensity: 2.4,
      keyPosition: [3.5, 2.2, 1.1],
      ambientIntensity: 0.28,
      backdrop: '#15171c',
    },
    tvPosition: [-0.3, 0.62, -1.2],
    tvRotation: [0, 0.1, 0],
    consolePosition: [0.5, 0.5, -1.05],
    consoleRotation: [0, -0.3, 0],
    controllerPosition: [-0.18, 0.014, 0.45],
    controllerRotation: [0, 0.5, 0],
    shelfPosition: [-1.4, 0.55, -1.58],
  },

  games: [
    { rank: 1, title: 'Grand Theft Auto V', year: 2014, unitsSold: 8_000_000, developer: 'Rockstar North', publisher: 'Rockstar Games', blurb: 'A re-release of a last-generation game that outsold nearly everything built for this one.' },
    { rank: 2, title: 'Call of Duty: Black Ops III', year: 2015, unitsSold: 6_800_000, developer: 'Treyarch', publisher: 'Activision', blurb: 'Wall-running and thruster jumps, at the point the series was pushing hardest away from the ground.' },
    { rank: 3, title: 'Minecraft', year: 2014, unitsSold: 6_000_000, developer: 'Mojang', publisher: 'Microsoft Studios', blurb: 'Microsoft bought Mojang for $2.5 billion the year this version shipped, and it has looked cheap ever since.' },
    { rank: 4, title: 'Call of Duty: WWII', year: 2017, unitsSold: 5_100_000, developer: 'Sledgehammer Games', publisher: 'Activision', blurb: 'The series returning to the war it started with, after a decade in the future.' },
    { rank: 5, title: 'Halo 5: Guardians', year: 2015, unitsSold: 5_000_000, developer: '343 Industries', publisher: 'Microsoft Studios', blurb: 'The console\'s biggest exclusive, and the first mainline Halo with no split-screen campaign — a decision that did not go over well.' },
    { rank: 6, title: 'Fallout 4', year: 2015, unitsSold: 4_300_000, developer: 'Bethesda Game Studios', publisher: 'Bethesda Softworks', blurb: 'The first console Fallout to support mods, which Bethesda enabled on Xbox before PlayStation.' },
    { rank: 7, title: 'Red Dead Redemption 2', year: 2018, unitsSold: 4_200_000, developer: 'Rockstar Studios', publisher: 'Rockstar Games', blurb: 'Eight years in development, and among the most detailed worlds ever built for a console.' },
    { rank: 8, title: 'FIFA 17', year: 2016, unitsSold: 3_600_000, developer: 'EA Vancouver', publisher: 'EA Sports', blurb: 'The first FIFA on the Frostbite engine, and the first with a story mode.' },
    { rank: 9, title: 'Forza Horizon 4', year: 2018, unitsSold: 3_400_000, developer: 'Playground Games', publisher: 'Microsoft Studios', blurb: 'An open Britain with changing seasons shared across every player at once.' },
    { rank: 10, title: 'Gears of War 4', year: 2016, unitsSold: 3_000_000, developer: 'The Coalition', publisher: 'Microsoft Studios', blurb: 'The first Gears made after Microsoft bought the series outright from Epic.' },
  ],

  sources: [
    'https://en.wikipedia.org/wiki/Xbox_One',
    'https://en.wikipedia.org/wiki/Xbox_One_controller',
    'https://en.wikipedia.org/wiki/Xbox_Game_Pass',
    'https://en.wikipedia.org/wiki/List_of_Xbox_One_games',
    'https://en.wikipedia.org/wiki/Backward_compatibility',
  ],
}
