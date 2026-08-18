import type { ConsoleEntry } from '@/types/console'

/**
 * The console that got a year's head start, invented the achievement, and
 * then broke in the field on a scale no other console has matched. Microsoft
 * set aside $1.15 billion to repair it, extended the warranty to three years,
 * and kept the platform — the 360 went on to outsell its predecessor more
 * than three times over.
 *
 * Sales figures, dates and technical specs from Wikipedia (see `sources`).
 * Controller dimensions re-mapped onto this project's width/thickness/depth
 * convention (see the comment on the controller entry below).
 */
export const xbox360: ConsoleEntry = {
  id: 'xbox-360',
  name: 'Xbox 360',
  shortName: 'Xbox 360',
  manufacturer: 'Microsoft',
  generation: 7,
  released: {
    na: '2005-11-22',
    eu: '2005-12-02',
    jp: '2005-12-10',
  },
  discontinued: '2016-04-20',
  unitsSold: 84_000_000,
  msrpUsd: 299,
  msrpUsdAdjusted: 490,
  tagline: 'Jump in.',
  summary:
    'Microsoft launched a full year before Sony and spent that year building the things the generation would be remembered for: achievements attached to every game as a platform-wide system, a digital storefront that made small downloadable games a real business, and an online service that had already been running for three years while its competitors were still building theirs. It also failed, constantly. Early consoles overheated until the motherboard flexed and the solder joints cracked, and the three red lights that resulted became the best-known error message in console history. Microsoft took a $1.15 billion charge to repair them all and kept going — and the 360 finished the generation having sold 84 million units, three and a half times the original Xbox.',

  specs: {
    cpu: 'IBM PowerPC "Xenon", three cores',
    cpuClockMhz: 3200,
    ram: '512 MB GDDR3, unified, plus 10 MB eDRAM on the GPU',
    ramBytes: 536_870_912,
    resolution: '1280×720 to 1920×1080',
    colors: '16.7 million',
    audio: '48 kHz 16-bit, 320 independent channels',
    media: 'DVD-DL, 8.5 GB',
  },

  relatableSpecs: [
    {
      label: 'Warranty repair charge',
      value: '$1.15 billion',
      comparison:
        'Set aside in one quarter to repair failing consoles. It is the most expensive hardware fault in the history of the medium, and Microsoft absorbed it rather than abandon the platform.',
    },
    {
      label: 'Achievements',
      value: 'Every game, mandatory',
      comparison:
        'Microsoft required all 360 games to award a shared, permanent score. Individual games had done something similar before; making it a property of the account rather than the disc is what every platform then copied.',
    },
    {
      label: 'Head start on the PS3',
      value: '~12 months',
      comparison:
        'The 360 launched in November 2005; the PS3 arrived the following November at $599. A year of exclusivity plus a $300 price gap decided most of the generation.',
    },
    {
      label: 'Graphics memory',
      value: '10 MB eDRAM',
      comparison:
        'A small, extremely fast scratchpad welded to the graphics chip, used for anti-aliasing at no bandwidth cost. It is the reason 360 games so often looked cleaner than their PS3 counterparts despite similar raw power.',
    },
  ],

  mediaKind: 'optical',
  mediaArchetype: 'dvd-keepcase',
  model: '/models/consoles/xbox-360.glb',
  // Anchors measured against the rendered GLB (see snes.ts's hardwareDiagram
  // comment). The console stands on end; its front face (power ring, disc
  // tray, ports) is the -z face — the hero yaw carries the half-turn that
  // shows it to the room. Renders 258 x 311 x 97mm against a 258 x 309 x 83
  // spec — within the bounds test's slack.
  hardwareDiagram: {
    // The console stands on end: the render's height (311mm) is the data's
    // width (309mm) axis, so the bounds test validates against renderBox.
    renderBox: { x: [-0.129, 0.129], y: [0, 0.311], z: [-0.048, 0.048] },
    callouts: [
      {
        label: 'Power button — the ring of light',
        anchor: [0.01, 0.03, -0.047],
        labelOffset: [0.02, 0.04, 0],
      },
      {
        label: 'Disc tray — the upper third of the front',
        anchor: [0, 0.22, -0.047],
        labelOffset: [0.02, 0.03, 0],
      },
      {
        label: 'USB ports and sync button — the recessed panel at the left edge',
        anchor: [-0.1, 0.1, -0.037],
        labelOffset: [-0.03, 0.03, 0],
      },
      {
        label: 'Vents — the front exhales top and bottom',
        anchor: [0, 0.28, -0.047],
        labelOffset: [0.02, 0.03, 0],
      },
    ],
  },
  // Aspirational mesh targets — these name the parts the insert sequence and
  // failure states will drive once an authored model exists. Until then the
  // shell comes from the console form (see console-forms.ts), which generates
  // meshes under exactly these names.
  animatedParts: {
    tray: 'disc_tray',
    powerSwitch: 'power_button',
    ejectLever: 'eject_button',
    led: 'power_ring',
  },
  // Wikipedia: 309mm W x 83mm H x 258mm D (original, lying horizontally).
  dimensions: { width: 309, height: 83, depth: 258 },

  variants: [],

  controllers: [
    {
      id: 'xbox-360-pad',
      name: 'Xbox 360 Wireless Controller',
      model: '/models/controllers/xbox-360-pad.glb',
      // ~155mm across the grips x 105mm front-to-back, ~62mm thick at the
      // handles — re-mapped to this project's convention: width 155 (L-R),
      // height 62 (thickness), depth 105 (front-to-back).
      dimensions: { width: 155, height: 62, depth: 105 },
      innovations: [
        'The offset stick layout — left stick high, right stick low — which became the standard arrangement for third-person and shooter controls.',
        'A ring of four quadrant lights showing which player you are, so a wireless pad could still tell you where it belonged.',
        'Rechargeable battery packs that clip on rather than seal in, so a dead pad is swapped in seconds rather than tethered to a cable.',
      ],
      buttons: [
        { id: 'stick-l', mesh: 'stick_l', label: 'Left stick', travel: [0, -0.001, 0], position: [-46, 16], shape: 'stick', sizeMm: 32 },
        { id: 'stick-r', mesh: 'stick_r', label: 'Right stick', travel: [0, -0.001, 0], position: [20, -16], shape: 'stick', sizeMm: 32 },
        { id: 'dpad-up', mesh: 'dpad', label: 'D-pad Up', key: 'ArrowUp', travel: [0, -0.0008, 0], position: [-20, -16], shape: 'cross', sizeMm: 26 },
        { id: 'dpad-down', mesh: 'dpad', label: 'D-pad Down', key: 'ArrowDown', travel: [0, -0.0008, 0] },
        { id: 'dpad-left', mesh: 'dpad', label: 'D-pad Left', key: 'ArrowLeft', travel: [0, -0.0008, 0] },
        { id: 'dpad-right', mesh: 'dpad', label: 'D-pad Right', key: 'ArrowRight', travel: [0, -0.0008, 0] },
        { id: 'a', mesh: 'btn_a', label: 'A', key: 'j', travel: [0, -0.0012, 0], position: [48, 6], shape: 'convex', sizeMm: 14 },
        { id: 'b', mesh: 'btn_b', label: 'B', key: 'k', travel: [0, -0.0012, 0], position: [61, 18], shape: 'convex', sizeMm: 14 },
        { id: 'x', mesh: 'btn_x', label: 'X', key: 'u', travel: [0, -0.0012, 0], position: [35, 18], shape: 'convex', sizeMm: 14 },
        { id: 'y', mesh: 'btn_y', label: 'Y', key: 'i', travel: [0, -0.0012, 0], position: [48, 30], shape: 'convex', sizeMm: 14 },
        { id: 'start', mesh: 'btn_start', label: 'Start', key: 'Enter', travel: [0, -0.0008, 0], position: [20, 12], shape: 'capsule', sizeMm: 9 },
        { id: 'back', mesh: 'btn_back', label: 'Back', key: 'Backspace', travel: [0, -0.0008, 0], position: [-20, 12], shape: 'capsule', sizeMm: 9 },
        { id: 'guide', mesh: 'btn_guide', label: 'Guide', travel: [0, -0.0008, 0], position: [0, 22], shape: 'convex', sizeMm: 18 },
        { id: 'trigger-l', mesh: 'trigger_l', label: 'Left trigger', key: 'q', travel: [0, -0.002, 0], position: [-54, 44], shape: 'trigger', sizeMm: 30 },
        { id: 'trigger-r', mesh: 'trigger_r', label: 'Right trigger', key: 'e', travel: [0, -0.002, 0], position: [54, 44], shape: 'trigger', sizeMm: 30 },
      ],
    },
  ],

  facts: [
    {
      id: 'red-ring',
      title: 'Three red lights',
      body: 'Early 360s ran hot enough that the motherboard warped, cracking the solder beneath the graphics chip. The console then lit three quadrants of its power ring red — a "general hardware failure" so common it got a nickname, a folklore of temporary fixes, and eventually an unlimited three-year warranty. Failure rates were never officially published; retailer estimates at the time ran as high as one console in three.',
    },
    {
      id: 'achievements',
      title: 'The score that follows you between games',
      body: 'Microsoft made achievements mandatory: every 360 game had to award points into one permanent, public total attached to your account rather than your save file. It changed how people finish games — and turned completion into something visible to other players, which is why every platform since has shipped its own version.',
    },
    {
      id: 'arcade-storefront',
      title: 'It made small games a real business again',
      body: 'Xbox Live Arcade gave downloadable games a storefront on a major console at a moment when retail shelves only had room for big releases. Braid, Castle Crashers and Limbo reached millions of people through it, and the modern independent games industry is built substantially on the door it opened.',
    },
    {
      id: 'kinect-fastest',
      title: 'The fastest-selling consumer electronics device ever, briefly',
      body: 'Kinect, the camera that removed the controller entirely, sold eight million units in its first sixty days in 2010 — fast enough to take a Guinness World Record. Its bundled title, Kinect Adventures, became the best-selling 360 game of all time almost entirely by being in the box.',
    },
  ],

  failureStates: [
    {
      id: 'red-ring-of-death',
      name: 'Red Ring of Death',
      body: 'Three of the four quadrants around the power button light red and the console will not boot. The cause is thermal: repeated heating and cooling flexes the board until the solder joints under the GPU fracture. It is the defining hardware failure of its generation.',
      target: 'power_ring',
      effect: 'blink-red',
    },
    {
      id: 'disc-scratch',
      name: 'Disc scratched by the drive',
      body: 'Moving the console while a disc is spinning lets the disc contact the read head, carving a circular scratch that renders the game unreadable. Microsoft initially declined to replace discs damaged this way, which made it a widely-shared piece of owner folklore.',
      target: 'disc_tray',
      effect: 'no-signal',
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
      { kit: 'poster', variant: 'band', position: [-2.16, 1.5, -0.4], rotation: [0, Math.PI / 2, 0] },
      { kit: 'window', variant: 'blinds', position: [1.3, 1.4, -1.85] },
    ],
    tv: {
      id: 'lcd-40-2006',
      model: '/models/tvs/lcd-40.glb',
      label: '40-inch LCD, c. 2006',
      screenInches: 40,
      dimensions: { width: 980, height: 620, depth: 95 },
      curvature: 0,
      bezelInsetMm: 8,
      aspect: '16:9',
    },
    lighting: {
      id: 'evening-2000s-late',
      tempK: 3600,
      intensity: 2.5,
      keyPosition: [3.5, 2.2, 1.2],
      ambientIntensity: 0.3,
      backdrop: '#eeeeea',
    },
    tvPosition: [-0.3, 0.62, -1.2],
    tvRotation: [0, 0.1, 0],
    consolePosition: [0.48, 0.5, -1.05],
    // The GLB exports the console front-back (power ring + disc tray on its
    // -z face), so the yaw carries an extra half-turn to face the room like
    // the other consoles do.
    consoleRotation: [0, Math.PI - 0.3, 0],
    controllerPosition: [-0.18, 0.014, 0.45],
    controllerRotation: [0, 0.5, 0],
    shelfPosition: [-1.4, 0.55, -1.58],
  },

  games: [
    { rank: 1, title: 'Kinect Adventures!', year: 2010, unitsSold: 24_000_000, developer: 'Good Science Studio', publisher: 'Microsoft Game Studios', blurb: 'The best-selling 360 game, and almost entirely because it came in the box with every Kinect sensor sold.' },
    { rank: 2, title: 'Grand Theft Auto V', year: 2013, unitsSold: 16_400_000, developer: 'Rockstar North', publisher: 'Rockstar Games', blurb: 'Arrived at the very end of the console\'s life and still outsold nearly everything released in its prime.' },
    { rank: 3, title: 'Call of Duty: Modern Warfare 3', year: 2011, unitsSold: 14_700_000, developer: 'Infinity Ward', publisher: 'Activision', blurb: 'Took a billion dollars in sixteen days — the point at which annual shooters became the industry\'s biggest business.' },
    { rank: 4, title: 'Call of Duty: Black Ops', year: 2010, unitsSold: 14_700_000, developer: 'Treyarch', publisher: 'Activision', blurb: 'Cold War conspiracy plotting plus the Zombies mode that turned a side attraction into a franchise of its own.' },
    { rank: 5, title: 'Halo 3', year: 2007, unitsSold: 14_500_000, developer: 'Bungie', publisher: 'Microsoft Game Studios', blurb: 'Marketed as the end of the fight, and the game that made the 360 the default console of its generation in North America.' },
    { rank: 6, title: 'Call of Duty: Black Ops II', year: 2012, unitsSold: 13_600_000, developer: 'Treyarch', publisher: 'Activision', blurb: 'Branching missions and a near-future setting, unusual structural ambition for a series selling at this scale.' },
    { rank: 7, title: 'Minecraft: Xbox 360 Edition', year: 2012, unitsSold: 11_000_000, developer: '4J Studios', publisher: 'Microsoft Studios', blurb: 'Brought split-screen local play to a game built on PC for solitude and servers, and outsold the PC version on this platform alone.' },
    { rank: 8, title: 'Halo: Reach', year: 2010, unitsSold: 9_800_000, developer: 'Bungie', publisher: 'Microsoft Game Studios', blurb: 'Bungie\'s last Halo, a prequel where the story is required to end in defeat.' },
    { rank: 9, title: 'Halo 4', year: 2012, unitsSold: 9_400_000, developer: '343 Industries', publisher: 'Microsoft Studios', blurb: 'The first Halo made by the studio Microsoft built specifically to take the series over.' },
    { rank: 10, title: 'Gears of War', year: 2006, unitsSold: 6_000_000, developer: 'Epic Games', publisher: 'Microsoft Game Studios', blurb: 'Made cover shooting the default grammar of the third-person shooter, and defined the brown-and-grey look of the era.' },
  ],

  sources: [
    'https://en.wikipedia.org/wiki/Xbox_360',
    'https://en.wikipedia.org/wiki/Xbox_360_technical_problems',
    'https://en.wikipedia.org/wiki/List_of_best-selling_Xbox_360_video_games',
    'https://en.wikipedia.org/wiki/Kinect',
    'https://en.wikipedia.org/wiki/Xbox_Live_Arcade',
  ],
}
