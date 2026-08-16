/**
 * The scaling backbone. Every console in the atlas is described by this schema and
 * nothing else — no per-console code. If a new console needs a new component, the
 * schema is wrong.
 *
 * Validated on paper against SNES (cartridge), PS1 (optical) and Switch (card)
 * before any 3D work started.
 */

export type Region = 'jp' | 'na' | 'eu'

export type Generation = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

/**
 * A console the atlas knows about but may not have built yet.
 *
 * Deliberately much smaller than ConsoleEntry: the picker needs to show all nine
 * generations to be worth having, long before 22 full dioramas exist. `built` is
 * computed by intersecting with the real roster, never hand-set, so the two
 * lists cannot drift apart.
 */
export type RosterEntry = {
  id: string
  name: string
  shortName: string
  manufacturer: string
  generation: Generation
  year: number
  unitsSold: number
  built: boolean
}

/** Drives which insert/eject sequence plays. The whole roster maps onto three. */
export type MediaKind = 'cartridge' | 'optical' | 'card'

/** Keys into MEDIA_ARCHETYPES — see src/data/kits/media-archetypes.ts */
export type MediaArchetypeId =
  | 'cart-atari-2600'
  | 'cart-nes'
  | 'cart-sms'
  | 'cart-genesis'
  | 'cart-snes-na'
  | 'cart-snes-jp'
  | 'cart-n64'
  | 'jewel-cd'
  | 'dvd-keepcase'
  | 'bluray-case'
  | 'switch-case'

/** Millimetres, always. Everything in the scene derives from real-world dimensions. */
export type DimensionsMm = {
  width: number
  height: number
  depth: number
}

/**
 * A cartridge's printed label is a sticker on part of the shell, not the whole
 * face — and it is rarely centred proportionally. NESdev publishes the NES label
 * as 55x97mm on a 120x134mm face: 46% wide but 72% tall. A single inset scalar
 * cannot express that, so labels carry their own real dimensions.
 *
 * Optical and card cases print edge to edge and have no separate label.
 */
export type CartridgeLabel = {
  widthMm: number
  heightMm: number
  /** Offset from the centre of the front face, in mm. Positive Y is up. */
  offsetYMm: number
  precision: 'exact' | 'approximate'
}

export type MediaArchetype = {
  id: MediaArchetypeId
  kind: MediaKind
  label: string
  dimensions: DimensionsMm
  /** Corner rounding in mm. Carts are chunky, cases are near-square. */
  cornerRadiusMm: number
  /** Null for cases, which are printed edge to edge. */
  cartridgeLabel: CartridgeLabel | null
  /** Where the artwork lives in the atlas: front, spine, back. */
  hasBackArt: boolean
  /**
   * Honesty about provenance. 'exact' means a published spec was found;
   * 'approximate' means it came from collector consensus and should be
   * re-measured before that console ships. Surfaced in the UI.
   */
  precision: 'exact' | 'approximate'
  source: string
}

export type ConsoleSpecs = {
  cpu: string
  cpuClockMhz: number
  ram: string
  ramBytes: number
  resolution: string
  colors: string
  audio: string
  media: string
}

/**
 * Specs mean nothing as raw numbers. Each console carries a handful of
 * comparisons that land: "the entire game is smaller than one phone photo".
 */
export type RelatableSpec = {
  label: string
  value: string
  comparison: string
}

export type Fact = {
  id: string
  title: string
  body: string
  /** Optional 3D hotspot anchor on the console mesh, in local metres. */
  anchor?: [number, number, number]
}

/**
 * The famous failure mode. Pure material/shader work at render time, but it needs
 * a home in the data so every console can declare its own.
 */
export type FailureState = {
  id: string
  name: string
  body: string
  /** Which named mesh the effect targets, and how it renders. */
  target: string
  effect: 'blink-red' | 'blink-amber' | 'screen-garbage' | 'no-signal' | 'dim'
}

/** How a button's cap is moulded — the physical difference a thumb feels. */
export type ButtonShape = 'convex' | 'concave' | 'flat' | 'cross' | 'capsule' | 'shoulder' | 'stick' | 'trigger'

export type ControllerButton = {
  id: string
  /** Mesh name generated for this button — matches a real GLB's naming if one replaces the form. */
  mesh: string
  label: string
  /** Keyboard key that depresses this button in Controller mode. */
  key?: string
  note?: string
  /** Local-space direction the button travels when pressed, in metres. */
  travel?: [number, number, number]
  /**
   * Position on the pad's top face, in mm from the plan-outline centre. Present
   * once a button is data-driven rather than hard-coded per controller.
   */
  position?: [number, number]
  shape?: ButtonShape
  /** Cap diameter/width in mm — a d-pad cross and a shoulder trigger read very differently. */
  sizeMm?: number
}

export type Controller = {
  id: string
  name: string
  model: string
  dimensions: DimensionsMm
  buttons: ControllerButton[]
  /** What this controller introduced to the medium. The input-evolution story. */
  innovations: string[]
}

/**
 * A controller's physical shell, described once as data. A polygon plan
 * outline swept vertically covers the NES rectangle, the SNES dog bone, the
 * N64 trident and the Wii Remote with no special cases — see
 * src/three/geometry/profiles.ts#sweepPlanVertically.
 */
export type ControllerForm = {
  /** Top-down outline in mm, wound consistently. */
  plan: [number, number][]
  thicknessMm: number
  /** How much the top surface domes upward at its crown, in mm. */
  domeMm: number
  bevelMm: number
  /**
   * `accent2` exists because a single accent colour silently conflated two
   * facts the data already recorded correctly — the SNES pad's A/B are
   * purple and convex, X/Y are lavender and concave — into one colour for
   * both. Optional so a single-accent pad (most controllers) doesn't need to
   * repeat itself.
   */
  palette: { shell: string; accent: string; accent2?: string; dark: string }
}

export type GameClip = {
  webm?: string
  mp4?: string
  /** Native resolution of the source hardware — the CRT shader samples at this. */
  nativeWidth: number
  nativeHeight: number
  durationMs: number
}

export type Game = {
  rank: number
  title: string
  year: number
  unitsSold: number
  developer: string
  publisher: string
  /** Cover art texture path. Low-res on purpose — see the legal posture. */
  cover?: string
  clip?: GameClip
  /** Opens the compliant 2D embed for anyone wanting the real thing. */
  youtubeId?: string
  blurb: string
}

/**
 * A labelled hotspot on the console's OWN rendered 3D model — not a flat
 * image. `anchor` and `labelOffset` are both in the console's local space,
 * in metres: the exact same convention `Fact.anchor` already uses (origin at
 * the shell's own floor-centre, matching `dimensions` at 1:1 scale). This
 * used to be a leader-line coordinate pinned to a specific crop of a
 * generated image — coupling the annotation to a picture that could drift
 * out of sync with what the model actually looks like the moment either one
 * changed. Anchoring straight into the model's own coordinate space instead
 * means the callout points at the real part it names, live, in whichever
 * pose the console happens to be rendered in.
 *
 *   anchor       the exact point ON the shell the leader line starts from —
 *                where the part actually is.
 *   labelOffset  a delta FROM anchor to where the line ends and the label
 *                floats, so the pill never sits on top of the part it is
 *                naming. Small and mostly upward/outward is usually right.
 *
 * Rendered by HardwareAnnotations.tsx, mounted alongside the hero console —
 * see that file for how the two points become a marker, a line and a pill.
 */
export type HardwareCallout = {
  label: string
  anchor: [number, number, number]
  labelOffset: [number, number, number]
}

export type HardwareDiagram = {
  callouts: HardwareCallout[]
}

export type PropInstance = {
  kit: string
  variant?: string
  position: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
}

export type LightingPreset = {
  id: string
  /** Colour temperature of the room's key light. Sells the era on its own. */
  tempK: number
  intensity: number
  /** Direction of the key light — afternoon sun through a window, or a ceiling bulb. */
  keyPosition: [number, number, number]
  ambientIntensity: number
  /** Backdrop behind the diorama's open walls. */
  backdrop: string
}

export type TvSpec = {
  id: string
  model: string
  label: string
  /** Visible screen size in inches, and the physical cabinet in mm. */
  screenInches: number
  dimensions: DimensionsMm
  /** 0 = flat panel, 1 = heavily curved CRT glass. Feeds the barrel distortion. */
  curvature: number
  /** How far the screen mesh sits behind the bezel face, in mm. */
  bezelInsetMm: number
  aspect: '4:3' | '16:9'
}

export type DioramaSpec = {
  roomKit: string
  /** Interior floor dimensions in metres — the diorama's actual footprint. */
  footprint: [number, number]
  props: PropInstance[]
  tv: TvSpec
  lighting: LightingPreset
  /** Base of the TV cabinet, in metres. The set is explicit, never derived. */
  tvPosition: [number, number, number]
  tvRotation?: [number, number, number]
  /** Where the console physically sits, in metres, relative to room origin. */
  consolePosition: [number, number, number]
  consoleRotation?: [number, number, number]
  /** Where the controller lies. Base of the pad, lying flat. */
  controllerPosition: [number, number, number]
  controllerRotation?: [number, number, number]
  /** Anchor of the game-box row: centre of the bottom row, in metres. */
  shelfPosition: [number, number, number]
  shelfRotation?: [number, number, number]
}

/**
 * A regional variant swaps *both* the hardware model and the room around it.
 * SNES ↔ Super Famicom is a US den ↔ a Japanese living room, not a recolour.
 */
export type RegionVariant = {
  id: string
  region: Region
  name: string
  model: string
  mediaArchetype: MediaArchetypeId
  /** Only the fields that differ from the base diorama. */
  dioramaOverrides?: Partial<DioramaSpec>
  note: string
}

/**
 * How media goes in. Surveyed against the full ~22-console roster before being
 * locked in — seven kinds cover every mainline home console from the Atari
 * 2600's top slot to the Switch's dock:
 *
 *   top-slot    2600, Master System, Genesis, SNES, N64
 *   front-door  NES's zero-insertion-force tray
 *   top-lid     PlayStation, Saturn, Dreamcast, GameCube
 *   front-tray  PS2, Xbox, PS4, Xbox One, Series X
 *   front-slot  Wii, PS3, Xbox 360 S, PS5
 *   dock        Switch
 *   none        Xbox Series S (no disc drive at all)
 */
export type IntakeKind = 'top-slot' | 'front-door' | 'top-lid' | 'front-tray' | 'front-slot' | 'dock' | 'none'

export type MediaIntake = {
  kind: IntakeKind
  /** Position on the shell's top or front face, in mm from the shell's own centre. */
  position: [number, number]
  widthMm: number
  heightMm: number
}

/**
 * A physical control on the shell. Seven kinds, also surveyed against the full
 * roster: the Atari 2600's six toggle switches and the Xbox's glowing jewel
 * are the awkward cases, and both fit without a new kind.
 */
export type ControlKind = 'slider' | 'round-button' | 'rect-button' | 'lever' | 'toggle' | 'touch' | 'jewel'

/**
 * Which face a control is mounted on. The SNES is the reason this exists: its
 * POWER and RESET keys lie flat on the *top* of the low front deck, not on the
 * vertical front face, and rendering them on the front put two purple plates
 * where the reference photo has bare plastic. 'front' stays the default, so
 * every existing control keeps its meaning.
 */
export type ControlFace = 'front' | 'top'

export type ControlSpec = {
  /** Mesh name generated for this control — becomes an animatedParts target. */
  mesh: string
  kind: ControlKind
  /**
   * Interpretation depends on `face`, matching the convention the intake and
   * vent specs already use:
   *   front — [x from the shell's centre, y above the floor]
   *   top   — [x from the shell's centre, z back from the front face]
   * A top-mounted control's height is not authored at all: it is read off the
   * shell profile at that depth, so a control cannot float above or sink into
   * its own deck.
   */
  position: [number, number]
  face?: ControlFace
  /** Length of the cap along X, in mm. */
  sizeMm: number
  /**
   * Cap width across its length, as a fraction of `sizeMm`. The SNES's power
   * and reset are long, narrow stadium keys (~0.3); a squarer cap sits nearer
   * 0.6. Defaults per kind when omitted.
   */
  aspect?: number
  color?: string
}

/**
 * A rectangular block standing proud of the shell's front face.
 *
 * The SNES front is not one flat plane: two blocks carry the power and reset
 * keys and the controller ports, and the narrower column between them — the
 * one wearing the EJECT label — sits back from both. That relief is most of
 * what makes the front read as an SNES rather than a grey box.
 *
 * Blocks are additive only. A recess is expressed by raising its neighbours,
 * never by a negative protrusion: subtracting a volume needs a boolean library
 * this project deliberately does not depend on, and a dark plate faking a hole
 * is exactly the sort of painted-on detail the swept-profile approach exists
 * to avoid.
 */
export type ReliefSpec = {
  mesh?: string
  /** Centre of the block on the front face — [x from centre, y above floor], mm. */
  position: [number, number]
  widthMm: number
  heightMm: number
  /** How far the block stands proud of the front face, in mm. Must be > 0. */
  protrusionMm: number
}

export type PortSpec = {
  mesh: string
  position: [number, number]
  widthMm: number
  heightMm: number
}

export type VentSpec = {
  /** A row of slots, generated from one spec rather than authored individually. */
  position: [number, number]
  count: number
  slotWidthMm: number
  slotHeightMm: number
  gapMm: number
  /** 'row' runs the slots along X, 'column' along the profile's depth axis. */
  direction: 'row' | 'column'
}

/**
 * A console's physical shell, described once as data. Roughly 16 of the ~22
 * consoles are swept profiles — flat boxes, wedges, slabs — and fall out of
 * this as pure data. A `kind: 'bespoke'` shell defers entirely to a registry
 * override (GameCube's handle, Xbox 360's waist, PS5's fins, the Switch's
 * dock-plus-tablet) — the escape hatch costs no new architecture because the
 * model registry already resolves by override-first, form-second.
 */
export type ConsoleForm = {
  shell:
    | {
        kind: 'swept'
        /** Side profile — (depth, height) points — swept across the shell's own width. */
        profile: [number, number][]
        cornerRadiusMm: number
        bevelMm: number
      }
    | { kind: 'bespoke' }
  finish: 'matte' | 'gloss' | 'wood-veneer' | 'textured'
  palette: { shell: string; accent: string; dark: string }
  intake: MediaIntake
  controls: ControlSpec[]
  ports: PortSpec[]
  vents: VentSpec[]
  /** Front-face relief blocks. Optional: most shells are a plain swept face. */
  reliefs?: ReliefSpec[]
}

export type ConsoleEntry = {
  id: string
  name: string
  shortName: string
  manufacturer: string
  generation: Generation
  released: Partial<Record<Region, string>>
  discontinued?: string
  unitsSold: number
  msrpUsd: number
  /** Inflation-adjusted to 2025 dollars, so cross-generation price is comparable. */
  msrpUsdAdjusted: number
  tagline: string
  summary: string

  specs: ConsoleSpecs
  relatableSpecs: RelatableSpec[]

  mediaKind: MediaKind
  mediaArchetype: MediaArchetypeId
  /** Hero model path plus the named meshes the insert sequence animates. */
  model: string
  /**
   * Optional annotated hardware diagram. Missing is NOT an error state — the
   * diagram slot falls back gracefully (see HardwareDiagram.tsx).
   */
  hardwareDiagram?: HardwareDiagram
  animatedParts: {
    slot?: string
    tray?: string
    lid?: string
    powerSwitch?: string
    resetButton?: string
    ejectLever?: string
    led?: string
  }
  dimensions: DimensionsMm

  variants: RegionVariant[]
  controllers: Controller[]
  facts: Fact[]
  failureStates: FailureState[]
  diorama: DioramaSpec
  games: Game[]

  sources: string[]
}
