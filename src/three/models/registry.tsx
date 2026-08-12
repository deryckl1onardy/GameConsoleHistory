import type { ConsoleEntry, Controller } from '@/types/console'
import { consoleForm } from '@/data/kits/console-forms'
import { controllerForm } from '@/data/kits/controller-forms'
import { ConsoleFromForm } from './ConsoleFromForm'
import { ControllerFromForm } from './ControllerFromForm'
import { boxArgsMm } from '../lighting'

/**
 * Hero-model registry — three tiers, checked in order:
 *
 *   1. Bespoke override, keyed by the path in the data (`entry.model`,
 *      `controller.model`). For consoles a swept profile cannot express —
 *      GameCube's handle, Xbox 360's waist, PS5's fins, the Switch's dock —
 *      and for a real GLB once one exists to replace a form.
 *   2. Generic form-based render, keyed by id, from console-forms.ts /
 *      controller-forms.ts. Where roughly 16 of the ~22-console roster lives:
 *      a new console is a form spec, not a component.
 *   3. A correctly sized grey block, so a half-populated roster still lays
 *      out properly instead of a console disappearing outright.
 *
 * A real GLB replacing a form is a one-line change: register it in the
 * override map at step 1 and delete the form spec, or leave both — the
 * override always wins.
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
  dimensions: { width: number; height: number; depth: number }
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

  return (
    <group position={position} rotation={rotation ?? [0, 0, 0]}>
      {Bespoke ? (
        <Bespoke entry={entry} />
      ) : form ? (
        <ConsoleFromForm entry={entry} form={form} />
      ) : (
        <Block dimensions={entry.dimensions} />
      )}
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

  return (
    <group position={position} rotation={rotation ?? [0, 0, 0]}>
      {Bespoke ? (
        <Bespoke controller={controller} />
      ) : form ? (
        <ControllerFromForm controller={controller} form={form} />
      ) : (
        <Block dimensions={controller.dimensions} color="#c9c6bc" />
      )}
    </group>
  )
}
