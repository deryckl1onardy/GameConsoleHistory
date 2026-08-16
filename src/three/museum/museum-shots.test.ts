import { describe, expect, it } from 'vitest'
import { PerspectiveCamera, Vector3 } from 'three'
import { CONSOLES } from '@/data/consoles'
import { applyFrameOffset, frameOffsetFor } from '@/frame'
import { MAX_DOLLY, shotCameraPosition, shotsFor } from '../shots'
import { artifactAtX, layoutMuseum } from './shelf-layout'
import { approachShot, hallOverviewShot, roomDelta, stageShot, translate } from './museum-shots'
import {
  getHallOffset,
  hallOffsetFor,
  presentOffset,
  setHallOffset,
  shelfWorldPose,
  stageWorldPos,
} from './hall-glide'

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

describe('the glide invariant', () => {
  /**
   * THE test this redesign exists to write. The two tests above pin that
   * `approachShot` is DERIVED from the room's console shot, but neither
   * numerically checks the value of T = room − shelf — and the hall glide
   * is exactly what puts T's value at risk. This one binds it directly:
   * `stageWorldPos(id)` must be exactly `artifact.position + hallOffsetFor +
   * presentOffset` for every console, so when the hall is glided to its
   * target the console sits precisely on the stage, and roomDelta's
   * translation stays pure no matter which console is focused.
   */
  it('glides every artifact exactly onto its stage pose', () => {
    for (const entry of CONSOLES) {
      const artifact = layout.byId[entry.id]
      const expected = stageWorldPos(entry.id)
      const actual = translate(
        translate(artifact.position, hallOffsetFor(layout, entry.id)),
        presentOffset(entry.id),
      )
      actual.forEach((v, i) => {
        expect(v, `${entry.id} stage[${i}]`).toBeCloseTo(expected[i], 9)
      })
    }
  })

  /**
   * And the live path that Phase 4 actually animates: when the hall group
   * carries its target offset, `shelfWorldPose` (what the hero console and
   * the approach both read) must land on the stage.
   */
  it('sits on the stage when the hall is glided to its target', () => {
    for (const entry of CONSOLES) {
      setHallOffset(hallOffsetFor(layout, entry.id))
      const pose = shelfWorldPose(layout, entry.id)
      const stage = stageWorldPos(entry.id)
      pose.position.forEach((v, i) => {
        expect(v, `${entry.id} live stage[${i}]`).toBeCloseTo(stage[i], 9)
      })
    }
    setHallOffset([0, 0, 0])
    expect(getHallOffset()).toEqual([0, 0, 0])
  })

  /**
   * The rotation guard. The existing yaw test reads DATA (`artifact.rotation`
   * vs `consoleRotation`); this one reads the POSE the world actually uses —
   * it would fire the moment anyone added "and it turns to face you" to the
   * present step.
   */
  it('never changes a console’s rotation on its way to the stage', () => {
    for (const entry of CONSOLES) {
      const pose = shelfWorldPose(layout, entry.id)
      expect(pose.rotation, entry.id).toEqual(layout.byId[entry.id].rotation)
    }
  })

  it('throws rather than guessing for a console that is not shelved', () => {
    expect(() => hallOffsetFor(layout, 'not-on-any-shelf')).toThrow(/not on any shelf/)
    expect(() => shelfWorldPose(layout, 'not-on-any-shelf')).toThrow(/not on any shelf/)
  })
})

/*
  Every museum shot has to leave the camera INSIDE the hall. That is not
  automatic and it is not visible from a shot's declaration: a shot is
  `target + direction * distance`, so in a 34m hall any vertical component of
  the direction is multiplied by a very large number. The overview's first
  version used a 0.14 lift and put the camera at y = 4.78 with a 4.6m ceiling,
  and a 0.72 length factor that put it 5.6m outside the entrance — framing the
  gallery from beyond a wall that does not exist. Both are pinned here rather
  than left to be noticed in a screenshot.
*/
describe('every museum shot stays inside the hall', () => {
  // The museum's camera has exactly two poses now: the overview, and the
  // stage every console presents on. Both must stay inside the shell.
  const shots = [
    { what: 'the stage', shot: stageShot() },
    { what: 'the overview', shot: hallOverviewShot(layout) },
  ]

  for (const { what, shot } of shots) {
    it(`keeps ${what}'s camera within the walls, floor and ceiling`, () => {
      // Checked at every dolly: a narrow viewport pushes the camera further
      // back, which is exactly when it would punch through a wall.
      for (const dolly of DOLLIES) {
        const [x, y, z] = shotCameraPosition(shot, dolly)
        expect(y, `${what} through the floor @ ${dolly}`).toBeGreaterThan(0)
        expect(y, `${what} through the ceiling @ ${dolly}`).toBeLessThan(layout.hall.height)
        expect(Math.abs(x), `${what} through a side wall @ ${dolly}`).toBeLessThan(
          layout.hall.width / 2,
        )
        expect(z, `${what} past the far wall @ ${dolly}`).toBeGreaterThan(layout.hall.farZ)
        // The other end of the hall: the camera must not back out of the
        // entrance either. Live at MAX_DOLLY before the dolly fix: the
        // overview camera landed at z = +21.9, ~18m outside the shell,
        // framing the gallery through a wall that is not there — and the old
        // suite never noticed because it only asserted `z > farZ`.
        expect(z, `${what} out of the entrance @ ${dolly}`).toBeLessThan(
          layout.hall.entranceZ + 4,
        )
      }
    })
  }
})

/*
  Clicking a console has to select THAT console — the one interaction the whole
  gallery exists to offer, and the entry point to the transition.

  It runs through one invisible plane per station (ShelfBay's BayHitPlane),
  which resolves the artifact from the X of the hit rather than raycasting
  180k triangles of console geometry. That indirection is fast but it is also
  silent: if the plane drifted off its station, or stopped covering the
  consoles' height, or `artifactAtX` disagreed with where the models actually
  stand, clicks would land on the wrong console — or on nothing — and nothing
  else in the suite would notice.

  The hall GLIDES now, so the ray test has to exercise the real geometry: the
  stage camera (the only shelf camera there is), each artifact glided to its
  stage pose, the hit plane carried along with the hall, and the world→local
  X conversion ShelfBay applies before resolving. A glide with any X component
  silently selects the NEIGHBOURING console if that conversion is wrong —
  this test is what catches it.
*/
describe('clicking a console picks that console', () => {
  /** Matches BayHitPlane's own height in ShelfBay.tsx — see the marker test for why it stays a literal. */
  const HIT_PLANE_HEADROOM = 0.22

  for (const bay of layout.bays) {
    const planeLocalZ = bay.boardCenter[2] + bay.boardDepth / 2
    const planeHeight = bay.tallest + HIT_PLANE_HEADROOM

    for (const artifact of bay.artifacts) {
      it(`resolves ${artifact.id} from a ray through it, glided to the stage`, () => {
        for (const dolly of DOLLIES) {
          const cam = shotCameraPosition(stageShot(), dolly)
          // When THIS artifact is focused, the hall carries its offset.
          const offset = hallOffsetFor(layout, artifact.id)
          const planeZ = planeLocalZ + offset[2]

          // Aim at the middle of the glided console, the way a pointer would.
          const aim: [number, number, number] = [
            artifact.position[0] + offset[0],
            artifact.position[1] + artifact.size.height / 2,
            artifact.position[2] + offset[2],
          ]
          const dir = [aim[0] - cam[0], aim[1] - cam[1], aim[2] - cam[2]]

          // The camera must be in front of the plane, or it is looking at the
          // back of its own station.
          expect(cam[2], `${artifact.id} camera behind the hit plane @ ${dolly}`).toBeGreaterThan(
            planeZ,
          )

          const t = (planeZ - cam[2]) / dir[2]
          expect(t, `${artifact.id} ray never reaches the plane @ ${dolly}`).toBeGreaterThan(0)
          expect(t, `${artifact.id} plane is behind the console @ ${dolly}`).toBeLessThan(1)

          const hitX = cam[0] + dir[0] * t
          const hitY = cam[1] + dir[1] * t

          // Inside the plane's own rectangle (its centre moved with the hall).
          expect(
            Math.abs(hitX - (bay.boardCenter[0] + offset[0])),
            `${artifact.id} hit off the plane's width @ ${dolly}`,
          ).toBeLessThanOrEqual(bay.boardLength / 2)
          expect(hitY, `${artifact.id} hit below the plane @ ${dolly}`).toBeGreaterThanOrEqual(
            bay.boardY,
          )
          expect(hitY, `${artifact.id} hit above the plane @ ${dolly}`).toBeLessThanOrEqual(
            bay.boardY + planeHeight,
          )

          // And resolving that hit — through ShelfBay's world→local X
          // conversion — gives back the console actually aimed at.
          expect(
            artifactAtX(bay, hitX - offset[0])?.id,
            `${artifact.id} resolved to the wrong console @ ${dolly}`,
          ).toBe(artifact.id)
        }
      })
    }
  }
})

describe('the stage shot', () => {
  it('keeps the camera above the floor', () => {
    const [, y] = shotCameraPosition(stageShot())
    expect(y).toBeGreaterThan(0)
  })

  it('normalises its direction to unit length', () => {
    const [x, y, z] = stageShot().direction
    expect(Math.hypot(x, y, z)).toBeCloseTo(1, 9)
  })

  it('sits inside its own orbit clamps', () => {
    const s = stageShot()
    expect(s.minDistance).toBeLessThan(s.distance)
    expect(s.maxDistance).toBeGreaterThan(s.distance)
  })

  it('presents every console at the same stage point — per-console framing by construction', () => {
    // The replacement for per-station framing: one fixed camera frames every
    // console identically because the hall brings each of them to the same
    // world point. (The present step in Phase 6 adds a per-console standoff
    // on top; until then the stage pose is literally identical for all 22.)
    const poses = CONSOLES.map((c) => stageWorldPos(c.id))
    for (const pose of poses) {
      expect(pose).toEqual(poses[0])
    }
  })

})
