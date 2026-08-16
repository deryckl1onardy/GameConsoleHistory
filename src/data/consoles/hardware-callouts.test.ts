import { describe, expect, it } from 'vitest'
import { CONSOLES } from './index'

/**
 * `HardwareCallout` anchors are hand-derived numbers (see the comment above
 * the SNES's `hardwareDiagram` in snes.ts), not something a type checker can
 * validate — a typo here doesn't fail to compile, it just points a leader
 * line at empty air or buries a label inside the shell. These tests are the
 * actual correctness net.
 */

const consolesWithCallouts = CONSOLES.filter((c) => (c.hardwareDiagram?.callouts.length ?? 0) > 0)

describe('hardware callouts', () => {
  it('covers at least the proving case (SNES)', () => {
    expect(consolesWithCallouts.some((c) => c.id === 'snes')).toBe(true)
  })

  for (const entry of consolesWithCallouts) {
    describe(entry.id, () => {
      const callouts = entry.hardwareDiagram!.callouts
      // Half-extents in metres, from the console's own PUBLISHED dimensions —
      // the same box every other piece of geometry in the scene is measured
      // against. A flat mm-scale slack covers ordinary surface slop (the
      // bevel, a relief block's protrusion); it does NOT cover a console
      // that renders from a dropped-in GLB whose height/depth axes are
      // known to disagree with the published spec — see gltf-transforms.ts's
      // notes on exactly this (the SNES's own file reads 88mm tall and
      // 163mm deep against a real 68mm/254mm, because a bundled controller
      // and cord are fused into the same mesh and only the width axis was
      // calibrated). Anchors for a console in that state are measured
      // against its ACTUAL rendered geometry, not the spec, so the bound
      // here has to tolerate the same gap rather than fail a correct
      // anchor for disagreeing with a number the render itself disagrees
      // with. Proportional, not a fixed retry-until-it-passes number: it
      // scales with the console's own size and still catches a genuinely
      // wrong anchor (double the model, or on the wrong side entirely).
      const slackM = 0.01
      const proportionalSlack = (mm: number) => Math.max(slackM, (mm / 1000) * 0.35)
      const halfX = entry.dimensions.width / 2000 + slackM
      const halfZ = entry.dimensions.depth / 2000 + proportionalSlack(entry.dimensions.depth)
      const maxY = entry.dimensions.height / 1000 + proportionalSlack(entry.dimensions.height)

      it('gives every callout a non-empty, distinct label', () => {
        const labels = callouts.map((c) => c.label)
        expect(labels.every((l) => l.trim().length > 0)).toBe(true)
        expect(new Set(labels).size).toBe(labels.length)
      })

      it('keeps every anchor and label point finite', () => {
        for (const c of callouts) {
          for (const v of [...c.anchor, ...c.labelOffset]) {
            expect(Number.isFinite(v), `${entry.id}: "${c.label}" has a non-finite coordinate`).toBe(
              true,
            )
          }
        }
      })

      it('keeps every anchor inside (or right at the surface of) the shell', () => {
        for (const c of callouts) {
          const [x, y, z] = c.anchor
          expect(Math.abs(x), `${entry.id}: "${c.label}" anchor.x outside the shell`).toBeLessThanOrEqual(
            halfX,
          )
          expect(y, `${entry.id}: "${c.label}" anchor.y below the floor`).toBeGreaterThanOrEqual(
            -slackM,
          )
          expect(y, `${entry.id}: "${c.label}" anchor.y above the shell`).toBeLessThanOrEqual(maxY)
          expect(Math.abs(z), `${entry.id}: "${c.label}" anchor.z outside the shell`).toBeLessThanOrEqual(
            halfZ,
          )
        }
      })

      it('actually pulls every label away from its anchor', () => {
        // A zero offset means the pill renders exactly on top of the dot it
        // is naming — the one thing labelOffset exists to prevent.
        for (const c of callouts) {
          const dist = Math.hypot(...c.labelOffset)
          expect(dist, `${entry.id}: "${c.label}" labelOffset is ~zero`).toBeGreaterThan(0.005)
        }
      })
    })
  }
})
