import { useMemo } from 'react'
import type { ConsoleEntry, MediaArchetypeId } from '@/types/console'
import { archetype as getArchetype } from '@/data/kits/media-archetypes'
import { layoutSpread, MEDIA_SPREAD_RANKS } from './geometry/gameBox'
import { GameBox } from './GameBox'
import { useScene } from '@/store/scene'

/**
 * The selected game, standing on the same floor the console stands on — ONE
 * box at a time.
 *
 * This replaces GameShelf.tsx's wooden bookshelf. Cases and cartridges stand
 * up unaided, so no furniture is needed to show them honestly. The full
 * ten-box spread was tried in the games section and read as a mess next to
 * the artifact view; the current design is a single subject: only the
 * selected game's box exists, and the artifact camera centres on exactly it
 * (shots.ts's artifactShotFor aims at this same slot position, so camera and
 * contents cannot disagree). When nothing is selected nothing renders.
 *
 * The box still sits at its spread-slot position, derived from the
 * archetype's real dimensions — the same layout the library/artifact shots
 * frame, so the camera math stays exact with no per-console tuning.
 */
export function MediaSpread({
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

  const slots = useMemo(
    () => layoutSpread({ archetype, count: entry.games.length, ranks: MEDIA_SPREAD_RANKS }),
    [archetype, entry.games.length],
  )

  if (selectedRank === null) return null
  const game = entry.games.find((g) => g.rank === selectedRank)
  const slot = slots.find((s) => entry.games[s.index].rank === selectedRank)
  if (!game || !slot) return null

  return (
    <group position={position} rotation={rotation}>
      <GameBox
        game={game}
        archetype={archetype}
        consoleId={entry.id}
        position={slot.position}
        rotation={slot.rotation}
        selected
        onSelect={selectGame}
      />
    </group>
  )
}
