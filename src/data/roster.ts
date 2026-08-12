import type { Generation, RosterEntry } from '@/types/console'
import { CONSOLES_BY_ID } from './consoles'

/**
 * Every mainline home console the atlas covers, built or not.
 *
 * This exists so the generation picker is real navigation from day one rather
 * than a list with a single item in it. Unbuilt consoles render dimmed and
 * unselectable — the picker doubles as a visible roadmap.
 *
 * Unit figures and release years are from Wikipedia's "List of best-selling game
 * consoles", checked rather than recalled. Handhelds are out of scope: this is
 * an atlas of living rooms.
 */

type RawRoster = Omit<RosterEntry, 'built'>

const RAW: RawRoster[] = [
  // ---- Generation 2 ----
  {
    id: 'atari-2600',
    name: 'Atari Video Computer System',
    shortName: 'Atari 2600',
    manufacturer: 'Atari',
    generation: 2,
    year: 1977,
    unitsSold: 30_000_000,
  },

  // ---- Generation 3 ----
  {
    id: 'nes',
    name: 'Nintendo Entertainment System',
    shortName: 'NES',
    manufacturer: 'Nintendo',
    generation: 3,
    year: 1983,
    unitsSold: 61_910_000,
  },
  {
    id: 'master-system',
    name: 'Sega Master System',
    shortName: 'Master System',
    manufacturer: 'Sega',
    generation: 3,
    year: 1985,
    unitsSold: 13_000_000,
  },

  // ---- Generation 4 ----
  {
    id: 'genesis',
    name: 'Sega Genesis / Mega Drive',
    shortName: 'Genesis',
    manufacturer: 'Sega',
    generation: 4,
    year: 1988,
    unitsSold: 30_750_000,
  },
  {
    id: 'snes',
    name: 'Super Nintendo Entertainment System',
    shortName: 'SNES',
    manufacturer: 'Nintendo',
    generation: 4,
    year: 1990,
    unitsSold: 49_100_000,
  },

  // ---- Generation 5 ----
  {
    id: 'saturn',
    name: 'Sega Saturn',
    shortName: 'Saturn',
    manufacturer: 'Sega',
    generation: 5,
    year: 1994,
    unitsSold: 9_260_000,
  },
  {
    id: 'playstation',
    name: 'Sony PlayStation',
    shortName: 'PlayStation',
    manufacturer: 'Sony',
    generation: 5,
    year: 1994,
    unitsSold: 102_490_000,
  },
  {
    id: 'n64',
    name: 'Nintendo 64',
    shortName: 'N64',
    manufacturer: 'Nintendo',
    generation: 5,
    year: 1996,
    unitsSold: 32_930_000,
  },

  // ---- Generation 6 ----
  {
    id: 'dreamcast',
    name: 'Sega Dreamcast',
    shortName: 'Dreamcast',
    manufacturer: 'Sega',
    generation: 6,
    year: 1998,
    unitsSold: 9_130_000,
  },
  {
    id: 'ps2',
    name: 'PlayStation 2',
    shortName: 'PS2',
    manufacturer: 'Sony',
    generation: 6,
    year: 2000,
    unitsSold: 160_000_000,
  },
  {
    id: 'xbox',
    name: 'Microsoft Xbox',
    shortName: 'Xbox',
    manufacturer: 'Microsoft',
    generation: 6,
    year: 2001,
    unitsSold: 24_000_000,
  },
  {
    id: 'gamecube',
    name: 'Nintendo GameCube',
    shortName: 'GameCube',
    manufacturer: 'Nintendo',
    generation: 6,
    year: 2001,
    unitsSold: 21_740_000,
  },

  // ---- Generation 7 ----
  {
    id: 'xbox-360',
    name: 'Xbox 360',
    shortName: 'Xbox 360',
    manufacturer: 'Microsoft',
    generation: 7,
    year: 2005,
    unitsSold: 84_000_000,
  },
  {
    id: 'ps3',
    name: 'PlayStation 3',
    shortName: 'PS3',
    manufacturer: 'Sony',
    generation: 7,
    year: 2006,
    unitsSold: 87_400_000,
  },
  {
    id: 'wii',
    name: 'Nintendo Wii',
    shortName: 'Wii',
    manufacturer: 'Nintendo',
    generation: 7,
    year: 2006,
    unitsSold: 101_630_000,
  },

  // ---- Generation 8 ----
  {
    id: 'wii-u',
    name: 'Nintendo Wii U',
    shortName: 'Wii U',
    manufacturer: 'Nintendo',
    generation: 8,
    year: 2012,
    unitsSold: 13_560_000,
  },
  {
    id: 'ps4',
    name: 'PlayStation 4',
    shortName: 'PS4',
    manufacturer: 'Sony',
    generation: 8,
    year: 2013,
    unitsSold: 117_200_000,
  },
  {
    id: 'xbox-one',
    name: 'Xbox One',
    shortName: 'Xbox One',
    manufacturer: 'Microsoft',
    generation: 8,
    year: 2013,
    unitsSold: 58_000_000,
  },
  {
    id: 'switch',
    name: 'Nintendo Switch',
    shortName: 'Switch',
    manufacturer: 'Nintendo',
    generation: 8,
    year: 2017,
    unitsSold: 156_590_000,
  },

  // ---- Generation 9 ----
  {
    id: 'ps5',
    name: 'PlayStation 5',
    shortName: 'PS5',
    manufacturer: 'Sony',
    generation: 9,
    year: 2020,
    unitsSold: 95_300_000,
  },
  {
    id: 'xbox-series',
    name: 'Xbox Series X|S',
    shortName: 'Xbox Series',
    manufacturer: 'Microsoft',
    generation: 9,
    year: 2020,
    unitsSold: 35_000_000,
  },
  {
    id: 'switch-2',
    name: 'Nintendo Switch 2',
    shortName: 'Switch 2',
    manufacturer: 'Nintendo',
    generation: 9,
    year: 2025,
    unitsSold: 23_680_000,
  },
]

/** `built` is derived, so the roster can never claim a diorama that isn't there. */
export const ROSTER: RosterEntry[] = RAW.map((r) => ({
  ...r,
  built: CONSOLES_BY_ID.has(r.id),
}))

export const GENERATION_LABELS: Record<Generation, string> = {
  1: 'First generation',
  2: 'Second generation',
  3: 'Third generation',
  4: 'Fourth generation',
  5: 'Fifth generation',
  6: 'Sixth generation',
  7: 'Seventh generation',
  8: 'Eighth generation',
  9: 'Ninth generation',
}

/** The era caption shown under each generation heading in the picker. */
export const GENERATION_ERAS: Partial<Record<Generation, string>> = {
  2: '1977 — cartridges arrive',
  3: '1983 — the crash, and the recovery',
  4: '1990 — 16-bit, and the first console war',
  5: '1994 — the jump to 3D',
  6: '1998 — optical discs and online',
  7: '2005 — high definition',
  8: '2012 — the living room saturates',
  9: '2020 — and now',
}

/** Roster grouped by generation, each group ordered by release year. */
export function rosterByGeneration(): { generation: Generation; consoles: RosterEntry[] }[] {
  const groups = new Map<Generation, RosterEntry[]>()
  for (const entry of ROSTER) {
    const list = groups.get(entry.generation) ?? []
    list.push(entry)
    groups.set(entry.generation, list)
  }
  return [...groups.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([generation, consoles]) => ({
      generation,
      consoles: [...consoles].sort((a, b) => a.year - b.year),
    }))
}

export function rosterEntry(id: string): RosterEntry | undefined {
  return ROSTER.find((r) => r.id === id)
}
