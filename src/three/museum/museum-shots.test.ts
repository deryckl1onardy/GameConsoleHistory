import { describe, expect, it } from 'vitest'
import { PerspectiveCamera, Vector3 } from 'three'
import { CONSOLES } from '@/data/consoles'
import { applyFrameOffset, frameOffsetFor } from '@/frame'
import { MAX_DOLLY, shotCameraPosition, shotsFor } from '../shots'
import { layoutMuseum } from './shelf-layout'
import { approachShot, bayShot, roomDelta, translate } from './museum-shots'

const layout = layoutMuseum(CONSOLES)

/** The dollies a real viewport can produce: 16:9, a narrow laptop, and the cap. */
const DOLLIES = [1, 1.6, MAX_DOLLY]

describe('the handoff invariant', () => {
  /**
   * THE load-bearing test of the whole museum feature.
   *
   * The approach ends in museum space; the room begins in room space. If
   * translating the approach by T does not land exactly on the room's own
   * console shot, the console visibly jumps at the handoff and the illusion
   * that this is one continuous space collapses.
   *
   * Checked for every console at every dolly, because the framing has to match
   * on a phone as well as a monitor.
   */
  it('lands the approach exactly on the room console shot, for every console', () => {
    for (const entry of CONSOLES) {
      const spec = entry.diorama
      const t = roomDelta(layout, entry, spec)
      const approach = approachShot(layout, entry, spec)
      const room = shotsFor(entry, spec).console

      const movedTarget = translate(approach.target as [number, number, number], t)
      movedTarget.forEach((v, i) => {
        expect(v, `${entry.id} target[${i}]`).toBeCloseTo(room.target[i], 9)
      })

      for (const dolly of DOLLIES) {
        const movedCamera = translate(shotCameraPosition(approach, dolly), t)
        const roomCamera = shotCameraPosition(room, dolly)
        movedCamera.forEach((v, i) => {
          expect(v, `${entry.id} camera[${i}] @ dolly ${dolly}`).toBeCloseTo(roomCamera[i], 9)
        })
      }
    }
  })

  it('keeps the lens identical across the handoff', () => {
    // A translation cannot change a direction or a distance. If any of these
    // diverge, someone has re-declared the approach instead of deriving it.
    for (const entry of CONSOLES) {
      const approach = approachShot(layout, entry, entry.diorama)
      const room = shotsFor(entry, entry.diorama).console
      expect(approach.direction, entry.id).toEqual(room.direction)
      expect(approach.distance, entry.id).toBe(room.distance)
      expect(approach.minDistance, entry.id).toBe(room.minDistance)
      expect(approach.maxDistance, entry.id).toBe(room.maxDistance)
    }
  })

  it('depends on the shelf keeping each console its own room yaw', () => {
    // The pure-translation property only holds because rotation is identical in
    // both places. This is the guard on that assumption.
    for (const entry of CONSOLES) {
      const artifact = layout.byId[entry.id]
      const roomYaw = entry.diorama.consoleRotation?.[1] ?? 0
      expect(artifact.rotation[1], entry.id).toBeCloseTo(roomYaw, 12)
    }
  })

  it('throws rather than guessing for a console that is not shelved', () => {
    const orphan = { ...CONSOLES[0], id: 'not-on-any-shelf' }
    expect(() => roomDelta(layout, orphan, orphan.diorama)).toThrow(/not on any shelf/)
  })

  /**
   * The handoff the USER actually sees: the console must not move a pixel on
   * screen when the camera and hero teleport by T. The old design applied the
   * frame offset (the lift that clears the bottom panel) only AFTER the
   * handoff, tweening it in during `arriving` — so the console visibly
   * drifted upward after the camera had stopped. The offset is now ramped
   * during the FLIGHT and held CONSTANT across the handoff (full on both
   * sides of the translation), and this test pins that the projection is
   * identical either way — with the same offset applied before and after.
   */
  it('keeps the console on the same pixels across the handoff with the frame offset applied', () => {
    const offset = frameOffsetFor(1440, 900, 'wide')
    // The test is only meaningful if the offset actually lifts the subject.
    expect(offset.dy).toBeGreaterThan(0)

    for (const entry of CONSOLES) {
      const spec = entry.diorama
      const t = roomDelta(layout, entry, spec)
      const approach = approachShot(layout, entry, spec)
      const half = (entry.dimensions.height * 1e-3) / 2

      // The console's centre in each space — the same physical point, one
      // rigid translation apart.
      const pShelf = new Vector3(
        spec.consolePosition[0] - t[0],
        spec.consolePosition[1] + half - t[1],
        spec.consolePosition[2] - t[2],
      )
      const pRoom = new Vector3(
        spec.consolePosition[0],
        spec.consolePosition[1] + half,
        spec.consolePosition[2],
      )

      for (const dolly of DOLLIES) {
        const camera = new PerspectiveCamera(24, 16 / 9, 0.05, 120)
        camera.position.set(...shotCameraPosition(approach, dolly))
        camera.lookAt(...approach.target)
        applyFrameOffset(camera, offset)
        camera.updateProjectionMatrix()
        camera.updateMatrixWorld()

        const before = pShelf.clone().project(camera)

        // The teleport: position and target translate by T; the camera's
        // orientation does not change, and the offset stays exactly as it was.
        camera.position.x += t[0]
        camera.position.y += t[1]
        camera.position.z += t[2]
        camera.updateMatrixWorld()

        const after = pRoom.clone().project(camera)

        expect(after.x, `${entry.id} NDC.x @ dolly ${dolly}`).toBeCloseTo(before.x, 6)
        expect(after.y, `${entry.id} NDC.y @ dolly ${dolly}`).toBeCloseTo(before.y, 6)
      }
    }
  })
})

describe('bay shots', () => {
  it('keeps every museum camera above the floor', () => {
    for (const bay of layout.bays) {
      const [, y] = shotCameraPosition(bayShot(bay))
      expect(y, `gen ${bay.generation}`).toBeGreaterThan(0)
    }
  })

  it('normalises every direction to unit length', () => {
    for (const bay of layout.bays) {
      const [x, y, z] = bayShot(bay).direction
      expect(Math.hypot(x, y, z), `gen ${bay.generation}`).toBeCloseTo(1, 9)
    }
  })

  it('sits inside its own orbit clamps', () => {
    for (const bay of layout.bays) {
      const s = bayShot(bay)
      expect(s.minDistance, `gen ${bay.generation}`).toBeLessThan(s.distance)
      expect(s.maxDistance, `gen ${bay.generation}`).toBeGreaterThan(s.distance)
    }
  })

  it('pulls back further for a taller bay than a wider one', () => {
    // The PS5 bay is short but tall; a 3-console bay is long but flat. Both
    // must be framed by whichever constraint actually binds.
    const ps5Bay = layout.bays.find((b) => b.artifacts.some((a) => a.id === 'ps5'))!
    const ps4Bay = layout.bays.find((b) => b.artifacts.some((a) => a.id === 'ps4'))!
    expect(ps5Bay.boardLength).toBeCloseTo(ps4Bay.boardLength, 9)
    expect(bayShot(ps5Bay).distance).toBeGreaterThan(bayShot(ps4Bay).distance)
  })

  it('centres on the artifacts rather than the board', () => {
    for (const bay of layout.bays) {
      const s = bayShot(bay)
      expect(s.target[1], `gen ${bay.generation}`).toBeGreaterThan(bay.boardY)
    }
  })
})
