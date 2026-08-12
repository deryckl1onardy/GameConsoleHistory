import { useMemo } from 'react'
import type { ConsoleEntry, DioramaSpec, MediaArchetypeId, PropInstance } from '@/types/console'
import { propKit } from '@/data/kits/prop-kit'
import { boxArgsMm, kelvinToColor, mm } from './lighting'
import { GameShelf } from './GameShelf'
import { ConsoleModel, ControllerModel } from './models/registry'

/**
 * The room, built entirely from DioramaSpec. No console-specific code.
 *
 * Props render as correctly-proportioned grey boxes until a real GLB lands in
 * the kit entry's `model` field. That is deliberate: the placeholder path IS the
 * layout, so swapping in geometry later changes nothing about composition.
 *
 * The room is an open dollhouse cutaway — floor, back wall, left wall. The
 * missing walls are what make it read as a miniature set rather than an
 * interior render.
 */

const WALL_HEIGHT = 2.5
const WALL_THICKNESS = 0.08

function Prop({ instance }: { instance: PropInstance }) {
  const kit = propKit(instance.kit)

  if (!kit) {
    if (import.meta.env.DEV) console.warn(`[diorama] unknown prop kit: ${instance.kit}`)
    return null
  }

  const variant =
    kit.variants[instance.variant ?? ''] ?? Object.values(kit.variants)[0]
  const [w, h, d] = boxArgsMm(kit.dimensions)
  const scale = instance.scale ?? 1

  // 'floor' props are authored with their base on the ground, so lift by half
  // their height. 'surface' and 'wall' props are positioned explicitly.
  const yOffset = kit.anchor === 'floor' ? (h * scale) / 2 : 0

  return (
    <mesh
      position={[
        instance.position[0],
        instance.position[1] + yOffset,
        instance.position[2],
      ]}
      rotation={instance.rotation ?? [0, 0, 0]}
      scale={scale}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial
        color={variant.color}
        roughness={variant.roughness}
        metalness={variant.metalness ?? 0}
      />
    </mesh>
  )
}

function RoomShell({ footprint }: { footprint: [number, number] }) {
  const [fw, fd] = footprint

  return (
    <group>
      {/* Floor */}
      <mesh position={[0, -WALL_THICKNESS / 2, 0]} receiveShadow>
        <boxGeometry args={[fw, WALL_THICKNESS, fd]} />
        <meshStandardMaterial color="#8f7d68" roughness={0.95} />
      </mesh>

      {/* Back wall */}
      <mesh
        position={[0, WALL_HEIGHT / 2, -fd / 2 - WALL_THICKNESS / 2]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[fw + WALL_THICKNESS * 2, WALL_HEIGHT, WALL_THICKNESS]} />
        <meshStandardMaterial color="#cdbca4" roughness={0.98} />
      </mesh>

      {/* Left wall */}
      <mesh
        position={[-fw / 2 - WALL_THICKNESS / 2, WALL_HEIGHT / 2, 0]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[WALL_THICKNESS, WALL_HEIGHT, fd]} />
        <meshStandardMaterial color="#c3b199" roughness={0.98} />
      </mesh>

      {/* Baseboard, the detail that stops the walls reading as bare planes */}
      <mesh position={[0, 0.05, -fd / 2 + WALL_THICKNESS / 2]}>
        <boxGeometry args={[fw, 0.1, 0.02]} />
        <meshStandardMaterial color="#e8dfd0" roughness={0.7} />
      </mesh>
    </group>
  )
}


/** The TV cabinet at true size, with a dark screen face until phase 5. */
function TvPlaceholder({ spec }: { spec: DioramaSpec }) {
  const [w, h, d] = boxArgsMm(spec.tv.dimensions)
  const screenW = w * 0.78
  const screenH = h * 0.74

  return (
    <group position={spec.tvPosition} rotation={spec.tvRotation ?? [0, 0, 0]}>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color="#3a3733" roughness={0.6} />
      </mesh>
      {/* Screen face, recessed by the bezel inset */}
      <mesh position={[0, h / 2, d / 2 - mm(spec.tv.bezelInsetMm)]}>
        <planeGeometry args={[screenW, screenH]} />
        <meshStandardMaterial color="#0d0f10" roughness={0.18} />
      </mesh>
    </group>
  )
}

export function Diorama({
  entry,
  spec,
  archetypeId,
}: {
  entry: ConsoleEntry
  spec: DioramaSpec
  archetypeId: MediaArchetypeId
}) {
  const keyColor = useMemo(
    () => kelvinToColor(spec.lighting.tempK),
    [spec.lighting.tempK],
  )

  return (
    <group>
      <ambientLight intensity={spec.lighting.ambientIntensity} color={keyColor} />

      {/* Key light — position and temperature come from the era preset */}
      <directionalLight
        position={spec.lighting.keyPosition}
        intensity={spec.lighting.intensity}
        color={keyColor}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      >
        <orthographicCamera attach="shadow-camera" args={[-4, 4, 4, -4, 0.1, 20]} />
      </directionalLight>

      {/* Cool bounce fill from the open side, so shadows are not dead black */}
      <directionalLight position={[-2.5, 1.6, 3]} intensity={0.35} color="#9fb6d0" />

      <RoomShell footprint={spec.footprint} />

      {spec.props.map((p, i) => (
        <Prop key={`${p.kit}-${i}`} instance={p} />
      ))}

      <TvPlaceholder spec={spec} />

      <ConsoleModel
        entry={entry}
        position={spec.consolePosition}
        rotation={spec.consoleRotation}
      />

      {entry.controllers[0] && (
        <ControllerModel
          controller={entry.controllers[0]}
          position={spec.controllerPosition}
          rotation={spec.controllerRotation}
        />
      )}

      <GameShelf
        entry={entry}
        archetypeId={archetypeId}
        position={spec.shelfPosition}
        rotation={spec.shelfRotation}
      />
    </group>
  )
}
