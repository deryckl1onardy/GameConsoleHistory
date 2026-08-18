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
import { xbox360 } from './xbox-360'
import { wii } from './wii'
import { wiiU } from './wii-u'
import { xboxOne } from './xbox-one'
import { nintendoSwitch } from './switch'
import { xboxSeries } from './xbox-series'
import { switch2 } from './switch-2'
import { ps3 } from './ps3'
import { ps4 } from './ps4'
import { ps5 } from './ps5'

/**
 * The roster. Adding a console means adding a data file and one line here —
 * that is the whole scaling contract.
 *
 * Target roster (22 mainline home consoles), in release order — all built:
 *   gen 2  Atari 2600 ✅
 *   gen 3  NES ✅, Master System ✅
 *   gen 4  Genesis ✅, SNES ✅
 *   gen 5  Saturn ✅, PlayStation ✅, Nintendo 64 ✅
 *   gen 6  Dreamcast ✅, PlayStation 2 ✅, Xbox ✅, GameCube ✅
 *   gen 7  Xbox 360 ✅, PlayStation 3 ✅, Wii ✅
 *   gen 8  Wii U ✅, PlayStation 4 ✅, Xbox One ✅, Switch ✅
 *   gen 9  PlayStation 5 ✅, Xbox Series X|S ✅, Switch 2 ✅
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
  xbox360,
  ps3,
  wii,
  wiiU,
  ps4,
  xboxOne,
  nintendoSwitch,
  ps5,
  xboxSeries,
  switch2,
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

/**
 * Whether a console matches a sidebar search query. Searches the display
 * name, the full name and the manufacturer, the same fields the old top-bar
 * search covered.
 */
export function matchesConsole(c: ConsoleEntry, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    c.shortName.toLowerCase().includes(q) ||
    c.name.toLowerCase().includes(q) ||
    c.manufacturer.toLowerCase().includes(q)
  )
}

/**
 * The sidebar's list: CONSOLES (already in release order) filtered by the
 * search query, grouped by generation with each group in release order.
 * CONSOLES is chronological and generations are contiguous in it, so a
 * single pass over the filtered roster yields ordered groups.
 */
export function sidebarGroups(query: string): { generation: Generation; consoles: ConsoleEntry[] }[] {
  const groups: { generation: Generation; consoles: ConsoleEntry[] }[] = []
  for (const c of CONSOLES) {
    if (!matchesConsole(c, query)) continue
    const last = groups[groups.length - 1]
    const group = last && last.generation === c.generation ? last : null
    if (group) {
      group.consoles.push(c)
    } else {
      groups.push({ generation: c.generation, consoles: [c] })
    }
  }
  return groups
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
  xbox360,
  ps3,
  wii,
  wiiU,
  ps4,
  xboxOne,
  nintendoSwitch,
  ps5,
  xboxSeries,
  switch2,
}
