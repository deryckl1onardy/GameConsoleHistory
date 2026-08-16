import { describe, expect, it } from 'vitest'
import { DRAG_THRESHOLD_PX, isDrag } from './interaction'

/**
 * The shelf's pointer rules: the ONLY thing separating a click from a drag on
 * a pointer is how far it travelled between down and up (R3F fires onClick on
 * release over the object regardless), so a drag that starts over a console
 * must not open it. These tests pin the number every interactive station
 * shares.
 */
describe('the shelf pointer rules', () => {
  it('treats a stationary press-release as a click', () => {
    expect(isDrag(100, 100, 101, 102)).toBe(false)
    // Exactly at the threshold is still a click.
    expect(isDrag(100, 100, 100 + DRAG_THRESHOLD_PX, 100)).toBe(false)
    expect(isDrag(100, 100, 100, 100 + DRAG_THRESHOLD_PX)).toBe(false)
  })

  it('treats any move beyond the threshold as a drag, not a click', () => {
    // A hair past the threshold, in any direction, is a drag.
    expect(isDrag(100, 100, 100 + DRAG_THRESHOLD_PX + 0.5, 100)).toBe(true)
    expect(isDrag(100, 100, 100, 100 + DRAG_THRESHOLD_PX + 0.5)).toBe(true)
    expect(isDrag(100, 100, 100 - DRAG_THRESHOLD_PX - 0.5, 100)).toBe(true)
    // A diagonal that stays inside the threshold radius is a click.
    expect(isDrag(100, 100, 104, 104)).toBe(false)
  })

  it('the drag threshold is sub-button-move so real clicks never drag', () => {
    // Mouse jitter while clicking is a few pixels at most; the threshold must
    // swallow it while staying far short of a real gesture.
    expect(DRAG_THRESHOLD_PX).toBeGreaterThanOrEqual(3)
    expect(DRAG_THRESHOLD_PX).toBeLessThanOrEqual(10)
  })
})
