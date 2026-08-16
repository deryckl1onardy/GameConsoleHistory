import { useEffect, useMemo, useRef, useState } from 'react'
import { getConsole } from '@/data/consoles'
import { useScene } from '@/store/scene'
import { consoleOrder, yearOf } from '@/three/museum/hall-glide'
import { MUSEUM_LAYOUT } from '@/three/museum/layout'

/**
 * The `/` search: find a console by name and focus it. The third discovery
 * path the concept calls for — you know the machine, so type it rather than
 * walk the hall.
 *
 * Like every other control on the shelf, a search result FOCUSES the console
 * (camera to its station); Enter or a second click enters its room. Arrow
 * keys move the active result; Enter commits it; Escape closes.
 */

const MAX_RESULTS = 8

export function ConsoleSearch({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const setFocusedConsole = useScene((s) => s.setFocusedConsole)

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return consoleOrder(MUSEUM_LAYOUT)
      .map((a) => getConsole(a.id)!)
      .filter(
        (c) =>
          c.shortName.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.manufacturer.toLowerCase().includes(q),
      )
      .slice(0, MAX_RESULTS)
  }, [query])

  // Focus the box the moment the search opens.
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // A new query resets the active result, so Enter always commits what the
  // user is actually looking at.
  useEffect(() => {
    setActive(0)
  }, [query])

  const commit = (id: string) => {
    setFocusedConsole(id)
    onClose()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(i + 1, Math.max(0, matches.length - 1)))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const id = matches[active]?.id
      if (id) commit(id)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  return (
    <div className="pointer-events-auto absolute left-1/2 top-20 w-96 -translate-x-1/2">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={onClose}
        placeholder="Search consoles, manufacturers…"
        className="w-full rounded-none border-b border-[#2b2724]/30 bg-transparent px-1 pb-2 font-display text-xl text-[#2b2724] outline-none placeholder:italic placeholder:opacity-40"
      />
      {matches.length > 0 && (
        <ul className="mt-2 max-h-80 overflow-auto bg-white/90 shadow-sm backdrop-blur">
          {matches.map((c, i) => {
            const isActive = i === active
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onClick={() => commit(c.id)}
                  onPointerDown={(e) => e.preventDefault()}
                  className={[
                    'flex w-full items-baseline justify-between px-3 py-2 text-left',
                    isActive ? 'bg-[#2b2724] text-[#fbfbf9]' : 'text-[#2b2724]',
                  ].join(' ')}
                >
                  <span className="font-display text-base">{c.shortName}</span>
                  <span
                    className={[
                      'text-[10px] uppercase tracking-[0.2em]',
                      isActive ? 'opacity-70' : 'opacity-50',
                    ].join(' ')}
                  >
                    {c.manufacturer} · {yearOf(c)}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
      {query.trim() && matches.length === 0 && (
        <p className="mt-2 px-1 text-xs italic opacity-50">No consoles match “{query}”.</p>
      )}
    </div>
  )
}
