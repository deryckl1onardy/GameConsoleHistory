import { useMemo, useState } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import type { Game, MediaArchetype } from '@/types/console'
import { boxSizeMetres, coverAspect, labelPlane } from './geometry/gameBox'
import { placeholderCover } from './covers'
import { MM } from '@/data/kits/media-archetypes'

/**
 * One physical game box, at true published dimensions.
 *
 * Cartridges and cases collapse to the same construction: a plain shell plus a
 * printed plane sitting proud of the front face. For a cartridge that plane is
 * the label sticker at its real size; for a case it covers the whole face. Two
 * draw calls either way, and no six-material atlas to author.
 *
 * This component is the entire reason the roster scales: ~220 games across 22
 * consoles need ~10 archetype entries and one texture each, not 220 models.
 */

const SHELL = {
  cartridge: { color: '#8d8b86', roughness: 0.62, metalness: 0 },
  optical: { color: '#1d1c1f', roughness: 0.32, metalness: 0 },
  card: { color: '#c8382f', roughness: 0.4, metalness: 0 },
} as const

export type GameBoxProps = {
  game: Game
  archetype: MediaArchetype
  position: [number, number, number]
  rotation?: [number, number, number]
  selected?: boolean
  onSelect?: (rank: number) => void
}

export function GameBox({
  game,
  archetype,
  position,
  rotation = [0, 0, 0],
  selected = false,
  onSelect,
}: GameBoxProps) {
  const [hovered, setHovered] = useState(false)

  const [w, h, d] = useMemo(() => boxSizeMetres(archetype), [archetype])
  const label = useMemo(() => labelPlane(archetype), [archetype])
  const shell = SHELL[archetype.kind]

  const cover = useMemo(
    () => placeholderCover({ game, archetype, aspect: coverAspect(archetype) }),
    [game, archetype],
  )

  // Cases print edge to edge, so the printed plane is the full front face.
  const print = label ?? {
    width: w,
    height: h,
    position: [0, 0, d / 2 + 0.15 * MM] as [number, number, number],
  }

  const lift = selected ? 0.05 : hovered ? 0.012 : 0

  const stop = (e: ThreeEvent<PointerEvent>) => e.stopPropagation()

  return (
    <group
      position={[position[0], position[1] + lift, position[2]]}
      rotation={rotation}
      onPointerOver={(e) => {
        stop(e)
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={(e) => {
        stop(e)
        setHovered(false)
        document.body.style.cursor = ''
      }}
      onClick={(e) => {
        e.stopPropagation()
        onSelect?.(game.rank)
      }}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color={shell.color}
          roughness={shell.roughness}
          metalness={shell.metalness}
        />
      </mesh>

      <mesh position={print.position}>
        <planeGeometry args={[print.width, print.height]} />
        <meshStandardMaterial
          map={cover}
          roughness={archetype.kind === 'cartridge' ? 0.85 : 0.28}
          emissive={selected || hovered ? '#ffffff' : '#000000'}
          emissiveIntensity={selected ? 0.14 : hovered ? 0.06 : 0}
        />
      </mesh>
    </group>
  )
}
