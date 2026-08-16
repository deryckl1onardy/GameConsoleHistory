import { useState } from 'react'
import type { ConsoleEntry } from '@/types/console'
import { COPY } from './panel-copy'

/**
 * The annotated hardware diagram slot.
 *
 * The ART is a file dropped in at public/diagrams/consoles/<id>.svg|.png —
 * exactly like the public/models/ GLB convention, the app builds the slot,
 * not the art. Callout coordinates live in the data as FRACTIONS of the
 * image box (HardwareCallout), so regenerating the art silently misplaces
 * every leader line — the diagram README says so for the same reason the
 * models README states its scale caveat.
 *
 * Fallback rungs, mirroring the GLB posture that a missing file is never an
 * error state:
 *   1. art + callouts   the full diagram
 *   2. art alone        art exists, no callouts authored
 *   3. callouts only    art 404s (or Vite's SPA fallback serves HTML, which
 *                       fails to decode as an image) — leaders become a
 *                       plain definition list
 *   4. neither          no hardwareDiagram at all — the Hardware tab simply
 *                       has no diagram section (the caller omits us)
 *
 * No HEAD probe, deliberately: <img onError> is a first-class non-throwing
 * signal and also catches the SPA fallback for free, where the 90 lines of
 * content-type sniffing GltfModel.tsx needs for useGLTF would be required.
 */
export function HardwareDiagram({ entry }: { entry: ConsoleEntry }) {
  const diagram = entry.hardwareDiagram
  const [artFailed, setArtFailed] = useState(false)
  if (!diagram) return null

  const callouts = diagram.callouts
  const showArt = !artFailed

  // Rung 3: the art is gone but the callouts are the content — keep them as
  // a labelled list rather than silently dropping the knowledge.
  if (!showArt && callouts.length > 0) {
    return (
      <section>
        <h4 className="mb-2 text-[10px] uppercase tracking-[0.18em] text-amber/70">
          {COPY.diagramFallbackHeading}
        </h4>
        <dl className="space-y-1.5">
          {callouts.map((c, i) => (
            <div key={i} className="flex gap-3 text-[12px]">
              <dt className="w-3 shrink-0 text-phosphor/80">·</dt>
              <dd className="text-parchment/75">{c.label}</dd>
            </div>
          ))}
        </dl>
      </section>
    )
  }

  if (!showArt) {
    // Rung 4: diagram declared but neither art nor callouts survive.
    return (
      <section>
        <h4 className="mb-2 text-[10px] uppercase tracking-[0.18em] text-amber/70">
          {COPY.sectionNumbers}
        </h4>
        <ul className="space-y-2">
          {entry.relatableSpecs.slice(0, 2).map((s) => (
            <li key={s.label} className="text-[12px] text-parchment/70">
              <span className="text-parchment/50">{s.label}</span> — {s.comparison}
            </li>
          ))}
        </ul>
      </section>
    )
  }

  return (
    <section>
      <h4 className="mb-2 text-[10px] uppercase tracking-[0.18em] text-amber/70">
        {COPY.diagramHeading}
      </h4>
      <div className="relative overflow-hidden rounded-xl border border-parchment/10 bg-ink-soft/40">
        <img
          src={diagram.image}
          alt={`${entry.shortName} annotated hardware diagram`}
          onError={() => setArtFailed(true)}
          className="block w-full"
        />
        {/* Leader lines only. Dots and labels are DOM, not SVG — a <circle>
            under the preserveAspectRatio="none" stretch becomes an ellipse,
            and non-scaling-stroke text is a non-thing. */}
        {callouts.length > 0 && (
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden
          >
            {callouts.map((c, i) => (
              <path
                key={i}
                d={`M ${c.x} ${c.y} L ${c.side === 'left' ? 0 : 100} ${c.y}`}
                vectorEffect="non-scaling-stroke"
                className="stroke-phosphor/70"
                strokeWidth={1}
              />
            ))}
          </svg>
        )}
        {callouts.map((c, i) => (
          <div
            key={i}
            className="pointer-events-none absolute"
            style={{
              left: `${c.x}%`,
              top: `${c.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <span className="block h-1.5 w-1.5 rounded-full bg-phosphor" />
          </div>
        ))}
        {callouts.map((c, i) => (
          <span
            key={`label-${i}`}
            className="pointer-events-none absolute -translate-y-1/2 text-[10px] leading-none text-phosphor/90"
            style={{
              left: c.side === 'left' ? 8 : undefined,
              right: c.side === 'right' ? 8 : undefined,
              top: `${c.y}%`,
            }}
          >
            {c.label}
          </span>
        ))}
      </div>
    </section>
  )
}
