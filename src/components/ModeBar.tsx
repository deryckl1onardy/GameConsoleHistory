import type { ViewMode } from '@/store/scene'
import { useScene } from '@/store/scene'

/**
 * Camera shot selector. Setting `mode` is the only way anything moves the
 * camera, so this bar and the panel tabs stay in agreement by construction.
 */

const MODES: { id: ViewMode; label: string; hint: string }[] = [
  { id: 'console', label: 'Console', hint: 'The hardware itself' },
  { id: 'diorama', label: 'Room', hint: 'The whole diorama' },
  { id: 'library', label: 'Games', hint: 'The top ten, on the shelf' },
  { id: 'controller', label: 'Controller', hint: 'The pad, up close' },
]

export function ModeBar() {
  const mode = useScene((s) => s.mode)
  const setMode = useScene((s) => s.setMode)

  return (
    <nav
      className="pointer-events-auto absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-1 rounded-full border border-parchment/12 bg-ink/75 p-1 backdrop-blur-xl"
      aria-label="Camera view"
    >
      {MODES.map((m) => (
        <button
          key={m.id}
          onClick={() => setMode(m.id)}
          aria-current={mode === m.id ? 'true' : undefined}
          title={m.hint}
          className={[
            'rounded-full px-4 py-2 text-[12px] transition',
            mode === m.id
              ? 'bg-parchment text-ink'
              : 'text-parchment/60 hover:bg-parchment/10 hover:text-parchment',
          ].join(' ')}
        >
          {m.label}
        </button>
      ))}
    </nav>
  )
}
