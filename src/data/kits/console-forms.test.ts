import { describe, expect, it } from 'vitest'
import { CONSOLE_FORMS, consoleForm } from './console-forms'
import { CONTROLLER_FORMS, controllerForm } from './controller-forms'
import { CONSOLES } from '@/data/consoles'
import { sweepProfileAlongX, sweepPlanVertically } from '@/three/geometry/profiles'

/**
 * These are the tests the plan's Phase 4b verification asks for: dimensional
 * accuracy must survive the move from a bespoke component to a form spec, and
 * every animated part must still resolve by name — the whole point of the
 * kit is that neither the insert sequence nor the GLB swap seam can tell the
 * difference.
 */

describe('SNES console form', () => {
  const entry = CONSOLES.find((c) => c.id === 'snes')!
  const form = consoleForm('snes')!

  it('exists and is a swept shell', () => {
    expect(form).toBeDefined()
    expect(form.shell.kind).toBe('swept')
  })

  it('produces a shell whose bounding box matches the published dimensions', () => {
    if (form.shell.kind !== 'swept') throw new Error('expected swept shell')
    const geom = sweepProfileAlongX(form.shell.profile, entry.dimensions.width, {
      bevelMm: form.shell.bevelMm,
    })
    geom.computeBoundingBox()
    const box = geom.boundingBox!
    const width = box.max.x - box.min.x
    const height = box.max.y - box.min.y
    const depth = box.max.z - box.min.z

    // Within a couple mm — the bevel adds a small margin, which is expected.
    expect(width).toBeCloseTo(entry.dimensions.width / 1000, 2)
    expect(height).toBeCloseTo(entry.dimensions.height / 1000, 2)
    expect(depth).toBeCloseTo(entry.dimensions.depth / 1000, 2)
  })

  it('sizes the cartridge intake wide enough for the SNES Game Pak', () => {
    // 136mm wide cartridge — the intake must not be narrower than what it
    // is meant to accept.
    expect(form.intake.widthMm).toBeGreaterThanOrEqual(136)
  })

  it('names every mesh the insert sequence and failure states will target', () => {
    // The slot's rendered mesh name is *read from* animatedParts (see
    // ConsoleFromForm's TopSlot) rather than hardcoded — this must derive the
    // same way, or the test just re-hardcodes the value it's meant to check.
    const slotName = entry.animatedParts.slot ?? entry.animatedParts.tray ?? 'slot'
    const meshNames = new Set([
      ...form.controls.map((c) => c.mesh),
      ...form.ports.map((p) => p.mesh),
      slotName,
      'power_led',
    ])
    for (const [key, meshName] of Object.entries(entry.animatedParts)) {
      if (!meshName) continue
      expect(meshNames.has(meshName), `${key} -> "${meshName}"`).toBe(true)
    }
  })

  it('corrects the control-panel colours against the published design', () => {
    // Wikipedia: purple sliding switches, dark grey eject lever. An earlier
    // hand-built pass had this backwards (grey switch, purple reset).
    const power = form.controls.find((c) => c.mesh === 'power_switch')!
    const eject = form.controls.find((c) => c.mesh === 'eject_lever')!
    expect(power.kind).toBe('slider')
    expect(power.color).toBe('accent') // resolves to palette.accent = purple
    expect(eject.kind).toBe('lever')
    expect(eject.color).toBe('dark') // resolves to palette.dark = grey
    expect(form.palette.accent.toLowerCase()).not.toBe(form.palette.shell.toLowerCase())
  })

  it('gives the loading bay a genuine curve, not a flat step', () => {
    if (form.shell.kind !== 'swept') throw new Error('expected swept shell')
    // A flat-deck design (the original hand-built model) would jump straight
    // from the control-deck height to the full rear-deck height in one or two
    // points. The corrected profile rises through several intermediate
    // heights on the way up — that gradual rise is the curve.
    const heights = form.shell.profile.map(([, h]) => h)
    const risingSection = heights.filter((h, i) => i > 0 && h > heights[i - 1])
    expect(risingSection.length).toBeGreaterThanOrEqual(4)
  })
})

describe('SNES controller form', () => {
  const controller = CONSOLES.find((c) => c.id === 'snes')!.controllers[0]
  const form = controllerForm(controller.id)!

  it('exists and produces the correct bounding box', () => {
    const geom = sweepPlanVertically(form.plan, form.thicknessMm, { bevelMm: form.bevelMm })
    geom.computeBoundingBox()
    const box = geom.boundingBox!
    expect(box.max.x - box.min.x).toBeCloseTo(controller.dimensions.width / 1000, 2)
    expect(box.max.y - box.min.y).toBeCloseTo(controller.dimensions.height / 1000, 2)
    expect(box.max.z - box.min.z).toBeCloseTo(controller.dimensions.depth / 1000, 2)
  })

  it('keeps A/B convex and X/Y concave — the shapes the anatomy mode exists to explain', () => {
    const shapeOf = (id: string) => controller.buttons.find((b) => b.id === id)!.shape
    expect(shapeOf('a')).toBe('convex')
    expect(shapeOf('b')).toBe('convex')
    expect(shapeOf('x')).toBe('concave')
    expect(shapeOf('y')).toBe('concave')
  })

  it('gives every positioned button a shape and vice versa', () => {
    for (const b of controller.buttons) {
      if (b.position) expect(b.shape, `${b.id} has position but no shape`).toBeTruthy()
      if (b.shape) expect(b.position, `${b.id} has shape but no position`).toBeTruthy()
    }
  })

  it('keeps every positioned button inside the pad outline', () => {
    const xs = form.plan.map(([x]) => x)
    const zs = form.plan.map(([, z]) => z)
    const [minX, maxX] = [Math.min(...xs), Math.max(...xs)]
    const [minZ, maxZ] = [Math.min(...zs), Math.max(...zs)]

    for (const b of controller.buttons) {
      if (!b.position) continue
      const [x, z] = b.position
      expect(x, `${b.id} x out of plan bounds`).toBeGreaterThanOrEqual(minX)
      expect(x, `${b.id} x out of plan bounds`).toBeLessThanOrEqual(maxX)
      expect(z, `${b.id} z out of plan bounds`).toBeGreaterThanOrEqual(minZ)
      expect(z, `${b.id} z out of plan bounds`).toBeLessThanOrEqual(maxZ)
    }
  })

  it('gives only one of the four d-pad entries a position, avoiding duplicate meshes', () => {
    const dpad = controller.buttons.filter((b) => b.id.startsWith('dpad-'))
    const withPosition = dpad.filter((b) => b.position)
    expect(withPosition).toHaveLength(1)
  })
})

describe('form kit registries', () => {
  it('key every entry by a real console/controller id', () => {
    for (const id of Object.keys(CONSOLE_FORMS)) {
      expect(CONSOLES.some((c) => c.id === id), `unknown console id "${id}"`).toBe(true)
    }
    const controllerIds = CONSOLES.flatMap((c) => c.controllers.map((p) => p.id))
    for (const id of Object.keys(CONTROLLER_FORMS)) {
      expect(controllerIds.includes(id), `unknown controller id "${id}"`).toBe(true)
    }
  })
})
