import type { ConsoleEntry } from '@/types/console'

/**
 * The console that invented the home cartridge industry, then nearly buried
 * it under its own success. No framebuffer exists in this machine — the TIA
 * chip races the television's own electron beam, generating each scanline
 * a fraction of a second before it is drawn. Every visual trick in the
 * 2600's library is a program that learned to out-run a CRT.
 *
 * Sales figures, dates and technical specs from Wikipedia (see `sources`).
 * Physical dimensions from Dimensions.com. Controller model not yet built —
 * the CX40 is a joystick, not a gamepad, and this project's parametric
 * controller kit (a plan outline swept vertically) has no shape for a stick
 * protruding upward; it renders as a placeholder block until a bespoke form
 * exists for it.
 */
export const atari2600: ConsoleEntry = {
  id: 'atari-2600',
  name: 'Atari Video Computer System',
  shortName: 'Atari 2600',
  manufacturer: 'Atari',
  generation: 2,
  released: {
    na: '1977-09-01',
    eu: '1978-01-01',
    // Japan got a rebadged, four-port variant (the Atari 2800) in October
    // 1983, not this console under this name — omitted rather than implying
    // a same-model launch that didn't happen.
  },
  discontinued: '1992-01-01',
  unitsSold: 30_000_000,
  msrpUsd: 189.95,
  msrpUsdAdjusted: 1010,
  tagline: 'The console that invented the industry, then nearly buried it.',
  summary:
    'The Atari 2600 has no framebuffer. Its Television Interface Adaptor generates each scanline in real time, racing the electron beam across the tube as it draws. The entire console is, electrically, a chip trying to stay one step ahead of a television. That constraint produced an entire genre of programmer folklore: counting cycles, exploiting the beam\'s own timing, coaxing 128 bytes of RAM into holding a whole game\'s state. It launched in 1977 and was still being sold new in 1992, a fifteen-year run spanning from the year of Star Wars to the year of Sonic 2. In between, it also absorbed the industry\'s first real catastrophe: an oversaturated market of third-party games, a rushed movie tie-in, and a 1983 crash so complete that Atari reportedly buried unsold cartridges in a New Mexico landfill, a story confirmed true by an actual excavation in 2014.',

  specs: {
    cpu: 'MOS Technology 6507',
    cpuClockMhz: 1.19,
    ram: '128 bytes RAM (no video RAM); every frame is generated live, scanline by scanline',
    ramBytes: 128,
    resolution: '160×192 visible (NTSC), 228 lines (PAL)',
    colors: '16 on screen at once (NTSC) from a palette of 128',
    audio: 'TIA, 2-channel',
    media: 'ROM cartridge, 2–4 KB natively, up to 32 KB via bank switching',
  },

  relatableSpecs: [
    {
      label: 'Working memory',
      value: '128 bytes',
      comparison:
        'Not kilobytes. Bytes. The paragraph above this one, as plain text, is already larger than the entire RAM of the console that ran it.',
    },
    {
      label: 'No framebuffer',
      value: '1 frame = 1 race',
      comparison:
        'The TIA chip has no memory to hold a finished picture. It draws each line of the screen as the TV\'s own electron beam sweeps past it, sixty times a second, or the picture simply does not appear.',
    },
    {
      label: 'Combat, the pack-in game',
      value: '2 KB',
      comparison:
        'Two kilobytes held 27 game variants, two-player support and full collision logic. A single small icon on a modern website is often a heavier download.',
    },
    {
      label: 'Production lifespan',
      value: '15 years',
      comparison:
        'It launched the same year as the first Star Wars film and was still on store shelves the year the Sega Genesis got its own sequel to Sonic.',
    },
  ],

  mediaKind: 'cartridge',
  mediaArchetype: 'cart-atari-2600',
  model: '/models/consoles/atari-2600.glb',
  // Measured against the actual rendered GLB — see snes.ts's hardwareDiagram
  // comment for the method. This model renders 284 x 100 x 251mm against the
  // real 346 x 89 x 232 (a squarer footprint, documented in gltf-transforms.ts),
  // so the anchors below track the render, not the spec.
  hardwareDiagram: {
    renderBox: { x: [-0.1418, 0.1418], y: [0, 0.1], z: [-0.1257, 0.1257] },
    callouts: [
      {
        label: 'The toggle switches: power, select, difficulty and reset, in a row',
        anchor: [0, 0.084, -0.04],
        labelOffset: [0, 0.045, -0.015],
      },
      {
        label: 'Cartridge slot: the bay on top',
        anchor: [0, 0.098, 0.03],
        labelOffset: [0, 0.03, 0.02],
      },
      {
        label: 'Controller ports (×2): DB9 sockets on the right side',
        anchor: [0.14, 0.05, -0.03],
        labelOffset: [0.035, 0.04, 0.01],
      },
    ],
  },
  // The dropped-in model's meshes carry generic Blender export names
  // (Cube_Material_0, etc.), not semantic ones, so none of these mesh names
  // exist in the current GLB — they're aspirational targets for a future
  // authored model, matching the convention snes.ts already established.
  animatedParts: {
    slot: 'cart_slot',
    powerSwitch: 'power_switch',
  },
  // Dimensions.com: 13.625in (346.1mm) W x 3.5in (88.9mm) H x 9.125in (231.8mm) D.
  dimensions: { width: 346.1, height: 88.9, depth: 231.8 },

  variants: [],

  controllers: [
    {
      id: 'cx40',
      name: 'CX40 Joystick',
      model: '/models/controllers/cx40.glb',
      // Dimensions.com: 4in (101.6mm) W x 5in (127mm) H x 4in (101.6mm) D —
      // the "height" is the stick's own vertical throw, not a resting profile.
      dimensions: { width: 101.6, height: 127, depth: 101.6 },
      innovations: [
        'The first genuinely cross-platform game controller. Its 9-pin connector was copied by Sega, Commodore and MSX for over a decade after the 2600 itself was gone.',
        'One digital 8-way stick, one fire button. Every design that followed added to this; nothing before it had settled on it.',
      ],
      // No position/shape data: a vertical stick has no equivalent in this
      // project's controller-form shapes (all authored as flat button caps
      // on a swept plan outline), so it is left unplaced rather than
      // guessed at — matches the existing convention for any button this
      // kit cannot yet express.
      buttons: [{ id: 'fire', mesh: 'fire_button', label: 'Fire', key: ' ' }],
    },
  ],

  facts: [
    {
      id: 'racing-the-beam',
      title: 'The chip that raced the television',
      body: 'The 2600 has no framebuffer: no memory chip anywhere on the board holds a finished picture. The Television Interface Adaptor generates video by reacting to the position of the TV\'s own electron beam as it happens, line by line, 60 times a second. Programmers had to write code that finished each scanline\'s work inside the exact number of processor cycles the beam took to cross the screen. Miss the timing and the picture visibly breaks.',
    },
    {
      id: 'et-five-weeks',
      title: 'Five weeks to make the most infamous game ever shipped',
      body: 'Atari paid a reported $20–25 million for the E.T. license and wanted the game in stores for Christmas. Howard Scott Warshaw was given about five weeks to design, program and finish it, a fraction of a normal development cycle even by 1982 standards. The result became the public face of a crash it did not, by itself, cause.',
    },
    {
      id: 'landfill-confirmed',
      title: 'The landfill story turned out to be true',
      body: 'For thirty years it was treated as an urban legend: that Atari, drowning in unsold cartridges after 1983, buried millions of them, E.T. among them, in a landfill in Alamogordo, New Mexico. In 2014 a film crew got permission to actually dig. They found the cartridges.',
    },
    {
      id: 'oversaturation-not-et',
      title: 'E.T. got the blame; oversaturation did the damage',
      body: 'By 1982 anyone could publish a 2600 cartridge with no approval process at all, and the market filled with games built to ship, not to be played. E.T. is remembered as the crash\'s cause because it was the biggest, most visible casualty, but the actual damage was years of third-party flooding and consumer trust collapsing under low-quality software, with or without a licensed alien.',
    },
  ],

  failureStates: [
    {
      id: 'rf-drift',
      name: 'RF channel drift',
      body: 'The 2600 connected to a TV over the antenna input, broadcasting on channel 2 or 3 through an RF modulator. That modulator drifts with age and heat, and the picture degrades into static and rolling snow until the TV is re-tuned by hand, a routine part of owning one, not a fault unique to any single unit.',
      target: 'shell',
      effect: 'screen-garbage',
    },
    {
      id: 'cartridge-corrosion',
      name: 'Cartridge contact corrosion',
      body: 'Decades of oxidation on the cartridge\'s edge connector produces a scrambled, flickering title screen or a console that boots to noise: the same failure family as a dirty NES pin, on a slot with no spring-loaded ejector to help clean it.',
      target: 'cart_slot',
      effect: 'screen-garbage',
    },
  ],

  diorama: {
    roomKit: 'living-70s-na',
    footprint: [4.2, 3.6],
    props: [
      { kit: 'sofa', variant: 'corduroy-olive', position: [0, 0, 1.35], rotation: [0, Math.PI, 0] },
      { kit: 'rug', variant: 'shag-rust', position: [0, 0.002, 0.55], scale: 1.15 },
      { kit: 'tv-stand', variant: 'oak-veneer', position: [0, 0, -1.15] },
      { kit: 'side-table', variant: 'oak-veneer', position: [1.25, 0, 0.95] },
      { kit: 'lamp', variant: 'brass-shade', position: [1.25, 0.52, 0.95] },
      { kit: 'plant', variant: 'fern', position: [1.75, 0, -1.05], scale: 1.2 },
      { kit: 'poster', variant: 'arcade', position: [-2.06, 1.5, -0.4], rotation: [0, Math.PI / 2, 0] },
      { kit: 'window', variant: 'curtains', position: [1.25, 1.4, -1.78] },
    ],
    tv: {
      id: 'crt-19-1977',
      model: '/models/tvs/crt-19.glb',
      label: '19-inch wood-cabinet CRT, c. 1977',
      screenInches: 19,
      dimensions: { width: 560, height: 460, depth: 520 },
      curvature: 0.85,
      bezelInsetMm: 20,
      aspect: '4:3',
    },
    lighting: {
      id: 'afternoon-70s',
      tempK: 2700,
      intensity: 2.6,
      keyPosition: [3.4, 2.1, 1.2],
      ambientIntensity: 0.32,
      backdrop: '#eeeeea',
    },
    tvPosition: [-0.28, 0.5, -1.15],
    tvRotation: [0, 0.12, 0],
    consolePosition: [0.4, 0.5, -1.0],
    consoleRotation: [0, -0.24, 0],
    controllerPosition: [-0.18, 0.014, 0.42],
    controllerRotation: [0, 0.4, 0],
    shelfPosition: [-1.35, 0.55, -1.52],
  },

  games: [
    { rank: 1, title: 'Pac-Man', year: 1982, unitsSold: 8_095_586, developer: 'Tod Frye', publisher: 'Atari, Inc.', blurb: 'A rushed, flickering port of the arcade phenomenon, and still the best-selling game the 2600 ever had, on reputation alone.' },
    { rank: 2, title: 'Space Invaders', year: 1980, unitsSold: 6_252_229, developer: 'Rick Maurer', publisher: 'Atari, Inc.', blurb: 'The killer app that quadrupled console sales overnight and proved arcade licenses could sell hardware.' },
    { rank: 3, title: 'Donkey Kong', year: 1982, unitsSold: 4_000_000, developer: 'Garry Kitchen', publisher: 'Coleco', blurb: 'A Nintendo arcade game, ported by Coleco, selling consoles for a competitor entirely: an early lesson in how licensing actually works.' },
    { rank: 4, title: 'Pitfall!', year: 1982, unitsSold: 4_000_000, developer: 'David Crane', publisher: 'Activision', blurb: 'Activision\'s answer to "what is a platformer" before the word existed, built by programmers who had just walked out of Atari.' },
    { rank: 5, title: 'Asteroids', year: 1981, unitsSold: 3_832_886, developer: 'Bradley G. Stewart', publisher: 'Atari, Inc.', blurb: 'Vector-arcade physics squeezed onto raster hardware that was never built for it.' },
    { rank: 6, title: 'Defender', year: 1982, unitsSold: 3_040_684, developer: 'Bob Polaro', publisher: 'Atari, Inc.', blurb: 'Notoriously hard to control on a single-button joystick, a port fighting its own input device.' },
    { rank: 7, title: 'E.T. the Extra-Terrestrial', year: 1982, unitsSold: 2_740_232, developer: 'Howard Scott Warshaw', publisher: 'Atari, Inc.', blurb: 'Five weeks of development, a $20+ million license, and the game every history of the industry mentions first.' },
    { rank: 8, title: 'Ms. Pac-Man', year: 1983, unitsSold: 2_311_428, developer: 'Mike Horowitz, Josh Littlefield', publisher: 'Atari, Inc.', blurb: 'A better port than the original, arriving after the market had already begun to collapse.' },
    { rank: 9, title: 'Demon Attack', year: 1982, unitsSold: 2_000_000, developer: 'Rob Fulop', publisher: 'Imagic', blurb: 'One of the third-party wave\'s genuine hits, from a studio of ex-Atari programmers who left over royalties.' },
    { rank: 10, title: 'Night Driver', year: 1980, unitsSold: 1_990_643, developer: 'Rob Fulop', publisher: 'Atari, Inc.', blurb: 'A first-person racer rendered from a handful of moving dots, an early answer to "how much can this chip fake."' },
  ],

  sources: [
    'https://en.wikipedia.org/wiki/Atari_2600',
    'https://en.wikipedia.org/wiki/List_of_best-selling_Atari_2600_video_games',
    'https://en.wikipedia.org/wiki/Atari_CX40_joystick',
    'https://www.dimensions.com/element/atari-2600',
    'https://www.dimensions.com/element/atari-cx40-joystick',
  ],
}
