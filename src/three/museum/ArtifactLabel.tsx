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
 * 2. **Never a hover reveal.** Within the station you are standing at, every
 *    label is visible at once, dimmed rather than hidden — a real museum
 *    convention. Content should never depend on a mouse being somewhere; a
 *    label a touch user cannot hover must still be legible.
 *
 * 3. **But only the station you are at.** `<Html>` renders at a constant
 *    SCREEN size regardless of depth, so from the hall's overview all
 *    twenty-two placards drew at full size across a scene 34m deep and
 *    collided into unreadable stacks — four generations' worth of names
 *    printed on top of each other. Distance-scaling them would only trade
 *    that for a row of illegibly tiny ones. A gallery placard is read when
 *    you walk up to the case, so that is when it is drawn; from the overview
 *    the collection is a shape, and the rail carries the dates.
 */
export function ArtifactLabel({ artifact, bay }: { artifact: ShelfArtifact; bay: ShelfBay }) {
  const entry = getConsole(artifact.id)
  const hovered = useScene((s) => s.hoveredId === artifact.id)
  // Labels are gallery chrome: as the camera closes in on a console they fade
  // out with the rest of the hall, and they stay hidden through the retreat
  // remount (where the museum is back but the camera is still in the room).
  // They are DOM (drei Html), so lights cannot dim them — this opacity must.
  const approach = useScene((s) => s.approach)
  const hallView = useScene((s) => s.hallView)
  const focusGeneration = useScene((s) => s.focusGeneration)

  if (!entry) return null
  // Only the station being stood at — see (3) above.
  if (hallView !== 'station' || artifact.generation !== focusGeneration) return null

  return (
    <Html
      // The plinth's own front edge, centred under the artifact — not floating
      // over the model, where the console's own geometry would fight it for
      // the eye.
      //
      // The Z is the STATION'S front edge, not a bare half-depth. That was the
      // same number back when every bay sat on the hall's centre line at
      // z = 0; now that stations recede down the hall it has to be measured
      // from the station the label belongs to, or every label in the gallery
      // stacks up at the entrance.
      position={[
        artifact.position[0],
        bay.boardY,
        bay.boardCenter[2] + bay.boardDepth / 2,
      ]}
      center
      pointerEvents="none"
      occlude={false}
      // Ahead of the app's floating panels (z-40-ish via Tailwind stacking in
      // App.tsx) is unnecessary here — labels belong to the museum layer, not
      // the UI chrome, so a low range is deliberate.
      zIndexRange={[5, 0]}
    >
      {/*
        Ink, not parchment. These read as engraved placard text on a white
        plinth now; in the old dark archive they were light-on-black, which
        against gallery plaster left every label in the hall invisible.

        Resting opacity is higher than it was, too. At 45% on near-black a
        label still read; the same 45% ink on white is a whisper, and a museum
        label you cannot read is not restraint.
      */}
      <div
        className={[
          'flex -translate-y-full flex-col items-center pb-2 text-center transition-opacity duration-300',
          'motion-reduce:transition-none',
          approach === 'idle' ? (hovered ? 'opacity-100' : 'opacity-70') : 'opacity-0',
        ].join(' ')}
        style={{ color: '#2b2724' }}
      >
        <div className="whitespace-nowrap font-display text-base">{entry.shortName}</div>
        <div className="mt-0.5 whitespace-nowrap text-[9px] uppercase tracking-[0.2em] opacity-60">
          {entry.manufacturer} · {releaseYear(entry)}
        </div>
      </div>
    </Html>
  )
}
