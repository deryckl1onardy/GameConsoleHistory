import { CanvasTexture, SRGBColorSpace, type Texture } from 'three'
import type { Game, MediaArchetype } from '@/types/console'
import type { ShellStyle } from '@/data/kits/media-shells'

/**
 * Placeholder cover art.
 *
 * Real box art is copyrighted; until `coverFor` (src/data/covers.ts) resolves
 * a real cover for a title, this is what prints on the box. It used to be a
 * random two-colour gradient hashed from the title — visually distinct, but
 * ten random gradients standing side by side is a generic-AI tell, not a
 * design. This draws an honest printed label instead: label stock, a title
 * set in the app's own Sentient face, publisher and year beneath. It reads as
 * a deliberate archival stand-in rather than fake art.
 *
 * Deliberately low resolution — these sit a few centimetres tall in the
 * diorama, and the real covers pulled from SteamGridDB will be modest
 * resolution too.
 */

const CACHE = new Map<string, Texture>()

/** Warm off-white label stock for cases, which have no shell recess colour. */
const CASE_STOCK = '#f4efe6'
const INK = '#181512'
const INK_MUTED = 'rgba(24,21,18,0.62)'
const RULE = 'rgba(24,21,18,0.16)'

let sentientReady: Promise<void> | null = null

/** Load the self-hosted display face once, so the first paint isn't a fallback. */
function ensureSentient(): Promise<void> {
  if (typeof document === 'undefined' || !('fonts' in document)) return Promise.resolve()
  if (!sentientReady) {
    sentientReady = Promise.all([
      document.fonts.load('600 40px Sentient'),
      document.fonts.load('500 20px Sentient'),
    ]).then(() => undefined)
  }
  return sentientReady
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
  shell: ShellStyle
  /** width / height of the printed area */
  aspect: number
}

function draw(ctx: CanvasRenderingContext2D, W: number, H: number, opts: CoverOptions) {
  const { game, archetype, shell } = opts
  const isCart = archetype.kind === 'cartridge'
  const stock = isCart ? (shell.recess ?? CASE_STOCK) : CASE_STOCK

  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = stock
  ctx.fillRect(0, 0, W, H)

  const pad = Math.round(W * 0.09)
  const innerW = W - pad * 2

  // A single hairline rule frames the label, the way a printed sticker or a
  // case's own die-line would — structure, not decoration.
  ctx.strokeStyle = RULE
  ctx.lineWidth = Math.max(1, W * 0.006)
  ctx.strokeRect(pad * 0.55, pad * 0.55, W - pad * 1.1, H - pad * 1.1)

  // Rank, top-left — small, tabular, the same voice the panel list uses.
  ctx.fillStyle = INK_MUTED
  ctx.font = `500 ${Math.round(W * 0.05)}px 'Sentient', ui-serif, Georgia, serif`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(`No. ${game.rank}`, pad, pad + W * 0.05)

  // Title, set large in the display face — the one piece of real hierarchy.
  const titleSize = Math.round(innerW * (isCart ? 0.145 : 0.115))
  ctx.font = `600 ${titleSize}px 'Sentient', ui-serif, Georgia, serif`
  ctx.fillStyle = INK
  const lines = wrap(ctx, game.title, innerW).slice(0, 3)
  const lineH = titleSize * 1.12
  const titleTop = H * 0.42
  lines.forEach((ln, i) => {
    ctx.fillText(ln, pad, titleTop + lineH * (i + 1))
  })

  // Publisher and year, bottom edge, quiet.
  const metaY = H - pad * 0.9
  ctx.font = `500 ${Math.round(W * 0.042)}px 'Sentient', ui-serif, Georgia, serif`
  ctx.fillStyle = INK_MUTED
  ctx.fillText(`${game.publisher} · ${game.year}`, pad, metaY)
}

export function placeholderCover(opts: CoverOptions): Texture {
  const { game, archetype, shell } = opts
  const key = `${archetype.id}:${shell.body}:${game.rank}:${game.title}`
  const cached = CACHE.get(key)
  if (cached) return cached

  const W = 512
  const H = Math.round(W / opts.aspect)
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  draw(ctx, W, H, opts)

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 4
  texture.needsUpdate = true

  CACHE.set(key, texture)

  // The very first label on the page loads before the font resolves and
  // falls back to the serif system font — redraw once Sentient is ready so
  // that one box doesn't stay in the fallback face forever.
  ensureSentient().then(() => {
    draw(ctx, W, H, opts)
    texture.needsUpdate = true
  })

  return texture
}

/** Test seam — placeholder textures are cached for the life of the page. */
export function clearCoverCache() {
  for (const t of CACHE.values()) t.dispose()
  CACHE.clear()
}
