import { useEffect } from 'react'
import { Scene } from '@/three/Scene'
import { RoomChrome } from '@/components/room/RoomChrome'
import { ConsoleSidebar } from '@/components/room/ConsoleSidebar'
import { useScene } from '@/store/scene'

/**
 * Full-bleed 3D with floating panels, beside a persistent left rail.
 *
 * The layout is a real flex split, not an overlay: the sidebar is a static
 * sibling of the 3D canvas, so the diorama simply starts where the rail
 * ends and the two can never overlap. Inside the 3D area the diorama fills
 * the space and the UI floats over it — a miniature only reads as a
 * miniature at size, and the camera choreography is the product here, so
 * the room keeps the full remaining viewport.
 *
 * The overlay layer inside the 3D area is pointer-events-none; each panel
 * opts back in. Otherwise an invisible full-screen div would swallow every
 * orbit drag.
 *
 * Double-click anywhere over the scene resets the camera (bumpReframe) — the
 * pan escape hatch, since pan is unbounded in the room and the legend's reset
 * button is the other way home.
 */
export default function App() {
  const setReducedMotion = useScene((s) => s.setReducedMotion)
  const setLayout = useScene((s) => s.setLayout)
  const bumpReframe = useScene((s) => s.bumpReframe)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setReducedMotion(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [setReducedMotion])

  /*
    The room chrome has two layouts — wide (side title column, split panel)
    and compact (title inline, single-column panel). Crossing the 1100px
    breakpoint swaps the layout, and because the chrome and the camera both
    read the SAME fractions from frame.ts, the camera reframes with it for
    free. An earlier version toggled two side rails open/closed and crossing
    the breakpoint could leave them stuck shut; the layout is a plain value,
    so there is no state machine to get stuck.
  */
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1100px)')
    const apply = () => setLayout(mq.matches ? 'wide' : 'compact')
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [setLayout])

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* The navigation rail — real layout, see ConsoleSidebar.tsx. */}
      <ConsoleSidebar />

      {/* The 3D room, with its floating chrome overlaid. */}
      <div
        className="relative min-w-0 flex-1 overflow-hidden"
        onDoubleClick={(e) => {
          // Only the canvas itself — the overlay layers are pointer-events-none
          // so a click on empty space lands here, while a double-click inside a
          // panel (e.target inside it) must NOT yank the camera.
          if ((e.target as HTMLElement).tagName === 'CANVAS') {
            bumpReframe()
          }
        }}
      >
        <Scene />
        <div className="pointer-events-none absolute inset-0">
          <RoomChrome />
        </div>
      </div>
    </div>
  )
}
