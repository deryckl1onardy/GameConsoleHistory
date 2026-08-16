import { useEffect } from 'react'
import { useScene } from '@/store/scene'
import {
  consoleOrder,
  nextConsole,
  nextGeneration,
  prevConsole,
  prevGeneration,
} from '@/three/museum/hall-glide'
import { MUSEUM_LAYOUT } from '@/three/museum/layout'

/**
 * The shelf's keyboard map — the first keyboard the app has ever had, and the
 * reason the canvas does not need to be focusable (this listens on window).
 *
 *   ← / →        previous / next console (the two glide axes: lateral
 *                within a station, longitudinal between them)
 *   ↑ / ↓        previous / next generation
 *   Home / End   first / last console in the hall
 *   Enter        enter the focused console's room
 *   Esc          close search; otherwise back out to the whole hall
 *   /            open search
 *
 * Deliberately a FOCUS vocabulary: every key except Enter moves focus, and
 * focus is what the hall glides to (Phase 4) — Enter is the only \"commit to
 * the room\" key. Nothing here fires while the approach is in flight (the
 * transition owns the world then) or while typing in the search box.
 */
export function useShelfKeyboard(
  searchOpen: boolean,
  openSearch: () => void,
  closeSearch: () => void,
) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = useScene.getState()
      if (s.screen !== 'shelf' || s.approach !== 'idle') return
      const target = e.target as HTMLElement | null
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return

      if (e.key === '/') {
        e.preventDefault()
        openSearch()
        return
      }

      // While the search is open the box owns the keys — only Escape leaks
      // out here (the box's own handler already closed it; this is the
      // second line for when focus has left the input).
      if (searchOpen) {
        if (e.key === 'Escape') {
          e.preventDefault()
          closeSearch()
        }
        return
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          s.setFocusedConsole(prevConsole(MUSEUM_LAYOUT, s.focusedId))
          break
        case 'ArrowRight':
          e.preventDefault()
          s.setFocusedConsole(nextConsole(MUSEUM_LAYOUT, s.focusedId))
          break
        case 'ArrowUp':
          e.preventDefault()
          s.setFocusGeneration(prevGeneration(MUSEUM_LAYOUT, s.focusGeneration))
          break
        case 'ArrowDown':
          e.preventDefault()
          s.setFocusGeneration(nextGeneration(MUSEUM_LAYOUT, s.focusGeneration))
          break
        case 'Home':
          e.preventDefault()
          s.setFocusedConsole(consoleOrder(MUSEUM_LAYOUT)[0].id)
          break
        case 'End':
          e.preventDefault()
          s.setFocusedConsole(consoleOrder(MUSEUM_LAYOUT)[consoleOrder(MUSEUM_LAYOUT).length - 1].id)
          break
        case 'Enter':
          e.preventDefault()
          s.selectArtifact(s.focusedId)
          break
        case 'Escape':
          e.preventDefault()
          s.showHallOverview()
          break
        default:
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [searchOpen, openSearch, closeSearch])
}
