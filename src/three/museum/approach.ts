/**
 * Timing for the shelf-to-room approach and its reverse.
 *
 * Pure numbers only — the actual choreography (which refs move when) lives in
 * CameraRig, MuseumLights and Diorama, each reacting to `store.approach`
 * independently. This file exists so those three places share one clock
 * instead of three sets of hand-copied constants.
 *
 * Forward sequence, from the moment `selectArtifact` fires (t = 0):
 *
 *   0                      focusing    hover relaxes, camera holds
 *   FOCUS_HOLD_MS          approaching camera flies to the approach shot
 *   FOCUS_HOLD_MS+FLIGHT_MS   HANDOFF  camera/target/hero teleport by T,
 *                                      synchronously, before any store write
 *   ...+ARRIVE_MS           idle       room lights have reached rest
 *
 *   total: FOCUS_HOLD_MS + FLIGHT_MS + ARRIVE_MS = 2560ms, matching the
 *   room's own existing INTRO budget (shots.ts) so neither move feels
 *   out of step with the other.
 *
 * Reverse sequence, from `retreatToShelf` (t = 0):
 *
 *   0                       retreating  room lights fade down
 *   RETREAT_FADE_MS          HANDOFF    camera/target/hero teleport by -T
 *   ...+RETREAT_FLIGHT_MS     idle      camera has reached the bay shot
 *
 *   total: 700ms — deliberately a quick pull-back, not the forward
 *   sequence played backward. See the plan's scope note: reverse
 *   choreography is a later refinement, not this pass's job.
 */
export const APPROACH_TIMING = {
  FOCUS_HOLD_MS: 260,
  FLIGHT_MS: 1400,
  ARRIVE_MS: 900,
  RETREAT_FADE_MS: 250,
  RETREAT_FLIGHT_MS: 450,
} as const
