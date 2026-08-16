import { useMemo } from 'react'
import * as THREE from 'three'
import type { ConsoleEntry, ConsoleForm, ControlSpec, ReliefSpec } from '@/types/console'
import {
  addRectHole,
  extrude,
  MM,
  profileHeightAtDepth,
  roundedPadGeometry,
  roundedRectShape,
  shapeFromPoints,
  sweepProfileAlongX,
} from '../geometry/profiles'
import { plasticMaterial } from '../materials/plastic'

/**
 * Renders a console from a ConsoleForm — the generic path every "tier 1"
 * console (roughly 16 of the ~22-console roster) goes through. Adding a
 * console here means adding a form spec to console-forms.ts, not a component.
 *
 * Geometry is memoised per console id: building the same form twice returns
 * the same BufferGeometry instance, so nothing regenerates per frame or per
 * instance on the shelf/room.
 */

const geometryCache = new Map<string, THREE.BufferGeometry>()
const capGeometryCache = new Map<string, THREE.BufferGeometry>()

/** Memoised cap for a top-mounted control, keyed by its dimensions rather than its owner. */
function topCapGeometry(spec: ControlSpec, capDepthMm: number, thicknessMm: number) {
  const key = `${spec.sizeMm}x${capDepthMm}x${thicknessMm}`
  const cached = capGeometryCache.get(key)
  if (cached) return cached
  const geometry = roundedPadGeometry(spec.sizeMm, capDepthMm, thicknessMm)
  capGeometryCache.set(key, geometry)
  return geometry
}

/**
 * Converts "distance back from the front face" (how intake/vent positions are
 * authored in console-forms.ts — a natural way to place something on a top
 * surface) into world-space Z.
 *
 * After sweepProfileAlongX's own centring, the front face sits at
 * +halfDepth and the back face at −halfDepth, matching the ±depth/2
 * convention every other object in the scene uses. A value measured "back
 * from the front" is therefore `halfDepth − offset`, not the offset itself —
 * using the offset directly was the bug that left the SNES's top-mounted
 * fixtures floating detached from the shell during the visual gate.
 */
function worldZFromFront(entry: ConsoleEntry, offsetFromFrontMm: number): number {
  return (entry.dimensions.depth / 2 - offsetFromFrontMm) * MM
}

/**
 * How far the shell's real surface sits outside its authored profile, in mm.
 *
 * `extrude()` grows the shape by `bevelSize` on every side to round the edges,
 * so a shell authored 68mm tall is really 69.2mm tall, and its front face sits
 * 1.2mm forward of depth/2. Every fixture is authored against the profile, so
 * every fixture needs this back, and forgetting it does not look like an
 * offset — it looks like the part is *missing*, because it renders inside the
 * shell. That is exactly what had happened to the cartridge bay and both
 * controller ports: authored correctly, drawn about a millimetre too deep, and
 * invisible in every screenshot.
 */
function surfaceOffsetMm(form: ConsoleForm): number {
  return form.shell.kind === 'swept' ? form.shell.bevelMm : 0
}

/** Y of the real top surface at a given depth back from the front face. */
function deckSurfaceY(form: ConsoleForm, depthFromFrontMm: number): number {
  if (form.shell.kind !== 'swept') return 0
  return (profileHeightAtDepth(form.shell.profile, depthFromFrontMm) + surfaceOffsetMm(form)) * MM
}

/** Z of the real front face — the authored half-depth, pushed out by the bevel. */
function frontFaceZ(entry: ConsoleEntry, form: ConsoleForm): number {
  return (entry.dimensions.depth / 2) * MM + surfaceOffsetMm(form) * MM
}

/**
 * Z of whatever surface actually faces forward at a point on the front face.
 *
 * Once a shell carries relief blocks, "the front face" is no longer one plane:
 * a port or control sitting on a block has to move out by that block's
 * protrusion or it renders *inside* it. Mounting every fixture against the
 * surface in front of it, rather than against the nominal face, is the same
 * class of fix as reading a control's height off the profile — the shell
 * decides where its own fixtures land.
 */
function frontSurfaceZ(entry: ConsoleEntry, form: ConsoleForm, xMm: number, yMm: number): number {
  const baseZ = frontFaceZ(entry, form)
  const block = (form.reliefs ?? []).find(
    (r) =>
      Math.abs(xMm - r.position[0]) <= r.widthMm / 2 &&
      Math.abs(yMm - r.position[1]) <= r.heightMm / 2,
  )
  return baseZ + (block ? block.protrusionMm * MM : 0)
}

/**
 * A block standing proud of the front face — see ReliefSpec for why it is
 * additive only.
 *
 * It takes the shell's own material instance rather than a colour: a block is
 * the same moulded piece of plastic as the shell around it, and giving it a
 * plain standard material instead made the front panel read as a separate
 * lighter part bolted on.
 */
function Relief({
  entry,
  form,
  spec,
  material,
}: {
  entry: ConsoleEntry
  form: ConsoleForm
  spec: ReliefSpec
  material: THREE.Material
}) {
  const depth = spec.protrusionMm * MM
  // A plain box gives the block four hard square corners, which reads as a
  // panel bolted onto the front rather than plastic moulded out of it. The
  // same rounded-rect extrusion the shell uses keeps it in the shell's own
  // silhouette language. No bevel: the block's outer face has to land at
  // exactly `frontFaceZ + protrusion` so anything mounted on it (both
  // controller ports, here) can be placed against it, and a bevel would push
  // that face out by an amount the caller cannot see.
  const geometry = useMemo(
    () =>
      extrude(roundedRectShape(spec.widthMm, spec.heightMm, 2), {
        depthMm: spec.protrusionMm,
        bevelMm: 0,
        curveSegments: 6,
      }),
    [spec.widthMm, spec.heightMm, spec.protrusionMm],
  )

  return (
    <mesh
      name={spec.mesh}
      geometry={geometry}
      material={material}
      position={[spec.position[0] * MM, spec.position[1] * MM, frontFaceZ(entry, form) + depth / 2]}
      castShadow
      receiveShadow
    />
  )
}

function shellGeometry(entry: ConsoleEntry, form: ConsoleForm): THREE.BufferGeometry {
  if (form.shell.kind !== 'swept') {
    throw new Error(`${entry.id}: bespoke shells are not rendered by ConsoleFromForm`)
  }

  const cacheKey = `console:${entry.id}`
  const cached = geometryCache.get(cacheKey)
  if (cached) return cached

  const { profile, bevelMm } = form.shell

  // Cut the media intake into the profile before sweeping, when it is a
  // top-mounted slot — a genuine recess via a shape hole, not a floating dark
  // box on the surface. Front-mounted intakes (trays, doors) are separate
  // geometry, added by the caller, since they cut a different face.
  if (form.intake.kind === 'top-slot' || form.intake.kind === 'top-lid') {
    // The profile is 2D (depth, height); the intake is a 3D recess. Since the
    // profile itself only defines the silhouette, the slot opening is carved
    // as a separate darker inset mesh layered into the top surface rather than
    // a hole in the swept profile — a true 3D hole through a curved top would
    // need a volume boolean, which this project deliberately does not depend
    // on (see the plan's decision log on dropping three-bvh-csg).
  }

  const geometry = sweepProfileAlongX(profile, entry.dimensions.width, {
    bevelMm,
    curveSegments: 10,
  })
  geometryCache.set(cacheKey, geometry)
  return geometry
}

/** A rectangular vent row, generated from one VentSpec rather than authored per-slot. */
function VentRow({
  entry,
  spec,
  originY,
}: {
  entry: ConsoleEntry
  spec: ConsoleForm['vents'][number]
  originY: number
}) {
  const slots = useMemo(() => {
    const total =
      spec.count * spec.slotWidthMm + (spec.count - 1) * spec.gapMm
    return Array.from({ length: spec.count }, (_, i) => {
      const offset = -total / 2 + i * (spec.slotWidthMm + spec.gapMm) + spec.slotWidthMm / 2
      return spec.direction === 'row'
        ? ([offset, 0] as const)
        : ([0, offset] as const)
    })
  }, [spec])

  return (
    <group
      position={[spec.position[0] * MM, originY, worldZFromFront(entry, spec.position[1])]}
    >
      {slots.map(([dx, dz], i) => (
        <mesh key={i} position={[dx * MM, 0.0007, dz * MM]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry
            args={[
              (spec.direction === 'row' ? spec.slotWidthMm : spec.slotHeightMm) * MM,
              (spec.direction === 'row' ? spec.slotHeightMm : spec.slotWidthMm) * MM,
            ]}
          />
          <meshStandardMaterial color="#161615" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

/**
 * One physical control, shaped by its ControlKind.
 *
 * Controls are front-face fixtures: `spec.position` is (x = left-right
 * offset, y = height above the floor) — both in mm, per the convention
 * documented in console-forms.ts. Z is derived from the shell's own depth so
 * the control sits proud of the front face, not wherever `spec.position[1]`
 * happened to fall on the depth axis (an earlier draft conflated the two).
 */
function Control({
  spec,
  entry,
  form,
}: {
  spec: ControlSpec
  entry: ConsoleEntry
  form: ConsoleForm
}) {
  const palette = form.palette
  const size = spec.sizeMm * MM
  const color = spec.color === 'accent' ? palette.accent : spec.color === 'dark' ? palette.dark : palette.shell

  // A top-mounted control lies flat on the deck: its cap is thin on Y, and its
  // height comes from the profile rather than the spec (see ControlSpec).
  if (spec.face === 'top') {
    if (form.shell.kind !== 'swept') return null
    const [xMm, depthFromFrontMm] = spec.position
    const deckY = deckSurfaceY(form, depthFromFrontMm)
    const capDepth = spec.sizeMm * (spec.aspect ?? 0.42)
    // 4mm of travel-height: enough to catch the key light along its top edge
    // and read as a moulded key, not a decal printed on the deck.
    const capThickness = 4

    return (
      <mesh
        name={spec.mesh}
        geometry={topCapGeometry(spec, capDepth, capThickness)}
        position={[xMm * MM, deckY, worldZFromFront(entry, depthFromFrontMm)]}
        castShadow
      >
        <meshStandardMaterial color={color} roughness={0.42} />
      </mesh>
    )
  }

  const frontZ = frontSurfaceZ(entry, form, spec.position[0], spec.position[1])
  const position: [number, number, number] = [spec.position[0] * MM, spec.position[1] * MM, frontZ]

  // Thin dimension is Z for every shape below — how far it pokes out of the
  // front face — with width/height of the visible face on X/Y. An earlier
  // draft sized these as if lying flat on a top surface (thin on Y instead of
  // Z), which put every control's visible face pointing the wrong way.
  switch (spec.kind) {
    case 'slider':
      return (
        <mesh name={spec.mesh} position={position} castShadow>
          <boxGeometry args={[size, size * (spec.aspect ?? 0.42), 0.006]} />
          <meshStandardMaterial color={color} roughness={0.4} />
        </mesh>
      )
    case 'round-button':
      return (
        <mesh name={spec.mesh} position={position} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[size / 2, size / 2, 0.005, 20]} />
          <meshStandardMaterial color={color} roughness={0.45} />
        </mesh>
      )
    case 'lever':
      return (
        <mesh name={spec.mesh} position={position} castShadow>
          <boxGeometry args={[size, size * (spec.aspect ?? 0.36), 0.006]} />
          {/* Matte: a lever is a large flat face, and a specular hit across it
              reads as a printed label rather than a moulded part. */}
          <meshStandardMaterial color={color} roughness={0.78} />
        </mesh>
      )
    case 'toggle':
      return (
        <mesh name={spec.mesh} position={position} castShadow>
          <boxGeometry args={[size * 0.3, size, size * 0.18]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
      )
    case 'jewel':
      return (
        <mesh name={spec.mesh} position={position} rotation={[Math.PI / 2, 0, 0]}>
          <sphereGeometry args={[size / 2, 16, 12]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.4}
            roughness={0.2}
            toneMapped={false}
          />
        </mesh>
      )
    case 'touch':
      // A PlaneGeometry already faces +Z by default — exactly outward from
      // the front face — so unlike the top-facing shapes above, this one
      // needs no rotation at all.
      return (
        <mesh name={spec.mesh} position={position}>
          <planeGeometry args={[size, size * 0.6]} />
          <meshStandardMaterial color={color} roughness={0.15} metalness={0.1} />
        </mesh>
      )
    case 'rect-button':
    default:
      return (
        <mesh name={spec.mesh} position={position} castShadow>
          <boxGeometry args={[size, size * (spec.aspect ?? 0.6), 0.005]} />
          <meshStandardMaterial color={color} roughness={0.45} />
        </mesh>
      )
  }
}

/** Recessed slot opening for a top-mounted cartridge/disc intake. */
function TopSlot({
  entry,
  form,
}: {
  entry: ConsoleEntry
  form: ConsoleForm
}) {
  if (form.intake.kind !== 'top-slot' && form.intake.kind !== 'top-lid') return null

  const { position, widthMm, heightMm } = form.intake
  // The deck height *at the slot's own depth*, not the shell's maximum. The
  // two agree on a flat rear deck and diverge the moment an intake sits
  // anywhere on a slope — reading the profile means the opening tracks the
  // surface it belongs to instead of hovering at the tallest point.
  const shellTop =
    form.shell.kind === 'swept' ? deckSurfaceY(form, position[1]) : entry.dimensions.height * MM

  // The mesh name comes from animatedParts, not a literal here — that field
  // is the actual contract the insert sequence and GLB swap depend on, and a
  // form-kit test caught exactly this drifting once already (animatedParts
  // said "cart_slot"; this used to say "slot").
  const slotMeshName = entry.animatedParts.slot ?? entry.animatedParts.tray ?? 'slot'

  return (
    <group position={[position[0] * MM, shellTop, worldZFromFront(entry, position[1])]}>
      {/*
        A shallow moulded surround, standing 0.8mm off the deck, so the opening
        reads as a bay cut into the shell rather than a dark rectangle painted
        on it. Drawn first; the opening then sits on top of it.
      */}
      <mesh position={[0, 0.0004, 0]} castShadow receiveShadow>
        <boxGeometry args={[widthMm * MM + 0.005, 0.0008, heightMm * MM + 0.005]} />
        <meshStandardMaterial color={form.palette.shell} roughness={0.7} />
      </mesh>
      {/*
        The opening. This used to sit 1mm *below* the deck, which put it inside
        the shell where nothing could ever see it — the cartridge bay, the one
        feature that makes a cartridge console read as a cartridge console, was
        silently absent from every render.
      */}
      <mesh
        name={slotMeshName}
        position={[0, 0.00085, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[widthMm * MM, heightMm * MM]} />
        <meshStandardMaterial color="#141312" roughness={0.9} />
      </mesh>
    </group>
  )
}

export function ConsoleFromForm({
  entry,
  form,
  yellowing = 0,
}: {
  entry: ConsoleEntry
  form: ConsoleForm
  /** 0 = fresh, 1 = fully yellowed — the `yellowing` failure state. */
  yellowing?: number
}) {
  const geometry = useMemo(() => shellGeometry(entry, form), [entry, form])

  const material = useMemo(
    () =>
      plasticMaterial({
        id: `console:${entry.id}`,
        color: form.palette.shell,
        roughness: 0.58,
        seamAtV: 0.5,
        yellowing,
      }),
    [entry.id, form.palette.shell, yellowing],
  )

  // Vent rows and the LED sit on the shell's highest surface — bevel included,
  // for the same reason every other fixture needs it.
  const shellTop =
    form.shell.kind === 'swept'
      ? (Math.max(...form.shell.profile.map(([, h]) => h)) + surfaceOffsetMm(form)) * MM
      : entry.dimensions.height * MM

  return (
    <group>
      <mesh geometry={geometry} material={material} castShadow receiveShadow />

      <TopSlot entry={entry} form={form} />

      {/* Relief blocks first: controls and ports mount against them. */}
      {(form.reliefs ?? []).map((r, i) => (
        <Relief
          key={r.mesh ?? `relief-${i}`}
          entry={entry}
          form={form}
          spec={r}
          material={material}
        />
      ))}

      {form.controls.map((c) => (
        <Control key={c.mesh} spec={c} entry={entry} form={form} />
      ))}

      {/* Ports sit on the front face, recessed a hair so they read as cut in. */}
      {form.ports.map((p) => (
        <mesh
          key={p.mesh}
          name={p.mesh}
          position={[
            p.position[0] * MM,
            p.position[1] * MM,
            frontSurfaceZ(entry, form, p.position[0], p.position[1]) - 0.001,
          ]}
        >
          <boxGeometry args={[p.widthMm * MM, p.heightMm * MM, 0.003]} />
          <meshStandardMaterial color="#141312" roughness={0.85} />
        </mesh>
      ))}

      {form.vents.map((v, i) => (
        <VentRow key={i} entry={entry} spec={v} originY={shellTop} />
      ))}

      <mesh name="power_led" position={[-entry.dimensions.width * MM * 0.42, shellTop * 0.5, 0]}>
        <circleGeometry args={[0.0032, 16]} />
        <meshStandardMaterial
          color="#8c1d1d"
          emissive="#ff2d2d"
          emissiveIntensity={0}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

/** Exposed for tests that need to assert on shape construction without a full render. */
export { shapeFromPoints, addRectHole }
