import * as THREE from 'three'
import { MM } from '@/data/kits/media-archetypes'

/**
 * Profile-extrusion toolkit — how hero geometry gets its silhouette without a
 * boolean library.
 *
 * A console shell is, in cross-section, a side profile swept across its width.
 * A controller is a top-down plan outline swept vertically. Both are exactly
 * what `Shape` + `ExtrudeGeometry` produce, and `Shape` supports holes natively,
 * which covers real recesses — vents, ports, the cart slot sunk into a curved
 * bay — without needing `three-bvh-csg` (dropped: its peer requirement on
 * three-mesh-bvh conflicts with the version drei installs; see the plan's
 * decision log).
 *
 * Every point in this module is millimetres in, metres out — geometry is
 * generated once per form spec and memoised by the caller, never per frame.
 */

export type Vec2Mm = [number, number]

/** A closed polygon outline in mm, wound consistently (CCW for outer shapes). */
export function shapeFromPoints(points: Vec2Mm[]): THREE.Shape {
  const shape = new THREE.Shape()
  const [x0, y0] = points[0]
  shape.moveTo(x0 * MM, y0 * MM)
  for (let i = 1; i < points.length; i++) {
    const [x, y] = points[i]
    shape.lineTo(x * MM, y * MM)
  }
  shape.closePath()
  return shape
}

/**
 * A rounded-rectangle outline in mm, corner radius in mm, optionally centred
 * away from the origin. Degrades to a plain rect at r=0.
 *
 * `THREE.Shape` has no `.translate()` — offsetting a shape after construction
 * is not an API three.js provides, so the centre is baked in at build time.
 */
export function roundedRectShape(
  widthMm: number,
  heightMm: number,
  radiusMm: number,
  centreXMm = 0,
  centreYMm = 0,
): THREE.Shape {
  const w = widthMm * MM
  const h = heightMm * MM
  const r = Math.min(radiusMm * MM, w / 2, h / 2)
  const shape = new THREE.Shape()
  const x = centreXMm * MM - w / 2
  const y = centreYMm * MM - h / 2

  shape.moveTo(x + r, y)
  shape.lineTo(x + w - r, y)
  if (r > 0) shape.quadraticCurveTo(x + w, y, x + w, y + r)
  shape.lineTo(x + w, y + h - r)
  if (r > 0) shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  shape.lineTo(x + r, y + h)
  if (r > 0) shape.quadraticCurveTo(x, y + h, x, y + h - r)
  shape.lineTo(x, y + r)
  if (r > 0) shape.quadraticCurveTo(x, y, x + r, y)
  shape.closePath()
  return shape
}

/** Cuts a rectangular hole (a vent, a port, a slot) into an existing shape. */
export function addRectHole(
  shape: THREE.Shape,
  centreXMm: number,
  centreYMm: number,
  widthMm: number,
  heightMm: number,
  radiusMm = 0,
): void {
  shape.holes.push(roundedRectShape(widthMm, heightMm, radiusMm, centreXMm, centreYMm))
}

export type ExtrudeOptions = {
  /** How far the shape is swept, in mm. */
  depthMm: number
  /** Bevel size in mm — the edge highlight that reads as "moulded plastic", not paper. */
  bevelMm?: number
  bevelSegments?: number
  curveSegments?: number
}

/**
 * Extrude a shape (holes included) into a solid, centred on its own depth axis
 * so the caller doesn't have to re-offset it — extruded geometry is +Z by
 * default in three.js, which reads as "front-to-back thickness" for a shell
 * profile swept across its width.
 */
export function extrude(shape: THREE.Shape, opts: ExtrudeOptions): THREE.ExtrudeGeometry {
  const { depthMm, bevelMm = 0, bevelSegments = 2, curveSegments = 8 } = opts
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: depthMm * MM,
    bevelEnabled: bevelMm > 0,
    bevelThickness: bevelMm * MM,
    bevelSize: bevelMm * MM,
    bevelSegments,
    curveSegments,
    steps: 1,
  })
  // Centre the extrusion on its depth axis, then re-orient so the sweep runs
  // along X (the profile's natural "width" reading) rather than three's
  // default Z-only extrusion axis. Console shells are swept across width.
  geometry.translate(0, 0, -(depthMm * MM) / 2)
  geometry.computeVertexNormals()
  return geometry
}

/**
 * A side profile — point order (depthMm, heightMm), i.e. front-to-back then
 * up — swept along X to produce width. This is the construction a console
 * shell actually is: draw the silhouette you'd see from the side, then sweep
 * it sideways.
 *
 * Axis derivation, since getting this wrong silently produces garbled
 * geometry: `extrude()` places the input shape's (x, y) directly into the
 * output mesh's (x, y), and extrudes along z. Feeding it (x=depth, y=height)
 * and extruding by `widthMm` gives an unrotated mesh of (x=depth, y=height,
 * z=width). A single `rotateY(90°)` maps (x, y, z) → (z, y, −x), landing on
 * (x=width, y=height, z=−depth) — width on X, height on Y, depth on Z, but
 * with the front face (profile depth 0) sitting at z=0 and the back face at
 * z=−depthMm, NOT straddling the origin the way every other object in this
 * scene does (game boxes, the TV, the walls all centre on X and Z, resting on
 * the floor at Y=0). A caller that assumed the ±depth/2 convention and placed
 * front-face fixtures at z=+depth/2 got them floating in mid-air, detached
 * from the shell — the bug that made this comment necessary. Centring the
 * finished geometry on its own bounding box, rather than trusting the
 * rotation math to land on a convenient origin, is what makes that
 * convention actually hold: after centring, the front face lands at
 * +halfDepth and the back at −halfDepth, matching everything else.
 */
export function sweepProfileAlongX(
  profile: Vec2Mm[],
  widthMm: number,
  opts: { bevelMm?: number; curveSegments?: number } = {},
): THREE.BufferGeometry {
  const shape = shapeFromPoints(profile)
  const geometry = extrude(shape, {
    depthMm: widthMm,
    bevelMm: opts.bevelMm,
    curveSegments: opts.curveSegments,
  })
  geometry.rotateY(Math.PI / 2)

  // Y (height) already runs from the floor upward correctly, since the
  // profile's own points are authored starting at height 0. Only Z needs
  // centring here.
  geometry.computeBoundingBox()
  const box = geometry.boundingBox!
  geometry.translate(0, 0, -(box.min.z + box.max.z) / 2)

  geometry.computeVertexNormals()
  return geometry
}

/**
 * The height of a swept profile's top surface at a given depth back from the
 * front face, in mm — i.e. "how high is the shell where I want to put this?".
 *
 * Top-mounted fixtures need this. Authoring their height by hand duplicates a
 * number the profile already knows, and the two drift the moment the profile
 * is corrected: the SNES profile was revised to curve into its rear deck, and
 * any hand-authored height for a control sitting on that curve would silently
 * have become wrong. Reading it back means a control cannot float above its
 * own deck or sink into it.
 *
 * Returns the *highest* surface at that depth, since a closed profile crosses
 * every interior depth at least twice (once on the top, once along the floor).
 * Depths outside the profile return the nearest end's height rather than
 * throwing — a fixture authored slightly off the back edge should land on the
 * shell, not crash the scene.
 */
export function profileHeightAtDepth(profile: Vec2Mm[], depthMm: number): number {
  const depths = profile.map(([d]) => d)
  const clamped = Math.min(Math.max(depthMm, Math.min(...depths)), Math.max(...depths))

  let highest = -Infinity
  for (let i = 0; i < profile.length; i++) {
    const [d1, h1] = profile[i]
    const [d2, h2] = profile[(i + 1) % profile.length]
    const lo = Math.min(d1, d2)
    const hi = Math.max(d1, d2)
    if (clamped < lo || clamped > hi) continue

    // A vertical segment (front face, back face) spans no depth range, so both
    // its endpoints are candidates; interpolation would divide by zero.
    if (d1 === d2) {
      highest = Math.max(highest, h1, h2)
      continue
    }
    const t = (clamped - d1) / (d2 - d1)
    highest = Math.max(highest, h1 + t * (h2 - h1))
  }

  return highest === -Infinity ? 0 : highest
}

/**
 * A flat cap with rounded ends, lying in the X–Z plane with its thickness on
 * Y and its underside at y=0 — the shape of a key sitting on a horizontal
 * surface. Width runs along X, depth along Z.
 *
 * A capsule primitive is the obvious reach for a stadium shape and the wrong
 * one here: it is a half-cylinder at each end, so a cap wide enough to read as
 * the SNES's power key also stands 14mm tall. This is the same rounded-rect
 * extrusion the shells use, so cap and shell share one silhouette language.
 */
export function roundedPadGeometry(
  widthMm: number,
  depthMm: number,
  thicknessMm: number,
  radiusMm = Math.min(widthMm, depthMm) / 2,
): THREE.BufferGeometry {
  const shape = roundedRectShape(widthMm, depthMm, radiusMm)
  const geometry = extrude(shape, { depthMm: thicknessMm, bevelMm: 0, curveSegments: 10 })
  // extrude() leaves width on X, depth on Y, thickness on Z centred at 0.
  // rotateX(-90°) maps (x, y, z) -> (x, z, -y): width on X, thickness on Y,
  // depth on Z. Then lift it so the underside rests on y=0 rather than
  // straddling it, matching how every other fixture is placed against the
  // surface it sits on.
  geometry.rotateX(-Math.PI / 2)
  geometry.translate(0, (thicknessMm * MM) / 2, 0)
  geometry.computeVertexNormals()
  return geometry
}

/** A plan outline (in the X–Z plane: width × depth) swept vertically — a controller shell. */
export function sweepPlanVertically(
  plan: Vec2Mm[],
  heightMm: number,
  opts: { bevelMm?: number; curveSegments?: number } = {},
): THREE.BufferGeometry {
  const shape = shapeFromPoints(plan)
  const geometry = extrude(shape, {
    depthMm: heightMm,
    bevelMm: opts.bevelMm,
    curveSegments: opts.curveSegments,
  })
  // extrude() gives width(x) × depth(y) in-plane, height in Z, height
  // centred on 0. Rotate so height lies along Y: (x=width, y=depth, z=height)
  // -> (x=width, y=height, z=depth) — but that leaves Y running from
  // −height/2 to +height/2, which puts half the controller below the floor
  // once ControllerModel places it at the diorama's floor-level anchor.
  // Floor it (0 to heightMm) to match the same resting-on-Y=0 convention
  // every other object in the scene uses, and centre X/Z on their own
  // bounding box rather than trusting the plan outline to be authored
  // perfectly symmetric — the same defensive centring sweepProfileAlongX
  // needed for Z, applied here to all three axes since a plan outline has no
  // equivalent of a profile's "starts at the floor" authoring convention.
  geometry.rotateX(-Math.PI / 2)
  geometry.computeBoundingBox()
  const box = geometry.boundingBox!
  geometry.translate(
    -(box.min.x + box.max.x) / 2,
    -box.min.y,
    -(box.min.z + box.max.z) / 2,
  )
  geometry.computeVertexNormals()
  return geometry
}

/** Millimetres to scene metres, re-exported for form-spec authors. */
export { MM }
