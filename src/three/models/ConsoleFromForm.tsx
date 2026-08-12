import { useMemo } from 'react'
import * as THREE from 'three'
import type { ConsoleEntry, ConsoleForm, ControlSpec } from '@/types/console'
import { addRectHole, MM, shapeFromPoints, sweepProfileAlongX } from '../geometry/profiles'
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
  palette,
  frontZ,
}: {
  spec: ControlSpec
  palette: ConsoleForm['palette']
  frontZ: number
}) {
  const size = spec.sizeMm * MM
  const color = spec.color === 'accent' ? palette.accent : spec.color === 'dark' ? palette.dark : palette.shell
  const position: [number, number, number] = [spec.position[0] * MM, spec.position[1] * MM, frontZ]

  // Thin dimension is Z for every shape below — how far it pokes out of the
  // front face — with width/height of the visible face on X/Y. An earlier
  // draft sized these as if lying flat on a top surface (thin on Y instead of
  // Z), which put every control's visible face pointing the wrong way.
  switch (spec.kind) {
    case 'slider':
      return (
        <mesh name={spec.mesh} position={position} castShadow>
          <boxGeometry args={[size, size * 0.42, 0.006]} />
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
          <boxGeometry args={[size, size * 0.36, 0.006]} />
          <meshStandardMaterial color={color} roughness={0.5} />
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
          <boxGeometry args={[size, size * 0.6, 0.005]} />
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
  // The slot sits at the shell's full height at this depth — approximated as
  // the profile's max height, which is accurate for any profile whose rear
  // deck is flat (true for every tier-1 console so far).
  const shellTop =
    form.shell.kind === 'swept'
      ? Math.max(...form.shell.profile.map(([, h]) => h)) * MM
      : entry.dimensions.height * MM

  // The mesh name comes from animatedParts, not a literal here — that field
  // is the actual contract the insert sequence and GLB swap depend on, and a
  // form-kit test caught exactly this drifting once already (animatedParts
  // said "cart_slot"; this used to say "slot").
  const slotMeshName = entry.animatedParts.slot ?? entry.animatedParts.tray ?? 'slot'

  return (
    <group position={[position[0] * MM, shellTop, worldZFromFront(entry, position[1])]}>
      <mesh name={slotMeshName} position={[0, -0.001, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[widthMm * MM, heightMm * MM]} />
        <meshStandardMaterial color="#141312" roughness={0.85} />
      </mesh>
      {/* A shallow rim so the opening reads as recessed, not painted on. */}
      <mesh position={[0, -0.0005, 0]}>
        <boxGeometry args={[widthMm * MM + 0.004, 0.001, heightMm * MM + 0.004]} />
        <meshStandardMaterial color="#242220" roughness={0.7} />
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

  const shellTop =
    form.shell.kind === 'swept'
      ? Math.max(...form.shell.profile.map(([, h]) => h)) * MM
      : entry.dimensions.height * MM

  return (
    <group>
      <mesh geometry={geometry} material={material} castShadow receiveShadow />

      <TopSlot entry={entry} form={form} />

      {form.controls.map((c) => (
        <Control
          key={c.mesh}
          spec={c}
          palette={form.palette}
          frontZ={entry.dimensions.depth * MM * 0.5 - 0.001}
        />
      ))}

      {/* Ports sit on the front face, recessed a hair so they read as cut in. */}
      {form.ports.map((p) => (
        <mesh
          key={p.mesh}
          name={p.mesh}
          position={[p.position[0] * MM, p.position[1] * MM, entry.dimensions.depth * MM * 0.5 - 0.001]}
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
