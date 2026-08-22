import type { OrthographicCamera, PerspectiveCamera } from 'three'

/**
 * The layout contract shared between the 2D room chrome and the 3D camera.
 *
 * The room screen's bottom panel covers roughly a third of the viewport and
 * sits ON TOP of the console without moving it, so the console has to be
 * framed clear of it. The left title column is top-aligned — it occupies the
 * upper-left corner, not a band the console sits under — so the console stays
 * HORIZONTALLY CENTRED and only needs the vertical lift. The top strip is
 * now TWO rows (the 56px ConsoleNav bar plus the SectionSwitch row beneath
 * it), and `topH` covers both. This file is the one place that fact lives,
 * imported by both sides: `CameraRig.tsx` reads it to push the camera's view
 * rectangle, and the room chrome components read the SAME fractions to size
 * themselves. Neither can drift from the other because there is only one set
 * of numbers.
 *
 * The mechanism is `PerspectiveCamera.setViewOffset` in RATIO form — see
 * `applyFrameOffset` for why that specific form matters. It shifts which
 * portion of the projection is rendered, not the camera's position or the
 * shot's target — `shots.ts` stays untouched. The sign convention is the
 * one already established and documented in `src/review.ts:60-70`: positive
 * `dy` shifts the SUBJECT up on screen; positive `dx` shifts it left. To
 * clear the bottom panel we want `dy > 0`; horizontally the subject stays
 * centred, so `dx` is always 0.
 */

export type Layout = 'wide' | 'compact'

/**
 * The REAL, fixed-pixel height of the top chrome in compact layout — the
 * 56px ConsoleNav header (`h-14`) plus the SectionSwitch tab row beneath it
 * (`pt-5` 20px + its 28px `leading-none` text), measured live against the
 * actual DOM (`getBoundingClientRect`), not derived: 56 + 20 + 28 = 104.
 *
 * This is deliberately a DIFFERENT number from `ROOM_CHROME.compact.topH`,
 * which is a vh FRACTION carrying its own safety margin for the camera's
 * framing ("0.21 ... held with margin", see below) — a fraction is the
 * wrong tool for "sit this element's edge flush against that one", because
 * its margin is the whole point of it not being flush. GameList's compact
 * filmstrip docks against this exact pixel value instead, so "right under
 * the tabs" means what it says rather than floating in the topH fraction's
 * built-in slack. Nothing else should need this — everywhere the camera's
 * OWN framing is concerned, `topHFor`/`ROOM_CHROME` remain the source of
 * truth, on purpose (their slack is what keeps the 3D subject clear).
 */
export const TOP_CHROME_PX = 104

/**
 * Fractions of the viewport the room chrome occupies. `panelH`/`topH` are
 * vertical (bottom panel, top brand/header strip); `titleW` is the left
 * title column's width — kept as the historical width of the sidebar that
 * replaced the title column, so the number that once framed the room's left
 * edge stays recorded even though nothing consumes it today (the sidebar is
 * real layout now, sized in App.tsx, and the console stays centred).
 */
export const ROOM_CHROME = {
  panelH: 0.32,
  /**
   * Top strip fraction: the 56px ConsoleNav bar PLUS the ~60px SectionSwitch
   * row that now sits directly under it (top-14 + pt-5 + a 28px Sentient
   * line). 116px against a 900px viewport is ~13%; 0.15 is held with margin
   * so the camera never frames the console under the switcher on a shorter
   * screen. Both numbers were re-derived against a real viewport rather than
   * extrapolated — the frame.test.ts coverage test pins this floor.
   */
  topH: 0.15,
  titleW: 0.34,
  /** Height when the panel is collapsed to just its chevron bar. */
  collapsedPanelH: 0.08,
  compact: {
    panelH: 0.45,
    // Same 116px of chrome, but a compact viewport can be much shorter —
    // 116px against a 700px phone is ~17%, and 0.21 holds the same margin.
    topH: 0.21,
    titleW: 0,
    collapsedPanelH: 0.08,
    /**
     * A REAL BUG, fixed by this fraction existing at all: the games
     * section's GameList used to size itself to the FULL clear band (top
     * strip to bottom panel) on every layout — fine on wide, where it's a
     * narrow 264px side rail with the 3D view visible beside it, but on
     * compact it is full-width (`left-4 right-4`), so "the full clear
     * band" meant the list covered the ENTIRE area the 3D camera was also
     * trying to frame the cartridge into. The games section's 3D art was
     * never visible on a phone — not cropped, not small, entirely hidden
     * under an opaque list panel every single time.
     *
     * The fix: on compact, GameList renders as a short horizontal filmstrip
     * (cover thumbnails in a row) docked just under the header, instead of
     * a tall vertical list spanning to the bottom panel. This fraction is
     * that filmstrip's own height — read by GameList.tsx to size itself,
     * and by `topHFor`/`frameOffsetFor` below so the camera's clear-band
     * math knows this extra band exists too and frames the 3D box under
     * it, not behind it.
     */
    gamesStripH: 0.12,
  },
} as const

/**
 * The top offset actually in effect for the CAMERA'S clear-band math —
 * `ROOM_CHROME.topH` on the console section or on wide layout (where
 * GameList is a side rail, not a horizontal band), plus the compact games
 * filmstrip's own height when it's actually on screen (compact layout,
 * games section). One function so GameList's own positioning and the
 * camera's framing can never read two different answers for "how much top
 * chrome is there right now".
 */
export function topHFor(layout: Layout, inGamesSection: boolean): number {
  const chrome = layout === 'compact' ? ROOM_CHROME.compact : ROOM_CHROME
  const filmstrip = layout === 'compact' && inGamesSection ? ROOM_CHROME.compact.gamesStripH : 0
  return chrome.topH + filmstrip
}

export type FrameOffset = { dx: number; dy: number }
export const NO_OFFSET: FrameOffset = { dx: 0, dy: 0 }

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
  inGamesSection = false,
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
  // `topHFor` folds in the compact games filmstrip's own height when it's
  // actually on screen, so the subject centres in the band BELOW it too.
  const dy = clamp((panelH - topHFor(layout, inGamesSection)) / 2, 0, MAX_DY)
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
