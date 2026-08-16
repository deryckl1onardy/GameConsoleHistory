import { useMemo } from 'react'
import * as THREE from 'three'
import type { Controller, ControllerButton, ControllerForm } from '@/types/console'
import { MM, sweepPlanVertically } from '../geometry/profiles'
import { plasticMaterial } from '../materials/plastic'

/**
 * Renders a controller from a ControllerForm plus the button list already
 * living on `Controller.buttons` — the plan outline and thickness come from
 * the form; each button's position and shape come from the data that already
 * existed for the anatomy mode (`mesh`, `label`, `key`, `travel`), now
 * extended with `position` and `shape`.
 *
 * Buttons without a `position` (not yet migrated to the data-driven form) are
 * skipped rather than guessed at — a missing button is an obvious gap; a
 * wrongly-placed one is a subtle, misleading bug.
 */

const geometryCache = new Map<string, THREE.BufferGeometry>()

function shellGeometry(controllerId: string, form: ControllerForm): THREE.BufferGeometry {
  const cached = geometryCache.get(controllerId)
  if (cached) return cached
  const geometry = sweepPlanVertically(form.plan, form.thicknessMm, {
    bevelMm: form.bevelMm,
    curveSegments: 8,
  })
  geometryCache.set(controllerId, geometry)
  return geometry
}

/** Shape-appropriate geometry for one button, built from ButtonShape. */
function ButtonMesh({ button, form }: { button: ControllerButton; form: ControllerForm }) {
  if (!button.position || !button.shape) return null

  const size = (button.sizeMm ?? 12) * MM
  const [x, z] = button.position
  // The bevel grows the shell by `bevelMm` at BOTH ends of the sweep, so a pad
  // authored 25mm thick is really 28mm tall. Placing buttons at the authored
  // thickness put every low-profile cap — the d-pad cross, both concave face
  // buttons, select and start — *inside* the shell, where they rendered as
  // nothing at all. Only the tall convex domes poked out far enough to survive,
  // which is why the pad read as two purple pills on a blank slab.
  const top = (form.thicknessMm + 2 * form.bevelMm) * MM + form.domeMm * MM * 0.4
  // Convex and concave are deliberately different colours when the data
  // provides accent2 — on the SNES pad this is the whole visible difference
  // between A/B (purple) and X/Y (lavender), which a single accent colour
  // would silently erase even though both shapes render correctly.
  const color =
    button.shape === 'convex'
      ? form.palette.accent
      : button.shape === 'concave'
        ? (form.palette.accent2 ?? form.palette.accent)
        : form.palette.dark
  const position: [number, number, number] = [x * MM, top, z * MM]

  switch (button.shape) {
    case 'convex':
      // A shallow dome sitting proud of the shell — the shape a thumb finds
      // by feel and reads as "primary action" without looking.
      return (
        <mesh name={button.mesh} position={position} castShadow>
          <sphereGeometry
            args={[size / 2, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2.6]}
          />
          <meshStandardMaterial color={color} roughness={0.4} />
        </mesh>
      )
    case 'concave':
      // A dished disc — the shape that reads as "secondary" beside a convex
      // neighbour. The dish is a thin inverted cap set into the top.
      return (
        <group position={position}>
          <mesh name={button.mesh} castShadow>
            <cylinderGeometry args={[size / 2, size / 2, 0.0026, 20]} />
            <meshStandardMaterial color={color} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.0016, 0]} rotation={[Math.PI, 0, 0]}>
            <sphereGeometry args={[size * 0.47, 16, 8, 0, Math.PI * 2, 0, Math.PI / 3.2]} />
            <meshStandardMaterial color={color} roughness={0.55} side={THREE.BackSide} />
          </mesh>
        </group>
      )
    case 'cross':
      // A D-pad: two crossed bars, one mesh under one name — pressing any
      // direction depresses the same physical part, which matches hardware.
      return (
        <group name={button.mesh} position={position}>
          <mesh castShadow>
            <boxGeometry args={[size, 0.0034, size * 0.34]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>
          <mesh castShadow>
            <boxGeometry args={[size * 0.34, 0.0034, size]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>
        </group>
      )
    case 'capsule':
      return (
        <mesh
          name={button.mesh}
          position={position}
          rotation={[0, 0, -0.32]}
          castShadow
        >
          <capsuleGeometry args={[size * 0.32, size * 0.62, 4, 8]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
      )
    case 'shoulder':
      return (
        <mesh
          name={button.mesh}
          position={[x * MM, form.thicknessMm * MM * 0.55, z * MM]}
          castShadow
        >
          <boxGeometry args={[size, form.thicknessMm * MM * 0.7, size * 0.42]} />
          <meshStandardMaterial color={form.palette.shell} roughness={0.55} />
        </mesh>
      )
    case 'trigger':
      return (
        <mesh
          name={button.mesh}
          position={[x * MM, form.thicknessMm * MM * 0.4, z * MM]}
          rotation={[0.5, 0, 0]}
          castShadow
        >
          <boxGeometry args={[size, size * 0.5, size * 0.22]} />
          <meshStandardMaterial color={form.palette.dark} roughness={0.5} />
        </mesh>
      )
    case 'stick':
      return (
        <mesh name={button.mesh} position={position} castShadow>
          <cylinderGeometry args={[size * 0.4, size * 0.32, size * 0.5, 16]} />
          <meshStandardMaterial color={form.palette.dark} roughness={0.5} />
        </mesh>
      )
    case 'flat':
    default:
      return (
        <mesh name={button.mesh} position={position} castShadow>
          <cylinderGeometry args={[size / 2, size / 2, 0.0026, 20]} />
          <meshStandardMaterial color={color} roughness={0.55} />
        </mesh>
      )
  }
}

export function ControllerFromForm({
  controller,
  form,
}: {
  controller: Controller
  form: ControllerForm
}) {
  const geometry = useMemo(
    () => shellGeometry(controller.id, form),
    [controller.id, form],
  )

  const material = useMemo(
    () =>
      plasticMaterial({
        id: `controller:${controller.id}`,
        color: form.palette.shell,
        roughness: 0.6,
        seamAtV: null,
      }),
    [controller.id, form.palette.shell],
  )

  const positioned = controller.buttons.filter((b) => b.position && b.shape)

  // A d-pad is four inputs on ONE moulded cross: only the first carries the
  // position and shape, and its siblings name the same `mesh` deliberately.
  // Counting those as gaps warned about every pad on the roster and buried
  // the real cases — a button with no cap and no positioned sibling to
  // stand in for it, like the 2600 stick's lone fire button.
  const drawnMeshes = new Set(positioned.map((b) => b.mesh))
  const unrepresented = controller.buttons.filter(
    (b) => !(b.position && b.shape) && !drawnMeshes.has(b.mesh),
  )
  if (unrepresented.length > 0 && import.meta.env.DEV) {
    console.warn(
      `[ControllerFromForm] ${controller.id}: ${unrepresented.length} button(s) with no cap and no ` +
        `positioned sibling (${unrepresented.map((b) => b.id).join(', ')}) — skipped rather than guessed.`,
    )
  }

  return (
    <group>
      <mesh geometry={geometry} material={material} castShadow receiveShadow />
      {positioned.map((b) => (
        <ButtonMesh key={b.id} button={b} form={form} />
      ))}
    </group>
  )
}
