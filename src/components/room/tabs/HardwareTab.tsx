import { useActiveConsole } from '@/store/scene'
import { HardwareDiagram } from '../HardwareDiagram'
import { COPY } from '../panel-copy'

/**
 * The annotated hardware diagram, then the raw specs, then the controller —
 * the order matters: the diagram answers "what am I looking at", the table
 * answers "what is inside it", and the controller is the part of the
 * hardware the visitor actually touched.
 */
export function HardwareTab() {
  const entry = useActiveConsole()
  const pad = entry.controllers[0]

  return (
    <div className="space-y-6">
      <HardwareDiagram entry={entry} />

      <section>
        <h4 className="mb-2 text-[10px] uppercase tracking-[0.18em] text-amber/70">
          {COPY.sectionSpecs}
        </h4>
        <dl className="space-y-1.5">
          {Object.entries({
            CPU: `${entry.specs.cpu} @ ${entry.specs.cpuClockMhz} MHz`,
            Memory: entry.specs.ram,
            Resolution: entry.specs.resolution,
            Colours: entry.specs.colors,
            Audio: entry.specs.audio,
            Media: entry.specs.media,
          }).map(([k, v]) => (
            <div key={k} className="flex gap-3 text-[12px]">
              <dt className="w-20 shrink-0 text-parchment/40">{k}</dt>
              <dd className="text-parchment/80">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      {pad && (
        <section>
          <h4 className="mb-2 text-[10px] uppercase tracking-[0.18em] text-amber/70">
            {COPY.sectionController}
          </h4>
          <p className="text-sm text-parchment">{pad.name}</p>
          <p className="mt-0.5 text-[11px] tabular-nums text-parchment/40">
            {pad.dimensions.width} × {pad.dimensions.height} × {pad.dimensions.depth} mm
          </p>

          <h5 className="mb-1.5 mt-4 text-[10px] uppercase tracking-[0.18em] text-amber/70">
            {COPY.sectionInnovations}
          </h5>
          <ul className="space-y-2">
            {pad.innovations.map((i) => (
              <li key={i} className="text-[13px] leading-snug text-parchment/75">
                {i}
              </li>
            ))}
          </ul>

          <h5 className="mb-1.5 mt-4 text-[10px] uppercase tracking-[0.18em] text-amber/70">
            {COPY.sectionButtons}
          </h5>
          <ul className="space-y-1">
            {pad.buttons
              .filter((b) => !b.id.startsWith('dpad-') || b.id === 'dpad-up')
              .map((b) => (
                <li key={b.id} className="flex gap-3 text-[12px]">
                  <span className="w-16 shrink-0 text-parchment/80">
                    {b.id.startsWith('dpad') ? 'D-pad' : b.label}
                  </span>
                  <span className="text-parchment/50">{b.note ?? '—'}</span>
                </li>
              ))}
          </ul>
        </section>
      )}
    </div>
  )
}
