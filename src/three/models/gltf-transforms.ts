/**
 * Per-console fixups for dropped-in GLB files — see public/models/README.md.
 *
 * `scale` is the uniform multiplier that brings a model's raw exported units
 * to real-world metres, matching this project's scene convention (everything
 * else is in metres via the `mm`/`MM` helpers in profiles.ts and lighting.ts).
 * Sketchfab exports carry no consistent unit convention — some of these
 * arrived unit-cube-normalized, some in centimetres, one already in metres —
 * so each scale below was derived by measuring the model's own raw bounding
 * box (a one-off /measure.html harness) against the console's real published
 * dimensions and solving for the multiplier, not guessed or eyeballed.
 *
 * `hideMeshIndices` removes mesh(es) by their scene-traversal index (0-based,
 * mesh nodes only) — for the handful of models that bundle a detached
 * controller/cartridge/cable into the same file as the console body. Indices
 * were found the same way: traverse the raw scene, dump each mesh's own
 * bounding box, and identify which cluster spatially away from the console.
 */
export type GltfTransform = {
  scale: number
  hideMeshIndices?: number[]
  notes: string
}

export const GLTF_TRANSFORMS: Record<string, GltfTransform> = {
  snes: {
    // Only 2 meshes in the whole scene -- console body, controller, coiled
    // cord and an inserted cartridge are all fused into them, so unlike
    // nes/n64 there is no submesh boundary to isolate the console by. The
    // three raw axes disagree badly if matched whole-bbox to the real
    // console (203.2 x 68 x 254mm): implied scales of 0.157 / 0.203 / 0.316
    // on height/width/depth respectively, a 2x spread -- because the
    // dangling controller + cord extend the model well past the console's
    // own footprint on the height and depth axes, but not on width (the
    // controller sits below/in front of the shell, not beside it). Anchored
    // on width alone (least likely axis to be corrupted by the bundled
    // extras) rather than averaging all three, which would silently bake in
    // the controller's extra bulk. The controller + cord + cartridge will
    // still render attached to the console in the diorama at this scale --
    // fixing that needs the source model re-authored with separable parts,
    // not a scale number.
    scale: 0.2032,
    notes:
      'Real SNES: 203.2 x 68 x 254mm (Nintendo published spec, already used elsewhere in this project). ' +
      'Width-anchored only -- see the code comment above for why height/depth cannot be trusted from this file.',
  },
  'atari-2600': {
    scale: 0.07244,
    notes:
      'Real Atari 2600 (four-switch, woodgrain): 346.1 x 88.9 x 231.8mm (width x height x depth). ' +
      'Uniform scale fit leaves a 22% residual error on the widest axis -- the model’s own footprint reads ' +
      'noticeably squarer (near 1.13:1 width:depth) than the real console (1.49:1). That mismatch is in the ' +
      'source geometry, not something a scale factor can correct; flagged for a possible model swap later.',
  },
  nes: {
    scale: 0.97977,
    // Only index 5 (Object_10) is a separable extra. The rest of the bundled
    // controller CANNOT be hidden by index in this export: mesh 0 spans
    // z -0.104..+0.366 while the console body is only -0.10..+0.10, so the
    // pad lying in front of the console is fused into the same mesh as the
    // console's own shell. Hiding it takes the console with it (verified by
    // toggling in the browser).
    //
    // The old list also named 6, 7 and 8, which no longer exist — the file
    // was re-exported from 9 meshes down to 6. Same staleness that made the
    // N64 vanish entirely; see the guard in GltfModel.tsx.
    //
    // Fixing this properly needs the source model re-authored with separable
    // parts, not a different index list.
    hideMeshIndices: [5],
    notes:
      'Real NES (top-loader): 256 x 88.9 x 203.2mm. This model was exported already close to real-world ' +
      'metres (raw size ~0.256 x 0.089 x 0.216 for the console alone) -- scale is ~1.0, only a minor correction. ' +
      'Console-only fit is excellent (~4% max-axis error).',
  },
  'master-system': {
    scale: 0.08311,
    notes: 'Real Sega Master System: 365 x 69 x 170mm. Excellent fit (~3.6% max-axis error).',
  },
  genesis: {
    scale: 0.00973,
    notes:
      'Real Sega Genesis / Mega Drive (Model 1): 278.1 x 57.2 x 214.6mm. Raw model size (~28 x 6.2 x 21.3) reads ' +
      'as already-exported centimetres -- 0.00973 is close to the expected 1/100 cm-to-m factor. Good fit (~5.3%).',
  },
  saturn: {
    scale: 0.24167,
    notes:
      'Real Sega Saturn: 260 x 83 x 230mm. Moderate fit (~11% max-axis error) -- the model reads a little ' +
      'deeper relative to its width than the real console.',
  },
  playstation: {
    scale: 0.00063,
    notes: 'Real PS1 (SCPH-1000/1001): 275 x 65 x 190mm. Good fit (~9% max-axis error).',
  },
  ps2: {
    scale: 0.00074,
    notes: 'Real PS2 "fat" (SCPH-10000): 302.3 x 78.7 x 182.9mm. Good fit (~8.6% max-axis error).',
  },
  ps3: {
    scale: 0.57333,
    notes: 'Real PS3 "fat" (CECHA01): 325 x 98 x 274mm. Best fit of the whole batch (~2% max-axis error).',
  },
  ps4: {
    scale: 0.00732,
    notes: 'Real PS4 launch (CUH-1000): 275 x 53 x 305mm. Good fit (~6.6% max-axis error).',
  },
  ps5: {
    scale: 0.14108,
    notes:
      'Real PS5 disc console, standing (no base): 104mm thick x 390mm tall x 260mm deep. This model was exported ' +
      'already standing upright, matching the PS5’s actual resting orientation -- unlike every other console ' +
      'here, which lie flat. 22% residual error on the thickness axis; the real PS5 is dramatically thin (2.5x ' +
      'thinner than it is deep) and this model reads noticeably chunkier. Orientation (standing vs. lying flat ' +
      'to match the rest of the diorama) is a placement decision, not a scale one -- flagged, not decided here.',
  },
  n64: {
    scale: 0.21205,
    // Console body isolated from a bundled controller + cable via per-mesh
    // bounding-box clustering: meshes 8/9/10/11/15 all share x ~ 0.085 and
    // carry the console's own footprint, while 0-7 and 12-14 cluster off to
    // one side (the pad and its buttons) or far in -z (the cable).
    //
    // RECOMPUTED after the source file was re-exported smaller: it went from
    // 24 mesh nodes to 16, and the previous list ([0..17, 21, 23]) then
    // covered EVERY surviving index, hiding the console outright. See the
    // out-of-range guard in GltfModel.tsx, which now catches exactly this.
    hideMeshIndices: [0, 1, 2, 3, 4, 5, 6, 7, 12, 13, 14],
    notes:
      'Real N64: 260 x 73 x 190mm (width x depth x height per the source, i.e. 260 x 190 x 73 in width/height/' +
      'depth order). Console-only fit is moderate (~11.5% max-axis error); a thin sliver of the controller cord ' +
      'was still attached at the isolation boundary and could not be cleanly separated by mesh alone.',
  },
}
