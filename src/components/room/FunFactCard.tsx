import { useEffect, useRef, useState } from 'react'
import { ROOM_CHROME } from '@/frame'
import { useActiveConsole, useScene } from '@/store/scene'
import { COPY } from './panel-copy'

/**
 * The fun-fact card floating above the detail panel's right edge — the one
 * piece of chrome that is allowed to be playful. Rotates through the
 * console's facts so it stays alive without ever demanding attention.
 *
 * Rendered AFTER DetailPanel in RoomChrome on purpose: there is not a single
 * z-index class in this app, so DOM order is the z-order, and a card mounted
 * before the panel would vanish behind it.
 */
export function FunFactCard() {
  const entry = useActiveConsole()
  const layout = useScene((s) => s.layout)

  const facts = entry.facts
  const [index, setIndex] = useState(0)
  const [opacity, setOpacity] = useState(1)
  const fadeTimer = useRef<number | null>(null)

  useEffect(() => {
    if (facts.length < 2) return
    const t = window.setInterval(() => {
      setOpacity(0)
      fadeTimer.current = window.setTimeout(() => {
        setIndex((i) => (i + 1) % facts.length)
        setOpacity(1)
      }, 350)
    }, 8000)
    return () => {
      window.clearInterval(t)
      if (fadeTimer.current) window.clearTimeout(fadeTimer.current)
    }
  }, [facts.length])

  if (layout === 'compact' || facts.length === 0) return null

  const fact = facts[index % facts.length]

  return (
    <aside
      className="pointer-events-none absolute right-8 w-[300px]"
      style={{ bottom: `calc(${ROOM_CHROME.panelH * 100}vh + 1rem)` }}
      aria-label={COPY.funFact}
    >
      <p
        className="mb-1.5 text-[10px] uppercase tracking-[0.22em] text-amber/80 transition-opacity duration-300"
        style={{ opacity }}
      >
        {COPY.funFact}
      </p>
      <div
        className="rounded-xl border border-parchment/12 bg-ink/70 p-4 backdrop-blur-xl transition-opacity duration-300"
        style={{ opacity }}
      >
        <h4 className="font-display text-[15px] leading-snug text-parchment">{fact.title}</h4>
        <p className="mt-1.5 text-[12px] leading-relaxed text-parchment/65">{fact.body}</p>
      </div>
    </aside>
  )
}
