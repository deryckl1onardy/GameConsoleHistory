import { create } from 'zustand'
import type { ConsoleEntry, DioramaSpec, Game, RegionVariant } from '@/types/console'
import { CONSOLES, getConsole } from '@/data/consoles'

/**
 * One store, shared by the 2D shell and the 3D scene. The playback field is a
 * strict state machine — the insert/eject GSAP timelines key off it, so nothing
 * else is allowed to mutate it ad hoc.
 */

export type ViewMode = 'console' | 'diorama' | 'library' | 'controller' | 'compare'

/** Sections of the floating info panel. */
export type PanelTab = 'overview' | 'games' | 'controller' | 'facts'

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

/** Which panel tab a given camera mode belongs with, when the two are linked. */
const TAB_FOR_MODE: Partial<Record<ViewMode, PanelTab>> = {
  library: 'games',
  controller: 'controller',
}

const MODE_FOR_TAB: Partial<Record<PanelTab, ViewMode>> = {
  games: 'library',
  controller: 'controller',
}

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
  /** Panels collapse on small viewports and when the user wants a clean view. */
  panelOpen: boolean
  pickerOpen: boolean

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
  setPanelOpen: (v: boolean) => void
  setPickerOpen: (v: boolean) => void
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
  panelOpen: true,
  pickerOpen: false,

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
      pickerOpen: false,
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
  setPanelOpen: (panelOpen) => set({ panelOpen }),
  setPickerOpen: (pickerOpen) => set({ pickerOpen }),
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
