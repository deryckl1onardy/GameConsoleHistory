import type { ConsoleEntry } from '@/types/console'

/**
 * Two consoles sold as one product: a black monolith and a small white box
 * with no disc drive at all, launched the same day at very different prices.
 * This entry describes the Series X, the flagship — see the `variants` for the
 * Series S, which is the same platform with a third of the graphics power and
 * no way to play a disc you already own.
 *
 * Sales figures, dates and technical specs from Wikipedia (see `sources`).
 * Controller dimensions re-mapped onto this project's width/thickness/depth
 * convention (see the comment on the controller entry below).
 */
export const xboxSeries: ConsoleEntry = {
  id: 'xbox-series',
  name: 'Xbox Series X|S',
  shortName: 'Xbox Series',
  manufacturer: 'Microsoft',
  generation: 9,
  released: {
    na: '2020-11-10',
    eu: '2020-11-10',
    jp: '2020-11-10',
  },
  unitsSold: 35_000_000,
  msrpUsd: 499,
  msrpUsdAdjusted: 610,
  tagline: 'Power your dreams.',
  summary:
    'Microsoft launched two consoles on the same day: the Series X, a 30cm black tower built around raw performance, and the Series S, a small white box at $299 with no disc drive, aimed at people who had already stopped buying discs. Both run the same games. The generation\'s real argument, though, was never about the hardware — it was about whether you should buy games at all. Game Pass puts hundreds of titles, including every Microsoft release on the day it launches, behind a monthly fee, and Microsoft spent $69 billion acquiring Activision Blizzard to feed it. The console is fast and quiet and largely uncontroversial; the business model around it is the thing being argued over.',

  specs: {
    cpu: 'AMD Zen 2, eight cores',
    cpuClockMhz: 3800,
    ram: '16 GB GDDR6',
    ramBytes: 17_179_869_184,
    resolution: '3840×2160 at up to 120 Hz',
    colors: '1.07 billion (10-bit HDR)',
    audio: 'Dolby Atmos, DTS:X, Windows Sonic',
    media: 'Ultra HD Blu-ray, 100 GB',
  },

  relatableSpecs: [
    {
      label: 'Storage speed',
      value: '2.4 GB/s',
      comparison:
        'The custom SSD is roughly forty times faster than the Xbox One\'s hard drive. Loading screens stopped being a design constraint — Quick Resume holds several suspended games at once and returns to any of them in seconds.',
    },
    {
      label: 'Two consoles, one library',
      value: '$499 and $299',
      comparison:
        'The Series S has no disc drive and about a third of the graphics power, but runs every Series X game. It is the first time a platform holder shipped a deliberately weaker console as a permanent second tier rather than a later cost reduction.',
    },
    {
      label: 'The Activision deal',
      value: '$69 billion',
      comparison:
        'The largest acquisition in the history of the games industry, and roughly seventy times what Microsoft paid for Mojang. It took nearly two years and regulator fights on three continents to close.',
    },
    {
      label: 'Backwards compatibility',
      value: 'Four generations',
      comparison:
        'Original Xbox, 360, One and Series games all run on the same machine, most of them faster and sharper than on the hardware they were written for. No other console line has carried its whole history forward like this.',
    },
  ],

  mediaKind: 'optical',
  mediaArchetype: 'bluray-case',
  model: '/models/consoles/xbox-series.glb',
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
  // Wikipedia, Series X standing upright: 151mm W x 301mm H x 151mm D.
  dimensions: { width: 151, height: 301, depth: 151 },

  variants: [
    {
      id: 'xbox-series-s',
      region: 'na',
      name: 'Xbox Series S',
      model: '/models/consoles/xbox-series-s.glb',
      mediaArchetype: 'bluray-case',
      note: 'The all-digital tier: 275 x 151 x 63.5mm, white, with a large black circular vent on one face and no disc drive at all — the first mainline Xbox that cannot play a disc you already own. Same games, about a third of the graphics power, $200 cheaper.',
    },
  ],

  controllers: [
    {
      id: 'xbox-series-pad',
      name: 'Xbox Wireless Controller',
      model: '/models/controllers/xbox-series-pad.glb',
      // ~151mm across the grips x 103mm front-to-back, ~60mm thick at the
      // handles — re-mapped to this project's convention: width 151 (L-R),
      // height 60 (thickness), depth 103 (front-to-back).
      dimensions: { width: 151, height: 60, depth: 103 },
      innovations: [
        'A hybrid d-pad — a dish with eight faceted edges, borrowing the octagonal-gate idea from the GameCube to make diagonals findable by feel.',
        'A dedicated Share button, acknowledging that recording and posting play is now a default part of using a console.',
        'Textured grips moulded into the triggers and bumpers rather than applied as a coating that wears off.',
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
        { id: 'menu', mesh: 'btn_menu', label: 'Menu', key: 'Enter', travel: [0, -0.0008, 0], position: [22, 12], shape: 'capsule', sizeMm: 9 },
        { id: 'view', mesh: 'btn_view', label: 'View', key: 'Backspace', travel: [0, -0.0008, 0], position: [-22, 12], shape: 'capsule', sizeMm: 9 },
        { id: 'share', mesh: 'btn_share', label: 'Share', travel: [0, -0.0008, 0], position: [0, 2], shape: 'flat', sizeMm: 10 },
        { id: 'guide', mesh: 'btn_guide', label: 'Xbox', travel: [0, -0.0008, 0], position: [0, 30], shape: 'convex', sizeMm: 16 },
        { id: 'trigger-l', mesh: 'trigger_l', label: 'LT', key: 'q', travel: [0, -0.002, 0], position: [-53, 43], shape: 'trigger', sizeMm: 30 },
        { id: 'trigger-r', mesh: 'trigger_r', label: 'RT', key: 'e', travel: [0, -0.002, 0], position: [53, 43], shape: 'trigger', sizeMm: 30 },
      ],
    },
  ],

  facts: [
    {
      id: 'two-consoles-one-launch',
      title: 'Two machines, one library, permanently',
      body: 'The Series S is not a cost-reduced model released later — it launched the same day as the Series X at $200 less, with no disc drive and roughly a third of the graphics power, and every game must run on both. Developers have to build for the weaker box as a hard requirement, which is the most-argued-about technical constraint of the generation.',
    },
    {
      id: 'quick-resume',
      title: 'Several games suspended at once',
      body: 'Quick Resume writes a game\'s entire memory state to the SSD and restores it in seconds, for multiple games simultaneously. You can leave one mid-mission, play something else for a week, and come back to the same frame — a feature that only became possible once storage got fast enough to make the console\'s memory disposable.',
    },
    {
      id: 'game-pass-bet',
      title: 'A console built to be optional',
      body: 'Microsoft puts every game it publishes on Game Pass the day it releases, streams the same library to phones, tablets and televisions with no console at all, and sells its games on rival storefronts. The strategy treats the box under the television as one way in rather than the thing being sold — a genuine departure from a hundred million units of console-exclusive thinking.',
    },
    {
      id: 'the-fridge',
      title: 'It looks like a fridge, and Microsoft leaned in',
      body: 'The Series X\'s monolithic shape drew immediate comparisons to a small refrigerator. Microsoft responded by building an actual Xbox-shaped mini fridge, giving it away in a competition, and then selling it at retail — merchandise made entirely out of a joke at the product\'s expense.',
    },
  ],

  failureStates: [
    {
      id: 'hdmi-handshake',
      name: 'HDMI 2.1 handshake failure',
      body: 'At 4K and 120 Hz the console and the television have to agree on a mode over HDMI 2.1, and early televisions frequently got it wrong — a black screen, or a picture that drops out every few minutes, fixed only by forcing a lower refresh rate.',
      target: 'power_logo',
      effect: 'no-signal',
    },
    {
      id: 'drive-eject-fault',
      name: 'Disc drive will not eject',
      body: 'The slot-loading drive can fail to grip or release a disc, leaving the game stuck inside. Because the drive is a sealed assembly there is no manual eject hole, so the console has to be opened or serviced.',
      target: 'disc_slot',
      effect: 'dim',
    },
  ],

  diorama: {
    roomKit: 'living-2020s-na',
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
      id: 'oled-65-2020',
      model: '/models/tvs/oled-65.glb',
      label: '65-inch OLED, c. 2020',
      screenInches: 65,
      dimensions: { width: 1450, height: 835, depth: 47 },
      curvature: 0,
      bezelInsetMm: 3,
      aspect: '16:9',
    },
    lighting: {
      id: 'evening-2020s-cool',
      tempK: 3800,
      intensity: 2.3,
      keyPosition: [3.5, 2.2, 1.1],
      ambientIntensity: 0.26,
      backdrop: '#eeeeea',
    },
    tvPosition: [-0.3, 0.66, -1.2],
    tvRotation: [0, 0.1, 0],
    consolePosition: [0.52, 0.5, -1.05],
    consoleRotation: [0, -0.26, 0],
    controllerPosition: [-0.18, 0.014, 0.45],
    controllerRotation: [0, 0.5, 0],
    shelfPosition: [-1.4, 0.55, -1.58],
  },

  games: [
    { rank: 1, title: 'Call of Duty: Modern Warfare II', year: 2022, unitsSold: 3_200_000, developer: 'Infinity Ward', publisher: 'Activision', blurb: 'Took a billion dollars in ten days across all platforms, the fastest the series has ever managed.' },
    { rank: 2, title: 'Starfield', year: 2023, unitsSold: 2_800_000, developer: 'Bethesda Game Studios', publisher: 'Bethesda Softworks', blurb: 'Bethesda\'s first new universe in twenty-five years, and the biggest test of Microsoft\'s day-one Game Pass strategy.' },
    { rank: 3, title: 'Halo Infinite', year: 2021, unitsSold: 2_400_000, developer: '343 Industries', publisher: 'Xbox Game Studios', blurb: 'Returned Halo to an open landscape, and gave away its multiplayer for free as a separate download.' },
    { rank: 4, title: 'Forza Horizon 5', year: 2021, unitsSold: 2_200_000, developer: 'Playground Games', publisher: 'Xbox Game Studios', blurb: 'Ten million players in its first week — the biggest launch in Xbox Game Studios history at the time.' },
    { rank: 5, title: 'Elden Ring', year: 2022, unitsSold: 2_000_000, developer: 'FromSoftware', publisher: 'Bandai Namco', blurb: 'FromSoftware\'s formula in an open world written with George R. R. Martin, and the runaway critical success of the generation.' },
    { rank: 6, title: 'FIFA 23', year: 2022, unitsSold: 1_800_000, developer: 'EA Vancouver', publisher: 'EA Sports', blurb: 'The last game to carry the FIFA name after a thirty-year licensing partnership ended.' },
    { rank: 7, title: 'Diablo IV', year: 2023, unitsSold: 1_500_000, developer: 'Blizzard Entertainment', publisher: 'Blizzard Entertainment', blurb: 'Released weeks before Microsoft\'s acquisition of its publisher finally closed.' },
    { rank: 8, title: 'Grand Theft Auto V', year: 2022, unitsSold: 1_400_000, developer: 'Rockstar North', publisher: 'Rockstar Games', blurb: 'A third generation of the same 2013 game, and still selling in volume.' },
    { rank: 9, title: 'Hogwarts Legacy', year: 2023, unitsSold: 1_300_000, developer: 'Avalanche Software', publisher: 'Warner Bros. Games', blurb: 'One of the best-selling games of its year despite a widespread boycott campaign over the source author\'s public statements.' },
    { rank: 10, title: 'Sea of Thieves', year: 2021, unitsSold: 1_200_000, developer: 'Rare', publisher: 'Xbox Game Studios', blurb: 'A shaky launch rebuilt over years into one of the platform\'s most-played games, and later sold on PlayStation too.' },
  ],

  sources: [
    'https://en.wikipedia.org/wiki/Xbox_Series_X_and_Series_S',
    'https://en.wikipedia.org/wiki/Xbox_Game_Pass',
    'https://en.wikipedia.org/wiki/Microsoft%27s_acquisition_of_Activision_Blizzard',
    'https://en.wikipedia.org/wiki/Xbox_Wireless_Controller',
    'https://en.wikipedia.org/wiki/List_of_Xbox_Series_X_and_Series_S_games',
  ],
}
