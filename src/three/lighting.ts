import { Color } from 'three'

/**
 * Colour temperature is the cheapest way to sell an era. A 1985 den under
 * tungsten (2700K) and a 2015 living room under LEDs (5000K) read as decades
 * apart before a single prop changes.
 *
 * Tanner Helland's approximation, clamped to 1000–40000K.
 */
export function kelvinToColor(kelvin: number): Color {
  const t = Math.min(40000, Math.max(1000, kelvin)) / 100

  let r: number
  let g: number
  let b: number

  if (t <= 66) {
    r = 255
    g = 99.4708025861 * Math.log(t) - 161.1195681661
  } else {
    r = 329.698727446 * Math.pow(t - 60, -0.1332047592)
    g = 288.1221695283 * Math.pow(t - 60, -0.0755148492)
  }

  if (t >= 66) {
    b = 255
  } else if (t <= 19) {
    b = 0
  } else {
    b = 138.5177312231 * Math.log(t - 10) - 305.0447927307
  }

  const clamp = (v: number) => Math.min(255, Math.max(0, v)) / 255
  return new Color(clamp(r), clamp(g), clamp(b)).convertSRGBToLinear()
}

/** Millimetres to scene metres. The scene is metric and 1:1 with reality. */
export const mm = (v: number) => v * 0.001

/** Convert a mm dimension triple to a metres triple for BoxGeometry args. */
export function boxArgsMm(d: {
  width: number
  height: number
  depth: number
}): [number, number, number] {
  return [mm(d.width), mm(d.height), mm(d.depth)]
}
