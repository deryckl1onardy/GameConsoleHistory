import { useScene } from '@/store/scene'
import { PanIcon, RotateIcon, ZoomIcon } from '@/components/icons'
import { COPY } from './panel-copy'

/**
 * The viewport controls cluster, right edge. A gesture LEGEND, not a control:
 * three static rows telling the visitor how the camera behaves, because the
 * room is now orbitable in every direction (enablePan is on — see CameraRig).
 * Making the rows buttons would need press-and-hold camera nudging, duplicating
 * the mouse and violating CameraRig's single-owner rule.
 *
 * The one real control here is the small reset underneath, wired to the same
 * `reframeNonce` store field as canvas double-click — it snaps the camera
 * back to the resting console shot after the user has panned it somewhere.
 */
export function ViewportControls() {
  const layout = useScene((s) => s.layout)
  const bumpReframe = useScene((s) => s.bumpReframe)

  if (layout === 'compact') return null

  return (
    <div className="pointer-events-none absolute right-7 top-1/2 flex -translate-y-1/2 flex-col items-end gap-4">
      <ul className="space-y-3">
        {[
          { icon: RotateIcon, label: COPY.legendRotate },
          { icon: PanIcon, label: COPY.legendPan },
          { icon: ZoomIcon, label: COPY.legendZoom },
        ].map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-2.5 text-parchment/45">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-parchment/12 bg-ink/40">
              <Icon size={15} />
            </span>
            <span className="text-[11px] tracking-wide">{label}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={bumpReframe}
        className="pointer-events-auto rounded-full border border-parchment/12 bg-ink/50 px-3.5 py-1.5 text-[10px] uppercase tracking-[0.18em] text-parchment/55 transition hover:border-parchment/30 hover:text-parchment"
      >
        {COPY.resetView}
      </button>
    </div>
  )
}
