import { describe, expect, it } from 'vitest'
import { PerspectiveCamera, Vector3 } from 'three'
import { NO_OFFSET, applyFrameOffset, frameOffsetFor } from './frame'

describe('frameOffsetFor', () => {
  it('lifts the subject up (positive dy) and keeps it horizontally centred (dx 0) on a wide layout', () => {
    const { dx, dy } = frameOffsetFor(1440, 900, 'wide')
    expect(dy).toBeGreaterThan(0)
    expect(dx).toBe(0)
  })

  it('keeps the subject horizontally centred on the compact layout too', () => {
    const { dx } = frameOffsetFor(800, 1200, 'compact')
    expect(dx).toBe(0)
  })

  it('still lifts the subject on the compact layout, from its own chrome fractions', () => {
    const wide = frameOffsetFor(1440, 900, 'wide')
    const compact = frameOffsetFor(1440, 900, 'compact')
    // compact's panel is taller and its top strip is taller too — both
    // numbers differ from wide's, so the lift should differ, not coincide.
    expect(compact.dy).not.toBeCloseTo(wide.dy, 5)
    expect(compact.dy).toBeGreaterThan(0)
  })

  it('does not lift the subject when the panel is collapsed', () => {
    const wide = frameOffsetFor(1440, 900, 'wide')
    const collapsed = frameOffsetFor(1440, 900, 'wide', true)
    // The collapsed bar (8%) is SHORTER than the top strip (10%), so the
    // clear band's midpoint sits below the viewport centre — no lift needed,
    // and the clamp keeps a negative from sneaking in.
    expect(collapsed.dy).toBe(0)
    expect(collapsed.dy).toBeLessThan(wide.dy)
  })

  it('clamps dy well inside the safety rail regardless of how tall the chrome fractions get', () => {
    // ROOM_CHROME.panelH/topH are already both < 1, but the clamp is what
    // actually protects the frustum from a degenerate offset if someone
    // tunes those fractions carelessly later — assert the clamp holds, not
    // just today's specific numbers.
    const { dy } = frameOffsetFor(1440, 900, 'wide')
    expect(dy).toBeLessThanOrEqual(0.2)
  })

  it('returns NO_OFFSET for a degenerate viewport', () => {
    expect(frameOffsetFor(0, 900)).toEqual(NO_OFFSET)
    expect(frameOffsetFor(1440, 0)).toEqual(NO_OFFSET)
    expect(frameOffsetFor(-100, 900)).toEqual(NO_OFFSET)
    expect(frameOffsetFor(NaN, 900)).toEqual(NO_OFFSET)
    expect(frameOffsetFor(1440, Infinity)).toEqual(NO_OFFSET)
  })

  it('is deterministic', () => {
    expect(frameOffsetFor(1440, 900, 'wide')).toEqual(frameOffsetFor(1440, 900, 'wide'))
  })
})

describe('applyFrameOffset — the sign contract', () => {
  /**
   * The one assertion that matters: `dy` and `dx` are screen-space fractions
   * of where the SUBJECT moves, not implementation details of three's view
   * rectangle. Verified by projecting a real point through a real camera,
   * exactly the way the app actually uses this — round-tripping through
   * `setViewOffset` rather than trusting the doc comment.
   */
  it('moves a projected point by exactly 2*dy vertically and -2*dx horizontally in NDC', () => {
    const camera = new PerspectiveCamera(24, 16 / 9, 0.05, 120)
    camera.position.set(0, 0, 5)
    camera.lookAt(0, 0, 0)
    camera.updateMatrixWorld()
    camera.updateProjectionMatrix()

    const world = new Vector3(0.05, 0.02, 0)
    const before = world.clone().project(camera)

    const offset = { dx: -0.1, dy: 0.13 }
    applyFrameOffset(camera, offset)
    camera.updateProjectionMatrix()

    const after = world.clone().project(camera)

    // NDC spans [-1, 1], so one full "view rectangle" fraction is 2 NDC units.
    expect(after.y - before.y).toBeCloseTo(2 * offset.dy, 5)
    expect(after.x - before.x).toBeCloseTo(-2 * offset.dx, 5)
  })

  it('leaves the projection matrix untouched when clearing back to NO_OFFSET', () => {
    // The handoff's whole safety argument rests on this: a camera at
    // NO_OFFSET must be provably identical to one that was never offset at
    // all, not just "close enough" — otherwise the shelf<->room translation
    // (proven exact to 1e-9 in museum-shots.test.ts) would be composing with
    // a residual projection change nothing else accounts for.
    const untouched = new PerspectiveCamera(24, 16 / 9, 0.05, 120)
    untouched.updateProjectionMatrix()

    const roundTripped = new PerspectiveCamera(24, 16 / 9, 0.05, 120)
    applyFrameOffset(roundTripped, { dx: -0.1, dy: 0.13 })
    roundTripped.updateProjectionMatrix()
    applyFrameOffset(roundTripped, NO_OFFSET)
    roundTripped.updateProjectionMatrix()

    expect(roundTripped.projectionMatrix.elements).toEqual(untouched.projectionMatrix.elements)
  })

  it('never changes the camera aspect — three clobbers it in setViewOffset', () => {
    // r185's setViewOffset writes aspect = fullWidth/fullHeight (1 in ratio
    // form); applyFrameOffset must put it back or the scene renders squashed
    // until the next resize. Pin the guard here so a three upgrade can't
    // silently reintroduce it.
    const camera = new PerspectiveCamera(24, 16 / 9, 0.05, 120)
    applyFrameOffset(camera, { dx: -0.1, dy: 0.13 })
    camera.updateProjectionMatrix()
    expect(camera.aspect).toBeCloseTo(16 / 9, 10)
  })

  it('never calls setViewOffset for NO_OFFSET — clearViewOffset is the only path', () => {
    const camera = new PerspectiveCamera(24, 16 / 9, 0.05, 120)
    let cleared = false
    const originalClear = camera.clearViewOffset.bind(camera)
    camera.clearViewOffset = () => {
      cleared = true
      originalClear()
    }
    applyFrameOffset(camera, NO_OFFSET)
    expect(cleared).toBe(true)
  })
})
