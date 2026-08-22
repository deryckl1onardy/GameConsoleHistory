import type { ConsoleEntry, DioramaSpec } from '@/types/console'
import { MM } from '@/data/kits/media-archetypes'
import { archetype } from '@/data/kits/media-archetypes'
import { LIFT_M, layoutSpread, mediaAnchor, MEDIA_SPREAD_RANKS, spreadExtent } from './geometry/gameBox'
import { ROOM_CHROME, topHFor, type Layout } from '@/frame'

/**
 * Named camera shots.
 *
 * Every shot is *derived* from anchors that already exist in DioramaSpec —
 * consolePosition, tvPosition, controllerPosition — or, for the library shot,
 * from `mediaAnchor`, which is itself derived from consolePosition. Nothing
 * here is authored per console, so all 22 inherit the whole choreography for
 * free. Move the console in the data and the library shot follows it.
 * `spec.shelfPosition` still exists on DioramaSpec but is unused here — see
 * MediaSpread.tsx and geometry/gameBox.ts's `mediaAnchor`.
 *
 * Distances are quoted at BASE_ASPECT (16:9); CameraRig dollies them out on
 * narrower viewports.
 */

/** Shots derived from a DioramaSpec. `shotsFor` must return every one of these. */
export type RoomShotId = 'console' | 'diorama' | 'library' | 'controller' | 'tv'

/**
 * `stage` and `hall` belong to the museum, which has no DioramaSpec to derive
 * from — they are built by museum-shots.ts instead. They join the union so
 * CameraRig can hold one shot type, but stay out of `shotsFor`'s exhaustive
 * record.
 *
 * `stage` frames the point every focused console presents on; `hall` is the
 * wide opening view of the whole gallery from its entrance.
 *
 * `artifact` is the same precedent, for a different reason: it depends on a
 * SELECTED RANK that `shotsFor(entry, spec)` does not receive, so it is built
 * by `artifactShotFor` and joins the union without entering the record.
 */
export type ShotId = RoomShotId | 'stage' | 'hall' | 'artifact'

export type Shot = {
  id: ShotId
  label: string
  target: [number, number, number]
  /** Unit direction from the target toward the camera. */
  direction: [number, number, number]
  distance: number
  /**
   * How `aspectDolly` applies. 'distance' (default) pulls the camera back on
   * a narrow viewport — right for an object in open space, where cropping
   * loses the subject. 'none' keeps the shot exactly as authored: right for
   * the hall overview, a camera inside a BOX, where pulling back pushes it
   * through a wall — a narrow viewport should crop the hall's width (which
   * carries no content), never dolly the camera out of the room.
   */
  dolly?: 'distance' | 'none'
  /** Orbit clamps differ wildly: 0.3m for a cartridge, 6m for a room. */
  minDistance: number
  maxDistance: number
}

/**
 * The scene's vertical field of view, in degrees. Lives here — not just in
 * Scene.tsx's CAMERA constant — because the library shot's distance is
 * derived from it: the same discipline frame.ts already enforces between the
 * panel and the camera. Scene.tsx imports this rather than re-stating 24.
 */
export const CAMERA_FOV_DEG = 24

function normalise([x, y, z]: [number, number, number]): [number, number, number] {
  const len = Math.hypot(x, y, z) || 1
  return [x / len, y / len, z / len]
}

/** Where the camera ends up for a shot, in world space. */
export function shotCameraPosition(shot: Shot, dolly = 1): [number, number, number] {
  const d = shot.dolly === 'none' ? shot.distance : shot.distance * dolly
  return [
    shot.target[0] + shot.direction[0] * d,
    shot.target[1] + shot.direction[1] * d,
    shot.target[2] + shot.direction[2] * d,
  ]
}

export function shotsFor(entry: ConsoleEntry, spec: DioramaSpec): Record<RoomShotId, Shot> {
  const consoleHeight = entry.dimensions.height * MM

  // The spread's own footprint, so the library shot both centres on the
  // games (not the floor they stand on) and frames wide enough to hold every
  // one of them — a hardcoded distance would over- or under-frame depending
  // on whether the archetype is a narrow cartridge or a wide DVD keepcase.
  const media = archetype(entry.mediaArchetype)
  const slots = layoutSpread({ archetype: media, count: entry.games.length, ranks: MEDIA_SPREAD_RANKS })
  const extent = spreadExtent(slots, media)
  const anchor = mediaAnchor(entry, spec)

  // Horizontal half-angle of the lens at the tuned 16:9 aspect, so the
  // derived distance actually fits `extent.width` in frame at that aspect —
  // aspectDolly() handles narrower viewports separately, at render time.
  const vHalf = (CAMERA_FOV_DEG * Math.PI) / 180 / 2
  const hHalf = Math.atan(Math.tan(vHalf) * BASE_ASPECT)
  const libraryPadding = 1.18
  // Floored a hair above the shot's own minDistance (0.4) below, not equal to
  // it — an orbit clamp that starts exactly at the resting distance leaves no
  // room to zoom in at all.
  const libraryDistance = Math.max(0.45, (extent.width / 2 / Math.tan(hHalf)) * libraryPadding)

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

    /**
     * Square onto the spread, close enough to read cover art. Target and
     * distance both derive from the spread's own anchor and footprint
     * (mediaAnchor / spreadExtent), never from spec.shelfPosition — that
     * field still exists on DioramaSpec but names a wall the room no longer
     * has.
     */
    library: {
      id: 'library',
      label: 'Games',
      target: [anchor[0], anchor[1] + extent.height / 2, anchor[2] + extent.depth / 2],
      // More elevation, less grazing than the old shelf-tuned angle: a
      // near-square four-rank cluster (MEDIA_SPREAD_RANKS) reads better from
      // a clearer 3/4-down view than the old wide, flat two-rank row did.
      direction: normalise([0.24, 0.36, 1]),
      distance: libraryDistance,
      minDistance: 0.4,
      maxDistance: Math.max(4, libraryDistance * 3),
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
 * The Game Artifact shot: one selected box, framed close enough to read as an
 * object.
 *
 * Deliberately derived from the SAME layoutSpread + mediaAnchor the box
 * renders with, so the camera and the contents cannot disagree about where
 * the subject is — the same discipline the library shot already follows. The
 * box's world position is the spread anchor plus its slot offset, PLUS the
 * selection lift (LIFT_M): the box is raised off the floor when selected, so
 * aiming at its un-lifted slot would leave it visibly low of dead centre.
 *
 * The target is the box's MIDDLE, not its base — the same convention the
 * console shot uses (consolePosition + height/2). Aiming at the base pins
 * the look-at point at the floor, which reads fine from the authored
 * distance but puts the whole box high in frame once the user zooms in; the
 * centre keeps the box centred under the orbit pivot at every distance.
 * The distance comes from the box's own real height through the same lens
 * math the library shot uses, so a short cartridge frames tighter than a
 * tall DVD keepcase.
 */
export function artifactShotFor(
  entry: ConsoleEntry,
  spec: DioramaSpec,
  rank: number,
  layout: Layout = 'wide',
): Shot {
  const media = archetype(entry.mediaArchetype)
  const halfHeight = (media.dimensions.height * MM) / 2
  const slots = layoutSpread({ archetype: media, count: entry.games.length, ranks: MEDIA_SPREAD_RANKS })
  const gameIdx = entry.games.findIndex((g) => g.rank === rank)
  const slot = gameIdx === -1 ? null : slots[gameIdx]
  const anchor = mediaAnchor(entry, spec)

  // A missing slot means the rank is not in the spread (stale selection);
  // fall back to framing the spread's own anchor so the camera still lands
  // somewhere sane instead of NaN-ing.
  // A REAL BUG, caught and fixed here: this used to add `halfHeight` a
  // SECOND time on top of `slot.position[1]`. `layoutSpread` already sets
  // each slot's Y to `boxH / 2` (see geometry/gameBox.ts) — the box's own
  // CENTRE, not its floor — because GameBox renders each box centred on its
  // group position, the same convention this doc comment already describes
  // ("The target is the box's MIDDLE"). Adding halfHeight again moved the
  // look-at point a full halfHeight ABOVE the box's true centre, landing it
  // almost exactly on the box's TOP edge instead. Confirmed live: for the
  // Atari 2600 archetype (halfHeight 49mm), the box's measured screen-space
  // top sat within 2px of the target's projected position — the aim point
  // WAS the top edge, not the middle. Small cartridges hid this (the error
  // was a few pixels); Atari 2600's corrected 98mm-tall archetype made the
  // resulting "camera aims too high, box hangs low in frame" error large
  // enough to visibly overlap the bottom panel even at the resting shot.
  const target: [number, number, number] = slot
    ? [
        anchor[0] + slot.position[0],
        anchor[1] + slot.position[1] + LIFT_M,
        anchor[2] + slot.position[2],
      ]
    : [anchor[0], anchor[1] + LIFT_M + halfHeight, anchor[2]]

  const vHalf = (CAMERA_FOV_DEG * Math.PI) / 180 / 2

  // Padding over the box's height, derived from the CLEAR band the room
  // chrome actually leaves — not a bare constant — because the target is
  // centred in the FULL frame (see `target` above) while frame.ts's `dy`
  // offset only ever SHIFTS which part of that frame is visible; it cannot
  // shrink the box. A box sized to fill more of the full frame than the
  // clear band leaves is guaranteed to bleed into the top strip or the
  // bottom panel no matter how it's shifted.
  //
  // TWO real bugs lived here, fixed together:
  //
  // 1. This padding used to be a bare 1.4 (targeting ~71% of the FULL
  //    frame height) with a distance floor of 0.35. For most cartridges the
  //    floor silently pulled the camera back FURTHER than 1.4 alone would
  //    have, which incidentally kept them inside the ~53% clear band
  //    ('wide' layout: 1 - panelH 0.32 - topH 0.15) — bug #2 below made
  //    that floor identical across archetypes, which is what actually hid
  //    this one. Lowering the floor (to fix #2) let several archetypes'
  //    raw 1.4-padded distance stand on its own — and 71% of the full frame
  //    does not fit in a 53% clear band. Confirmed live: the Atari 2600 cart
  //    (corrected to a taller 98mm archetype) rendered cropped by both the
  //    top strip and the bottom panel at the old padding once its own
  //    distance (0.32) replaced the shared floor.
  //
  // 2. The floor was a flat 0.35, well above the height-derived distance
  //    for every cartridge archetype (SNES 0.29, master-system 0.33,
  //    genesis/n64 lower) — so almost every cartridge rested at the SAME
  //    clamped 0.35 regardless of its real size. Invisible while every
  //    cartridge had a similar footprint; the Atari 2600's corrected
  //    portrait dimensions (83 x 98mm, was a wrong 102 x 70mm landscape)
  //    made it noticeably narrower than SNES (136mm) while sharing that
  //    identical clamped distance, so it read smaller on screen despite
  //    being roughly as tall.
  //
  // The fix for both: derive padding from the room's own clear-band
  // fraction (frame.ts's single source of truth, shared with the chrome
  // that actually draws the panel), with a safety margin for the box's own
  // diagonal footprint at this shot's oblique angle — a box rotated toward
  // camera reads taller on screen than its raw height alone — and floor the
  // distance a hair above minDistance, not at an arbitrary constant.
  // `artifactShotFor` only ever runs for a selected game (mode 'artifact'),
  // which only exists inside the games section — so `topHFor` always gets
  // told it's in the games section, folding in the compact filmstrip's
  // height (GameList.tsx) on top of the ordinary top chrome.
  const chrome = layout === 'compact' ? ROOM_CHROME.compact : ROOM_CHROME
  const clearBandFraction = 1 - chrome.panelH - topHFor(layout, true)
  const diagonalSafetyMargin = 0.82
  const artifactPadding = 1 / (clearBandFraction * diagonalSafetyMargin)
  const distance = Math.max(0.25, (media.dimensions.height * MM / 2 / Math.tan(vHalf)) * artifactPadding)

  return {
    id: 'artifact',
    label: 'Artifact',
    target,
    // The same clear 3/4-down read the library shot uses, pulled in tight.
    direction: normalise([0.22, 0.32, 1]),
    distance,
    minDistance: 0.22,
    maxDistance: Math.max(2, distance * 3),
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
