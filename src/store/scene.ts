import { create } from 'zustand'
import type { ConsoleEntry, DioramaSpec, Game, RegionVariant } from '@/types/console'
import { CONSOLES, getConsole } from '@/data/consoles'
import type { FrameOffset, Layout } from '@/frame'

/**
 * One store, shared by the 2D shell and the 3D scene. The playback field is a
 * strict state machine — the insert/eject GSAP timelines key off it, so nothing
 * else is allowed to mutate it ad hoc.
 *
 * The app is a SINGLE screen now — the console detail room. The museum shelf
 * is gone, so `screen` and `approach` are constants rather than state: they
 * survive only so the few legacy "is a transition in flight" checks
 * (`approach !== 'idle'`) and the "which world are we in" branches read the
 * no-transition value without being deleted from every consumer. They can be
 * removed together with those checks when the room is fully self-contained.
 */

export type ViewMode =
  | 'console'
  | 'diorama'
  | 'library'
  | 'controller'
  | 'compare'
  | 'artifact'

/** The one world: the console's era room. Kept as a type so old checks compile. */
export type Screen = 'room'

/** The one value: idle, always. See the file header. */
export type Approach = 'idle'

/**
 * The two top-level sections beside the sidebar: the console's own room, and
 * its games. Games is not a tab of the console any more — it is a peer
 * section with its own panel content and camera behaviour (see SectionSwitch).
 */
export type Section = 'console' | 'games'

/** The console section's panel tabs. 'games' left to become a Section. */
export type ConsoleTab = 'overview' | 'hardware' | 'history'

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

type SceneState = {
  consoleId: string
  /** null = base regional model; otherwise a variant id such as 'sfc'. */
  variantId: string | null
  /** The top-level section: the console's room, or its games. */
  section: Section
  mode: ViewMode
  panelTab: ConsoleTab
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
   * Whether the sidebar's console list is open as a drawer. Only meaningful
   * in the compact layout, where the rail is hidden behind the hamburger
   * button; in the wide layout the sidebar is always visible and this is
   * ignored.
   */
  sidebarOpen: boolean
  /**
   * The frame offset currently applied to the camera. CameraRig owns the
   * tween; this mirror lets the post-processing focus band track the subject
   * as it lifts (see Scene.tsx).
   */
  frameOffset: FrameOffset
  /** Bumped to ask CameraRig to snap the camera back to the resting shot. */
  reframeNonce: number

  /* ---- constants, see the file header ---- */
  screen: Screen
  approach: Approach

  setConsole: (id: string) => void
  setVariant: (id: string | null) => void
  setSection: (section: Section) => void
  setMode: (mode: ViewMode) => void
  setPanelTab: (tab: ConsoleTab) => void
  setIntroDone: (v: boolean) => void
  setCompare: (id: string | null) => void
  selectGame: (rank: number | null) => void
  /** Returns false and does nothing if the transition is not legal. */
  transition: (next: Playback) => boolean
  setQuality: (q: 'high' | 'low') => void
  setReducedMotion: (v: boolean) => void
  setLayout: (layout: Layout) => void
  setPanelOpen: (v: boolean) => void
  setSidebarOpen: (v: boolean) => void
  setFrameOffset: (offset: FrameOffset) => void
  bumpReframe: () => void
}

export const useScene = create<SceneState>((set, get) => ({
  consoleId: CONSOLES[0].id,
  variantId: null,
  // The console is the subject of the atlas, so it is where the camera rests.
  section: 'console',
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
  sidebarOpen: false,
  frameOffset: { dx: 0, dy: 0 },
  reframeNonce: 0,

  // Constants — the app opens straight into the console detail room.
  screen: 'room',
  approach: 'idle',

  setConsole: (id) =>
    set({
      consoleId: id,
      variantId: null,
      section: 'console',
      mode: 'console',
      panelTab: 'overview',
      // The intro already played once; a switch glides quickly instead of
      // replaying the opening move (CameraRig's intro effect reads this).
      introDone: true,
      playback: 'browsing',
      selectedGameRank: null,
    }),

  setVariant: (id) => set({ variantId: id }),

  /**
   * The single entry point for the top-level section switch.
   *
   * The camera follows the section: console rests on the console shot, games
   * rests on the selected game's artifact. The games section auto-selects the
   * first game when nothing is picked, so entering Games never shows an
   * empty stage — the floating list is the navigation and the panel is the
   * artifact, so there is no "list view" to land on.
   */
  setSection: (section) =>
    set((s) => {
      if (section === 'console') {
        // The selected game no longer means anything here — drop it and the
        // lifted-box state with it.
        return { section, mode: 'console', panelOpen: true, selectedGameRank: null, playback: 'browsing' }
      }
      const first = getConsole(s.consoleId)?.games[0]?.rank ?? null
      const selectedGameRank = s.selectedGameRank ?? first
      return {
        section: 'games',
        panelOpen: true,
        selectedGameRank,
        mode: selectedGameRank !== null ? 'artifact' : 'library',
        playback:
          selectedGameRank !== null && (s.playback === 'browsing' || s.playback === 'selected')
            ? 'selected'
            : s.playback,
      }
    }),

  /** Kept for callers that drive the camera directly (compare mode). */
  setMode: (mode) => set({ mode }),

  setPanelTab: (tab) =>
    set(() => ({
      // All three console tabs face the console itself; none of them needs
      // to move the camera anywhere else. 'games' is no longer a tab — it is
      // a Section, switched by SectionSwitch, not by this map.
      panelTab: tab,
      section: 'console',
      mode: 'console',
      panelOpen: true,
    })),

  setIntroDone: (introDone) => set({ introDone }),
  setCompare: (id) => set({ compareId: id }),

  selectGame: (rank) =>
    set((s) => {
      if (rank === null) {
        // Back to the list (the artifact view's back button, or toggling a
        // row off). The section stays Games; the camera returns to the spread.
        return {
          selectedGameRank: null,
          section: 'games',
          mode: 'library',
          playback: s.playback === 'selected' ? 'browsing' : s.playback,
        }
      }
      // Picking a different game while one is lifted stays in 'selected'.
      return {
        selectedGameRank: rank,
        // Selecting a game surfaces it as an artifact: the section is Games,
        // the camera flies to that one cartridge. This sets `section` and
        // `mode` directly rather than routing through setSection, because
        // the two are deliberately different moves — a section switch rests
        // on the spread, a selection rests on the box. (Keeping them in sync
        // by hand is the known gotcha this store's header warns about.)
        section: 'games',
        panelOpen: true,
        mode: 'artifact',
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
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setFrameOffset: (frameOffset) => set({ frameOffset }),
  bumpReframe: () => set((s) => ({ reframeNonce: s.reframeNonce + 1 })),
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

export { TRANSITIONS }
