import type { ConsoleEntry, DioramaSpec } from '@/types/console'
import { type Shot, shotsFor } from '../shots'
import { STAGE_ANCHOR, hallOffsetFor, stageWorldPos } from './hall-glide'
import type { MuseumLayout } from './shelf-layout'

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

/**
 * Room pose minus shelf pose. Pure translation — see the file comment.
 *
 * Reads only module constants (STAGE_ANCHOR, presentOffset) plus the room
 * spec — NEVER the layout's positions or any live animated value — so it is
 * incapable of being mid-flight: whatever the hall is doing, the translation
 * that hands the console to the room is the same, and the approach and the
 * retreat cannot disagree about it.
 *
 * The "not on any shelf" guard lives in hall-glide's `hallOffsetFor`, shared
 * with the glide and the hero pose; routing through it here means the three
 * places that must agree about where a console lives throw from the same
 * code rather than drifting apart.
 */
export function roomDelta(layout: MuseumLayout, entry: ConsoleEntry, spec: DioramaSpec): Vec3 {
  // Throws for a console that is not on any shelf.
  hallOffsetFor(layout, entry.id)
  return sub(spec.consolePosition as Vec3, stageWorldPos(entry.id))
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
 * The one shot the shelf camera ever takes while browsing — framing the
 * STAGE, where every focused console presents itself.
 *
 * The camera is bolted down now: instead of travelling to a station, the
 * whole hall glides until the focused console stands on the stage (see
 * hall-glide.ts), so a single shot frames every console in the collection
 * identically. That is what keeps "a console is the same on-screen size
 * wherever it lives" true by construction — one target, one distance — and
 * the per-console present step (Phase 6) then equalizes the on-screen size
 * further for the machines the fixed framing would otherwise dwarf.
 *
 * The lens is fixed at 24 degrees vertical (Scene.tsx CAMERA). The distance
 * frames the stage plinth and the air around the console — close enough to
 * read the hardware, far enough that the hall is still visibly around it.
 */
export function stageShot(): Shot {
  const distance = 1.9
  const height = 0.1 // a mid-sized console's half-height, roughly
  return {
    id: 'stage',
    label: 'The stage',
    target: [STAGE_ANCHOR[0], STAGE_ANCHOR[1] + height, STAGE_ANCHOR[2]],
    // Nearly square on, from the entrance side, slightly lifted — the same
    // posture as the old station shots: a gallery piece is photographed
    // straight, and the lift reads the plinth the artifact rests on.
    direction: normalise([0.1, 0.2, 1]),
    distance,
    minDistance: distance * 0.5,
    maxDistance: distance * 2.2,
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
    // The overview camera stands INSIDE a box, so a narrow viewport must not
    // dolly it back — that is exactly what pushed it through the far wall at
    // portrait aspect (z = +21.9, 18m outside the shell). Pulling back is
    // right for an object in open space and wrong here: a narrow frame should
    // crop the hall's width, which carries no content.
    dolly: 'none',
    minDistance: distance * 0.45,
    maxDistance: distance * 1.6,
  }
}

function normalise([x, y, z]: Vec3): Vec3 {
  const len = Math.hypot(x, y, z) || 1
  return [x / len, y / len, z / len]
}
