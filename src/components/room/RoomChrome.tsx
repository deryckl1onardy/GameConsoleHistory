import { ConsoleNav } from './ConsoleNav'
import { SectionSwitch } from './SectionSwitch'
import { GameList } from './GameList'
import { DetailPanel } from './DetailPanel'
import { ViewportControls } from './ViewportControls'

/**
 * The room screen's 2D chrome, mounted over the 3D scene in App.tsx.
 *
 * The parent overlay is pointer-events-none; each piece opts back in. DOM
 * order is load-bearing (no z-index classes exist anywhere in the app).
 * ViewportControls stays transparent to orbit drags — the legend sits over
 * the scene and must pass input straight through to the canvas.
 *
 * The big left title column used to live here; the sidebar (ConsoleSidebar,
 * a real layout sibling of the canvas) now carries identity and navigation,
 * so the chrome is just the top bar, the bottom panel and the viewport
 * legend.
 *
 * The fun fact used to float here as its own bordered card, disconnected
 * from the panel it sat above. It is now a genuine third column INSIDE
 * DetailPanel — see that file — so the room's whole bottom edge reads as
 * one composed object instead of two panels stacked on top of each other.
 */
export function RoomChrome() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <ConsoleNav />
      {/* After ConsoleNav on purpose — DOM order is the stacking order, and
          the switcher row sits directly under the header's 56px strip. */}
      <SectionSwitch />
      {/* The games section's floating list — hung beside the sidebar at the
          viewport's left edge, and only present while the section is Games.
          Mounted after SectionSwitch so it stacks under the header strip. */}
      <GameList />
      <ViewportControls />
      <DetailPanel />
    </div>
  )
}
