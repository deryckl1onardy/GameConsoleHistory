/**
 * Pointer-interaction rules for the shelf (Phase 7).
 *
 * A drag and a click can share a pointer: R3F fires `onClick` on pointer-up
 * over the hit object even after a long drag, so the ONLY thing separating
 * "I clicked this console" from "I dragged past it" is how far the pointer
 * travelled between down and up. These are the numbers every interactive
 * station shares, and the reason the click handlers in ShelfBay's hit plane
 * can be trusted at all.
 */

/** Pixels the pointer may travel between down and up before it stops being a click. */
export const DRAG_THRESHOLD_PX = 6

/**
 * A press-release pair is a DRAG (and therefore not a click) if the pointer
 * moved beyond the threshold between down and up. Squared distances: no sqrt,
 * no allocations.
 */
export function isDrag(downX: number, downY: number, upX: number, upY: number): boolean {
  const dx = upX - downX
  const dy = upY - downY
  return dx * dx + dy * dy > DRAG_THRESHOLD_PX * DRAG_THRESHOLD_PX
}
