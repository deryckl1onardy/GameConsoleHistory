import { MUSEUM_LAYOUT } from '@/three/museum/layout'
import { useScene } from '@/store/scene'

/**
 * The 2D chrome for the museum screen — a header stating where you are, and a
 * generation rail for jumping bays without hunting for the right scroll
 * gesture. Deliberately spare: the concept's own instruction is that this
 * screen sells itself on the collection, not on UI.
 *
 * Mirrors the room's header/panel discipline in App.tsx: this whole layer sits
 * inside the app's `pointer-events-none` overlay div, so each interactive
 * piece opts back in individually rather than one invisible full-screen div
 * swallowing orbit drags.
 */
export function ShelfOverlay() {
  const focusGeneration = useScene((s) => s.focusGeneration)
  const setFocusGeneration = useScene((s) => s.setFocusGeneration)
  // Fade the shelf chrome out as the approach begins and in again after the
  // retreat lands: the header and generation rail are DOM, so lights cannot
  // dim them — and the rail popping out mid-flight would read as a UI jump
  // rather than the world changing.
  const approach = useScene((s) => s.approach)
  const show = approach === 'idle'

  return (
    <div
      className={[
        'transition-[opacity,visibility] duration-500',
        show ? 'opacity-100 visible' : 'opacity-0 invisible',
      ].join(' ')}
    >
      <header className="absolute left-8 top-8 max-w-sm">
        <p className="text-[11px] uppercase tracking-[0.25em] text-parchment/50">
          Console Chronicles
        </p>
        <h1 className="mt-2 font-display text-5xl leading-none text-parchment">
          Shelf of History
        </h1>
        <p className="mt-3 text-sm italic text-parchment/70">
          Every generation, on its own shelf.
        </p>
      </header>

      {/* Reads top-to-bottom in the same order the bays physically stack —
          oldest generation first, both here and on the wall. */}
      <nav className="pointer-events-auto absolute right-8 top-1/2 flex -translate-y-1/2 flex-col items-end gap-3">
        {MUSEUM_LAYOUT.bays.map((bay) => {
          const active = bay.generation === focusGeneration
          return (
            <button
              key={bay.generation}
              onClick={() => setFocusGeneration(bay.generation)}
              className={[
                'text-right transition',
                active ? 'text-parchment' : 'text-parchment/35 hover:text-parchment/65',
              ].join(' ')}
              title={bay.era ?? bay.label}
            >
              <div className="text-[10px] uppercase tracking-[0.22em]">{bay.label}</div>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
