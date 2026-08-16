import type { OrthographicCamera, PerspectiveCamera } from 'three'

/**
 * The layout contract shared between the 2D room chrome and the 3D camera.
 *
 * The room screen's bottom panel covers roughly a third of the viewport and
 * sits ON TOP of the console without moving it, so the console has to be
 * framed clear of it. The left title column is top-aligned — it occupies the
 * upper-left corner, not a band the console sits under — so the console stays
 * HORIZONTALLY CENTRED and only needs the vertical lift. This file is the one
 * place that fact lives, imported by both sides: `CameraRig.tsx` reads it to
 * push the camera's view rectangle, and the room chrome components read the
 * SAME fractions to size themselves. Neither can drift from the other because
 * there is only one set of numbers.
 *
 * The mechanism is `PerspectiveCamera.setViewOffset` in RATIO form — see
 * `applyFrameOffset` for why that specific form matters. It shifts which
 * portion of the projection is rendered, not the camera's position or the
 * shot's target — `shots.ts` and the shelf<->room handoff (see
 * `museum-shots.ts`'s roomDelta) stay untouched. The sign convention is the
 * one already established and documented in `src/review.ts:60-70`: positive
 * `dy` shifts the SUBJECT up on screen; positive `dx` shifts it left. To
 * clear the bottom panel we want `dy > 0`; horizontally the subject stays
 * centred, so `dx` is always 0.
 */

export type Layout = 'wide' | 'compact'

/**
 * Fractions of the viewport the room chrome occupies. `panelH`/`topH` are
 * vertical (bottom panel, top brand/header strip); `titleW` is the left
 * title column's width. These are the actual numbers `DetailPanel` and
 * `ConsoleTitle` size themselves to — changing one without the other is
 * exactly the drift this file exists to prevent.
 */
export const ROOM_CHROME = {
  panelH: 0.32,
  topH: 0.1,
  titleW: 0.34,
  /** Height when the panel is collapsed to just its chevron bar. */
  collapsedPanelH: 0.08,
  compact: {
    panelH: 0.45,
    topH: 0.16,
    titleW: 0,
    collapsedPanelH: 0.08,
  },
} as const

export type FrameOffset = { dx: number; dy: number }
export const NO_OFFSET: FrameOffset = { dx: 0, dy: 0 }

/**
 * The shelf's own bottom chrome — the timeline strip. Much shorter than the
 * room's detail panel (a strip of year marks, not a thirds-of-the-screen
 * panel) but real: with the strip in place the shelf camera has to lift the
 * subject clear of it just like the room does. Fraction of the viewport the
 * strip occupies.
 */
const SHELF_CHROME_PANEL_H = 0.09

/**
 * The offset that clears the shelf's timeline strip — the shelf half of the
 * frame-offset contract. Same shape as `frameOffsetFor` (a vertical lift, no
 * horizontal dodge) with the shelf's own chrome fractions; see the file
 * header for why the mechanism is identical.
 */
export function shelfFrameOffsetFor(width: number, height: number): FrameOffset {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return NO_OFFSET
  }
  const dy = clamp(SHELF_CHROME_PANEL_H / 2, 0, MAX_DY)
  return { dx: 0, dy }
}

/** How far the subject may be lifted, as a safety rail on the arithmetic below. */
const MAX_DY = 0.2

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v))
}

/**
 * The offset that clears the console of the room chrome for a given viewport
 * and layout. Pure — no store, no camera, so it is trivially unit-testable
 * and safe to call from both a React component and CameraRig.
 *
 * `width`/`height` are accepted (rather than just `layout`) so a genuinely
 * degenerate viewport — 0, negative, NaN — falls back to `NO_OFFSET` instead
 * of producing a NaN that would black the projection matrix, the same guard
 * `aspectDolly` already applies in `shots.ts` for the same reason.
 */
export function frameOffsetFor(
  width: number,
  height: number,
  layout: Layout = 'wide',
  collapsed = false,
): FrameOffset {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return NO_OFFSET
  }

  const chrome = layout === 'compact' ? ROOM_CHROME.compact : ROOM_CHROME
  // A collapsed panel barely hides anything, so the console barely needs
  // lifting — the offset follows the panel's actual height, not a binary.
  const panelH = collapsed ? chrome.collapsedPanelH : chrome.panelH
  // Centring the console in the CLEAR band between the top strip and the
  // bottom panel means lifting it by half the difference between them.
  const dy = clamp((panelH - chrome.topH) / 2, 0, MAX_DY)
  // The console stays horizontally centred. The left title column is
  // top-aligned, so the console sits beside (not under) it and needs no
  // horizontal dodge — and the console shot already aims dead-on at the
  // console, so any non-zero dx would visibly push it off-centre.
  const dx = 0

  return { dx, dy }
}

/**
 * Applies (or clears) a frame offset on a live camera.
 *
 * Ratio form — `setViewOffset(1, 1, dx, dy, 1, 1)` — on purpose, not pixel
 * form. With `fullWidth = fullHeight = 1`, three's own scale terms
 * (`width *= view.width/fullWidth`) reduce to `*= 1`, so FOV and aspect are
 * untouched; only the frustum's `left`/`top` shift. It also means this call
 * never needs to know the canvas's actual pixel size or DPR, and R3F's own
 * resize handling (`updateProjectionMatrix()`, which READS `camera.view`
 * rather than clearing it) requires no coordination at all — resize and DPR
 * changes are complete non-events for this offset.
 *
 * `{dx: 0, dy: 0}` clears the offset rather than applying a no-op one, so a
 * camera that has never been framed (the shelf, or either handoff instant)
 * is provably identical to a camera `setViewOffset` was never called on —
 * see frame.test.ts's handoff test, which pins exactly that.
 */
export function applyFrameOffset(
  camera: PerspectiveCamera | OrthographicCamera,
  offset: FrameOffset,
): void {
  if (offset.dx === 0 && offset.dy === 0) {
    camera.clearViewOffset()
    return
  }
  /*
   * three r185's setViewOffset writes `this.aspect = fullWidth / fullHeight`
   * before building the frustum — with ratio form that is 1, so the real
   * aspect would be silently clobbered and the scene would render squashed
   * until the next resize happened to fix it. Save and restore it so the
   * offset is a pure frustum shift: FOV and aspect untouched, exactly the
   * contract this file promises.
   */
  // Only a PerspectiveCamera carries an aspect; an OrthographicCamera has no
  // projection-matrix aspect term to protect.
  const perspective = 'aspect' in camera ? camera : null
  const aspect = perspective?.aspect ?? null
  camera.setViewOffset(1, 1, offset.dx, offset.dy, 1, 1)
  if (perspective && aspect !== null) perspective.aspect = aspect
  camera.updateProjectionMatrix()
}
