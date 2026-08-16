import { create } from 'zustand'
import type { ConsoleEntry, DioramaSpec, Game, Generation, RegionVariant } from '@/types/console'
import { CONSOLES, getConsole } from '@/data/consoles'
import type { FrameOffset, Layout } from '@/frame'

/**
 * One store, shared by the 2D shell and the 3D scene. The playback field is a
 * strict state machine — the insert/eject GSAP timelines key off it, so nothing
 * else is allowed to mutate it ad hoc.
 */

export type ViewMode = 'console' | 'diorama' | 'library' | 'controller' | 'compare'

/**
 * Which of the two worlds we are in. Deliberately NOT a ViewMode: a ViewMode is
 * contractually a shot derivable from a DioramaSpec (that is what shots.test.ts
 * defends), and the museum has no DioramaSpec and its own coordinate space.
 */
export type Screen = 'shelf' | 'room'

/**
 * The museum-to-room move, as a guarded machine — same posture as `playback`,
 * because a GSAP timeline keys off it and a desync would strand the camera
 * between two coordinate spaces.
 *
 *   idle        the current `screen` is authoritative, camera is the user's
 *   focusing    an artifact is chosen; neighbours dim; camera still
 *   approaching camera flying at the artifact, museum going dark
 *   arriving    room mounted under an unmoved console, lights ramping up
 *   retreating  quick pull-back, room -> shelf
 */
export type Approach = 'idle' | 'focusing' | 'approaching' | 'arriving' | 'retreating'

const APPROACH_TRANSITIONS: Record<Approach, Approach[]> = {
  // 'focusing' -> 'idle' is the user changing their mind before the flight.
  idle: ['focusing', 'retreating'],
  focusing: ['approaching', 'idle'],
  approaching: ['arriving'],
  arriving: ['idle'],
  retreating: ['idle'],
}

/** Sections of the room's detail panel. */
export type PanelTab = 'overview' | 'games' | 'hardware' | 'history'

export type Playback =
  | 'browsing' // idle, room view
  | 'selected' // a game box is lifted and readable
  | 'inserting' // cart travelling to the slot
  | 'booting' // powered on, screen warming up
  | 'playing' // video running on the CRT
  | 'ejecting' // returning to browsing

/** Legal next states. Guards every transition so the timelines cannot desync. */
const TRANSITIONS: Record<Playback, Playback[]> = {
  browsing: ['selected'],
  selected: ['browsing', 'inserting'],
  inserting: ['booting', 'ejecting'],
  booting: ['playing', 'ejecting'],
  playing: ['ejecting'],
  ejecting: ['browsing'],
}

/**
 * Which panel tab a given camera mode belongs with, when the two are linked.
 *
 * Empty for now: Diorama.tsx no longer draws a game shelf or a placed
 * controller, so the 'library'/'controller' shots it used to link to would
 * move the camera to stare at empty space. The Games/Hardware PANEL tabs
 * are unaffected — they're plain text lists (the room's detail panel), never
 * 3D — this only cuts the camera-follow side of that link. `ViewMode`/
 * `PanelTab` keep every value either map could use; restoring an entry here
 * is the whole fix once the room set comes back.
 */
const TAB_FOR_MODE: Partial<Record<ViewMode, PanelTab>> = {}

const MODE_FOR_TAB: Partial<Record<PanelTab, ViewMode>> = {}

type SceneState = {
  consoleId: string
  /** null = base regional model; otherwise a variant id such as 'sfc'. */
  variantId: string | null
  mode: ViewMode
  panelTab: PanelTab
  /** Whether the opening pull-back has played for the current console. */
  introDone: boolean
  playback: Playback
  selectedGameRank: number | null
  /** Second console for compare mode. */
  compareId: string | null
  reducedMotion: boolean
  /** Set by the perf monitor; drops post-processing on weak devices. */
  quality: 'high' | 'low'
  /**
   * The room chrome layout, set from the 1100px viewport breakpoint in
   * App.tsx. Both the chrome components and the camera read the SAME
   * fractions via frame.ts, so one number drives both.
   */
  layout: Layout
  /**
   * The detail panel is expanded vs collapsed — toggled by the bottom-centre
   * chevron. Collapsing changes the panel's height, which changes
   * frameOffsetFor's result, which reframes the camera.
   */
  panelOpen: boolean
  /**
   * The frame offset currently applied to the camera. CameraRig owns the
   * tween; this mirror lets the post-processing focus band track the subject
   * as it lifts (see Scene.tsx). NO_OFFSET on the shelf and at both handoffs.
   */
  frameOffset: FrameOffset
  /** Bumped to ask CameraRig to snap the camera back to the resting shot. */
  reframeNonce: number

  /* ---- museum ---- */
  screen: Screen
  approach: Approach
  /** Which generation's bay the museum camera rests on. */
  focusGeneration: Generation
  /** Artifact under the pointer on the shelf, or null. */
  hoveredId: string | null
  /** Whether the museum's opening move has played this session. */
  museumIntroDone: boolean
  /**
   * Bumped by every `selectArtifact`/`retreatToShelf` call, including a
   * re-selection of the SAME console. CameraRig's approach choreography keys
   * its scheduling effect on this rather than on `approach` itself: `approach`
   * changes several more times over the course of the sequence (via this
   * effect's own timers calling `advanceApproach`), and a dependency that
   * fires on every one of those would have React tear down and reschedule
   * itself mid-flight. This changes exactly once per genuine new request.
   */
  approachNonce: number

  setConsole: (id: string) => void
  setVariant: (id: string | null) => void
  setMode: (mode: ViewMode) => void
  setPanelTab: (tab: PanelTab) => void
  setIntroDone: (v: boolean) => void
  setCompare: (id: string | null) => void
  selectGame: (rank: number | null) => void
  /** Returns false and does nothing if the transition is not legal. */
  transition: (next: Playback) => boolean
  setQuality: (q: 'high' | 'low') => void
  setReducedMotion: (v: boolean) => void
  setLayout: (layout: Layout) => void
  setPanelOpen: (v: boolean) => void
  setFrameOffset: (offset: FrameOffset) => void
  bumpReframe: () => void

  /** Pick an artifact off the shelf. Starts the approach; see `selectArtifact`. */
  selectArtifact: (id: string) => void
  /** Leave the room, back to the shelf. No-op outside `idle`. */
  retreatToShelf: () => void
  /** Returns false and does nothing if the transition is not legal. */
  advanceApproach: (next: Approach) => boolean
  setScreen: (s: Screen) => void
  setFocusGeneration: (g: Generation) => void
  setHovered: (id: string | null) => void
  setMuseumIntroDone: (v: boolean) => void
}

function initialScreen(): Screen {
  if (typeof window === 'undefined') return 'shelf'
  // ?screen=room is the escape hatch now — useful for room-only dev work
  // (or a future direct deep link) without the museum in front of it.
  return new URLSearchParams(window.location.search).get('screen') === 'room' ? 'room' : 'shelf'
}

export const useScene = create<SceneState>((set, get) => ({
  consoleId: CONSOLES[0].id,
  variantId: null,
  // The console is the subject of the atlas, so it is where the camera rests.
  mode: 'console',
  panelTab: 'overview',
  introDone: false,
  playback: 'browsing',
  selectedGameRank: null,
  compareId: null,
  reducedMotion: false,
  quality: 'high',
  layout: 'wide',
  panelOpen: true,
  frameOffset: { dx: 0, dy: 0 },
  reframeNonce: 0,

  // Stays 'room' until the museum is wired end to end; reachable before then
  // with ?screen=shelf so the shelf can be built and judged without disturbing
  // the existing app. Read here rather than in an effect so the museum never
  // flashes the room first. Same category of dev switch as Scene.tsx's ?fx.
  screen: initialScreen(),
  approach: 'idle',
  // The oldest bay: the museum reads downward through time from here.
  focusGeneration: CONSOLES.reduce<Generation>(
    (oldest, c) => (c.generation < oldest ? c.generation : oldest),
    CONSOLES[0].generation,
  ),
  hoveredId: null,
  museumIntroDone: false,
  approachNonce: 0,

  setConsole: (id) =>
    set({
      consoleId: id,
      variantId: null,
      mode: 'console',
      panelTab: 'overview',
      // Replay the opening move for the newly chosen console.
      introDone: false,
      playback: 'browsing',
      selectedGameRank: null,
    }),

  setVariant: (id) => set({ variantId: id }),

  /** The single entry point that moves the camera. */
  setMode: (mode) =>
    set((s) => ({
      mode,
      // Keep the panel showing whatever the camera is looking at.
      panelTab: TAB_FOR_MODE[mode] ?? s.panelTab,
    })),

  setPanelTab: (tab) =>
    set((s) => ({
      panelTab: tab,
      // Asking to see the games takes you to them.
      mode: MODE_FOR_TAB[tab] ?? s.mode,
      panelOpen: true,
    })),

  setIntroDone: (introDone) => set({ introDone }),
  setCompare: (id) => set({ compareId: id }),

  selectGame: (rank) =>
    set((s) => {
      if (rank === null) {
        return { selectedGameRank: null, playback: s.playback === 'selected' ? 'browsing' : s.playback }
      }
      // Picking a different game while one is lifted stays in 'selected'.
      return {
        selectedGameRank: rank,
        // Selecting a cartridge in 3D surfaces it in the panel, and vice versa —
        // the list and the shelf are two views of one selection.
        panelTab: 'games',
        panelOpen: true,
        playback: s.playback === 'browsing' || s.playback === 'selected' ? 'selected' : s.playback,
      }
    }),

  transition: (next) => {
    const current = get().playback
    if (current === next) return true
    if (!TRANSITIONS[current].includes(next)) {
      if (import.meta.env.DEV) {
        console.warn(`[scene] illegal playback transition: ${current} -> ${next}`)
      }
      return false
    }
    set({ playback: next, ...(next === 'browsing' ? { selectedGameRank: null } : {}) })
    return true
  },

  setQuality: (quality) => set({ quality }),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
  setLayout: (layout) => set({ layout }),
  setPanelOpen: (panelOpen) => set({ panelOpen }),
  setFrameOffset: (frameOffset) => set({ frameOffset }),
  bumpReframe: () => set((s) => ({ reframeNonce: s.reframeNonce + 1 })),

  /**
   * Taking an artifact off the shelf. A sibling of `setConsole`, deliberately
   * NOT a caller of it: `setConsole` sets `introDone: false` to replay the
   * room's opening pull-back, which would fight the approach for the camera
   * and undo the handoff. The approach IS this console's opening move, so it
   * marks the intro already done.
   */
  selectArtifact: (id) =>
    set((s) => ({
      consoleId: id,
      variantId: null,
      mode: 'console',
      panelTab: 'overview',
      introDone: true,
      playback: 'browsing',
      selectedGameRank: null,
      hoveredId: null,
      approach: 'focusing',
      approachNonce: s.approachNonce + 1,
    })),

  /**
   * Bypasses `advanceApproach`'s guard by design, exactly like `setConsole`
   * already bypasses `transition()` for playback: the UI is what enforces
   * "only from idle" (ShelfBay's click handler checks `approach === 'idle'`
   * before ever calling this), so the guard here is a second, defensive line
   * rather than the only one.
   */
  retreatToShelf: () => {
    if (get().approach !== 'idle') {
      if (import.meta.env.DEV) {
        console.warn(`[scene] retreatToShelf ignored — approach is ${get().approach}, not idle`)
      }
      return
    }
    set((s) => ({ approach: 'retreating', approachNonce: s.approachNonce + 1 }))
  },

  advanceApproach: (next) => {
    const current = get().approach
    if (current === next) return true
    if (!APPROACH_TRANSITIONS[current].includes(next)) {
      if (import.meta.env.DEV) {
        console.warn(`[scene] illegal approach transition: ${current} -> ${next}`)
      }
      return false
    }
    set({ approach: next })
    return true
  },

  setScreen: (screen) => set({ screen }),
  setFocusGeneration: (focusGeneration) => set({ focusGeneration }),
  setHovered: (hoveredId) => set({ hoveredId }),
  setMuseumIntroDone: (museumIntroDone) => set({ museumIntroDone }),
}))

/* ---------- derived selectors ---------- */

export function useActiveConsole(): ConsoleEntry {
  const id = useScene((s) => s.consoleId)
  return getConsole(id) ?? CONSOLES[0]
}

export function useActiveVariant(): RegionVariant | null {
  const entry = useActiveConsole()
  const variantId = useScene((s) => s.variantId)
  if (!variantId) return null
  return entry.variants.find((v) => v.id === variantId) ?? null
}

/**
 * The diorama actually rendered — base spec with the regional variant's
 * overrides applied. A variant swaps the room, not just the hardware.
 */
export function resolveDiorama(entry: ConsoleEntry, variant: RegionVariant | null): DioramaSpec {
  if (!variant?.dioramaOverrides) return entry.diorama
  return { ...entry.diorama, ...variant.dioramaOverrides }
}

export function useActiveDiorama(): DioramaSpec {
  const entry = useActiveConsole()
  const variant = useActiveVariant()
  return resolveDiorama(entry, variant)
}

export function useSelectedGame(): Game | null {
  const entry = useActiveConsole()
  const rank = useScene((s) => s.selectedGameRank)
  if (rank === null) return null
  return entry.games.find((g) => g.rank === rank) ?? null
}

/** The cartridge/case shape currently in play — regional variants differ. */
export function useActiveArchetypeId() {
  const entry = useActiveConsole()
  const variant = useActiveVariant()
  return variant?.mediaArchetype ?? entry.mediaArchetype
}

/**
 * Which scenes are mounted right now.
 *
 * The museum outlives `screen` for the whole approach so it can be lit down
 * rather than yanked, and so disposing eleven GLB subtrees never lands on the
 * frame the camera is moving. The room does NOT mount early: apart from the
 * console — which the hero layer owns throughout — a room is entirely
 * procedural boxes, so it costs nothing to build at the handoff and cannot
 * stall on the network.
 */
export function useSceneMounts(): { museum: boolean; room: boolean } {
  const screen = useScene((s) => s.screen)
  const approach = useScene((s) => s.approach)
  return {
    museum: screen === 'shelf' || approach !== 'idle',
    room: screen === 'room',
  }
}

export { TRANSITIONS, APPROACH_TRANSITIONS }
