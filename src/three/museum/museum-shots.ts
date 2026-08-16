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
 * Framing for one generation's station.
 *
 * Distance fits the plinth in frame AND the station's height, whichever is
 * more demanding — so a lonely single-artifact station is framed as tightly
 * as a crowded one, and the vertical PS5 pulls the camera back on its own
 * without a special case. That is what keeps a console the same on-screen
 * size whichever station it lives on.
 *
 * The lens is fixed at 24 degrees vertical (Scene.tsx CAMERA), so the fit
 * factors below are constants of that lens at 16:9, with a 1.25 margin.
 */
const H_FIT = 1.654 // plinth length -> distance, at 16:9
const V_FIT = 2.94 // station height -> distance
/** Room above the artifacts for the museum label to breathe. */
const LABEL_ROOM = 0.28

export function bayShot(bay: ShelfBay): Shot {
  const height = bay.tallest + LABEL_ROOM
  const distance = Math.max(H_FIT * bay.boardLength, V_FIT * height)

  return {
    id: 'bay',
    label: bay.label,
    // Centre on the artifacts, not the plinth, or a tall station sits low in
    // frame. The station's own X and Z put the camera in front of THIS
    // station rather than out on the hall's centre line — you walk over to a
    // display to look at it.
    target: [bay.boardCenter[0], bay.boardY + bay.tallest / 2, bay.boardCenter[2]],
    // Nearly square on, from the entrance side. A gallery piece is
    // photographed straight, not dramatically — and the slight lift reads the
    // plinth surface the artifacts rest on.
    direction: normalise([0.1, 0.22, 1]),
    distance,
    minDistance: distance * 0.45,
    maxDistance: distance * 2.4,
  }
}

/**
 * The opening frame: the whole hall at once, from just inside the entrance.
 *
 * This is the shot that says how much history there is — eight stations
 * receding, the far wall a long way off — before you go and look at any of
 * it. Aimed down the walkway's centre line rather than at any one station, and
 * held back far enough that the last plinth is still in frame.
 */
export function hallOverviewShot(layout: MuseumLayout): Shot {
  const { hall } = layout
  const deepest = layout.bays[layout.bays.length - 1].boardCenter[2]
  // Every number below is a fraction of the hall's own length, so the framing
  // scales if generations are ever added or removed.
  const hallLength = Math.abs(deepest - hall.entranceZ)

  /*
    The camera has to stand INSIDE the hall, and these two numbers are what
    keep it there — both got this wrong on the first pass and it is worth
    recording why, because neither failure is visible from the shot's
    declaration alone.

    A shot is `target + direction * distance`, so a long hall means a long
    distance, and any vertical component in the direction gets multiplied by
    it: a 0.14 lift over 25m put the camera at y = 4.78 in a hall with a 4.6m
    ceiling — outside the room, looking down through the roof. Down a hall
    this long the view is very nearly horizontal, so the lift has to be small.

    And 0.72 of the hall's length put the camera 5.6m PAST the entrance,
    outside the shell entirely, framing the gallery through a wall that isn't
    there. 0.54 lands it just inside the doorway, which is where someone
    taking in a gallery for the first time actually stands.
  */
  const distance = hallLength * 0.54

  return {
    id: 'hall',
    label: 'The hall',
    // Aim at the middle of the run of stations, at standing eye height, so the
    // vanishing point sits just above centre frame.
    target: [0, 1.35, hall.entranceZ - hallLength * 0.55],
    // Straight down the hall, barely lifted — see above.
    direction: normalise([0.03, 0.05, 1]),
    distance,
    minDistance: distance * 0.45,
    maxDistance: distance * 1.6,
  }
}

/** Every station shot, keyed by generation, for the museum's own navigation. */
export function bayShots(layout: MuseumLayout): Map<number, Shot> {
  return new Map(layout.bays.map((b) => [b.generation as number, bayShot(b)]))
}

function normalise([x, y, z]: Vec3): Vec3 {
  const len = Math.hypot(x, y, z) || 1
  return [x / len, y / len, z / len]
}
