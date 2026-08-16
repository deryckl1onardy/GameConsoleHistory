import type { ConsoleEntry, Generation } from '@/types/console'
import { atari2600 } from './atari-2600'
import { nes } from './nes'
import { masterSystem } from './master-system'
import { genesis } from './genesis'
import { snes } from './snes'
import { saturn } from './saturn'
import { playstation } from './playstation'
import { n64 } from './n64'
import { dreamcast } from './dreamcast'
import { ps2 } from './ps2'
import { xbox } from './xbox'
import { gamecube } from './gamecube'
import { ps3 } from './ps3'
import { ps4 } from './ps4'
import { ps5 } from './ps5'

/**
 * The roster. Adding a console means adding a data file and one line here —
 * that is the whole scaling contract.
 *
 * Target roster (~22 mainline home consoles), in release order:
 *   gen 2  Atari 2600 ✅
 *   gen 3  NES ✅, Master System ✅
 *   gen 4  Genesis ✅, SNES ✅
 *   gen 5  Saturn ✅, PlayStation ✅, Nintendo 64 ✅
 *   gen 6  Dreamcast ✅, PlayStation 2 ✅, Xbox ✅, GameCube ✅
 *   gen 7  Xbox 360, PlayStation 3 ✅, Wii
 *   gen 8  Wii U, PlayStation 4 ✅, Xbox One, Switch
 *   gen 9  PlayStation 5 ✅, Xbox Series X|S, Switch 2
 */
export const CONSOLES: ConsoleEntry[] = [
  atari2600,
  nes,
  masterSystem,
  genesis,
  snes,
  saturn,
  playstation,
  n64,
  dreamcast,
  ps2,
  xbox,
  gamecube,
  ps3,
  ps4,
  ps5,
]

export const CONSOLES_BY_ID = new Map(CONSOLES.map((c) => [c.id, c]))

export function getConsole(id: string): ConsoleEntry | undefined {
  return CONSOLES_BY_ID.get(id)
}

/** Release year used for timeline placement — earliest regional release. */
export function releaseYear(entry: ConsoleEntry): number {
  const dates = Object.values(entry.released).filter(Boolean) as string[]
  return Math.min(...dates.map((d) => new Date(d).getFullYear()))
}

export function byGeneration(): Map<Generation, ConsoleEntry[]> {
  const out = new Map<Generation, ConsoleEntry[]>()
  for (const c of CONSOLES) {
    const list = out.get(c.generation) ?? []
    list.push(c)
    out.set(c.generation, list)
  }
  return out
}

export {
  atari2600,
  nes,
  masterSystem,
  genesis,
  snes,
  saturn,
  playstation,
  n64,
  dreamcast,
  ps2,
  xbox,
  gamecube,
  ps3,
  ps4,
  ps5,
}
