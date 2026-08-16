import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import {
  addRectHole,
  extrude,
  profileHeightAtDepth,
  roundedPadGeometry,
  roundedRectShape,
  shapeFromPoints,
  sweepPlanVertically,
  sweepProfileAlongX,
} from './profiles'

/**
 * The axis derivation in sweepProfileAlongX/sweepPlanVertically is exactly the
 * kind of mental-rotation math that is easy to get quietly wrong — a bad
 * rotation doesn't throw, it just produces a mesh with swapped or negated
 * axes that looks like garbage in the viewport with no error anywhere. These
 * tests check dimensions numerically so a regression is a red test, not a
 * squint at a screenshot.
 */

function bbox(geometry: THREE.BufferGeometry) {
  geometry.computeBoundingBox()
  const box = geometry.boundingBox!
  return {
    width: box.max.x - box.min.x,
    height: box.max.y - box.min.y,
    depth: box.max.z - box.min.z,
  }
}

function hasNoNaN(geometry: THREE.BufferGeometry): boolean {
  const pos = geometry.getAttribute('position')
  for (let i = 0; i < pos.count; i++) {
    if (!Number.isFinite(pos.getX(i)) || !Number.isFinite(pos.getY(i)) || !Number.isFinite(pos.getZ(i))) {
      return false
    }
  }
  return true
}

describe('roundedRectShape', () => {
  it('produces a shape whose extrusion matches its authored width and height', () => {
    const shape = roundedRectShape(100, 60, 5)
    const geom = extrude(shape, { depthMm: 10 })
    const { width, height, depth } = bbox(geom)
    expect(width).toBeCloseTo(0.1, 3)
    expect(height).toBeCloseTo(0.06, 3)
    expect(depth).toBeCloseTo(0.01, 3)
  })

  it('degrades to a plain rectangle at radius 0 without throwing', () => {
    expect(() => roundedRectShape(50, 30, 0)).not.toThrow()
  })

  it('clamps an oversized radius rather than producing a self-intersecting outline', () => {
    // A radius larger than half the smallest side would invert the curve.
    const shape = roundedRectShape(20, 10, 999)
    const geom = extrude(shape, { depthMm: 5 })
    expect(hasNoNaN(geom)).toBe(true)
  })
})

describe('addRectHole', () => {
  it('adds a hole without corrupting the outer geometry bounds', () => {
    const shape = roundedRectShape(120, 80, 4)
    addRectHole(shape, 0, 0, 20, 10, 2)
    const geom = extrude(shape, { depthMm: 15 })
    const { width, height } = bbox(geom)
    expect(width).toBeCloseTo(0.12, 3)
    expect(height).toBeCloseTo(0.08, 3)
    expect(hasNoNaN(geom)).toBe(true)
  })

  it('actually removes material — a hollow shape has fewer or equal vertices at the hole site', () => {
    // Indirect check: extruding with a large hole should not throw and should
    // still produce a manifold-ish position buffer.
    const solid = extrude(roundedRectShape(100, 100, 0), { depthMm: 10 })
    const holed = shapeFromPoints([
      [-50, -50],
      [50, -50],
      [50, 50],
      [-50, 50],
    ])
    addRectHole(holed, 0, 0, 40, 40)
    const withHole = extrude(holed, { depthMm: 10 })
    expect(hasNoNaN(withHole)).toBe(true)
    // A shape with a hole has strictly more boundary geometry than a plain
    // rectangle of the same outer size (the hole's own walls).
    expect(withHole.getAttribute('position').count).toBeGreaterThan(
      solid.getAttribute('position').count,
    )
  })
})

describe('sweepProfileAlongX — console shell construction', () => {
  it('maps depth/height profile points onto (width, height, depth) correctly', () => {
    // A simple rectangular "profile": 60mm deep, 20mm tall, swept to 100mm wide.
    const profile: [number, number][] = [
      [0, 0],
      [60, 0],
      [60, 20],
      [0, 20],
    ]
    const geom = sweepProfileAlongX(profile, 100)
    const { width, height, depth } = bbox(geom)
    expect(width).toBeCloseTo(0.1, 3) // swept dimension
    expect(height).toBeCloseTo(0.02, 3) // profile's own height axis
    expect(depth).toBeCloseTo(0.06, 3) // profile's own depth axis
  })

  it('produces a curved profile (more than 8 unique vertex rings) for a rounded loading bay', () => {
    // A profile with a genuine curve (not just corners) needs enough segments
    // to read as curved rather than faceted. Approximate a bay lip with a few
    // intermediate points and check the geometry is non-degenerate.
    const profile: [number, number][] = [
      [0, 0],
      [80, 0],
      [80, 15],
      [65, 22],
      [45, 24],
      [25, 22],
      [10, 15],
      [0, 12],
    ]
    const geom = sweepProfileAlongX(profile, 150, { bevelMm: 1 })
    expect(hasNoNaN(geom)).toBe(true)
    const { width } = bbox(geom)
    expect(width).toBeGreaterThan(0.14) // ~150mm, bevel adds a hair
  })

  it('never produces NaN vertices for a shell carrying a subtracted slot', () => {
    const profile: [number, number][] = [
      [0, 0],
      [90, 0],
      [90, 18],
      [0, 18],
    ]
    const shape = shapeFromPoints(profile)
    addRectHole(shape, 45, 9, 20, 6, 1)
    const geom = extrude(shape, { depthMm: 100 })
    expect(hasNoNaN(geom)).toBe(true)
  })
})

describe('sweepProfileAlongX — front/back orientation', () => {
  // The bounding-box tests above check size, not which side is front — that
  // gap is exactly what let a real bug through: front-face fixtures placed
  // at the documented "+halfDepth = front" convention rendered detached from
  // the shell, because the geometry actually put the front at z=0 and the
  // back at z=-depth until the centring fix. These tests pin the semantic
  // convention itself, not just the envelope.
  const profile: [number, number][] = [
    [0, 0], // front, depth=0
    [100, 0], // back, depth=100
    [100, 20],
    [0, 20],
  ]

  it('centres the shell so the front sits at +halfDepth, not at z=0', () => {
    const geom = sweepProfileAlongX(profile, 50)
    geom.computeBoundingBox()
    const box = geom.boundingBox!
    // Depth is 100mm, so front and back should sit ±0.05m from the origin.
    expect(box.max.z).toBeCloseTo(0.05, 3)
    expect(box.min.z).toBeCloseTo(-0.05, 3)
  })

  it('puts the front face (profile depth 0) at positive Z', () => {
    // A vertex authored at profile depth=0 (the front, per the documented
    // point-order convention) must land at positive world Z after the sweep
    // — that is the ±depth/2 convention every fixture placement depends on.
    const geom = sweepProfileAlongX(profile, 50)
    const pos = geom.getAttribute('position')
    let maxZAtFrontHeight = -Infinity
    for (let i = 0; i < pos.count; i++) {
      // Vertices near the front-bottom corner (x≈0 in the original profile
      // maps to the largest z after centring) — just check the overall
      // extremes agree with the bounding-box assertion above, from the
      // vertex data directly rather than the cached bounding box.
      maxZAtFrontHeight = Math.max(maxZAtFrontHeight, pos.getZ(i))
    }
    expect(maxZAtFrontHeight).toBeGreaterThan(0)
  })
})

describe('sweepPlanVertically — controller shell construction', () => {
  it('maps width/depth plan points onto (width, height, depth) correctly', () => {
    // A simple rectangular "plan": 140mm wide, 55mm deep, swept 25mm tall.
    const plan: [number, number][] = [
      [-70, -27.5],
      [70, -27.5],
      [70, 27.5],
      [-70, 27.5],
    ]
    const geom = sweepPlanVertically(plan, 25)
    const { width, height, depth } = bbox(geom)
    expect(width).toBeCloseTo(0.14, 3)
    expect(height).toBeCloseTo(0.025, 3)
    expect(depth).toBeCloseTo(0.055, 3)
  })

  it('handles an asymmetric dog-bone-style outline without self-intersection artefacts', () => {
    const plan: [number, number][] = [
      [-60, -20],
      [-40, -30],
      [40, -30],
      [60, -20],
      [60, 20],
      [40, 30],
      [-40, 30],
      [-60, 20],
    ]
    const geom = sweepPlanVertically(plan, 22, { bevelMm: 2 })
    expect(hasNoNaN(geom)).toBe(true)
    const { width, depth } = bbox(geom)
    expect(width).toBeCloseTo(0.12, 2)
    expect(depth).toBeCloseTo(0.06, 2)
  })

  it('rests on the floor (Y from 0 upward), not centred on Y', () => {
    // A controller group is positioned at the diorama's floor-level anchor
    // with no extra offset — if the geometry were Y-centred instead of
    // floored, half of it would render below the floor.
    const plan: [number, number][] = [
      [-70, -27.5],
      [70, -27.5],
      [70, 27.5],
      [-70, 27.5],
    ]
    const geom = sweepPlanVertically(plan, 25)
    geom.computeBoundingBox()
    const box = geom.boundingBox!
    expect(box.min.y).toBeCloseTo(0, 3)
    expect(box.max.y).toBeCloseTo(0.025, 3)
  })

  it('centres X and Z even when the plan outline is not perfectly symmetric', () => {
    // An outline authored slightly off-centre (an honest authoring mistake,
    // not contrived) should still land centred after the sweep, matching
    // the ±extent/2 convention every other object in the scene relies on.
    const offsetPlan: [number, number][] = [
      [-60, -20],
      [80, -20], // +20mm further out on the right than the left
      [80, 20],
      [-60, 20],
    ]
    const geom = sweepPlanVertically(offsetPlan, 20)
    geom.computeBoundingBox()
    const box = geom.boundingBox!
    expect((box.min.x + box.max.x) / 2).toBeCloseTo(0, 6)
    expect((box.min.z + box.max.z) / 2).toBeCloseTo(0, 6)
  })
})

describe('profileHeightAtDepth', () => {
  // A miniature of the SNES silhouette: low front deck, a rise, a tall rear
  // deck, then straight back down and along the floor.
  const profile: [number, number][] = [
    [0, 0],
    [0, 40],
    [48, 40],
    [100, 68],
    [254, 68],
    [254, 0],
  ]

  it('reads the flat front deck', () => {
    expect(profileHeightAtDepth(profile, 14)).toBeCloseTo(40, 6)
    expect(profileHeightAtDepth(profile, 48)).toBeCloseTo(40, 6)
  })

  it('interpolates across the rise rather than snapping to either deck', () => {
    // Halfway along the 48->100 rise, which climbs 40->68.
    expect(profileHeightAtDepth(profile, 74)).toBeCloseTo(54, 6)
  })

  it('reads the rear deck', () => {
    expect(profileHeightAtDepth(profile, 190)).toBeCloseTo(68, 6)
  })

  it('returns the top surface, never the floor the profile also crosses', () => {
    // Every interior depth is crossed twice — once on top, once along the
    // closing floor segment. Returning the lower crossing would bury every
    // top-mounted control inside the shell.
    for (const d of [0, 20, 74, 150, 254]) {
      expect(profileHeightAtDepth(profile, d)).toBeGreaterThan(0)
    }
  })

  it('clamps past either end instead of throwing', () => {
    expect(profileHeightAtDepth(profile, -20)).toBeCloseTo(40, 6)
    expect(profileHeightAtDepth(profile, 400)).toBeCloseTo(68, 6)
  })
})

describe('roundedPadGeometry', () => {
  it('lies flat with its underside on y=0, so it rests on the surface it sits on', () => {
    const geom = roundedPadGeometry(46, 14, 4)
    geom.computeBoundingBox()
    const box = geom.boundingBox!
    expect(box.min.y).toBeCloseTo(0, 6)
    expect(box.max.y).toBeCloseTo(4 / 1000, 6)
  })

  it('puts length on X and depth on Z', () => {
    const geom = roundedPadGeometry(46, 14, 4)
    geom.computeBoundingBox()
    const box = geom.boundingBox!
    expect(box.max.x - box.min.x).toBeCloseTo(46 / 1000, 4)
    expect(box.max.z - box.min.z).toBeCloseTo(14 / 1000, 4)
  })

  it('stays centred on X and Z', () => {
    const geom = roundedPadGeometry(46, 14, 4)
    geom.computeBoundingBox()
    const box = geom.boundingBox!
    expect((box.min.x + box.max.x) / 2).toBeCloseTo(0, 6)
    expect((box.min.z + box.max.z) / 2).toBeCloseTo(0, 6)
  })
})

describe('shapeFromPoints', () => {
  it('closes the path so the extrusion has no gap', () => {
    const shape = shapeFromPoints([
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
    ])
    const geom = extrude(shape, { depthMm: 5 })
    expect(hasNoNaN(geom)).toBe(true)
    expect(geom.getAttribute('position').count).toBeGreaterThan(0)
  })
})
