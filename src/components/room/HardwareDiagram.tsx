import type { ConsoleEntry } from '@/types/console'
import { COPY } from './panel-copy'

/**
 * The hardware callouts' DOM companion — a plain list, standing beside the
 * LIVE version that actually does the pointing: small marked hotspots on
 * the console's own 3D model, drawn by HardwareAnnotations.tsx directly over
 * the rendered hardware, not here. This never draws a leader line or an
 * image of its own any more; a flat picture with its OWN leader-line
 * coordinates could drift out of sync with what the model actually looks
 * like the moment either one changed; anchoring straight into the model's
 * coordinate space instead removes that whole failure mode; see
 * `HardwareCallout` in types/console.ts.
 *
 * Kept anyway rather than dropped: the 3D hotspots need the model in view,
 * which is not every visitor's situation. The two views share their exact
 * label text, not a matching number — the ordinal here is a plain scan aid
 * (the same role a rank column plays in the games list), not a marker
 * printed on the model too; that would put a numbered badge on the console
 * itself, which is a heavier decoration than a bare dot and line earns.
 * Missing is never an error state — a console with no callouts authored yet
 * simply omits this section (the caller checks first).
 */
export function HardwareDiagram({ entry }: { entry: ConsoleEntry }) {
  const callouts = entry.hardwareDiagram?.callouts ?? []
  if (callouts.length === 0) return null

  return (
    <section>
      <h4 className="mb-2 text-[10px] uppercase tracking-[0.18em] text-amber/70">
        {COPY.diagramHeading}
      </h4>
      <ol className="space-y-1.5">
        {callouts.map((c, i) => (
          <li key={i} className="flex gap-3 text-[12px]">
            <span className="w-3.5 shrink-0 tabular-nums text-amber/60">{i + 1}</span>
            <span className="text-ink/75">{c.label}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}
