import { useActiveConsole } from '@/store/scene'
import { COPY } from '../panel-copy'

/**
 * The story tab: facts, the famous failure modes, and the regional variants.
 * Facts and variants are prose; failure states are a small sub-section so the
 * "how they failed" beat reads as one arc rather than a list of footnotes.
 */
export function HistoryTab() {
  const entry = useActiveConsole()

  return (
    <div className="space-y-6">
      {entry.facts.map((f) => (
        <article key={f.id}>
          <h4 className="text-[13px] font-medium leading-snug text-ink">{f.title}</h4>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink/70">{f.body}</p>
        </article>
      ))}

      {entry.failureStates.length > 0 && (
        <section className="border-t border-ink/10 pt-5">
          <h4 className="mb-3 text-[10px] uppercase tracking-[0.18em] text-amber/70">
            {COPY.sectionFailure}
          </h4>
          {entry.failureStates.map((f) => (
            <article key={f.id} className="mb-4 last:mb-0">
              <h5 className="text-[13px] font-medium text-ink">{f.name}</h5>
              <p className="mt-1 text-[13px] leading-relaxed text-ink/70">{f.body}</p>
            </article>
          ))}
        </section>
      )}

      {entry.variants.length > 0 && (
        <section className="border-t border-ink/10 pt-5">
          <h4 className="mb-2 text-[10px] uppercase tracking-[0.18em] text-amber/70">
            {COPY.sectionVariants}
          </h4>
          {entry.variants.map((v) => (
            <div key={v.id} className="mb-4 last:mb-0">
              <h5 className="text-[13px] font-medium text-ink">{v.name}</h5>
              <p className="mt-1 text-[13px] leading-relaxed text-ink/70">{v.note}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
