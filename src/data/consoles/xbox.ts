import type { ConsoleEntry } from '@/types/console'

/**
 * A PC company's answer to the console, and the first one built around a hard
 * drive and an ethernet port as standard equipment. It lost money on every
 * unit and finished third in its generation — and it established Xbox Live,
 * Halo, and a platform Microsoft is still selling two decades later.
 *
 * Sales figures, dates and technical specs from Wikipedia (see `sources`).
 * Controller dimensions re-mapped onto this project's width/thickness/depth
 * convention (see the comment on the controller entry below).
 */
export const xbox: ConsoleEntry = {
  id: 'xbox',
  name: 'Microsoft Xbox',
  shortName: 'Xbox',
  manufacturer: 'Microsoft',
  generation: 6,
  released: {
    na: '2001-11-15',
    jp: '2002-02-22',
    eu: '2002-03-14',
  },
  discontinued: '2006-03-02',
  unitsSold: 24_000_000,
  msrpUsd: 299,
  msrpUsdAdjusted: 540,
  tagline: 'The console with a hard drive in it.',
  summary:
    'Microsoft built its first console the way it built PCs: a 733 MHz Intel processor, an NVIDIA graphics chip, an ethernet port, and — the decision that mattered most — a hard drive fitted as standard in every unit. No memory cards, no shuffling saves, and games that could stream data off a disk instead of a disc. A year later Xbox Live turned that ethernet port into a single account, one friends list and one voice channel across every game, which is the model essentially all console online services still use. It sold 24 million units against the PS2\'s 160 million and reportedly lost money on nearly every one, and Microsoft treated the whole thing as the price of admission to a business it had decided to be in permanently.',

  specs: {
    cpu: 'Custom Intel Pentium III',
    cpuClockMhz: 733,
    ram: '64 MB DDR SDRAM, shared between CPU and GPU',
    ramBytes: 67_108_864,
    resolution: '640×480 to 1920×1080i',
    colors: '16.7 million',
    audio: 'NVIDIA MCPX, 256 channels, Dolby Digital 5.1',
    media: 'DVD-ROM',
  },

  relatableSpecs: [
    {
      label: 'Hard drive, standard',
      value: '8 GB',
      comparison:
        'The first console to fit one in every unit. It meant no memory cards, and it meant you could rip a CD onto the console and play your own music inside a racing game — a feature that felt like a PC habit smuggled into the living room.',
    },
    {
      label: 'Memory',
      value: '64 MB',
      comparison:
        'Double the PS2\'s 32 MB, and unified — the CPU and graphics chip drew from one pool instead of separate banks, which is why Xbox ports of the same game so often ran at a higher resolution.',
    },
    {
      label: 'Halo, attached',
      value: '~1 in 2 owners',
      comparison:
        'Halo: Combat Evolved sold to roughly half of everyone who bought the console. Almost no platform in history has leaned on a single launch game this heavily and had it work.',
    },
    {
      label: 'The launch controller',
      value: 'Nicknamed "the Duke"',
      comparison:
        'Large enough that Japanese reviewers singled it out, and replaced within two years by the smaller Controller S — which was designed for Japan first and then quietly became the standard everywhere.',
    },
  ],

  mediaKind: 'optical',
  mediaArchetype: 'dvd-keepcase',
  model: '/models/consoles/xbox.glb',
  // Aspirational mesh targets — these name the parts the insert sequence and
  // failure states will drive once an authored model exists. Until then the
  // shell comes from the console form (see console-forms.ts), which generates
  // meshes under exactly these names.
  animatedParts: {
    tray: 'disc_tray',
    powerSwitch: 'power_button',
    ejectLever: 'eject_button',
    led: 'power_jewel',
  },
  // Wikipedia: 320mm W x 100mm H x 260mm D.
  dimensions: { width: 320, height: 100, depth: 260 },

  variants: [],

  controllers: [
    {
      id: 'xbox-duke',
      name: 'Xbox Controller ("the Duke")',
      model: '/models/controllers/xbox-duke.glb',
      // The launch pad's footprint is ~185mm across the grips x 105mm
      // front-to-back, ~65mm thick at the handles — re-mapped to this
      // project's convention: width 185 (L-R), height 65 (thickness),
      // depth 105 (front-to-back).
      dimensions: { width: 185, height: 65, depth: 105 },
      innovations: [
        'Two analog triggers plus two analog sticks and a d-pad as one standard layout — the arrangement almost every controller since has converged on.',
        'Two memory-card slots built into the pad itself, a holdover made redundant by the console\'s own hard drive.',
      ],
      buttons: [
        { id: 'stick-l', mesh: 'stick_l', label: 'Left stick', travel: [0, -0.001, 0], position: [-56, 14], shape: 'stick', sizeMm: 32 },
        { id: 'stick-r', mesh: 'stick_r', label: 'Right stick', travel: [0, -0.001, 0], position: [22, -18], shape: 'stick', sizeMm: 32 },
        { id: 'dpad-up', mesh: 'dpad', label: 'D-pad Up', key: 'ArrowUp', travel: [0, -0.0008, 0], position: [-24, -18], shape: 'cross', sizeMm: 26 },
        { id: 'dpad-down', mesh: 'dpad', label: 'D-pad Down', key: 'ArrowDown', travel: [0, -0.0008, 0] },
        { id: 'dpad-left', mesh: 'dpad', label: 'D-pad Left', key: 'ArrowLeft', travel: [0, -0.0008, 0] },
        { id: 'dpad-right', mesh: 'dpad', label: 'D-pad Right', key: 'ArrowRight', travel: [0, -0.0008, 0] },
        { id: 'a', mesh: 'btn_a', label: 'A', key: 'j', travel: [0, -0.0012, 0], position: [56, 6], shape: 'convex', sizeMm: 18 },
        { id: 'b', mesh: 'btn_b', label: 'B', key: 'k', travel: [0, -0.0012, 0], position: [72, 18], shape: 'convex', sizeMm: 18 },
        { id: 'x', mesh: 'btn_x', label: 'X', key: 'u', travel: [0, -0.0012, 0], position: [40, 18], shape: 'convex', sizeMm: 18 },
        { id: 'y', mesh: 'btn_y', label: 'Y', key: 'i', travel: [0, -0.0012, 0], position: [56, 30], shape: 'convex', sizeMm: 18 },
        { id: 'start', mesh: 'btn_start', label: 'Start', key: 'Enter', travel: [0, -0.0008, 0], position: [12, 22], shape: 'capsule', sizeMm: 10 },
        { id: 'back', mesh: 'btn_back', label: 'Back', key: 'Backspace', travel: [0, -0.0008, 0], position: [-8, 22], shape: 'capsule', sizeMm: 10 },
        { id: 'trigger-l', mesh: 'trigger_l', label: 'Left trigger', key: 'q', travel: [0, -0.002, 0], position: [-64, 44], shape: 'trigger', sizeMm: 30 },
        { id: 'trigger-r', mesh: 'trigger_r', label: 'Right trigger', key: 'e', travel: [0, -0.002, 0], position: [64, 44], shape: 'trigger', sizeMm: 30 },
      ],
    },
  ],

  facts: [
    {
      id: 'hard-drive-standard',
      title: 'The first console with a hard drive in every box',
      body: 'Consoles before it saved to memory cards measured in kilobytes. Fitting an 8 GB drive as standard removed save management entirely, let games cache data off the disc to cut loading, and enabled the era\'s strangest feature: ripping your own CDs onto the console and playing them as the soundtrack inside a game.',
    },
    {
      id: 'xbox-live-model',
      title: 'One account, one friends list, one voice channel',
      body: 'Xbox Live launched in November 2002 with a decision nobody else had made: your identity, your friends and your voice chat belonged to the platform, not to each individual game. It required broadband at a time when most homes did not have it, and it is the shape every console online service adopted afterwards.',
    },
    {
      id: 'halo-carried-it',
      title: 'A launch game that carried the platform',
      body: 'Halo: Combat Evolved was not originally an Xbox game — it was announced as a Mac and PC title, and became a console exclusive when Microsoft bought Bungie in 2000. It went on to sell to roughly half of all Xbox owners, and its two-stick control scheme became the default for first-person shooters on every console since.',
    },
    {
      id: 'clock-capacitor',
      title: 'A component that destroys the console it is in',
      body: 'Most original Xboxes contain a small clock capacitor that leaks corrosive electrolyte onto the motherboard as it ages. It serves only to keep the clock running while unplugged, and the standard advice among people preserving these machines is now simply to remove it — a console whose most urgent repair is the deletion of a part.',
    },
  ],

  failureStates: [
    {
      id: 'clock-cap-leak',
      name: 'Clock capacitor leak',
      body: 'The clock capacitor leaks onto the board and corrodes the traces beneath it. Symptoms escalate from an intermittent boot to a console that will not power on at all, and the damage is progressive — an Xbox sitting unused in a cupboard is still slowly destroying itself.',
      target: 'shell',
      effect: 'dim',
    },
    {
      id: 'thomson-drive',
      name: 'DVD drive read failure',
      body: 'The Xbox shipped with drives from three different manufacturers, and the Thomson units in particular lose the ability to read discs as their laser ages. The tray opens and closes normally; the disc simply never mounts.',
      target: 'disc_tray',
      effect: 'no-signal',
    },
  ],

  diorama: {
    roomKit: 'den-2000s-na',
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
      id: 'crt-32-2002',
      model: '/models/tvs/crt-32.glb',
      label: '32-inch consumer CRT, c. 2002',
      screenInches: 32,
      dimensions: { width: 760, height: 640, depth: 610 },
      curvature: 0.3,
      bezelInsetMm: 18,
      aspect: '4:3',
    },
    lighting: {
      id: 'evening-2000s-cool',
      tempK: 3500,
      intensity: 2.6,
      keyPosition: [3.4, 2.1, 1.2],
      ambientIntensity: 0.3,
      backdrop: '#191c22',
    },
    tvPosition: [-0.28, 0.5, -1.15],
    tvRotation: [0, 0.12, 0],
    consolePosition: [0.46, 0.5, -1.0],
    consoleRotation: [0, -0.3, 0],
    controllerPosition: [-0.18, 0.014, 0.42],
    controllerRotation: [0, 0.5, 0],
    shelfPosition: [-1.35, 0.55, -1.52],
  },

  games: [
    { rank: 1, title: 'Halo 2', year: 2004, unitsSold: 8_490_000, developer: 'Bungie', publisher: 'Microsoft Game Studios', blurb: 'Took $125 million on its first day and effectively built Xbox Live into a mass-market service on its own.' },
    { rank: 2, title: 'Halo: Combat Evolved', year: 2001, unitsSold: 6_430_000, developer: 'Bungie', publisher: 'Microsoft Game Studios', blurb: 'The launch title that fixed the console first-person shooter — two sticks, regenerating shields, and only two weapons at a time.' },
    { rank: 3, title: 'Tom Clancy\'s Splinter Cell', year: 2002, unitsSold: 3_000_000, developer: 'Ubisoft Montreal', publisher: 'Ubisoft', blurb: 'Built its whole design around dynamic light and shadow, which the Xbox\'s graphics chip could render and its rivals largely could not.' },
    { rank: 4, title: 'Fable', year: 2004, unitsSold: 3_000_000, developer: 'Lionhead Studios', publisher: 'Microsoft Game Studios', blurb: 'A role-playing game where your choices visibly aged and scarred your character — famously promising even more than it delivered.' },
    { rank: 5, title: 'Star Wars: Knights of the Old Republic', year: 2003, unitsSold: 2_500_000, developer: 'BioWare', publisher: 'LucasArts', blurb: 'Set four thousand years before the films, which freed it from continuity entirely and let it write its own twist.' },
    { rank: 6, title: 'Project Gotham Racing 2', year: 2003, unitsSold: 2_000_000, developer: 'Bizarre Creations', publisher: 'Microsoft Game Studios', blurb: 'Scored you on driving with style rather than just speed, and was among the first racers built for online leaderboards.' },
    { rank: 7, title: 'Forza Motorsport', year: 2005, unitsSold: 2_000_000, developer: 'Turn 10 Studios', publisher: 'Microsoft Game Studios', blurb: 'Microsoft\'s answer to Gran Turismo, arriving late in the console\'s life and setting up a series that outlived it.' },
    { rank: 8, title: 'The Elder Scrolls III: Morrowind', year: 2002, unitsSold: 1_500_000, developer: 'Bethesda Game Studios', publisher: 'Bethesda Softworks', blurb: 'An open world of a scale nobody expected a console to hold, leaning hard on the hard drive to stream it.' },
    { rank: 9, title: 'Ninja Gaiden', year: 2004, unitsSold: 1_500_000, developer: 'Team Ninja', publisher: 'Tecmo', blurb: 'Notoriously difficult, and held up as the best-looking game on the platform when it launched.' },
    { rank: 10, title: 'Jet Set Radio Future', year: 2002, unitsSold: 1_000_000, developer: 'Smilebit', publisher: 'Sega', blurb: 'Sega making games for Microsoft one year after leaving hardware — bundled with the console in much of its life.' },
  ],

  sources: [
    'https://en.wikipedia.org/wiki/Xbox_(console)',
    'https://en.wikipedia.org/wiki/List_of_best-selling_Xbox_video_games',
    'https://en.wikipedia.org/wiki/Xbox_Live',
    'https://en.wikipedia.org/wiki/Halo:_Combat_Evolved',
    'https://en.wikipedia.org/wiki/Xbox_controller',
  ],
}
