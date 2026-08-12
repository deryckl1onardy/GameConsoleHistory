import { useMemo } from 'react'
import type { ConsoleEntry, MediaArchetypeId } from '@/types/console'
import { archetype as getArchetype, MM } from '@/data/kits/media-archetypes'
import { layoutShelf, shelfMetrics } from './geometry/gameBox'
import { GameBox } from './GameBox'
import { useScene } from '@/store/scene'

/**
 * The console's ten best-selling games, as physical objects on a shelf.
 *
 * Layout is computed from the archetype's real dimensions, so SNES cartridges
 * (136mm) and PS1 jewel cases (125mm) both fall out of the same call with no
 * per-console tuning — packing is purely a function of published width.
 */

/** Usable interior width of the bookshelf prop, in mm. */
const SHELF_INNER_WIDTH_MM = 760

export function GameShelf({
  entry,
  archetypeId,
  position,
  rotation = [0, 0, 0],
}: {
  entry: ConsoleEntry
  archetypeId: MediaArchetypeId
  position: [number, number, number]
  rotation?: [number, number, number]
}) {
  const archetype = getArchetype(archetypeId)
  const selectedRank = useScene((s) => s.selectedGameRank)
  const selectGame = useScene((s) => s.selectGame)

  const { slots, metrics } = useMemo(() => {
    const options = {
      archetype,
      count: entry.games.length,
      shelfWidthMm: SHELF_INNER_WIDTH_MM,
    }
    return { slots: layoutShelf(options), metrics: shelfMetrics(options) }
  }, [archetype, entry.games.length])

  const rowPitch = metrics.rowPitchMm * MM
  const boxHeight = archetype.dimensions.height * MM
  const boxDepth = archetype.dimensions.depth * MM

  return (
    <group position={position} rotation={rotation}>
      {slots.map((slot) => {
        const game = entry.games[slot.index]
        return (
          <GameBox
            key={game.rank}
            game={game}
            archetype={archetype}
            position={slot.position}
            selected={selectedRank === game.rank}
            onSelect={selectGame}
          />
        )
      })}

      <ShelfUnit
        rows={metrics.rows}
        rowPitch={rowPitch}
        boxHeight={boxHeight}
        boxDepth={boxDepth}
        // Local-space Y of the floor, so the carcass stands on it instead of
        // hovering at the height of the first row.
        floorY={-position[1]}
      />
    </group>
  )
}

/** Board thickness and side-panel thickness, in mm. */
const BOARD_MM = 18
const DEPTH_MM = 300

/**
 * An open-front shelving unit: back panel, two sides, and a board under each
 * occupied row. Open-front matters — a solid cabinet box would enclose the
 * cartridges standing inside it and hide the entire collection.
 */
function ShelfUnit({
  rows,
  rowPitch,
  boxHeight,
  boxDepth,
  floorY,
}: {
  rows: number
  rowPitch: number
  boxHeight: number
  boxDepth: number
  floorY: number
}) {
  const board = BOARD_MM * MM
  const depth = DEPTH_MM * MM
  const innerW = SHELF_INNER_WIDTH_MM * MM
  const outerW = innerW + board * 2

  // The carcass runs from the floor to just above the top row. The space below
  // the first row of games becomes an empty lower shelf, which is what a real
  // bookshelf looks like and stops the unit reading as floating.
  const bottom = floorY
  const top = (rows - 1) * rowPitch + boxHeight / 2 + board * 1.6
  const height = top - bottom
  const midY = bottom + height / 2

  // Boxes stand at z = 0, so push the carcass back to sit behind them.
  const z = -depth / 2 + boxDepth / 2 + 0.004

  const wood = { color: '#8a6440', roughness: 0.72 }

  return (
    <group position={[0, 0, z]}>
      {/* Back panel */}
      <mesh position={[0, midY, -depth / 2 + board / 2]} receiveShadow castShadow>
        <boxGeometry args={[outerW, height, board]} />
        <meshStandardMaterial {...wood} />
      </mesh>

      {/* Sides */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * (innerW / 2 + board / 2), midY, 0]}
          receiveShadow
          castShadow
        >
          <boxGeometry args={[board, height, depth]} />
          <meshStandardMaterial {...wood} />
        </mesh>
      ))}

      {/* One board under each occupied row */}
      {Array.from({ length: rows }, (_, row) => (
        <mesh
          key={row}
          position={[0, row * rowPitch - boxHeight / 2 - board / 2, 0]}
          receiveShadow
          castShadow
        >
          <boxGeometry args={[innerW, board, depth]} />
          <meshStandardMaterial {...wood} />
        </mesh>
      ))}
    </group>
  )
}
