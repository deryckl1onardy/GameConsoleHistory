import type { ConsoleEntry } from '@/types/console'

/**
 * The console that turned "load times" into a solved problem — its custom
 * NVMe SSD collapsed waits that had defined every prior generation down to
 * near-instant, at the cost of a chassis large enough to draw its own
 * running jokes. Launched into a pandemic-driven shortage that kept it
 * effectively sold out for its first two years on shelves.
 *
 * Sales figures, dates and technical specs from Wikipedia (see `sources`).
 * Controller modelled is the DualSense, standard since launch.
 *
 * NOTE on orientation: unlike every other console in this project, the PS5's
 * dropped-in model was exported already standing upright (its actual resting
 * orientation without the included stand) rather than lying flat — see
 * `gltf-transforms.ts`. `dimensions` below is recorded in this project's
 * width/height/depth convention with that standing pose in mind: height is
 * the tall vertical axis, width is the thin front-to-back thickness.
 */
export const ps5: ConsoleEntry = {
  id: 'ps5',
  name: 'PlayStation 5',
  shortName: 'PS5',
  manufacturer: 'Sony',
  generation: 9,
  released: {
    na: '2020-11-12',
    jp: '2020-11-12',
    eu: '2020-11-19',
  },
  unitsSold: 95_300_000,
  msrpUsd: 499,
  msrpUsdAdjusted: 499,
  tagline: 'It made load screens feel like a thing of the past.',
  summary:
    'The PlayStation 5 launched at $499 for the disc edition and $399 for an all-digital model with no drive at all, into a pandemic-driven chip shortage that kept both versions effectively sold out for the better part of two years. Its custom NVMe SSD was the real generational leap: games that once opened with a minute-plus loading screen now resumed in seconds, a change so immediate that Sony rebuilt its own marketing around it. The trade-off was size: a chassis tall and wide enough that "will it fit in my TV stand" became a genuine pre-order question, and one reviewers kept circling back to even as they praised everything running inside it.',

  specs: {
    cpu: 'AMD Zen 2 (8-core, custom)',
    cpuClockMhz: 3500,
    ram: '16 GB GDDR6',
    ramBytes: 17_179_869_184,
    resolution: 'Up to 4K/120Hz, 8K supported by spec',
    colors: '16.7 million (AMD RDNA 2 GPU, 36 CUs @ up to 2.23 GHz, 10.28 TFLOPS, hardware ray tracing)',
    audio: 'Tempest 3D AudioTech',
    media: 'Ultra HD Blu-ray, Blu-ray, DVD (Disc Edition); digital-only on the Digital Edition',
  },

  relatableSpecs: [
    {
      label: 'Custom NVMe SSD',
      value: '825 GB, ~5.5 GB/s raw throughput',
      comparison:
        'Turned loading screens that used to run a minute or more into a near-instant resume: the single biggest felt difference of the whole generation, not the graphics.',
    },
    {
      label: 'Two editions at launch',
      value: '$499 disc / $399 all-digital',
      comparison:
        'The first time Sony split a mainline PlayStation launch into a disc drive and a no-drive model sold side by side at different prices.',
    },
    {
      label: 'Chassis size',
      value: 'One of the largest consoles ever shipped',
      comparison:
        'Big enough that "will it fit my TV stand" became a real pre-launch concern: reviewers joked about it standing taller than a router and wider than a game case turned sideways.',
    },
    {
      label: 'Lifetime sales (so far)',
      value: '95+ million and still selling',
      comparison:
        'Tracking ahead of the PS4\'s pace at the same point in its life, despite years of supply shortage limiting how many units could reach shelves.',
    },
  ],

  mediaKind: 'optical',
  mediaArchetype: 'bluray-case',
  model: '/models/consoles/ps5.glb',
  // Measured against the actual rendered GLB — see snes.ts's hardwareDiagram
  // comment for the method. This model stands upright and renders 225 x 356 x
  // 156mm against the real 104 x 390 x 260 — over twice the published
  // thickness (gltf-transforms.ts), so the anchors here MUST be validated
  // against renderBox, not the spec. The model's own meshes confirm the disc
  // drive on the +X face (lower half) with the disc slot above it.
  hardwareDiagram: {
    renderBox: { x: [-0.1128, 0.1128], y: [0, 0.3563], z: [-0.0778, 0.0778] },
    callouts: [
      {
        label: "The white fins: the console's silhouette",
        anchor: [0.105, 0.28, 0.03],
        labelOffset: [0.03, 0.03, 0.01],
      },
      {
        label: 'Disc drive: the bulge on the right side',
        anchor: [0.105, 0.09, -0.024],
        labelOffset: [0.03, 0.03, 0.01],
      },
      {
        label: 'Disc slot + eject: right side, mid-height',
        anchor: [0.103, 0.17, 0.011],
        labelOffset: [0.03, 0.03, 0.01],
      },
      {
        label: 'Front ports: USB-C and USB-A, top',
        anchor: [0, 0.34, 0.05],
        labelOffset: [0, 0.03, 0.005],
      },
      {
        label: 'Power button: front, below the ports',
        anchor: [0, 0.3, 0.05],
        labelOffset: [0, 0.035, 0.005],
      },
    ],
  },
  // Aspirational mesh targets for a future authored model -- see the
  // Atari 2600 / NES entries for why the current dropped-in GLB can't be
  // targeted by name yet.
  animatedParts: {
    tray: 'disc_slot',
    powerSwitch: 'power_button',
  },
  // Real PS5, standing (no base): 104mm thick x 390mm tall x 260mm deep.
  // This model was exported already standing upright, unlike every other
  // console here -- see the file header note and gltf-transforms.ts.
  dimensions: { width: 104, height: 390, depth: 260 },

  variants: [],

  controllers: [
    {
      id: 'dualsense',
      name: 'DualSense Controller',
      model: '/models/controllers/dualsense.glb',
      // Dimensions.com: 160mm W x 106mm H x 66mm D.
      dimensions: { width: 160, height: 66, depth: 106 },
      innovations: [
        'Adaptive triggers that vary their own resistance in software: a bowstring pulling back, a car\'s brake pedal engaging, felt as genuine mechanical tension rather than a fixed click.',
        'Haptic feedback fine enough to distinguish rain from footsteps from gunfire as separate, located sensations, replacing the single rumble motor used since the DualShock 3.',
        'A built-in microphone array for chat with no headset required, plus the same touchpad and light bar carried over from the DualShock 4.',
      ],
      buttons: [
        { id: 'dpad-up', mesh: 'dpad', label: 'D-pad Up', key: 'ArrowUp', travel: [0, -0.0008, 0], position: [-46, 14], shape: 'cross', sizeMm: 24 },
        { id: 'dpad-down', mesh: 'dpad', label: 'D-pad Down', key: 'ArrowDown', travel: [0, -0.0008, 0] },
        { id: 'dpad-left', mesh: 'dpad', label: 'D-pad Left', key: 'ArrowLeft', travel: [0, -0.0008, 0] },
        { id: 'dpad-right', mesh: 'dpad', label: 'D-pad Right', key: 'ArrowRight', travel: [0, -0.0008, 0] },
        { id: 'triangle', mesh: 'btn_triangle', label: 'Triangle', key: 'i', travel: [0, -0.0012, 0], position: [46, 26], shape: 'convex', sizeMm: 12 },
        { id: 'circle', mesh: 'btn_circle', label: 'Circle', key: 'l', travel: [0, -0.0012, 0], position: [58, 14], shape: 'convex', sizeMm: 12 },
        { id: 'cross', mesh: 'btn_cross', label: 'Cross', key: 'k', travel: [0, -0.0012, 0], position: [46, 2], shape: 'convex', sizeMm: 12 },
        { id: 'square', mesh: 'btn_square', label: 'Square', key: 'j', travel: [0, -0.0012, 0], position: [34, 14], shape: 'convex', sizeMm: 12 },
        { id: 'l1', mesh: 'btn_l1', label: 'L1', key: 'q', travel: [0, 0, -0.0015], position: [-46, -30], shape: 'shoulder', sizeMm: 26 },
        { id: 'r1', mesh: 'btn_r1', label: 'R1', key: 'e', travel: [0, 0, -0.0015], position: [46, -30], shape: 'shoulder', sizeMm: 26 },
        { id: 'l2', mesh: 'btn_l2', label: 'L2 (Adaptive)', key: 'u', travel: [0.5, 0, 0], position: [-46, -38], shape: 'trigger', sizeMm: 22 },
        { id: 'r2', mesh: 'btn_r2', label: 'R2 (Adaptive)', key: 'o', travel: [0.5, 0, 0], position: [46, -38], shape: 'trigger', sizeMm: 22 },
        { id: 'share', mesh: 'btn_share', label: 'Create', key: 'Shift', travel: [0, -0.0006, 0], position: [-14, 10], shape: 'capsule', sizeMm: 8 },
        { id: 'options', mesh: 'btn_options', label: 'Options', key: 'Enter', travel: [0, -0.0006, 0], position: [14, 10], shape: 'capsule', sizeMm: 8 },
        { id: 'ps', mesh: 'btn_ps', label: 'PS Button', key: 'p', travel: [0, -0.0006, 0], position: [0, 10], shape: 'convex', sizeMm: 10 },
        { id: 'touchpad', mesh: 'touchpad', label: 'Touchpad', key: 't', travel: [0, -0.0008, 0], position: [0, 24], shape: 'flat', sizeMm: 55 },
        { id: 'l-stick', mesh: 'stick_l', label: 'Left Stick', key: 'a', travel: [0, 0, 0], position: [-20, -14], shape: 'stick', sizeMm: 20 },
        { id: 'r-stick', mesh: 'stick_r', label: 'Right Stick', key: 'd', travel: [0, 0, 0], position: [20, -14], shape: 'stick', sizeMm: 20 },
      ],
    },
  ],

  facts: [
    {
      id: 'ssd-load-times',
      title: 'The SSD, not the graphics, was the real leap',
      body: 'The PS5\'s custom NVMe SSD moved data fast enough to collapse loading screens that had run a minute or longer on PS4 into a near-instant resume. It changed how open-world games could even be designed: fast travel and streaming worlds no longer needed a loading screen to hide behind.',
    },
    {
      id: 'two-editions-launch',
      title: 'Two consoles, one generation, at once',
      body: 'Sony launched a $499 Disc Edition and a $399 Digital Edition with no drive at all side by side: the first mainline PlayStation to split its launch lineup into a disc and a no-disc model from day one.',
    },
    {
      id: 'shortage-years',
      title: 'It stayed hard to buy for nearly two years',
      body: 'A global chip shortage compounded by pandemic-era supply chain disruption kept the PS5 in short supply well into 2022, resellers and bots dominated the retail market for the first stretch of the console\'s life.',
    },
    {
      id: 'chassis-size-jokes',
      title: 'Its size became part of the conversation',
      body: 'At roughly 390mm tall, the PS5 stands notably larger than any prior mainline PlayStation: big enough that fitting it into an existing TV stand became a genuine pre-order consideration, and a running joke online well before launch.',
    },
  ],

  failureStates: [
    {
      id: 'disc-drive-noise',
      name: 'Disc drive grinding noise',
      body: 'A handful of early Disc Edition units developed an audible grinding or whirring from the optical drive under load, traced by some owners to disc-detection hardware. Sony addressed it through standard warranty repair rather than a formal recall.',
      target: 'lid',
      effect: 'dim',
    },
    {
      id: 'trigger-drift',
      name: 'Adaptive trigger and stick wear',
      body: 'The DualSense\'s more complex adaptive-trigger mechanism and analog sticks are both subject to wear-driven drift over heavy use, a continuation of the same potentiometer wear pattern seen on the DualShock 4.',
      target: 'shell',
      effect: 'dim',
    },
  ],

  diorama: {
    roomKit: 'living-2020s-na',
    footprint: [4.2, 3.6],
    props: [
      { kit: 'sofa', variant: 'grey-modern', position: [0, 0, 1.35], rotation: [0, Math.PI, 0] },
      { kit: 'rug', variant: 'berber-cream', position: [0, 0.002, 0.55], scale: 1.15 },
      { kit: 'tv-stand', variant: 'ikea-white', position: [0, 0, -1.15] },
      { kit: 'side-table', variant: 'glass-chrome', position: [1.25, 0, 0.95] },
      { kit: 'lamp', variant: 'white-shade', position: [1.25, 0.52, 0.95] },
      { kit: 'plant', variant: 'rubber-tree', position: [1.75, 0, -1.05], scale: 1.05 },
      { kit: 'poster', variant: 'band', position: [-2.06, 1.5, -0.4], rotation: [0, Math.PI / 2, 0] },
      { kit: 'window', variant: 'blinds', position: [1.25, 1.4, -1.78] },
    ],
    tv: {
      id: 'oled-55-2021',
      model: '/models/tvs/oled-55.glb',
      label: '55-inch OLED, c. 2021',
      screenInches: 55,
      dimensions: { width: 1230, height: 710, depth: 40 },
      curvature: 0,
      bezelInsetMm: 10,
      aspect: '16:9',
    },
    lighting: {
      id: 'evening-2020s',
      tempK: 3800,
      intensity: 2.6,
      keyPosition: [3.4, 2.1, 1.2],
      ambientIntensity: 0.36,
      backdrop: '#eeeeea',
    },
    tvPosition: [-0.28, 0.62, -1.15],
    tvRotation: [0, 0.12, 0],
    // y is the console's BASE, not its centre: GltfPrimitive floor-aligns every
    // model by `-box.min.y`. 0.5 is the top of the 500mm tv-stand, same as every
    // other console here -- the PS5 standing 390mm tall changes its height, not
    // where it rests. (Was 0.195, i.e. half its own height, which floated it
    // above the floor and *below* the stand it is meant to be on.)
    consolePosition: [0.5, 0.5, -1.0],
    consoleRotation: [0, -0.28, 0],
    controllerPosition: [-0.18, 0.014, 0.42],
    controllerRotation: [0, 0.5, 0],
    shelfPosition: [-1.35, 0.55, -1.52],
  },

  games: [
    { rank: 1, title: "Marvel's Spider-Man 2", year: 2023, unitsSold: 17_000_000, developer: 'Insomniac Games', publisher: 'Sony Interactive Entertainment', blurb: 'Two playable Spider-Men swinging through New York at once, built to show off what the SSD and haptics could really do.' },
    { rank: 2, title: 'Gran Turismo 7', year: 2022, unitsSold: 8_910_000, developer: 'Polyphony Digital', publisher: 'Sony Interactive Entertainment', blurb: 'A return to the series\' campaign roots after Sport\'s online-first detour, with ray-traced replays as a showcase feature.' },
    { rank: 3, title: 'EA Sports FC 26', year: 2025, unitsSold: 7_040_000, developer: 'EA Orlando', publisher: 'EA Sports', blurb: 'The annual football franchise\'s current entry, continuing under the EA Sports FC name after parting ways with FIFA.' },
    { rank: 4, title: 'Resident Evil 4', year: 2023, unitsSold: 6_968_000, developer: 'Capcom', publisher: 'Capcom', blurb: 'A ground-up remake of the 2005 original, rebuilt with modern combat while keeping the village\'s sense of dread intact.' },
    { rank: 5, title: 'Black Myth: Wukong', year: 2024, unitsSold: 6_000_000, developer: 'Game Science', publisher: 'Game Science', blurb: 'An action-RPG built on Chinese mythology\'s Journey to the West, and one of the biggest debuts ever for a first-time studio.' },
    { rank: 6, title: 'Helldivers 2', year: 2024, unitsSold: 5_600_000, developer: 'Arrowhead Game Studios', publisher: 'Sony Interactive Entertainment', blurb: 'A cooperative third-person shooter whose satirical tone and friendly-fire chaos turned it into a surprise cultural moment.' },
    { rank: 7, title: 'Forza Horizon 5', year: 2025, unitsSold: 5_300_000, developer: 'Playground Games', publisher: 'Xbox Game Studios', blurb: 'An open-world racer set in Mexico, arriving on PlayStation as part of Xbox\'s broader shift toward multiplatform releases.' },
    { rank: 8, title: 'God of War Ragnarök', year: 2022, unitsSold: 4_182_000, developer: 'Santa Monica Studio', publisher: 'Sony Interactive Entertainment', blurb: 'Closed out the Norse saga begun in 2018, expanding the cast and the scale of the world Kratos and Atreus travel through.' },
    { rank: 9, title: 'Ghost of Yōtei', year: 2025, unitsSold: 4_000_000, developer: 'Sucker Punch Productions', publisher: 'Sony Interactive Entertainment', blurb: 'A spiritual successor to Ghost of Tsushima, moving the setting north and the protagonist to a new lead.' },
    { rank: 10, title: 'Ratchet & Clank: Rift Apart', year: 2021, unitsSold: 3_970_000, developer: 'Insomniac Games', publisher: 'Sony Interactive Entertainment', blurb: 'Near-instant dimension-hopping traversal built specifically to demonstrate the PS5\'s SSD in real time, mid-level.' },
  ],

  sources: [
    'https://en.wikipedia.org/wiki/PlayStation_5',
    'https://en.wikipedia.org/wiki/List_of_best-selling_PlayStation_5_video_games',
    'https://www.dimensions.com/element/playstation-5-dualsense-controller',
  ],
}
