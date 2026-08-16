import type { ConsoleEntry, DioramaSpec } from '@/types/console'
import { MM } from '@/data/kits/media-archetypes'
import { archetype } from '@/data/kits/media-archetypes'
import { layoutShelf, shelfExtent } from './geometry/gameBox'

/**
 * Named camera shots.
 *
 * Every shot is *derived* from anchors that already exist in DioramaSpec —
 * consolePosition, tvPosition, shelfPosition, controllerPosition. Nothing here
 * is authored per console, so all 22 inherit the whole choreography for free.
 * Move a shelf in the data and the library shot follows it.
 *
 * Distances are quoted at BASE_ASPECT (16:9); CameraRig dollies them out on
 * narrower viewports.
 */

/** Shots derived from a DioramaSpec. `shotsFor` must return every one of these. */
export type RoomShotId = 'console' | 'diorama' | 'library' | 'controller' | 'tv'

/**
 * `bay` belongs to the museum, which has no DioramaSpec to derive from — it is
 * built by museum-shots.ts instead. It joins the union so CameraRig can hold
 * one shot type, but stays out of `shotsFor`'s exhaustive record.
 */
export type ShotId = RoomShotId | 'bay'

export type Shot = {
  id: ShotId
  label: string
  target: [number, number, number]
  /** Unit direction from the target toward the camera. */
  direction: [number, number, number]
  distance: number
  /** Orbit clamps differ wildly: 0.3m for a cartridge, 6m for a room. */
  minDistance: number
  maxDistance: number
}

function normalise([x, y, z]: [number, number, number]): [number, number, number] {
  const len = Math.hypot(x, y, z) || 1
  return [x / len, y / len, z / len]
}

/** Where the camera ends up for a shot, in world space. */
export function shotCameraPosition(shot: Shot, dolly = 1): [number, number, number] {
  const d = shot.distance * dolly
  return [
    shot.target[0] + shot.direction[0] * d,
    shot.target[1] + shot.direction[1] * d,
    shot.target[2] + shot.direction[2] * d,
  ]
}

export function shotsFor(entry: ConsoleEntry, spec: DioramaSpec): Record<RoomShotId, Shot> {
  const consoleHeight = entry.dimensions.height * MM

  // Height of the stacked game boxes, so the library shot centres on the
  // collection rather than on the bottom board.
  const media = archetype(entry.mediaArchetype)
  const slots = layoutShelf({
    archetype: media,
    count: entry.games.length,
    shelfWidthMm: 760,
  })
  const stackHeight = shelfExtent(slots, media).height

  const tvScreenY = spec.tvPosition[1] + (spec.tv.dimensions.height * MM) / 2

  return {
    /*
      The default. A 20cm console in a 4.2m room is roughly 40 pixels tall from
      the wide shot — so the hardware, which is the actual subject of the atlas,
      was the least visible thing in it. This sits close enough to read the
      shell and its controls, far enough that the room stays legible behind.
    */
    console: {
      id: 'console',
      label: 'Console',
      target: [
        spec.consolePosition[0],
        spec.consolePosition[1] + consoleHeight / 2,
        spec.consolePosition[2],
      ],
      direction: normalise([0.62, 0.46, 0.95]),
      distance: 1.2,
      minDistance: 0.35,
      maxDistance: 4,
    },

    /** The Phase 1 framing — now one shot among several, not the only view. */
    diorama: {
      id: 'diorama',
      label: 'Room',
      target: [0, 0.62, -0.55],
      direction: normalise([7.5, 5.08, 9.3]),
      distance: 13,
      minDistance: 6,
      maxDistance: 26,
    },

    /** Square onto the shelf, close enough to read cover art. */
    library: {
      id: 'library',
      label: 'Games',
      target: [
        spec.shelfPosition[0],
        spec.shelfPosition[1] + stackHeight / 2,
        spec.shelfPosition[2],
      ],
      direction: normalise([0.34, 0.22, 1]),
      distance: 1.35,
      minDistance: 0.4,
      maxDistance: 4,
    },

    /** Almost overhead — a controller is read from above, not from the side. */
    controller: {
      id: 'controller',
      label: 'Controller',
      target: [
        spec.controllerPosition[0],
        spec.controllerPosition[1] + 0.02,
        spec.controllerPosition[2],
      ],
      direction: normalise([0.16, 0.9, 0.5]),
      distance: 0.55,
      minDistance: 0.22,
      maxDistance: 2,
    },

    /** Reserved for the playing state, once the CRT runs video. */
    tv: {
      id: 'tv',
      label: 'Screen',
      target: [spec.tvPosition[0], tvScreenY, spec.tvPosition[2]],
      direction: normalise([0.18, 0.2, 1]),
      distance: 1.6,
      minDistance: 0.6,
      maxDistance: 5,
    },
  }
}

/**
 * How far to pull back on a viewport narrower than the tuned aspect.
 *
 * The shot distances assume 16:9. A narrower frame keeps the same vertical
 * field of view but loses horizontal, so the subject overflows the sides — on a
 * phone in portrait the room cropped to a corner. Capped so an extreme aspect
 * does not send the camera into orbit.
 */
export const BASE_ASPECT = 16 / 9
export const MAX_DOLLY = 2.2

export function aspectDolly(aspect: number): number {
  if (!Number.isFinite(aspect) || aspect <= 0) return 1
  return Math.min(MAX_DOLLY, Math.max(1, BASE_ASPECT / aspect))
}

/**
 * The opening move: start very tight on the console, then pull back to the
 * resting console shot. Establishes the hardware as the subject before revealing
 * that it sits in a room worth exploring.
 */
export const INTRO = {
  /** Fraction of the console shot's distance to start from. */
  startScale: 0.38,
  holdMs: 400,
  pullBackMs: 2200,
} as const
