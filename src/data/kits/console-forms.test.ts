import { describe, expect, it } from 'vitest'
import { CONSOLE_FORMS, consoleForm } from './console-forms'
import { CONTROLLER_FORMS, controllerForm } from './controller-forms'
import { CONSOLES } from '@/data/consoles'
import {
  profileHeightAtDepth,
  sweepProfileAlongX,
  sweepPlanVertically,
} from '@/three/geometry/profiles'

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

/**
 * These lock in corrections made against three reference photographs of an NA
 * SNES. Each one replaces a feature the model previously invented or got
 * backwards, and each is cheap to regress by "tidying" the form spec later.
 */
describe('SNES console form, against the reference photographs', () => {
  const entry = CONSOLES.find((c) => c.id === 'snes')!
  const form = consoleForm('snes')!

  it('cuts no vent grille into the top deck, because the hardware has none', () => {
    expect(form.vents).toHaveLength(0)
  })

  it('makes both power and reset purple, and eject the only grey control', () => {
    const byMesh = (m: string) => form.controls.find((c) => c.mesh === m)!
    expect(byMesh('power_switch').color).toBe('accent')
    expect(byMesh('reset_button').color).toBe('accent')
    expect(byMesh('eject_lever').color).toBe('dark')
    expect(form.controls.filter((c) => c.color === 'dark')).toHaveLength(1)
  })

  it('orders the front controls power, eject, reset from left to right', () => {
    const x = (m: string) => form.controls.find((c) => c.mesh === m)!.position[0]
    expect(x('power_switch')).toBeLessThan(x('eject_lever'))
    expect(x('eject_lever')).toBeLessThan(x('reset_button'))
    // Eject sits in the centre column, not off to one side.
    expect(Math.abs(x('eject_lever'))).toBeLessThan(5)
  })

  it('mounts power and reset on the deck top, at the height the profile says', () => {
    if (form.shell.kind !== 'swept') throw new Error('expected swept shell')
    for (const mesh of ['power_switch', 'reset_button']) {
      const control = form.controls.find((c) => c.mesh === mesh)!
      expect(control.face, `${mesh} must be top-mounted`).toBe('top')
      const [, depthFromFront] = control.position
      // The low front deck, not the raised rear deck — a control that landed
      // on the rear deck would be sitting on the cartridge bay.
      const deckHeight = profileHeightAtDepth(form.shell.profile, depthFromFront)
      expect(deckHeight).toBeGreaterThan(0)
      expect(deckHeight).toBeLessThan(entry.dimensions.height)
    }
  })

  it('leaves a centre column between the two front blocks', () => {
    const reliefs = form.reliefs ?? []
    expect(reliefs).toHaveLength(2)
    const [left, right] = [...reliefs].sort((a, b) => a.position[0] - b.position[0])
    const gap = right.position[0] - right.widthMm / 2 - (left.position[0] + left.widthMm / 2)
    // Wide enough to carry the eject control and read as a column, not a seam.
    expect(gap).toBeGreaterThan(20)
  })

  it('keeps every relief block inside the shell and standing proud of it', () => {
    for (const r of form.reliefs ?? []) {
      expect(r.protrusionMm, `${r.mesh} must be additive`).toBeGreaterThan(0)
      expect(Math.abs(r.position[0]) + r.widthMm / 2).toBeLessThanOrEqual(entry.dimensions.width / 2)
      expect(r.position[1] + r.heightMm / 2).toBeLessThanOrEqual(entry.dimensions.height)
    }
  })

  it('sits both controller ports on a block, so neither renders inside one', () => {
    // This is the failure the frontSurfaceZ lookup exists to prevent: a port
    // authored against the nominal front face, then buried by a block added in
    // front of it.
    for (const port of form.ports) {
      const onBlock = (form.reliefs ?? []).some(
        (r) =>
          Math.abs(port.position[0] - r.position[0]) + port.widthMm / 2 <= r.widthMm / 2 &&
          Math.abs(port.position[1] - r.position[1]) + port.heightMm / 2 <= r.heightMm / 2,
      )
      expect(onBlock, `${port.mesh} is not fully on a relief block`).toBe(true)
    }
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

/**
 * Every swept shell in the kit, checked against the console's own published
 * dimensions. Written as a loop rather than a describe-per-console on purpose:
 * the point is that this holds for the WHOLE kit, so a console added later
 * cannot quietly ship a profile that does not match its data — it is covered
 * the moment its form lands, with no new test to remember to write.
 */
describe('every swept console form', () => {
  const swept = Object.entries(CONSOLE_FORMS).filter(
    ([, form]) => form.shell.kind === 'swept',
  )

  it('covers at least the consoles known to be form-built', () => {
    expect(swept.length).toBeGreaterThanOrEqual(4)
  })

  for (const [id, form] of swept) {
    describe(id, () => {
      const entry = CONSOLES.find((c) => c.id === id)!

      it('produces a shell whose bounding box matches the published dimensions', () => {
        if (form.shell.kind !== 'swept') throw new Error('expected swept shell')
        const geom = sweepProfileAlongX(form.shell.profile, entry.dimensions.width, {
          bevelMm: form.shell.bevelMm,
        })
        geom.computeBoundingBox()
        const box = geom.boundingBox!

        // Within a couple mm — the bevel adds a small margin, which is expected.
        expect(box.max.x - box.min.x).toBeCloseTo(entry.dimensions.width / 1000, 2)
        expect(box.max.y - box.min.y).toBeCloseTo(entry.dimensions.height / 1000, 2)
        expect(box.max.z - box.min.z).toBeCloseTo(entry.dimensions.depth / 1000, 2)
      })

      it('names every animated part the data expects', () => {
        if (form.shell.kind !== 'swept') throw new Error('expected swept shell')
        // Anything the entry declares as animated must exist as a generated
        // mesh name, or the insert sequence will drive nothing at all.
        const generated = new Set([
          ...form.controls.map((c) => c.mesh),
          ...form.ports.map((p) => p.mesh),
          ...(form.reliefs ?? []).map((r) => r.mesh).filter(Boolean),
          // ConsoleFromForm renders a power_led mesh for every console
          // unconditionally, outside the form spec — so a form must NOT also
          // declare one as a control, or the name resolves to two meshes.
          'power_led',
        ])
        // The intake generates its own mesh under a kind-derived name, so slot,
        // tray and lid targets are satisfied by the intake rather than by a
        // control — check only the named controls here.
        const intakeDriven = ['slot', 'tray', 'lid'] as const
        for (const [role, mesh] of Object.entries(entry.animatedParts)) {
          if (!mesh) continue
          if (intakeDriven.includes(role as (typeof intakeDriven)[number])) continue
          expect(generated.has(mesh), `${id}: no generated mesh named "${mesh}" for ${role}`).toBe(
            true,
          )
        }
      })

      it('generates no duplicate mesh names', () => {
        // Every mesh the form generates has to be uniquely addressable:
        // animatedParts and failureStates both resolve their target by name,
        // and a duplicate silently makes getObjectByName pick whichever came
        // first. 'power_led' is included because ConsoleFromForm always
        // renders one, so a form declaring its own would collide with it.
        const names = [
          ...form.controls.map((c) => c.mesh),
          ...form.ports.map((p) => p.mesh),
          ...(form.reliefs ?? []).map((r) => r.mesh).filter((m): m is string => Boolean(m)),
          'power_led',
        ]
        const seen = new Set<string>()
        for (const name of names) {
          expect(seen.has(name), `${id}: duplicate mesh name "${name}"`).toBe(false)
          seen.add(name)
        }
      })

      it('keeps every control and port within the shell footprint', () => {
        const halfWidth = entry.dimensions.width / 2
        for (const c of form.controls) {
          expect(Math.abs(c.position[0]), `${id}: control ${c.mesh} off the shell`).toBeLessThanOrEqual(
            halfWidth,
          )
        }
        for (const p of form.ports) {
          expect(
            Math.abs(p.position[0]) + p.widthMm / 2,
            `${id}: port ${p.mesh} overhangs the shell`,
          ).toBeLessThanOrEqual(halfWidth)
        }
      })
    })
  }
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
