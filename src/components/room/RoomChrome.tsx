import { useEffect, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { APPROACH_TIMING } from '@/three/museum/approach'
import { useScene } from '@/store/scene'
import { BrandMark } from './BrandMark'
import { ConsoleTitle } from './ConsoleTitle'
import { DetailPanel } from './DetailPanel'
import { ViewportControls } from './ViewportControls'

/**
 * The room screen's 2D chrome, mounted over the 3D scene in App.tsx.
 *
 * The parent overlay is pointer-events-none; each piece opts back in. DOM
 * order is load-bearing (no z-index classes exist anywhere in the app).
 * ConsoleTitle and ViewportControls stay transparent to orbit drags — the
 * title covers a third of the screen and must pass input straight through
 * to the canvas.
 *
 * The fun fact used to float here as its own bordered card, disconnected
 * from the panel it sat above. It is now a genuine third column INSIDE
 * DetailPanel — see that file — so the room's whole bottom edge reads as
 * one composed object instead of two panels stacked on top of each other.
 */
export function RoomChrome() {
  const approach = useScene((s) => s.approach)
  const reducedMotion = useScene((s) => s.reducedMotion)
  const rootRef = useRef<HTMLDivElement>(null)

  /*
    Fade the chrome in over the arrival so it doesn't appear at full
    brightness the instant the world swaps — it settles with the room's
    lights, on the same clock. Read once at mount (the Diorama trick): a
    direct room load (?screen=room) had approach === 'idle' and wants the
    chrome there. LAYOUT effect: a plain effect would paint one frame of the
    full-brightness chrome behind the handoff before fading it.
  */
  useLayoutEffect(() => {
    const cameFromApproach = useScene.getState().approach !== 'idle'
    const el = rootRef.current
    if (!el || !cameFromApproach) return
    el.style.opacity = '0'
    const duration = useScene.getState().reducedMotion ? 0 : APPROACH_TIMING.ARRIVE_MS / 1000
    gsap.to(el, { opacity: 1, duration, ease: 'power2.out' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Retreat: the chrome goes dark with the room's lights, before the
  // teleport — a panel vanishing mid-fade would read as a glitch.
  useEffect(() => {
    if (approach !== 'retreating') return
    const el = rootRef.current
    if (!el) return
    const duration = reducedMotion ? 0 : APPROACH_TIMING.RETREAT_FADE_MS / 1000
    gsap.to(el, { opacity: 0, duration, ease: 'power2.in' })
  }, [approach, reducedMotion])

  return (
    <div ref={rootRef} className="pointer-events-none absolute inset-0">
      <BrandMark />
      <ConsoleTitle />
      <ViewportControls />
      <DetailPanel />
    </div>
  )
}
