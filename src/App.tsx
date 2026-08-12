import { useEffect } from 'react'
import { Scene } from '@/three/Scene'
import { ConsolePicker } from '@/components/ConsolePicker'
import { InfoPanel } from '@/components/InfoPanel'
import { ModeBar } from '@/components/ModeBar'
import { useActiveConsole, useScene } from '@/store/scene'

/**
 * Full-bleed 3D with floating panels.
 *
 * The diorama fills the window and the UI floats over it, rather than the
 * three-column layout of the reference. A miniature only reads as a miniature at
 * size, and the camera choreography is the product here — boxing the scene into
 * half the viewport would undercut both.
 *
 * The overlay layer is pointer-events-none; each panel opts back in. Otherwise
 * an invisible full-screen div would swallow every orbit drag.
 */
export default function App() {
  const entry = useActiveConsole()
  const setReducedMotion = useScene((s) => s.setReducedMotion)
  const setPickerOpen = useScene((s) => s.setPickerOpen)
  const setPanelOpen = useScene((s) => s.setPanelOpen)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setReducedMotion(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [setReducedMotion])

  /*
    Both panels flanking the scene needs room; below ~1100px they would cover
    the diorama entirely. Crossing the breakpoint sets both to the layout that
    fits — closing on the way down and reopening on the way up. An earlier
    version only ever closed them, so a window that was briefly narrow left the
    panels stuck shut with no way back except the edge tabs.
  */
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1100px)')
    const apply = () => {
      setPickerOpen(mq.matches)
      setPanelOpen(mq.matches)
    }
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [setPickerOpen, setPanelOpen])

  return (
    <div className="relative h-full w-full overflow-hidden">
      <Scene />

      <div className="pointer-events-none absolute inset-0">
        <header className="absolute left-8 top-8 max-w-sm">
          <p className="text-[11px] uppercase tracking-[0.25em] text-parchment/50">
            Generation {entry.generation} · {entry.manufacturer}
          </p>
          <h1 className="mt-2 font-display text-5xl leading-none text-parchment">
            {entry.shortName}
          </h1>
          <p className="mt-3 text-sm italic text-parchment/70">{entry.tagline}</p>
        </header>

        <ConsolePicker />
        <InfoPanel />
        <ModeBar />
      </div>
    </div>
  )
}
