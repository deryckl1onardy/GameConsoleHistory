import { CanvasTexture, SRGBColorSpace, type Texture } from 'three'
import type { Game, MediaArchetype } from '@/types/console'

/**
 * Placeholder cover art.
 *
 * Real box art is copyrighted and deliberately not shipped yet (see the legal
 * posture). Until it is, covers are generated procedurally so the shelf is
 * populated, each game is visually distinct, and layout/lighting can be judged
 * for real. Swapping in real art later is a one-line change: set `game.cover`.
 *
 * Deliberately low resolution — these sit ~5cm tall in the diorama, and the
 * real ones will be low-res too.
 */

const CACHE = new Map<string, Texture>()

/** Stable 32-bit hash so a given title always gets the same palette. */
function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

/** Greedy wrap that also hard-breaks words longer than the line. */
function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ''

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word
    if (ctx.measureText(candidate).width <= maxWidth || !line) {
      line = candidate
    } else {
      lines.push(line)
      line = word
    }
  }
  if (line) lines.push(line)
  return lines
}

export type CoverOptions = {
  game: Game
  archetype: MediaArchetype
  /** width / height of the printed area */
  aspect: number
}

export function placeholderCover({ game, archetype, aspect }: CoverOptions): Texture {
  const key = `${archetype.id}:${game.rank}:${game.title}`
  const cached = CACHE.get(key)
  if (cached) return cached

  const W = 512
  const H = Math.round(W / aspect)
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  const h = hash(game.title)
  const hue = h % 360
  const hue2 = (hue + 35 + (h % 40)) % 360
  const isCart = archetype.kind === 'cartridge'

  // Cartridge labels are stickers with a printed border; cases print to the edge.
  const pad = isCart ? Math.round(W * 0.035) : 0
  if (isCart) {
    ctx.fillStyle = '#e8e4da'
    ctx.fillRect(0, 0, W, H)
  }

  const ix = pad
  const iy = pad
  const iw = W - pad * 2
  const ih = H - pad * 2

  const grad = ctx.createLinearGradient(ix, iy, ix + iw, iy + ih)
  grad.addColorStop(0, `hsl(${hue} 62% 42%)`)
  grad.addColorStop(1, `hsl(${hue2} 58% 24%)`)
  ctx.fillStyle = grad
  ctx.fillRect(ix, iy, iw, ih)

  // A soft diagonal sheen so the art is not a flat field.
  const sheen = ctx.createLinearGradient(ix, iy + ih, ix + iw, iy)
  sheen.addColorStop(0, 'rgba(255,255,255,0)')
  sheen.addColorStop(0.55, 'rgba(255,255,255,0.13)')
  sheen.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = sheen
  ctx.fillRect(ix, iy, iw, ih)

  // Rank badge, top-left.
  const badge = Math.round(iw * 0.13)
  ctx.fillStyle = 'rgba(0,0,0,0.42)'
  roundRect(ctx, ix + iw * 0.05, iy + ih * 0.05, badge, badge, badge * 0.22)
  ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.font = `700 ${Math.round(badge * 0.58)}px ui-sans-serif, system-ui, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(String(game.rank), ix + iw * 0.05 + badge / 2, iy + ih * 0.05 + badge / 2)

  // Title block across the lower third.
  const titleSize = Math.round(iw * (isCart ? 0.085 : 0.105))
  ctx.font = `700 ${titleSize}px ui-sans-serif, system-ui, sans-serif`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'

  const maxTextW = iw * 0.86
  const lines = wrap(ctx, game.title.toUpperCase(), maxTextW).slice(0, 4)
  const lineH = titleSize * 1.16
  const blockH = lines.length * lineH
  const blockTop = iy + ih - blockH - ih * 0.12

  const scrim = ctx.createLinearGradient(0, blockTop - lineH, 0, iy + ih)
  scrim.addColorStop(0, 'rgba(0,0,0,0)')
  scrim.addColorStop(1, 'rgba(0,0,0,0.62)')
  ctx.fillStyle = scrim
  ctx.fillRect(ix, blockTop - lineH, iw, iy + ih - blockTop + lineH)

  ctx.fillStyle = '#ffffff'
  lines.forEach((ln, i) => {
    ctx.fillText(ln, ix + iw * 0.07, blockTop + lineH * (i + 0.82))
  })

  // Publisher, bottom edge.
  ctx.font = `500 ${Math.round(iw * 0.045)}px ui-sans-serif, system-ui, sans-serif`
  ctx.fillStyle = 'rgba(255,255,255,0.72)'
  ctx.fillText(game.publisher.toUpperCase(), ix + iw * 0.07, iy + ih - ih * 0.045)

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 4
  texture.needsUpdate = true

  CACHE.set(key, texture)
  return texture
}

/** Test seam — placeholder textures are cached for the life of the page. */
export function clearCoverCache() {
  for (const t of CACHE.values()) t.dispose()
  CACHE.clear()
}
