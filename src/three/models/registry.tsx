import { useEffect, useMemo } from 'react'
import { BoxGeometry, EdgesGeometry } from 'three'
import type { ConsoleEntry, Controller, DimensionsMm } from '@/types/console'
import { consoleForm } from '@/data/kits/console-forms'
import { controllerForm } from '@/data/kits/controller-forms'
import { ConsoleFromForm } from './ConsoleFromForm'
import { ControllerFromForm } from './ControllerFromForm'
import { GltfOrFallback } from './GltfModel'
import { GLTF_TRANSFORMS } from './gltf-transforms'
import { boxArgsMm } from '../lighting'

/**
 * Hero-model registry — four tiers, checked in order:
 *
 *   0. A dropped-in GLB at the conventional path (`/models/consoles/<id>.glb`,
 *      `/models/controllers/<id>.glb`) — see public/models/README.md. Checked
 *      at runtime, not registered by hand: paste a file in and it appears,
 *      with zero code changes, for any id already in the roster. Missing
 *      file is not an error — it just falls through to tier 1.
 *   1. Bespoke override, keyed by the path in the data (`entry.model`,
 *      `controller.model`). For consoles a swept profile cannot express —
 *      GameCube's handle, Xbox 360's waist, PS5's fins, the Switch's dock.
 *   2. Generic form-based render, keyed by id, from console-forms.ts /
 *      controller-forms.ts. Where roughly 16 of the ~22-console roster lives:
 *      a new console is a form spec, not a component.
 *   3. A correctly sized grey block, so a half-populated roster still lays
 *      out properly instead of a console disappearing outright.
 *
 * Tiers 1-3 are themselves passed to tier 0 as the fallback, so a missing
 * GLB is invisible — everything below behaves exactly as it did before this
 * tier existed.
 */

const CONSOLE_MODELS: Record<string, (props: { entry: ConsoleEntry }) => React.JSX.Element> = {
  // Bespoke consoles land here once built: GameCube, Xbox 360, PS5, Switch.
}

const CONTROLLER_MODELS: Record<
  string,
  (props: { controller: Controller }) => React.JSX.Element
> = {}

/** Correctly proportioned placeholder for hardware not yet modelled. */
function Block({
  dimensions,
  color = '#b9b7b2',
}: {
  dimensions: DimensionsMm
  color?: string
}) {
  const [w, h, d] = boxArgsMm(dimensions)
  return (
    <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial color={color} roughness={0.55} />
    </mesh>
  )
}

/**
 * Shown while a real model downloads — deliberately NOT `Block`.
 *
 * `Block` means "this hardware has no model yet" and is shaded as a solid
 * object, so using it here would state something false about a console whose
 * model is seconds away, and read as the finished thing. This states what is
 * actually true mid-download: the measured volume the object will occupy, and
 * nothing more. Edges over a near-transparent fill, unlit and shadowless so it
 * never reads as a surface, in tones taken from the room's own warm light
 * rather than an accent colour.
 */
function LoadingVolume({ dimensions }: { dimensions: DimensionsMm }) {
  const [w, h, d] = boxArgsMm(dimensions)

  const { volume, edges } = useMemo(() => {
    const volume = new BoxGeometry(w, h, d)
    return { volume, edges: new EdgesGeometry(volume) }
  }, [w, h, d])

  // Both geometries are constructed here rather than by a <boxGeometry> tag,
  // so disposal is ours to do — R3F only auto-disposes what it created.
  useEffect(
    () => () => {
      volume.dispose()
      edges.dispose()
    },
    [volume, edges],
  )

  return (
    <group position={[0, h / 2, 0]}>
      <mesh geometry={volume}>
        <meshBasicMaterial color="#8a7f72" transparent opacity={0.07} depthWrite={false} />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color="#c0b3a1" transparent opacity={0.5} depthWrite={false} />
      </lineSegments>
    </group>
  )
}

export function ConsoleModel({
  entry,
  position,
  rotation,
}: {
  entry: ConsoleEntry
  position: [number, number, number]
  rotation?: [number, number, number]
}) {
  const Bespoke = CONSOLE_MODELS[entry.model]
  const form = consoleForm(entry.id)
  const fallback = Bespoke ? (
    <Bespoke entry={entry} />
  ) : form ? (
    <ConsoleFromForm entry={entry} form={form} />
  ) : (
    <Block dimensions={entry.dimensions} />
  )

  // An entry here is proof the file exists: each scale was derived by
  // measuring that specific GLB's bounding box. Treating the table as the
  // manifest takes the console models off the HEAD-probe path entirely — that
  // probe is a discovery mechanism for uncatalogued files, and too flaky to
  // gate models we already know about (an aborted HEAD rejects, and silently
  // downgraded a console that serves perfectly well).
  const transform = GLTF_TRANSFORMS[entry.id]

  return (
    <group position={position} rotation={rotation ?? [0, 0, 0]}>
      <GltfOrFallback
        url={`/models/consoles/${entry.id}.glb`}
        fallback={fallback}
        loading={<LoadingVolume dimensions={entry.dimensions} />}
        known={Boolean(transform)}
        scale={transform?.scale}
        hideMeshIndices={transform?.hideMeshIndices}
      />
    </group>
  )
}

export function ControllerModel({
  controller,
  position,
  rotation,
}: {
  controller: Controller
  position: [number, number, number]
  rotation?: [number, number, number]
}) {
  const Bespoke = CONTROLLER_MODELS[controller.model]
  const form = controllerForm(controller.id)
  const fallback = Bespoke ? (
    <Bespoke controller={controller} />
  ) : form ? (
    <ControllerFromForm controller={controller} form={form} />
  ) : (
    <Block dimensions={controller.dimensions} color="#c9c6bc" />
  )

  // No `known` here: public/models/controllers/ is empty, so every controller
  // is legitimately a HEAD-discovered drop-in. There is no controller
  // equivalent of GLTF_TRANSFORMS to serve as a manifest yet — one belongs
  // here the day the first pad model lands.
  return (
    <group position={position} rotation={rotation ?? [0, 0, 0]}>
      <GltfOrFallback
        url={`/models/controllers/${controller.id}.glb`}
        fallback={fallback}
        loading={<LoadingVolume dimensions={controller.dimensions} />}
      />
    </group>
  )
}
