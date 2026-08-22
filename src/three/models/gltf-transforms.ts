import type { MediaArchetypeId } from '@/types/console'

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
  /**
   * Radians around Y applied by CartridgeModel when the model's label face
   * is not authored toward +z (the scene convention for a cartridge in the
   * spread). Measured from the model's own geometry, like `scale` — e.g.
   * the NES cart's label faces +x, so it turns -90 degrees to face the
   * camera. Console models never need it; only cartridges, whose spread
   * placement is always face-on.
   */
  rotationY?: number
  /**
   * Radians around X applied to the model instance BEFORE floor alignment.
   * Unlike rotationY (applied at the group level), this rotates the geometry
   * itself so floorAlignOffset computes the correct Y-min on the rotated
   * shape. Needed when the source model's label face is authored toward -Y
   * (or +Y) rather than +Z — e.g. the Sketchfab SNES cartridge, whose front
   * face normal is -Y and needs rotationX = -PI/2 to face +Z.
   */
  rotationX?: number
  /**
   * [right, up] in real-world mm, applied to the model's `label` mesh only
   * (see cartridge-label.ts's `offsetLabelMesh`) — never the whole model.
   * Only needed when the shell itself is not left-right symmetric: the NES's
   * moulded connector-release ridge runs down the left edge, so its actual
   * label sits right of the shell's centre line. Most cartridges will never
   * need this field at all.
   */
  labelOffsetMm?: [right: number, up: number]
  /**
   * Flips the label mesh's own UV.u (see cartridge-label.ts's `mirrorLabelU`)
   * when the model's UVs were authored left-right mirrored — caught on the
   * NES model by loading its raw cover art directly and comparing: the
   * source read as legible text, the model rendered it as a mirror image.
   * A geometry fix, not a texture one, so it never touches the shared cover
   * texture other boxes/archetypes also use.
   */
  mirrorLabelU?: boolean
  /**
   * Strips the baked texture off every mesh EXCEPT the label (see
   * cartridge-label.ts's `stripShellTextures`) and repaints it with the
   * console's real shell colour. Only needed when a source model bakes a
   * fake, generic box-art graphic straight onto the SHELL mesh's own UVs —
   * not just onto the separate label plate the artwork contract expects.
   * Caught on the SNES model: its front-shell mesh (`Cube_Material001_0`,
   * matching the full 136x88mm cartridge face) carried its own leftover
   * placeholder graphic, sitting proud of and fully occluding the correctly
   * per-game-updated `label` mesh underneath — a real cover swap on `label`
   * had visibly no effect at all, because the shell's own baked art was the
   * only thing the camera ever saw.
   */
  stripShellTexture?: boolean
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
  dreamcast: {
    // 1 fused mesh ("mesh_0") — the whole console, no bundled extras. Raw box
    // 0.2685 x 0.091 x 0.257 (x = front-to-back, y = height, z = width). The
    // front face (controller ports + SEGA logo) is the +x face.
    scale: 0.734,
    notes:
      'Real Dreamcast: 190 x 76 x 195.8mm (width x height x depth). Fit is good on the ' +
      'footprint (~1.5% agreement between the two horizontal axes) with the height reading ' +
      '~12% short — the model is a touch squat next to the real console.',
  },
  gamecube: {
    // 1 fused mesh ("Object_2"). Raw box 33.04 x 22.31 x 40.14 units (cm-ish export):
    // x = width, y = height, z = front-to-back depth. Front face (4 controller
    // ports + power button) is the +z face; the disc lid is on top.
    scale: 0.00454,
    notes:
      'Real GameCube (DOL-001): 150 x 110 x 161mm. Width-anchored (32.5 units -> 0.150m); ' +
      'height reads ~8% short and depth ~13% long — the model\'s footprint is more elongated ' +
      'than the real console (0.82 width:depth vs 0.93), a source-model quirk a scale cannot fix.',
  },
  switch: {
    // 1 fused mesh — the tablet, both Joy-Cons and the kickstand are all fused into
    // it, exactly like the SNES model. Raw box 6.559 x 2.723 x 1.366 units: x = width
    // across the screen (239mm real), y = height (102mm), z = thickness + open kickstand
    // (13.9mm real; the deployed stand inflates this axis ~3.6x and it cannot be
    // isolated). The model is authored in TABLE-TOP MODE — standing on its open
    // kickstand, but with the screen on the -z face (the back panel, logo and
    // kickstand face +z). The data's `dimensions` describe the DOCK; this model is the
    // handheld, so it is scaled to the handheld's own 239 x 102 x 13.9mm, not the dock.
    scale: 0.037,
    notes:
      'Real Switch handheld (with Joy-Cons): 239 x 102 x 13.9mm. Width/height anchored '
      + '(6.559/2.723 units); the z axis (open kickstand) is inflated ~3.6x by the deployed '
      + 'kickstand and is not a scale error. Renders standing on its kickstand; the data\'s '
      + 'consoleRotation carries the half-turn that shows the screen to the camera.',
  },
  wii: {
    // 5 named meshes: wiiconsole (body, 0.2104 x 0.1757 x 0.044), stand (under it),
    // plus a Wiimote + nunchuck standing beside the console on their own stand. The
    // controller pair is a deliberate display composition (both in their stands), not
    // a stray bundled extra, so unlike nes/n64 nothing is hidden. The console body's
    // depth (z = 44mm) matches the real standing Wii exactly at scale 1.0, but the
    // model is noticeably squat next to real proportions (210 wide x 176 tall vs the
    // real 157 x 215.4mm standing) — genuinely off, flagged in the notes.
    scale: 1.0,
    notes:
      'Real Wii standing: 44mm deep x 157mm wide x 215.4mm tall. The model\'s 44mm depth is ' +
      'exact at scale 1.0, but its width (210mm) reads 34% wide and its height (176mm) 18% ' +
      'short — a genuinely off-proportion source model, like the Atari 2600\'s footprint ' +
      'quirk. The bundled Wiimote + nunchuck are kept as a display composition.',
  },
  'wii-u': {
    // 11 meshes, all console parts (no bundled extras). Raw box 1.2629 x 0.2267 x 0.8233:
    // x = front-to-back depth (268.5mm real), y = height (46mm), z = width (172mm).
    // Front face (disc slot, power button, Wii U logo) is the +x face.
    scale: 0.209,
    notes: 'Real Wii U: 172 x 46 x 268.5mm (width x height x depth). Excellent fit (~4.8% max-axis error).',
  },
  xbox: {
    // 6 meshes: the console (Object_4 + Object_6 bodies, Object_8 jewel, Object_10/14
    // small parts) plus Object_12, a degenerate 2x2 plane lying at y=0 — a baked-in
    // ground/shadow disc that would render as a black circle under the console on top
    // of the diorama\'s own shadow catcher, so it is hidden. Raw box 6.69 x 2.44 x 5.42
    // units (cm-ish): x = width (320mm), y = height (100mm), z = depth (260mm).
    // Front face (controller ports, XBOX logo) is the +z face.
    scale: 0.0478,
    hideMeshIndices: [4],
    notes:
      'Real original Xbox: 320 x 100 x 260mm. Width/depth anchored (0.478/0.480 implied ' +
      'scales agree); the height reads ~17% tall — the model is a bit boxier than the real ' +
      'console. Object_12 (a ground shadow plane) is hidden.',
  },
  'xbox-360': {
    // 31 meshes: the console is the standing slab (indices 21-30; Cube_Material_0 and
    // the Cube001/002/003 cluster), and indices 0-20 are a bundled Xbox 360 controller
    // sitting in FRONT of the console (z -4.9..-0.2 vs the console's +0.2..+3.0). The
    // controller is a stray bundled extra like the NES/N64 pads, not part of the
    // console's own footprint, so it is hidden. Console slab raw box 7.37 x 8.86 x 2.76
    // units: standing, x = width (258mm), y = height (309mm), z = depth (83mm).
    scale: 0.035,
    hideMeshIndices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    notes:
      'Real Xbox 360 (original "fat", standing): 258 x 309 x 83mm. Width/height anchored ' +
      '(0.0350/0.0349 implied scales agree to 0.3%); the depth reads ~13% thick. The model ' +
      'stands on its end, matching the vertical orientation people actually used. Bundled ' +
      'controller (indices 0-20) hidden.',
  },
  'xbox-one': {
    // 4 meshes, all console parts (XboxOne_Matte body, Gloss top, Power button, Metal
    // trim) — no bundled extras. Raw box 0.3327 x 0.0809 x 0.2754, already in metres:
    // x = width (333mm), y = height (79mm), z = depth (274mm). Front face (power
    // button + blu-ray slot) is the +z face.
    scale: 0.99,
    notes:
      'Real Xbox One (original): 333 x 79 x 274mm. Exported already near real metres (0.333 x ' +
      '0.081 x 0.275); scale ~0.99 is only a minor correction. Best fit of the new batch (~2.5% max-axis error).',
  },
  'xbox-series': {
    // 1 fused mesh. Raw box 0.16 x 0.313 x 0.162, already in metres and already standing:
    // x = width (151mm), y = height (301mm), z = depth (151mm). The logo button is on the
    // front (+z) face, the disc slot on the left (-x) face, the fan vent on top.
    scale: 0.94,
    notes:
      'Real Xbox Series X standing: 151 x 301 x 151mm. Exported already near real metres and ' +
      'upright, matching the console\'s actual resting orientation; scale ~0.94 is a minor ' +
      'correction (~3% max-axis error).',
  },
  'xbox-series-s': {
    // The Series S variant model (not a roster console — only referenced by the Series
    // X|S entry's variants array). 1 fused mesh, raw box 6.225 x 26.7 x 14.63 units:
    // y = standing height (275mm), x = depth (63.5mm), z = width (151mm). Fits all three
    // axes to <1%, the best of the new batch. No hero renders this today (variants are
    // prose-only), but the file is measured so it renders right the day one does.
    scale: 0.0103,
    notes: 'Real Xbox Series S standing: 151 x 275 x 63.5mm (width x height x depth). Near-perfect fit (<1% max-axis error).',
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

/**
 * Per-cartridge fixups for dropped-in GLB files — the media sibling of
 * GLTF_TRANSFORMS, consumed by CartridgeModel. See docs/cartridge-models.md
 * for the full artwork contract and authoring checklist.
 *
 * IMPORTANT: cartridge models are ALWAYS sourced from real downloaded or
 * user-provided assets — never procedurally generated. If a model needs
 * fixing, patch the SOURCE file (rename mesh, fix UVs, adjust transforms),
 * don't replace it with code-generated geometry. See CLAUDE.md for the
 * full sourcing policy.
 *
 * The same manifest discipline as the console table: an id only earns an
 * entry here by having its file measured against the archetype's published
 * `dimensions` (the .img2threejs workflow's scale-calibration step). An entry
 * is also proof the file exists, which takes this archetype off the HEAD-probe
 * path in CartridgeModel — see useUrlExists' `enabled` flag.
 *
 * It starts EMPTY on purpose. No cartridge GLB is measured yet; the table is
 * the build-time record of that work as it lands, and dropping in an
 * unmeasured file still renders (via the HEAD probe) at scale 1.
 */
export const CARTRIDGE_TRANSFORMS: Partial<Record<MediaArchetypeId, GltfTransform>> = {
  'cart-snes-na': {
    // Imported from the user-supplied snes_cartridge.glb (Sketchfab "Cartucho.fbx").
    // Raw bounding box: 251.906 x 161.817 x 33.434 units (measured directly off
    // this file's own vertex data — see the live-render bbox check below, not
    // a note carried over from a different processing pass). Axes: X=width,
    // Z=height, Y=depth. Width-anchored scale: 0.136 / 251.906 = 0.00054,
    // landing height at 87.4mm (0.7% under 88mm) and depth at 18.1mm (10%
    // short of 20mm — the two shell halves overlap more than the real cart's
    // halves do, a source-model quirk a scale cannot fix).
    //
    // A REAL BUG, caught and fixed here: this entry briefly read `scale:
    // 0.054` — exactly 100x too large — from a raw-bbox note that read
    // "2.519 x 0.954 x 1.618 units", exactly 1/100th of this file's actual
    // raw size. Applying that scale rendered the cartridge with a world
    // bounding box of roughly 7.5 x 2.3 x 8.8 METRES — comfortably outside
    // the camera frustum, so nothing appeared on screen at all ("the
    // cartridge disappear"). Confirmed live: `new THREE.Box3().setFromObject`
    // on the mounted `label` mesh, before and after this fix. If this value
    // is ever touched again, re-measure the raw file directly rather than
    // trusting an inherited note — this is exactly how the error happened.
    //
    // The front face (mesh[0]) faces -Y. rotationX = -PI/2 turns that normal
    // to +Z (the scene convention for a cartridge's label face). Applied to
    // the instance BEFORE floorAlignOffset so the Y-min alignment computes
    // correctly on the rotated shape.
    //
    // stripShellTexture is OFF, on purpose, as of the label-decal patch
    // below: mesh[0] used to BE the "label" node (the entire bottom shell
    // half — housing, ridges, connector recess — sharing one baked texture
    // with a small placeholder graphic drawn into it). Renaming that whole
    // mesh to "label" meant swapping in per-game box art painted across all
    // of it, including the ridges and the connector recess (which dips back
    // in Z), which read as the art "ramping" diagonally down the shell
    // instead of sitting on a flat sticker. stripShellTexture papered over
    // that by flattening every non-label mesh to solid grey — but it also
    // threw away the real ridge/screw/connector detail baked into that same
    // texture, so the shell rendered as a smooth, detail-less ramp.
    // .img2threejs/cart/split-snes-label.mjs fixed the actual cause: it
    // measured the model's own perfectly flat recessed panel (Y is constant
    // at 0.8016 across every triangle on it — checked, not assumed) and
    // added ONE small decal quad on that exact plane, named "label", so the
    // per-game swap only ever touches that decal. The original mesh[0] (now
    // named "shell-front-lower") keeps its real baked texture — ridges,
    // screws, connector — same as the other two shell meshes always have.
    scale: 0.00054,
    // rotationX is 0: the whole-hierarchy wrapper rotation (CartridgeModel.tsx)
    // that replaced the old per-mesh geometry bake was tried at -PI/2 first
    // (matching the old per-mesh value) and it stood the model up on the
    // WRONG axis — measured live: shell world size came out 136 x 22.8 x 88mm
    // (Y and Z swapped versus the archetype's 136 x 88 x 20 spec), i.e. the
    // cartridge lay on its back instead of standing. At rotationX: 0 the
    // model's own node hierarchy already has the right axes for standing
    // (confirmed live: 136 x 88 x 22.8mm) — the per-node rotations baked into
    // this file (see CartridgeModel.tsx's rotationX doc comment) already do
    // that job, so no additional X rotation is needed once it's applied
    // whole-hierarchy instead of per-mesh.
    // No rotationY needed: measured live (mesh face-normal, cross product of
    // two triangle edges, transformed by matrixWorld), the label's world
    // normal at rotationY: 0 is already (0, -0.14, 0.99) — facing +Z, the
    // scene convention — no further turn required. (rotationY: PI was tried
    // first and measured flipping the normal to -Z; removed.)
    rotationX: 0,
    stripShellTexture: false,
    notes:
      'SNES Game Pak (NTSC), imported from the user-supplied snes_cartridge.glb (Sketchfab, Cartucho.fbx). ' +
      'Width-anchored fit: 136.0 x 88.0 x 22.8mm vs spec 136 x 88 x 20 — height exact, depth 14% over ' +
      '(shell-halves overlap in the source geometry). rotationX: 0 — the model\'s own node hierarchy already ' +
      'stands it up correctly and faces the label toward +Z with no rotationY needed (both measured live). ' +
      'The real label plate is a small decal quad added by .img2threejs/cart/split-snes-label.mjs, sitting on ' +
      'the model\'s own measured flat recessed panel (Y=0.8016 exactly, verified planar). Every other mesh ' +
      'keeps its original Sketchfab-baked texture (ridges, screws, connector) — stripShellTexture is off.',
  },
  'cart-nes': {
    // Measured from the imported file's own raw bounding box (the user-supplied
    // nes__cartridge__battletoads.glb, a Sketchfab export): 0.641 x 4.760 x
    // 4.234 units, authored x = thickness, y = height, z = width. Width-anchored
    // (z): 0.12 / 4.234 -> 0.02834, landing the height at 134.9mm (0.7% over
    // 134 — excellent) and the depth at 18.2mm (9% short of 20 — the same
    // shell-halves overlap quirk as the SNES cart). The sticker plate faces +x,
    // so rotationY = -90 degrees turns its label toward +z (the scene
    // convention for a cartridge in the spread). Its plate was resized in the
    // GLB to the NESdev-published 55 x 97mm rect.
    scale: 0.02834,
    rotationY: -Math.PI / 2,
    // Real NES carts have a moulded connector-release ridge down the shell's
    // left edge, so the label is not dead-centre on the face. Started at 9mm
    // (matching offsetXMm on the parametric NES archetype in
    // media-archetypes.ts) but that read as too subtle against this
    // particular model's shell once the rotation-frame bug above was fixed —
    // bumped to 15mm by eye against a live render. Comfortably inside the
    // safe range: label half-width 27.5mm vs shell half-width 60mm allows up
    // to ~32.5mm before the label would clear the shell's own edge.
    labelOffsetMm: [15, 0],
    // Verified against a live render: the raw cover art file reads correctly
    // ("GOLF", "ZELDA"), but on the model's label mesh it rendered as a
    // left-right mirror image. Not a texture-repeat sign issue (repeat.x/
    // offset.x were both positive) — the mesh's own UV winding is mirrored.
    mirrorLabelU: true,
    notes:
      'NES Game Pak, imported from the user-supplied nes__cartridge__battletoads.glb (Sketchfab, dark_igorek). ' +
      'Width-anchored fit: 120.0 x 134.9 x 18.2mm vs spec 120 x 134 x 20 — height off 0.7%, depth off 9%. ' +
      'Label plate (55 x 97mm, NESdev) faces +x and is turned -90 degrees to face the camera. The plate UVs ' +
      'were repaired to the 0..1 contract (fix-nes-uvs.mjs): the export squeezed them into u 0.004..0.584, ' +
      'which combined with the cover-fit crop shifted every game\'s art ~40% of the plate width to the right ' +
      '— verified in a browser render (texture-center marker landed at 69.5% of the shell width, now 50.0%). ' +
      'labelOffsetMm then shifts that now-centred plate 15mm right, to clear the shell\'s own connector ridge ' +
      '(bumped up from an initial 9mm once the rotation-frame bug was fixed — see offsetLabelMesh). ' +
      'mirrorLabelU corrects a separate bug on the same repaired UVs: fixing the RANGE did not fix the ' +
      'WINDING, so every cover printed as a left-right mirror image until this flip.',
  },
}

