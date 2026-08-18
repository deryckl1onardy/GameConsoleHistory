import { describe, expect, it } from 'vitest'
import { MAX_DOLLY, artifactShotFor, aspectDolly, shotCameraPosition, shotsFor, type RoomShotId } from './shots'
import { snes } from '@/data/consoles/snes'
import { genesis } from '@/data/consoles/genesis'
import { ps2 } from '@/data/consoles/ps2'
import { LIFT_M, MEDIA_SPREAD_RANKS, layoutSpread, mediaAnchor } from './geometry/gameBox'
import { MM, archetype } from '@/data/kits/media-archetypes'
import type { DioramaSpec } from '@/types/console'

/**
 * The point of the shot system is that nothing is authored per console — every
 * shot falls out of anchors already in DioramaSpec. These tests hold that line:
 * if someone starts hard-coding positions, the "move the data, the camera
 * follows" cases below break.
 */

// Room shots only — `bay` belongs to the museum and is built by museum-shots.ts.
const ALL: RoomShotId[] = ['console', 'diorama', 'library', 'controller', 'tv']

function shots(spec: DioramaSpec = snes.diorama) {
  return shotsFor(snes, spec)
}

describe('shot definitions', () => {
  it('defines every shot the mode bar and playback state need', () => {
    const s = shots()
    for (const id of ALL) {
      expect(s[id], id).toBeDefined()
      expect(s[id].id, id).toBe(id)
    }
  })

  it('gives every shot a sane distance inside its own orbit clamps', () => {
    const s = shots()
    for (const id of ALL) {
      const shot = s[id]
      expect(shot.distance, `${id} distance`).toBeGreaterThan(0)
      expect(shot.minDistance, `${id} min < distance`).toBeLessThan(shot.distance)
      expect(shot.maxDistance, `${id} max > distance`).toBeGreaterThan(shot.distance)
    }
  })

  it('normalises every direction to unit length', () => {
    const s = shots()
    for (const id of ALL) {
      const [x, y, z] = s[id].direction
      expect(Math.hypot(x, y, z), `${id}`).toBeCloseTo(1, 6)
    }
  })

  it('keeps every camera above the floor', () => {
    // A shot that dips below y=0 puts the camera underneath the diorama and
    // renders the room from below through the floor.
    const s = shots()
    for (const id of ALL) {
      const [, y] = shotCameraPosition(s[id])
      expect(y, `${id} camera below floor`).toBeGreaterThan(0)
    }
  })

  it('frames the console much closer than the room', () => {
    const s = shots()
    expect(s.console.distance).toBeLessThan(s.diorama.distance / 5)
  })
})

describe('shots are derived from the diorama, not hard-coded', () => {
  it('follows the console when the console (and so the media spread) moves', () => {
    // The library shot targets mediaAnchor(entry, spec), which is itself
    // derived from spec.consolePosition — so moving the console must move
    // the library shot by the same delta. spec.shelfPosition plays no part
    // any more; it names a wall the room no longer has.
    const moved: DioramaSpec = {
      ...snes.diorama,
      consolePosition: [snes.diorama.consolePosition[0] + 1.5, 0.5, -0.4],
    }
    const before = shots().library.target
    const after = shots(moved).library.target

    expect(after[0]).toBeCloseTo(before[0] + 1.5, 6)
    // consolePosition.z moved from its original value to -0.4; the target's
    // z tracks it by the same delta, since extent.depth is unchanged.
    const deltaZ = moved.consolePosition[2] - snes.diorama.consolePosition[2]
    expect(after[2]).toBeCloseTo(before[2] + deltaZ, 6)
  })

  it('follows the console when consolePosition moves', () => {
    const moved: DioramaSpec = {
      ...snes.diorama,
      consolePosition: [-2, 1.1, 0.3],
    }
    const t = shots(moved).console.target
    expect(t[0]).toBeCloseTo(-2, 6)
    expect(t[2]).toBeCloseTo(0.3, 6)
    // Aims at the middle of the shell, not its base.
    expect(t[1]).toBeCloseTo(1.1 + (snes.dimensions.height / 1000) / 2, 6)
  })

  it('follows the controller when controllerPosition moves', () => {
    const moved: DioramaSpec = { ...snes.diorama, controllerPosition: [0.7, 0.5, -0.9] }
    const t = shots(moved).controller.target
    expect(t[0]).toBeCloseTo(0.7, 6)
    expect(t[2]).toBeCloseTo(-0.9, 6)
  })

  it('aims the TV shot at the middle of the screen, not the cabinet base', () => {
    const t = shots().tv.target
    const base = snes.diorama.tvPosition[1]
    expect(t[1]).toBeGreaterThan(base)
    expect(t[1]).toBeCloseTo(base + snes.diorama.tv.dimensions.height / 2000, 6)
  })

  it('centres the library shot above the floor, not down at ankle height', () => {
    // Raised by half the spread's own height, so the top rank sits in frame
    // rather than being cropped at the top of the shot.
    const t = shots().library.target
    expect(t[1]).toBeGreaterThan(snes.diorama.consolePosition[1])
  })

  it('sits the library target beside the console, not on top of it', () => {
    const t = shots().library.target
    const anchor = mediaAnchor(snes, snes.diorama)
    expect(t[0]).toBeCloseTo(anchor[0], 6)
    expect(t[0]).toBeGreaterThan(snes.diorama.consolePosition[0])
  })

  it('frames a wider archetype (DVD keepcase) further back than a narrower one (Genesis cart)', () => {
    const genesisDistance = shotsFor(genesis, genesis.diorama).library.distance
    const ps2Distance = shotsFor(ps2, ps2.diorama).library.distance
    expect(ps2Distance).toBeGreaterThan(genesisDistance)
  })
})

describe('aspect dolly', () => {
  it('does not move the camera at or above the tuned aspect', () => {
    expect(aspectDolly(16 / 9)).toBeCloseTo(1, 6)
    expect(aspectDolly(21 / 9)).toBe(1)
  })

  it('pulls back on narrower viewports', () => {
    // Square and portrait both lost the sides before this existed.
    expect(aspectDolly(1)).toBeGreaterThan(1)
    expect(aspectDolly(9 / 19.5)).toBeGreaterThan(aspectDolly(1))
  })

  it('never exceeds the cap, however extreme the aspect', () => {
    expect(aspectDolly(0.05)).toBe(MAX_DOLLY)
    expect(aspectDolly(9 / 19.5)).toBeLessThanOrEqual(MAX_DOLLY)
  })

  it('survives a degenerate viewport instead of producing NaN', () => {
    // Happens for one frame during some resizes; a NaN here poisons the camera
    // matrix and the scene goes black with no error.
    expect(aspectDolly(0)).toBe(1)
    expect(aspectDolly(Number.NaN)).toBe(1)
    expect(aspectDolly(Number.POSITIVE_INFINITY)).toBe(1)
  })
})

describe('camera placement', () => {
  it('places the camera exactly one distance from the target', () => {
    const shot = shots().console
    const pos = shotCameraPosition(shot)
    const d = Math.hypot(
      pos[0] - shot.target[0],
      pos[1] - shot.target[1],
      pos[2] - shot.target[2],
    )
    expect(d).toBeCloseTo(shot.distance, 6)
  })

  it('scales distance by the dolly factor', () => {
    const shot = shots().console
    const pos = shotCameraPosition(shot, 2)
    const d = Math.hypot(
      pos[0] - shot.target[0],
      pos[1] - shot.target[1],
      pos[2] - shot.target[2],
    )
    expect(d).toBeCloseTo(shot.distance * 2, 6)
  })
})

describe('artifact shot', () => {
  it('targets exactly the slot the spread uses for that rank', () => {
    // The artifact camera and MediaSpread must agree about where the selected
    // box is — the target is the spread anchor plus the SAME layoutSpread
    // slot offset the box renders at, not a hand-placed point.
    const rank = 3
    const shot = artifactShotFor(snes, snes.diorama, rank)
    const anchor = mediaAnchor(snes, snes.diorama)
    const gameIdx = snes.games.findIndex((g) => g.rank === rank)
    const slot = layoutSpread({
      archetype: archetype(snes.mediaArchetype),
      count: snes.games.length,
      ranks: MEDIA_SPREAD_RANKS,
    })[gameIdx]

    expect(shot.target[0]).toBeCloseTo(anchor[0] + slot.position[0], 6)
    // The selected box is LIFTED off the floor (LIFT_M), and the camera aims
    // at the box's MIDDLE (half its real height), not its base — the same
    // convention the console shot uses — so the orbit pivot stays on the box
    // at every zoom distance, not pinned to the floor beneath it.
    const halfHeight = (archetype(snes.mediaArchetype).dimensions.height * MM) / 2
    expect(shot.target[1]).toBeCloseTo(anchor[1] + slot.position[1] + LIFT_M + halfHeight, 6)
    expect(shot.target[2]).toBeCloseTo(anchor[2] + slot.position[2], 6)
  })

  it('stays inside its own orbit clamps and above the floor', () => {
    const shot = artifactShotFor(snes, snes.diorama, 1)
    expect(shot.minDistance).toBeLessThan(shot.distance)
    expect(shot.maxDistance).toBeGreaterThan(shot.distance)
    const [, y] = shotCameraPosition(shot)
    expect(y).toBeGreaterThan(0)
  })

  it('frames a taller archetype further back than a shorter one', () => {
    const cart = artifactShotFor(snes, snes.diorama, 1).distance
    const ps2Shot = artifactShotFor(ps2, ps2.diorama, 1).distance
    expect(ps2Shot).toBeGreaterThan(cart)
  })
})
