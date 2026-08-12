import { describe, expect, it } from 'vitest'
import { MAX_DOLLY, aspectDolly, shotCameraPosition, shotsFor, type ShotId } from './shots'
import { snes } from '@/data/consoles/snes'
import type { DioramaSpec } from '@/types/console'

/**
 * The point of the shot system is that nothing is authored per console — every
 * shot falls out of anchors already in DioramaSpec. These tests hold that line:
 * if someone starts hard-coding positions, the "move the data, the camera
 * follows" cases below break.
 */

const ALL: ShotId[] = ['console', 'diorama', 'library', 'controller', 'tv']

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
  it('follows the shelf when shelfPosition moves', () => {
    const moved: DioramaSpec = {
      ...snes.diorama,
      shelfPosition: [snes.diorama.shelfPosition[0] + 1.5, 0.9, -0.4],
    }
    const before = shots().library.target
    const after = shots(moved).library.target

    expect(after[0]).toBeCloseTo(before[0] + 1.5, 6)
    expect(after[2]).toBeCloseTo(-0.4, 6)
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

  it('centres the library shot on the stack of boxes', () => {
    // Above the bottom board — otherwise the top row sits out of frame.
    const t = shots().library.target
    expect(t[1]).toBeGreaterThan(snes.diorama.shelfPosition[1])
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
