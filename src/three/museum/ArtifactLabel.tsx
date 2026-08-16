import { Html } from '@react-three/drei'
import { getConsole, releaseYear } from '@/data/consoles'
import { useScene } from '@/store/scene'
import type { ShelfArtifact, ShelfBay } from './shelf-layout'

/**
 * A museum label, one per artifact, mounted at the shelf's own front lip
 * rather than floating over the console it names.
 *
 * Two decisions worth recording:
 *
 * 1. **drei `<Html>`, not troika `<Text>`.** `Scene.tsx`'s TiltShift2 keeps
 *    only a ~20% horizontal screen-space band sharp — a 3D label positioned
 *    anywhere off that band would be blurred by design, which is most of the
 *    frame. `<Html>` renders as real DOM above the canvas, untouched by post.
 *    Troika also has no font wired up here and would fetch one from a CDN at
 *    runtime the first time it rendered.
 *
 * 2. **Every label is visible, all the time**, dimmed rather than hidden —
 *    this is a real museum convention, not a hover reveal. Content should
 *    never depend on a mouse being somewhere; a label a touch user can't
 *    hover must still be legible.
 */
export function ArtifactLabel({ artifact, bay }: { artifact: ShelfArtifact; bay: ShelfBay }) {
  const entry = getConsole(artifact.id)
  const hovered = useScene((s) => s.hoveredId === artifact.id)
  // Labels are shelf chrome: as the camera closes in they fade out with the
  // rest of the hall, and they stay hidden through the retreat remount (where
  // the museum is back but the camera is still in the room). They are DOM
  // (drei Html), so lights cannot dim them — this opacity must.
  const approach = useScene((s) => s.approach)
  if (!entry) return null

  return (
    <Html
      // The board's own front edge, centred under the artifact — not floating
      // over the model, where post-processing and the console's own geometry
      // would fight it for the eye.
      position={[artifact.position[0], bay.boardY, bay.boardDepth / 2]}
      center
      pointerEvents="none"
      occlude={false}
      // Ahead of the app's floating panels (z-40-ish via Tailwind stacking in
      // App.tsx) is unnecessary here — labels belong to the museum layer, not
      // the UI chrome, so a low range is deliberate.
      zIndexRange={[5, 0]}
    >
      <div
        className={[
          'flex -translate-y-full flex-col items-center pb-2 text-center transition-opacity duration-300',
          'motion-reduce:transition-none',
          approach === 'idle' ? (hovered ? 'opacity-100' : 'opacity-45') : 'opacity-0',
        ].join(' ')}
      >
        <div className="whitespace-nowrap font-display text-base text-parchment">
          {entry.shortName}
        </div>
        <div className="mt-0.5 whitespace-nowrap text-[9px] uppercase tracking-[0.2em] text-parchment/60">
          {entry.manufacturer} · {releaseYear(entry)}
        </div>
      </div>
    </Html>
  )
}
