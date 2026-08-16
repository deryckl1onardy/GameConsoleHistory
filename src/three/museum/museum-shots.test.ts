import { describe, expect, it } from 'vitest'
import { PerspectiveCamera, Vector3 } from 'three'
import { CONSOLES } from '@/data/consoles'
import { applyFrameOffset, frameOffsetFor } from '@/frame'
import { MAX_DOLLY, shotCameraPosition, shotsFor } from '../shots'
import { artifactAtX, layoutMuseum } from './shelf-layout'
import { approachShot, bayShot, hallOverviewShot, roomDelta, translate } from './museum-shots'
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
  const shots = [
    ...layout.bays.map((b) => ({ what: `gen ${b.generation}`, shot: bayShot(b) })),
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
      }
    })
  }
})

/*
  Clicking a console has to select THAT console — the one interaction the whole
  gallery exists to offer, and the entry point to the transition.

  It runs through one invisible plane per station (ShelfBay's BayHitPlane),
  which resolves the artifact from the world X of the hit rather than
  raycasting 180k triangles of console geometry. That indirection is fast but
  it is also silent: if the plane drifted off its station, or stopped covering
  the consoles' height, or `artifactAtX` disagreed with where the models
  actually stand, clicks would land on the wrong console — or on nothing — and
  nothing else in the suite would notice.

  So this casts the real ray: from each station's own camera, through each
  console on it, onto that station's hit plane, and asserts the hit lands
  inside the plane AND resolves back to the console aimed at.
*/
describe('clicking a console picks that console', () => {
  /** Matches BayHitPlane's own height in ShelfBay.tsx — see the marker test for why it stays a literal. */
  const HIT_PLANE_HEADROOM = 0.22

  for (const bay of layout.bays) {
    const shot = bayShot(bay)
    const planeZ = bay.boardCenter[2] + bay.boardDepth / 2
    const planeHeight = bay.tallest + HIT_PLANE_HEADROOM

    for (const artifact of bay.artifacts) {
      it(`resolves ${artifact.id} from a ray through it`, () => {
        for (const dolly of DOLLIES) {
          const cam = shotCameraPosition(shot, dolly)
          // Aim at the middle of the console, the way a pointer would.
          const aim: [number, number, number] = [
            artifact.position[0],
            artifact.position[1] + artifact.size.height / 2,
            artifact.position[2],
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

          // Inside the plane's own rectangle.
          expect(
            Math.abs(hitX - bay.boardCenter[0]),
            `${artifact.id} hit off the plane's width @ ${dolly}`,
          ).toBeLessThanOrEqual(bay.boardLength / 2)
          expect(hitY, `${artifact.id} hit below the plane @ ${dolly}`).toBeGreaterThanOrEqual(
            bay.boardY,
          )
          expect(hitY, `${artifact.id} hit above the plane @ ${dolly}`).toBeLessThanOrEqual(
            bay.boardY + planeHeight,
          )

          // And resolving that hit gives back the console actually aimed at.
          expect(
            artifactAtX(bay, hitX)?.id,
            `${artifact.id} resolved to the wrong console @ ${dolly}`,
          ).toBe(artifact.id)
        }
      })
    }
  }
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

  it('frames by whichever constraint actually binds, height or width', () => {
    /*
      A bay is framed by max(width-fit, height-fit): a short-but-tall bay (one
      standing console) and a long-but-flat one (four slabs) each have to be
      pulled back by the term that actually binds them.

      Tested on synthetic bays rather than two named consoles. The original
      version compared the PS5's bay against the PS4's and asserted their board
      lengths matched — which was only ever true by coincidence of how many
      consoles happened to be built in each generation, and broke the moment
      gen 8 gained a fourth. Holding one variable fixed by construction tests
      the actual rule and cannot be invalidated by the roster growing.
    */
    const base = layout.bays[0]
    const flat = { ...base, boardLength: 1.2, tallest: 0.08 }
    const tall = { ...base, boardLength: 1.2, tallest: 0.42 }
    const wide = { ...base, boardLength: 4.0, tallest: 0.08 }

    // Same width, more height — the height term takes over.
    expect(bayShot(tall).distance).toBeGreaterThan(bayShot(flat).distance)
    // Same height, more width — the width term takes over.
    expect(bayShot(wide).distance).toBeGreaterThan(bayShot(flat).distance)
  })

  it('frames a real bay of standing consoles by its height', () => {
    // The roster-level consequence of the rule above, on the one bay that
    // holds consoles which stand upright rather than lie flat.
    //
    // Deliberately states NOTHING about how this bay's width compares to any
    // other's: an earlier version of this assertion pinned it as the narrowest
    // bay, which was true only until gen 9 gained a second and third console —
    // the same roster-coupling that broke the test this replaced.
    const ps5Bay = layout.bays.find((b) => b.artifacts.some((a) => a.id === 'ps5'))!
    // Flatten the same bay and it would be framed by width alone. That the
    // real one sits further back is exactly what "height binds here" means.
    expect(bayShot(ps5Bay).distance).toBeGreaterThan(
      bayShot({ ...ps5Bay, tallest: 0.05 }).distance,
    )
  })

  it('centres on the artifacts rather than the board', () => {
    for (const bay of layout.bays) {
      const s = bayShot(bay)
      expect(s.target[1], `gen ${bay.generation}`).toBeGreaterThan(bay.boardY)
    }
  })
})
