import { MUSEUM_LAYOUT } from '@/three/museum/layout'
import { useScene } from '@/store/scene'

/**
 * The 2D chrome for the gallery — a header stating where you are, and a
 * generation rail for jumping stations without hunting for the right gesture.
 * Deliberately spare: the concept's own instruction is that this screen sells
 * itself on the collection, not on UI.
 *
 * Ink on white, because the hall is now a bright gallery. It was parchment on
 * near-black, which against white plaster rendered the entire header and rail
 * invisible — the text was still there, at 4% contrast.
 *
 * Mirrors the room's header/panel discipline in App.tsx: this whole layer sits
 * inside the app's `pointer-events-none` overlay div, so each interactive
 * piece opts back in individually rather than one invisible full-screen div
 * swallowing orbit drags.
 */

/** Gallery ink — a soft near-black that belongs to warm plaster, not pure #000. */
const INK = 'text-[#2b2724]'
const INK_SOFT = 'text-[#2b2724]/55'
const INK_FAINT = 'text-[#2b2724]/35'

export function ShelfOverlay() {
  const focusGeneration = useScene((s) => s.focusGeneration)
  const setFocusGeneration = useScene((s) => s.setFocusGeneration)
  // Fade the chrome out as the approach begins and in again after the retreat
  // lands: the header and generation rail are DOM, so lights cannot dim them —
  // and the rail popping out mid-flight would read as a UI jump rather than
  // the world changing.
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
        <p className={`text-[11px] uppercase tracking-[0.25em] ${INK_SOFT}`}>Console Chronicles</p>
        <h1 className={`mt-2 font-display text-5xl leading-none ${INK}`}>Shelf of History</h1>
        <p className={`mt-3 text-sm italic ${INK_SOFT}`}>Every generation, on its own shelf.</p>
      </header>

      {/* Reads top-to-bottom in the same order the stations recede down the
          hall — oldest first, both here and in the room. */}
      <nav className="pointer-events-auto absolute right-8 top-1/2 flex -translate-y-1/2 flex-col items-end gap-3">
        {MUSEUM_LAYOUT.bays.map((bay) => {
          const active = bay.generation === focusGeneration
          return (
            <button
              key={bay.generation}
              onClick={() => setFocusGeneration(bay.generation)}
              className={[
                'text-right transition',
                active ? INK : `${INK_FAINT} hover:text-[#2b2724]/70`,
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
