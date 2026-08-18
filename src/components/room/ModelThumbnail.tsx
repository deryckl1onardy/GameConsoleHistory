import { useEffect, useRef, useState } from 'react'
import type { ConsoleEntry } from '@/types/console'
import { renderThumbnail } from '@/three/thumbnails'

/**
 * One sidebar row's snippet — the console's own 3D model, rendered offscreen
 * into a cached image (see src/three/thumbnails.ts).
 *
 * Rendering is lazy per row: the shared offscreen renderer only fires when
 * the row scrolls near the viewport, so opening the app does not download
 * all ~21 GLBs at once — only the ones the user can actually see (plus a
 * small lookahead). While a thumbnail renders (or if the model fails), the
 * tile shows a quiet monogram so the row never looks broken.
 */
export function ModelThumbnail({ entry }: { entry: ConsoleEntry }) {
  const [src, setSrc] = useState<string | null>(null)
  const boxRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    let alive = true
    let observer: IntersectionObserver | null = null

    const kick = () => {
      renderThumbnail(entry).then((url) => {
        if (alive && url) setSrc(url)
      })
    }

    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            observer?.disconnect()
            kick()
          }
        },
        { rootMargin: '240px' },
      )
      observer.observe(el)
    } else {
      kick()
    }

    return () => {
      alive = false
      observer?.disconnect()
    }
  }, [entry])

  return (
    <span
      ref={boxRef}
      className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-ink/10 bg-parchment-dim/60"
    >
      {src ? (
        <img src={src} alt="" className="h-full w-full object-contain" draggable={false} />
      ) : (
        <span className="text-[9px] uppercase tracking-widest text-ink/35">
          {entry.shortName.slice(0, 2)}
        </span>
      )}
    </span>
  )
}
