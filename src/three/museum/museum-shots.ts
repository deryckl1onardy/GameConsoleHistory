import type { ConsoleEntry, DioramaSpec } from '@/types/console'
import { type Shot, shotsFor } from '../shots'
import type { MuseumLayout, ShelfBay } from './shelf-layout'

/**
 * The camera maths that makes the museum-to-room move read as one continuous
 * space rather than a scene change.
 *
 * The whole design rests on one property: an artifact keeps its ROOM yaw on
 * the shelf (see shelf-layout.ts). Because the rotation is identical in both
 * places, the transform between a console's shelf pose and its room pose is a
 * pure TRANSLATION:
 *
 *     T = roomPosition - shelfPosition
 *
 * So at the handoff we add T to the camera, the orbit target and the console
 * in one synchronous block, and every point on the console projects to exactly
 * the same pixel. No cross-fade to hide a seam, no lerp to tune — the
 * concept's "shared spatial anchor" becomes arithmetic, and the invariant is
 * a unit test rather than something eyeballed.
 *
 * If anyone ever gives the shelf its own yaw, that property dies silently and
 * the console will visibly swing at the handoff. museum-shots.test.ts is what
 * catches that.
 */

type Vec3 = [number, number, number]

const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]

/** Room pose minus shelf pose. Pure translation — see the file comment. */
export function roomDelta(layout: MuseumLayout, entry: ConsoleEntry, spec: DioramaSpec): Vec3 {
  const artifact = layout.byId[entry.id]
  if (!artifact) {
    throw new Error(`museum-shots: ${entry.id} is not on any shelf`)
  }
  return sub(spec.consolePosition as Vec3, artifact.position)
}

/** Apply the translation to a point. */
export function translate(p: Vec3, t: Vec3): Vec3 {
  return add(p, t)
}

/**
 * Where the approach ends: the room's own `console` shot, expressed in museum
 * coordinates.
 *
 * Derived by translating the real room shot rather than re-declaring one, so
 * a change to the console shot's direction or distance in shots.ts is
 * inherited automatically and the two can never drift apart. It is a plain
 * `Shot`, so it flows through CameraRig's existing `applyShot` untouched —
 * which also means it inherits `aspectDolly`, and the framing matches on both
 * sides of the handoff even on a narrow viewport.
 */
export function approachShot(
  layout: MuseumLayout,
  entry: ConsoleEntry,
  spec: DioramaSpec,
): Shot {
  const room = shotsFor(entry, spec).console
  const t = roomDelta(layout, entry, spec)
  return { ...room, target: sub(room.target as Vec3, t) }
}

/**
 * Framing for one generation's shelf.
 *
 * Distance fits the board in frame AND the bay's height, whichever is more
 * demanding — so a lonely single-artifact bay is framed as tightly as a
 * crowded one, and the vertical PS5 pulls the camera back on its own without
 * a special case. That is what keeps a console the same on-screen size
 * whichever bay it lives in.
 *
 * The lens is fixed at 24 degrees vertical (Scene.tsx CAMERA), so the fit
 * factors below are constants of that lens at 16:9, with a 1.25 margin.
 */
const H_FIT = 1.654 // board length -> distance, at 16:9
const V_FIT = 2.94 // bay height -> distance
/** Room above the artifacts for the museum label to breathe. */
const LABEL_ROOM = 0.28

export function bayShot(bay: ShelfBay): Shot {
  const height = bay.tallest + LABEL_ROOM
  const distance = Math.max(H_FIT * bay.boardLength, V_FIT * height)

  return {
    id: 'bay',
    label: bay.label,
    // Centre on the artifacts, not the board, or a tall bay sits low in frame.
    target: [bay.boardCenter[0], bay.boardY + bay.tallest / 2, bay.boardCenter[2]],
    // Nearly square on. An archive is photographed straight, not dramatically —
    // and the slight lift reads the board surface the artifacts rest on.
    direction: normalise([0.1, 0.22, 1]),
    distance,
    minDistance: distance * 0.45,
    maxDistance: distance * 2.4,
  }
}

/** Every bay shot, keyed by generation, for the museum's own navigation. */
export function bayShots(layout: MuseumLayout): Map<number, Shot> {
  return new Map(layout.bays.map((b) => [b.generation as number, bayShot(b)]))
}

function normalise([x, y, z]: Vec3): Vec3 {
  const len = Math.hypot(x, y, z) || 1
  return [x / len, y / len, z / len]
}
