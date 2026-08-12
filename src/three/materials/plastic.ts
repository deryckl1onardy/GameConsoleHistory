import * as THREE from 'three'

/**
 * Procedural plastic surface — the detail pass that stops hero geometry
 * reading as flat colour, generated in code rather than authored as image
 * files (consistent with covers.ts's placeholder art: no asset pipeline is
 * available here).
 *
 * Two textures, both generated once and cached by cache key:
 *   - a normal map: fine grain plus a moulding seam, so specular highlights
 *     break up instead of gliding across a mathematically perfect surface
 *   - a roughness map: slight variation so the same seam reads in matte light
 *     too, not just under a highlight
 *
 * `yellowing` is not a separate texture — it is a tint and roughness lift
 * applied to the material directly, so the existing `yellowing` failure state
 * in the SNES data has somewhere to render: a toggle from 0 to 1 ages the
 * shell in place, no new geometry or texture swap required.
 */

const CACHE = new Map<string, { normalMap: THREE.Texture; roughnessMap: THREE.Texture }>()

export type PlasticOptions = {
  /** Cache key — one pair of maps per distinct finish, shared across instances. */
  id: string
  /** Seam line as a fraction of texture height, 0–1. Null for no seam (e.g. a small button). */
  seamAtV?: number | null
  /** How coarse the grain reads. Higher = more visible texture. */
  grainStrength?: number
}

function hash2(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123
  return s - Math.floor(s)
}

function makeCanvas(size: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  return { canvas, ctx }
}

function buildNormalMap(seamAtV: number | null | undefined, grainStrength: number): THREE.Texture {
  const size = 256
  const { canvas, ctx } = makeCanvas(size)
  const img = ctx.createImageData(size, size)

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4

      // Fine grain: cheap value noise, low amplitude — plastic moulding texture,
      // not a rough material.
      const n = hash2(x * 0.9, y * 0.9) - 0.5
      let nx = n * grainStrength
      let ny = (hash2(x * 0.9 + 71, y * 0.9 + 19) - 0.5) * grainStrength

      // The moulding seam: a shallow groove where the upper and lower shell
      // halves meet, the one line every injection-moulded console shell has.
      if (seamAtV != null) {
        const v = y / size
        const dist = Math.abs(v - seamAtV) * size
        if (dist < 1.4) {
          ny += (v < seamAtV ? -1 : 1) * 0.35
        }
      }

      // Encode as a tangent-space normal: mostly +Z (0.5,0.5,1 in map space).
      const nz = 1
      const len = Math.hypot(nx, ny, nz) || 1
      img.data[i] = ((nx / len) * 0.5 + 0.5) * 255
      img.data[i + 1] = ((ny / len) * 0.5 + 0.5) * 255
      img.data[i + 2] = ((nz / len) * 0.5 + 0.5) * 255
      img.data[i + 3] = 255
    }
  }

  ctx.putImageData(img, 0, 0)
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(4, 4)
  tex.needsUpdate = true
  return tex
}

function buildRoughnessMap(seamAtV: number | null | undefined): THREE.Texture {
  const size = 128
  const { canvas, ctx } = makeCanvas(size)
  const img = ctx.createImageData(size, size)

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4
      const base = 160 + (hash2(x * 0.5, y * 0.5) - 0.5) * 30

      let v = base
      if (seamAtV != null) {
        const dist = Math.abs(y / size - seamAtV) * size
        if (dist < 1.4) v = Math.min(255, v + 40) // the seam catches more light
      }

      img.data[i] = img.data[i + 1] = img.data[i + 2] = v
      img.data[i + 3] = 255
    }
  }

  ctx.putImageData(img, 0, 0)
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(4, 4)
  tex.needsUpdate = true
  return tex
}

function plasticMaps(opts: PlasticOptions) {
  const cached = CACHE.get(opts.id)
  if (cached) return cached
  const built = {
    normalMap: buildNormalMap(opts.seamAtV, opts.grainStrength ?? 0.6),
    roughnessMap: buildRoughnessMap(opts.seamAtV),
  }
  CACHE.set(opts.id, built)
  return built
}

/** Base plastic colour tinted toward the yellowed-bromine look, 0 = fresh, 1 = fully yellowed. */
function yellow(color: THREE.Color, amount: number): THREE.Color {
  if (amount <= 0) return color
  const yellowTint = new THREE.Color('#c9a227')
  return color.clone().lerp(yellowTint, amount * 0.55)
}

export type PlasticMaterialOptions = PlasticOptions & {
  color: string
  roughness?: number
  metalness?: number
  /** 0 = fresh, 1 = fully yellowed. Drives the `yellowing` failure state. */
  yellowing?: number
}

/**
 * A ready-to-use plastic MeshStandardMaterial with generated normal/roughness
 * maps. `yellowing` is a live parameter — callers can mutate the returned
 * material's `color` and `roughness` directly each time the toggle changes
 * without regenerating textures.
 */
export function plasticMaterial(opts: PlasticMaterialOptions): THREE.MeshStandardMaterial {
  const { normalMap, roughnessMap } = plasticMaps(opts)
  const baseColor = new THREE.Color(opts.color)
  const amount = opts.yellowing ?? 0

  return new THREE.MeshStandardMaterial({
    color: yellow(baseColor, amount),
    roughness: (opts.roughness ?? 0.55) + amount * 0.15,
    metalness: opts.metalness ?? 0,
    normalMap,
    roughnessMap,
    normalScale: new THREE.Vector2(0.4, 0.4),
  })
}

/** Applies (or re-applies) a yellowing amount to an existing plastic material in place. */
export function applyYellowing(
  material: THREE.MeshStandardMaterial,
  baseColorHex: string,
  amount: number,
): void {
  material.color.copy(yellow(new THREE.Color(baseColorHex), amount))
  material.roughness = Math.min(1, material.roughness + amount * 0.15)
  material.needsUpdate = true
}

export function clearPlasticCache(): void {
  for (const { normalMap, roughnessMap } of CACHE.values()) {
    normalMap.dispose()
    roughnessMap.dispose()
  }
  CACHE.clear()
}
