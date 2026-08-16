import { useEffect, useRef, useState } from 'react'
import { useActiveConsole } from '@/store/scene'
import { COPY } from './panel-copy'

/**
 * The fun fact — one console fact at a time, rotating so it stays alive
 * without ever demanding attention.
 *
 * This used to be its own floating card: absolutely positioned above the
 * panel, with its own border, background, blur and rounded corners — a
 * second bordered box duplicating the panel's own chrome one level up,
 * which is exactly why it read as disconnected rather than as part of one
 * composition. It is now plain content, laid out as the detail panel's
 * third column (see DetailPanel.tsx) — no position, no card shell, no
 * height imposed. Whether and where it renders is entirely the panel's
 * decision; this component only knows how to show a fact.
 */
export function FunFactCard() {
  const entry = useActiveConsole()

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

  if (facts.length === 0) return null

  const fact = facts[index % facts.length]

  return (
    <div aria-label={COPY.funFact}>
      <p
        className="text-[10px] uppercase tracking-[0.22em] text-amber/80 transition-opacity duration-300"
        style={{ opacity }}
      >
        {COPY.funFact}
      </p>
      <div className="mt-2 transition-opacity duration-300" style={{ opacity }}>
        <h4 className="font-display text-lg leading-snug text-parchment">{fact.title}</h4>
        <p className="mt-2 text-[13px] leading-relaxed text-parchment/70">{fact.body}</p>
      </div>
    </div>
  )
}
