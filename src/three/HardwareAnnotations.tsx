import { Html, Line } from '@react-three/drei'
import type { ConsoleEntry } from '@/types/console'
import { useScene } from '@/store/scene'

/** Matches --color-amber in index.css — the room's one accent for "this is annotation, not content". */
const AMBER = '#d98c34'

function add(a: [number, number, number], b: [number, number, number]): [number, number, number] {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
}

/**
 * Hardware callouts, rendered as real hotspots ON the console itself rather
 * than leader lines drawn over a flat picture of it — see `HardwareCallout`'s
 * own doc comment in types/console.ts for why that distinction is the whole
 * point. Mounted as a sibling of the model inside HeroConsole's own group, so
 * `anchor`/`labelOffset` (both local metres, same convention as `Fact.anchor`)
 * land exactly where they're authored — the group's position/rotation carries
 * them the rest of the way, with no coordinate math of our own.
 *
 * Deliberately bare: a small dot, a thin dashed line, plain text with a drop
 * shadow for legibility over the model — no pill, no card, no background box
 * on the label. A rounded chip around every callout is exactly the kind of
 * decoration the rest of this app's chrome avoids; a real schematic doesn't
 * put its captions in badges either.
 *
 * Visible only on the room's Hardware tab, once the approach has finished —
 * hotspots mid-flight, or on the shelf where the console is the size of a
 * thumbnail, would be pointing at nothing anyone can read.
 */
export function HardwareAnnotations({ entry }: { entry: ConsoleEntry }) {
  const screen = useScene((s) => s.screen)
  const panelTab = useScene((s) => s.panelTab)
  const approach = useScene((s) => s.approach)

  const callouts = entry.hardwareDiagram?.callouts ?? []
  const visible =
    screen === 'room' && panelTab === 'hardware' && approach === 'idle' && callouts.length > 0

  if (!visible) return null

  return (
    <group>
      {callouts.map((c, i) => {
        const tip = add(c.anchor, c.labelOffset)
        return (
          <group key={i}>
            {/* The exact point on the shell — small enough to read as a mark, not an object. */}
            <mesh position={c.anchor}>
              <sphereGeometry args={[0.003, 12, 12]} />
              <meshBasicMaterial color={AMBER} toneMapped={false} />
            </mesh>
            <Line
              points={[c.anchor, tip]}
              color={AMBER}
              lineWidth={1.25}
              dashed
              dashSize={0.005}
              gapSize={0.004}
              transparent
              opacity={0.85}
              toneMapped={false}
            />
            <Html position={tip} center pointerEvents="none" occlude={false} zIndexRange={[5, 0]}>
              <div
                className="whitespace-nowrap text-[11px] font-medium text-parchment"
                style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.55)' }}
              >
                {c.label}
              </div>
            </Html>
          </group>
        )
      })}
    </group>
  )
}
