import type { ConsoleEntry } from '@/types/console'

/**
 * The vertical slice.
 *
 * Everything here is content — no console-specific code exists anywhere in the
 * app. When this file's shape proves out, console #2 is a copy of this file with
 * different values.
 *
 * Sales figures and dates from Wikipedia (see `sources`). Physical dimensions
 * from Nintendo's published Game Pak spec.
 */
export const snes: ConsoleEntry = {
  id: 'snes',
  name: 'Super Nintendo Entertainment System',
  shortName: 'SNES',
  manufacturer: 'Nintendo',
  generation: 4,
  released: {
    jp: '1990-11-21', // as the Super Famicom
    na: '1991-08-23',
    eu: '1992-04-11',
  },
  discontinued: '2003-09-25',
  unitsSold: 49_100_000,
  msrpUsd: 199,
  msrpUsdAdjusted: 465,
  tagline: 'The machine that won a war it started two years late.',
  summary:
    'Nintendo arrived to the 16-bit generation second. The Genesis had a two-year head start, a faster processor and an advertising campaign built entirely around mocking them. The SNES answered with a slower CPU and better everything else: a colour palette four times deeper, a sound chip designed by Sony, and hardware that could scale and rotate a whole layer of the screen at once. It is also the console that accidentally created its own successor: a shelved CD add-on, built with Sony, walked out of the building and came back as the PlayStation.',

  specs: {
    cpu: 'Ricoh 5A22 (65816 core)',
    cpuClockMhz: 3.58,
    ram: '128 KB work RAM, 64 KB VRAM, 64 KB audio RAM',
    ramBytes: 131_072,
    resolution: '256×224 standard, up to 512×448 interlaced',
    colors: '256 on screen from a palette of 32,768',
    audio: 'Sony SPC700, 8-channel ADPCM',
    media: 'ROM cartridge (Game Pak)',
  },

  relatableSpecs: [
    {
      label: 'Working memory',
      value: '128 KB',
      comparison:
        'A single 512×512 emoji, uncompressed, is eight times more memory than the SNES had for an entire game.',
    },
    {
      label: 'Super Mario World, complete',
      value: '512 KB',
      comparison:
        'Every level, sprite, note and line of code fits in less space than one photo from a modern phone camera.',
    },
    {
      label: 'Processor speed',
      value: '3.58 MHz',
      comparison:
        'A phone in 2026 runs roughly a thousand times faster per core, and does far more work in each of those cycles.',
    },
    {
      label: 'Colours on screen',
      value: '256 at once',
      comparison:
        'The display you are reading this on can show more distinct colours in a single pixel than the SNES could show in an entire frame.',
    },
  ],

  mediaKind: 'cartridge',
  mediaArchetype: 'cart-snes-na',
  model: '/models/consoles/snes.glb',
  // The proving case for the annotation slot (HardwareAnnotations.tsx).
  //
  // The first version of these anchors was computed on paper — converted
  // from console-forms.ts's `snes` form (its profile, control and intake
  // positions, sourced from real reference photographs) using the exact
  // math ConsoleFromForm.tsx uses to place those same features. It looked
  // right on paper and was wrong in the room: this console renders from its
  // dropped-in GLB, not that fallback form, and gltf-transforms.ts already
  // documented why that specific file can't be trusted this way — its
  // WIDTH was measured against the real 203.2mm spec, but its height and
  // depth are contaminated by a controller and cord fused into the same
  // mesh, so they read as 88mm and 163mm rather than the real 68mm and
  // 254mm. Coordinates derived from the real-world spec landed on the
  // wrong points of THIS mesh's actual, distorted proportions — the power
  // and reset labels pointed at the dangling cord, nowhere near the deck.
  //
  // These anchors are the actual fix: raycast against the real rendered
  // geometry (nearest surface vertex to a chosen screen pixel, picking the
  // camera-facing one where several vertices project to the same pixel),
  // at the app's own default camera pose, cross-checked by placing visible
  // test markers back into the live scene and screenshotting until they
  // sat on the right part of the shell. Still not laser-precise — this
  // model has no separately modelled button geometry to snap to, so "the
  // power switch" is a judged point on a continuous surface, not a solved
  // one — but it points at the actual control deck, left-to-right in the
  // real power/eject/reset order, rather than at empty air.
  hardwareDiagram: {
    callouts: [
      {
        label: 'Power switch: flat on the top deck, not the front face',
        anchor: [-0.0423, 0.047, 0.0514],
        labelOffset: [-0.025, 0.05, 0.01],
      },
      {
        label: 'Reset button: flat on the top deck, not the front face',
        anchor: [0.0231, 0.0467, -0.0173],
        labelOffset: [0.025, 0.05, 0.01],
      },
      {
        label: 'Eject lever: the narrower column between the two blocks',
        anchor: [0.0002, 0.0538, 0.0357],
        labelOffset: [0, 0.065, 0.02],
      },
      {
        label: 'Controller ports (×2): 7-pin, same as the NES',
        anchor: [-0.035, 0.0097, 0.0474],
        labelOffset: [-0.015, 0.045, 0.02],
      },
      {
        label: 'Cartridge slot: the Game Pak slides in from the top',
        anchor: [-0.0203, 0.0881, 0.0152],
        labelOffset: [0, 0.035, 0.01],
      },
    ],
  },
  animatedParts: {
    slot: 'cart_slot',
    powerSwitch: 'power_switch',
    resetButton: 'reset_button',
    ejectLever: 'eject_lever',
    led: 'power_led',
  },
  // Console shell, North American model SNS-001.
  // Dimensions.com: 8in (203.2mm) W x 2.68in (68mm) H x 10in (254mm) D.
  dimensions: { width: 203.2, height: 68, depth: 254 },

  variants: [
    {
      id: 'sfc',
      region: 'jp',
      name: 'Super Famicom',
      model: '/models/consoles/super-famicom.glb',
      mediaArchetype: 'cart-snes-jp',
      dioramaOverrides: {
        roomKit: 'living-jp-90s',
        lighting: {
          id: 'evening-fluorescent',
          tempK: 4200,
          intensity: 2.4,
          keyPosition: [0, 2.4, 0],
          ambientIntensity: 0.5,
          backdrop: '#eeeeea',
        },
      },
      note: 'The Japanese cartridge is a different physical shape: rounder, slightly smaller, with different notches. That was deliberate: the shells were designed so imported games would not fit, region-locking the hardware by geometry alone. It is the reason this atlas needs two cartridge archetypes for one console.',
    },
  ],

  controllers: [
    {
      id: 'snes-pad',
      name: 'SNES Controller',
      model: '/models/controllers/snes-pad.glb',
      // W/H/D consistently mean left-right / up-down / front-back everywhere
      // in this schema, including here: 148mm wide, 25mm thick, 60mm deep.
      dimensions: { width: 148, height: 25, depth: 60 },
      innovations: [
        'Shoulder buttons: the first pad to put inputs on the far edge, where your index fingers already rested.',
        'Four face buttons in a diamond, replacing the NES pair. A and B convex, X and Y concave, so your thumb could tell them apart without looking.',
        'The rounded "dog bone" shape, the first controller designed to be held for hours rather than gripped.',
      ],
      // position: [x, z] in mm from the pad's own centre, matching the plan
      // outline in controller-forms.ts. Only one of the four d-pad entries
      // carries a position — they share one physical mesh (see the type
      // comment on 'cross'), so giving all four a position would render four
      // overlapping copies of the same geometry.
      buttons: [
        { id: 'dpad-up', mesh: 'dpad', label: 'D-pad Up', key: 'ArrowUp', travel: [0, -0.0008, 0], position: [-38, 0], shape: 'cross', sizeMm: 24 },
        { id: 'dpad-down', mesh: 'dpad', label: 'D-pad Down', key: 'ArrowDown', travel: [0, -0.0008, 0] },
        { id: 'dpad-left', mesh: 'dpad', label: 'D-pad Left', key: 'ArrowLeft', travel: [0, -0.0008, 0] },
        { id: 'dpad-right', mesh: 'dpad', label: 'D-pad Right', key: 'ArrowRight', travel: [0, -0.0008, 0] },
        // NA pad (SNS-005): A and B are purple and convex; X and Y are lavender
        // and concave. You could tell them apart with your thumb in the dark,
        // which is the entire reason for the two shapes.
        { id: 'a', mesh: 'btn_a', label: 'A', key: 'l', travel: [0, -0.0012, 0], note: 'Purple, convex', position: [51, 0], shape: 'convex', sizeMm: 13 },
        { id: 'b', mesh: 'btn_b', label: 'B', key: 'k', travel: [0, -0.0012, 0], note: 'Purple, convex', position: [38, 13], shape: 'convex', sizeMm: 13 },
        { id: 'x', mesh: 'btn_x', label: 'X', key: 'i', travel: [0, -0.0012, 0], note: 'Lavender, concave', position: [38, -13], shape: 'concave', sizeMm: 13 },
        { id: 'y', mesh: 'btn_y', label: 'Y', key: 'j', travel: [0, -0.0012, 0], note: 'Lavender, concave', position: [25, 0], shape: 'concave', sizeMm: 13 },
        { id: 'l', mesh: 'btn_l', label: 'L', key: 'q', travel: [0, 0, -0.0015], note: 'New to this generation', position: [-40, -28], shape: 'shoulder', sizeMm: 30 },
        { id: 'r', mesh: 'btn_r', label: 'R', key: 'e', travel: [0, 0, -0.0015], note: 'New to this generation', position: [40, -28], shape: 'shoulder', sizeMm: 30 },
        { id: 'start', mesh: 'btn_start', label: 'Start', key: 'Enter', travel: [0, -0.0008, 0], position: [6, 20], shape: 'capsule', sizeMm: 9 },
        { id: 'select', mesh: 'btn_select', label: 'Select', key: 'Shift', travel: [0, -0.0008, 0], position: [-6, 20], shape: 'capsule', sizeMm: 9 },
      ],
    },
  ],

  facts: [
    {
      id: 'mode-7',
      title: 'Mode 7 was one trick, used everywhere',
      body: 'The SNES could scale and rotate exactly one background layer. That single capability produced the racetrack in Super Mario Kart, the sweeping ground of F-Zero, the world map of Final Fantasy VI and the dizzying spin of a hundred boss fights. An entire visual language of the 1990s came out of one hardware feature with a number for a name.',
      anchor: [0, 0.04, 0],
    },
    {
      id: 'super-fx',
      title: 'Some cartridges contained a second computer',
      body: 'Star Fox did not run on the SNES alone. Inside the cartridge sat the Super FX, a dedicated coprocessor that rendered the polygons the console itself could not. Nintendo shipped a graphics chip in the game box. It is why some carts are heavier than others, and why the console outlived its own specifications.',
      anchor: [0.06, 0.03, 0.02],
    },
    {
      id: 'sony-deal',
      title: 'The add-on that became the competition',
      body: 'Nintendo hired Sony to build a CD drive for the SNES, then announced a deal with Philips instead, at a trade show, without warning Sony first. Sony finished the hardware anyway. It shipped in 1994 as the PlayStation, and it ended Nintendo\'s dominance of the industry within a single generation.',
    },
    {
      id: 'console-war',
      title: '"Genesis does what Nintendon\'t"',
      body: 'Sega had two years, a faster processor and the first genuinely aggressive advertising in the industry. Nintendo could not answer on speed, so it answered on everything else: colour depth, sound, and a library. The SNES finished the generation ahead, but it is the only console war Nintendo ever had to fight from behind.',
    },
  ],

  failureStates: [
    {
      id: 'yellowing',
      name: 'The yellowing',
      body: 'The grey plastic contains a bromine-based flame retardant. Exposed to UV light over years, the bromine migrates to the surface and oxidises, and the console turns a blotchy yellow-brown. Almost every surviving SNES has it to some degree. The Super Famicom, in different plastic, largely does not.',
      target: 'shell',
      effect: 'dim',
    },
    {
      id: 'blowing',
      name: 'Blowing on the cartridge',
      body: 'It never worked. The contacts failed from oxidation and dust, and moist breath accelerated the corrosion: every puff made the next failure more likely. What actually fixed it was reseating the cartridge, which is what you did immediately afterward, which is why a whole generation believes in it.',
      target: 'cart_slot',
      effect: 'screen-garbage',
    },
  ],

  diorama: {
    roomKit: 'den-90s-na',
    footprint: [4.2, 3.6],
    props: [
      { kit: 'sofa', variant: 'plaid-brown', position: [0, 0, 1.35], rotation: [0, Math.PI, 0] },
      { kit: 'rug', variant: 'shag-rust', position: [0, 0.002, 0.55], scale: 1.15 },
      { kit: 'tv-stand', variant: 'oak-veneer', position: [0, 0, -1.15] },
      // No 'shelf' prop here on purpose: GameShelf renders its own open-front
      // shelving unit at shelfPosition. A solid prop box would swallow the
      // cartridges standing inside it.
      { kit: 'side-table', variant: 'oak-veneer', position: [1.25, 0, 0.95] },
      { kit: 'lamp', variant: 'brass-shade', position: [1.25, 0.52, 0.95] },
      { kit: 'plant', variant: 'fern', position: [1.75, 0, -1.05], scale: 1.1 },
      // Wall props must sit on a wall the cutaway actually keeps: back or left.
      { kit: 'poster', variant: 'arcade', position: [-2.06, 1.5, -0.4], rotation: [0, Math.PI / 2, 0] },
      { kit: 'window', variant: 'blinds', position: [1.25, 1.4, -1.78] },
    ],
    tv: {
      id: 'crt-20-1992',
      model: '/models/tvs/crt-20.glb',
      label: '20-inch consumer CRT, c. 1992',
      screenInches: 20,
      dimensions: { width: 530, height: 480, depth: 490 },
      curvature: 0.72,
      bezelInsetMm: 14,
      aspect: '4:3',
    },
    lighting: {
      id: 'afternoon-warm',
      tempK: 3200,
      intensity: 3.1,
      keyPosition: [3.4, 2.1, 1.2],
      ambientIntensity: 0.35,
      // Deliberately not the room's own palette. A warm-lit set against a dark
      // neutral sweep reads as a photographed model; against a matching tan it
      // reads as a flat illustration.
      backdrop: '#eeeeea',
    },
    // Cabinet top is 500mm; the TV group is anchored at that height.
    tvPosition: [-0.28, 0.5, -1.15],
    tvRotation: [0, 0.12, 0],
    // Sits on top of the TV cabinet (500mm tall), turned slightly to camera.
    consolePosition: [0.44, 0.5, -1.02],
    consoleRotation: [0, -0.28, 0],
    // Left on the rug where it was dropped, cable trailing back to the console.
    controllerPosition: [-0.18, 0.014, 0.42],
    controllerRotation: [0, 0.55, 0],
    // Inside the bookshelf, on its lower board, facing into the room.
    shelfPosition: [-1.35, 0.55, -1.52],
  },

  games: [
    {
      rank: 1,
      title: 'Super Mario World',
      year: 1990,
      unitsSold: 20_610_000,
      developer: 'Nintendo EAD',
      publisher: 'Nintendo',
      blurb:
        'The launch title, and still the best-selling game on the system by a factor of two. It introduced Yoshi and a world map that let you find your own way through.',
    },
    {
      rank: 2,
      title: 'Super Mario All-Stars',
      year: 1993,
      unitsSold: 10_550_000,
      developer: 'Nintendo EAD',
      publisher: 'Nintendo',
      blurb:
        'Four NES Mario games rebuilt with 16-bit graphics and save files, including the one Japan never got. An early argument that back catalogues were worth money.',
    },
    {
      rank: 3,
      title: 'Donkey Kong Country',
      year: 1994,
      unitsSold: 9_300_000,
      developer: 'Rare',
      publisher: 'Nintendo',
      blurb:
        'Pre-rendered 3D models crushed down into sprites, on hardware four years old. It outsold everything that Christmas and made the Genesis look a generation behind overnight.',
    },
    {
      rank: 4,
      title: 'Super Mario Kart',
      year: 1992,
      unitsSold: 8_760_000,
      developer: 'Nintendo EAD',
      publisher: 'Nintendo',
      blurb:
        'Mode 7 turned a flat image into a racetrack, split-screen turned it into an argument, and the blue shell had not been invented yet.',
    },
    {
      rank: 5,
      title: 'Street Fighter II: The World Warrior',
      year: 1992,
      unitsSold: 6_300_000,
      developer: 'Capcom',
      publisher: 'Capcom',
      blurb:
        'The arcade phenomenon, at home, nearly intact. It sold consoles on its own and is the reason the SNES pad needed six face and shoulder buttons.',
    },
    {
      rank: 6,
      title: "Donkey Kong Country 2: Diddy's Kong Quest",
      year: 1995,
      unitsSold: 5_150_000,
      developer: 'Rare',
      publisher: 'Nintendo',
      blurb:
        'Harder, stranger and better than the original, released into a year when everyone else had already moved on to 32-bit.',
    },
    {
      rank: 7,
      title: 'The Legend of Zelda: A Link to the Past',
      year: 1991,
      unitsSold: 4_610_000,
      developer: 'Nintendo EAD',
      publisher: 'Nintendo',
      blurb:
        'Two overlapping worlds, one map, and a structure that almost every action-adventure since has borrowed from.',
    },
    {
      rank: 8,
      title: 'Super Mario World 2: Yoshi\'s Island',
      year: 1995,
      unitsSold: 4_120_000,
      developer: 'Nintendo EAD',
      publisher: 'Nintendo',
      blurb:
        'Nintendo answered pre-rendered 3D by going the other way entirely: crayon textures and hand-drawn lines, powered by yet another chip hidden in the cartridge.',
    },
    {
      rank: 9,
      title: 'Street Fighter II Turbo',
      year: 1993,
      unitsSold: 4_100_000,
      developer: 'Capcom',
      publisher: 'Capcom',
      blurb:
        'The same game, faster, sold again, and bought again, in numbers that established the yearly fighting-game update as a business model.',
    },
    {
      rank: 10,
      title: 'Star Fox',
      year: 1993,
      unitsSold: 4_000_000,
      developer: 'Nintendo EAD / Argonaut',
      publisher: 'Nintendo',
      blurb:
        'Polygons on a machine that could not draw polygons. The Super FX chip inside the cartridge did the work the console could not.',
    },
  ],

  sources: [
    'https://en.wikipedia.org/wiki/Super_Nintendo_Entertainment_System',
    'https://en.wikipedia.org/wiki/List_of_best-selling_Super_Nintendo_Entertainment_System_video_games',
    'https://en.wikipedia.org/wiki/Super_Nintendo_Entertainment_System_Game_Pak',
  ],
}
