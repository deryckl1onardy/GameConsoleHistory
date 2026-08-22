# Cartridge models — drop-in real cartridges

The parametric `GameBox` shell (extruded rounded box + label plane) is a
placeholder: it gets every cartridge *approximately* right — right size, right
shell colour, right label rect — but a real Game Pak has a moulded silhouette
(SNES ribs, N64 notched corners, Genesis grip ridges) no box primitive can
express. This document is the contract for replacing the parametric shell with
real models, authored through the `.img2threejs` workflow, while keeping the
per-game artwork swap that already exists.

## How a cartridge model drops in

A GLB at **`/models/cartridges/<archetypeId>.glb`** replaces the parametric
shell the moment it exists — no registry change, no per-console code. The
resolution lives in `CartridgeModel.tsx`, wired into `GameBox`:

1. `CartridgeModel` HEAD-probes the URL. **No file → the parametric shell
   renders** (the ordinary state for most of the roster; `cart-snes-na` now
   has a real model).
2. File present → the GLB loads (per-model error boundary + Suspense, exactly
   like the console loader in `GltfModel.tsx`), and the per-game cover texture
   that would have been the parametric label plane's map is printed onto the
   model's `label` mesh instead.
3. The scene is **cloned per instance** (`scene.clone(true)`), because
   `useGLTF` hands every one of the ten boxes in the spread the same shared
   cached scene — without the clone they'd all fight over one parent and the
   label material would print the last box's art.
4. `floorAlignOffset` (shared with the console loader) floor-aligns and
   centres the model and opts every mesh into shadow casting/receiving, so a
   dropped-in cartridge behaves like every other object in the diorama.

Scale: models are authored at **true millimetres in local metres** — the
scene-wide convention — so they land at exactly `archetype.dimensions` with no
sizing code. If a model's raw export is not in metres, the correction goes in
`CARTRIDGE_TRANSFORMS` in `src/three/models/gltf-transforms.ts`, measured
against the archetype's published dimensions the same way the console table
measures each console. An entry there is also proof the file exists, which
takes that archetype off the HEAD-probe path. Two extra fixups live in the
same table:

- `rotationY` — the spread places every cartridge face-on toward +z; a model
  whose label face is authored toward another axis (the NES cart's sticker
  faces +x) is turned by the loader. Measured from the model's geometry, like
  `scale`.
- Label-plate geometry edits — `scale`/`rotation` size and orient the whole
  model, but the label plate must ALSO sit at the real rect. When an import's
  plate is the wrong size or position, it is resized/repositioned directly in
  the GLB by `.img2threejs/cart/fix-cart-label.mjs` (stride-aware, verified
  against world-space bounds), not by per-archetype code.

The per-game art prints undistorted when the plate's aspect matches the
archetype's `cartridgeLabel` rect (the aspect `GameBox` cover-fits the art to)
— for `cart-snes-na` that rect is **84×36mm**, per `media-archetypes.ts`,
measured live off the actual `label` mesh's rendered world-space size.

**A real bug lived here, fixed once**: the node renamed `label` during intake
was the model's ENTIRE bottom shell half (housing, ridges, connector recess),
not a small inset plate — its UVs covered nearly the full baked texture. Per-
game cover art swapped onto that whole mesh painted across the ridges and the
connector recess (which dips backward in Z), reading as the art "ramping"
diagonally down the shell instead of sitting on a flat sticker.
`.img2threejs/cart/split-snes-label.mjs` fixed the actual cause: it measured
the model's own genuinely flat recessed panel (checked — Y is constant across
every triangle on it) and added one small decal quad on that exact plane,
named `label`, so the swap only ever touches that decal. The original mesh
(renamed `shell-front-lower`) keeps its real baked texture — ridges, screws,
connector — same as every other shell mesh. `stripShellTexture` is now **off**
for `cart-snes-na`: it used to flatten every non-label mesh to solid grey to
hide the placeholder art baked into that mesh, which also threw away the real
surface detail. With the label properly isolated, that detail can stay.

## The artwork contract (the part that is different from consoles)

A console GLB is self-contained — nothing is ever swapped onto it. A cartridge
GLB is *not*: the whole point of modelling it is that per-game art gets placed
on the real sticker area. So a cartridge model must satisfy three requirements
beyond what the SNES console spec required:

1. **The label surface is a genuine recessed area of the shell.** On a real
   Game Pak the sticker sits in a shallow inset so it is flush with the shell,
   not proud of it. The recess rect is the archetype's `cartridgeLabel` data
   (`src/data/kits/media-archetypes.ts`) — the same rect the parametric label
   plane uses, already validated (NESdev-published 55×97 for NES, etc.).
2. **That surface is a mesh named exactly `label`** (constant
   `LABEL_MESH_NAME` in `src/three/models/cartridge-label.ts`), with UVs
   covering exactly the printed rect — **0..1 over the label area**. This is
   the whole contract; the renderer never knows where the label is, it finds
   the mesh by name and swaps its `map`. Same named-mesh convention the
   console models already use (`animatedParts.slot`, hardwareDiagram anchors).
3. **The label material is `MeshStandardMaterial` or a subclass.** The swap
   clones it as `MeshStandardMaterial`; a `MeshPhysicalMaterial` label keeps
   its clearcoat, so an embossed/laminated sticker look survives.

The texture itself arrives pre-resolved by `GameBox` — procedural placeholder
first, real cover swapped in on load, cover-fitted to the label rect's aspect.
The swap (`applyCoverToLabel`) clones the label material **once per model
instance** and reuses that clone for the placeholder→real transition, so ten
boxes of the same archetype each keep exactly one material and no clone leaks
per cover change.

### Authoring checklist for the `label` mesh

- Name: exactly `label` (no suffix, no prefix — findable anywhere in the tree).
- Geometry: a flat surface inset flush with the shell, sized to
  `cartridgeLabel.widthMm × heightMm` at the rect's `offsetYMm` position.
- UVs: 0..1 across the label rect, axis-aligned, unwrapped once — no seams
  within the rect, no padding baked into the UVs (padding is the texture's
  job, and the art is a full-bleed per-game image).
- Material: `MeshStandardMaterial`/`MeshPhysicalMaterial`, roughness ~0.85
  (paper, matte) unless the reference shows otherwise.
- The label must be **separable geometry**, not a UV region of the shell mesh
  — the swap finds the mesh by name and replaces its material entirely.

A model **without** a `label` mesh still renders (the loader logs a dev-only
warning); it just can't show any game's art. That is a spec failure, not a
crash.

## The img2threejs intake, applied to a cartridge

Same workflow that produced `snes.glb`, minus the parts a cartridge doesn't
need. A cartridge is the workflow's simplest target — one shell, one material
family, no motion parts, no bundled extras — so most of the SNES run's
apparatus (camera solving, action-readiness rigs) is overkill. What survives:

1. **Reference intake** (`.img2threejs/refs/`). Clean, well-lit shots, no
   labels' art obscuring the shell. Minimum set per cartridge:
   - front (label visible, square-on)
   - back (connector edge)
   - top (label + relief, square-on)
   - three-quarter (both top + front relief read)
   - a close-up of the label recess itself — this is the geometry the artwork
     contract depends on most, and it's the region reference photos usually
     wreck with glare and reflection
2. **Assessment + detail inventory** (`.img2threejs/cart/assessment.json`).
   Enumerate what makes THIS cartridge's silhouette read — SNES top ribs, N64
   grip notches, Genesis ridge grips — and the label recess as a genuine inset.
3. **Material evidence**. Cartridge shell plastic is uniformly matte ABS
   (#b0acbc sampled from the reference photo for the SNES run); the label
   area stays albedo-free (it gets the game art at runtime).
4. **Import + fixup**. Copy the sourced GLB to the drop-in path
   (`public/models/cartridges/cart-<id>.glb`). Run the established fix scripts
   to rename the label mesh to `label` (write a per-model rename script if
   `fix-cart-label.mjs` doesn't cover the mesh name) and repair UVs if the
   export squeezed them (`.img2threejs/cart/fix-nes-uvs.mjs`). Measure the raw bounding box and
   add a measured entry to `CARTRIDGE_TRANSFORMS` in
   `src/three/models/gltf-transforms.ts`. No procedural generation — the
   sourced model IS the model.
5. **Review passes** (blockout → structural → material → lighting), comparing
   the render against the reference the same way the SNES run did.

### Scale calibration

The archetype's published dimensions are the source of truth (the same table
that sizes the parametric shell and the spread layout). If the exported model
isn't already in metres, measure its raw bounding box against
`archetype.dimensions` and record the multiplier in `CARTRIDGE_TRANSFORMS`
with the console table's discipline: derived from measurement, never guessed,
with a note. If the authoring drifts in a way a scale factor can't fix, add a
`renderBox`-style calibration note exactly like `hardwareDiagram.renderBox`
does for consoles whose models disagree with spec.

## Priority order

The shape-bearing cartridges, in order of payoff:

| archetype | what a real model adds | label dims (mm) | refs |
|---|---|---|---|
| `cart-snes-na` | **DONE** — imported Sketchfab Game Pak, real `label` decal added on the model's own measured flat panel | 84×36 | `.img2threejs/refs/cart-snes-*.png` |
| `cart-nes` | **DONE** — imported Sketchfab Game Pak, sticker plate sized to NESdev rect | 55×97 | NESdev-exact |
| `cart-snes-jp` | Super Famicom proportions vs NA | 92×55 | Nintendo spec |
| `cart-n64` | notched corners, grip ridge, taller profile | 82×50 | plentiful |
| `cart-genesis` | matte black, grip ridges | 72×46 | plentiful |
| `cart-sms` | squat wedge | 72×66 | moderate |
| `cart-atari-2600` | nearly a flat box — **lowest ROI**; parametric shell only, corrected to real portrait 83×98×19mm | 72×88 | moderate |

`cart-snes-na` and `cart-nes` are done — both shipped as the user-supplied
Sketchfab exports (`snes_cartridge.glb`, `nes__cartridge__battletoads.glb`)
copied to their drop-in paths, scaled via `CARTRIDGE_TRANSFORMS` (measured,
width-anchored), with their label meshes renamed to `label` by the fix scripts
(a per-model rename script for SNES, `fix-cart-label.mjs` for NES).

The NES plate also needed a UV repair (`.img2threejs/cart/fix-nes-uvs.mjs`):
the Sketchfab export squeezed its UVs into u 0.004..0.584 — only 58% of the
texture width — so the app's cover-fit (repeat/offset, designed for a 0..1
plate) displayed a lopsided crop and every game's art sat ~40% of the plate
width right of center (a texture-center marker rendered at 69.5% of the shell
width in a headless browser check). The script rewrites each vertex's UV from
its position (u from z, v from y, preserving the verified orientation), and
the same marker now lands at 50.0%. The SNES plate was already clean.

The SNES model's `label` node originally pointed at the ENTIRE bottom shell
half (housing, ridges, connector recess all sharing one baked texture), not a
small inset plate — an intake mistake, not something the Sketchfab export did
on its own. Swapping per-game art onto that whole mesh painted the ridges and
connector recess too. `.img2threejs/cart/split-snes-label.mjs` fixed it: it
measured the model's own genuinely flat recessed panel (Y constant across
every triangle on it, checked) and added a small decal quad on that exact
plane as the real `label` mesh, leaving the original mesh (renamed
`shell-front-lower`) with its real baked ridge/screw/connector texture
intact. `stripShellTexture` is off for this archetype as a result — it isn't
needed once the label is properly isolated, and turning it back on would
throw away that real detail again. `.img2threejs/cart/flip-snes-label-v.mjs`
flipped the decal's V coordinate after the first pass rendered every game's
cover art upside down — a one-line fix, kept as its own script since it only
ever needs to touch those 4 UV floats.

**A second real bug, in the loader, not the file**: after the decal fix the
model still rendered as what looked like 3 separate floating pieces. The
cause was `CartridgeModel.tsx`'s `rotationX` handling, which used to bake the
rotation into each MESH's own geometry individually. That's only equivalent
to "rotate the model" when every mesh shares one local orientation — this
GLB's "back shell" piece is parented under a node that already carries its
own 180° rotation (correctly, mirroring the front shell to close the case).
Baking the SAME extra rotation into each mesh's own local space, ahead of
each mesh's own differing ancestor rotation, doesn't commute: the two shell
halves ended up rotated by different effective amounts in world space and
no longer met at the seam their authored positions were built for. The fix
(now in `CartridgeModel.tsx`) wraps the whole cloned hierarchy's children in
one Group and rotates that — a single rigid transform of the whole assembly,
applied after every piece's own relative position is already resolved by the
normal scene graph, still sitting below `floorAlignOffset`'s blind spot on
`scene`'s own transform. This is a loader-level fix, not per-archetype: any
future cartridge whose source file parents pieces under differently-rotated
nodes gets it for free.

The next shape-bearing cart is `cart-snes-jp` or `cart-n64` (notched corners,
grip ridge).

## Verification

- Unit: `src/three/models/cartridge-label.test.ts` pins the contract — name
  discovery, per-instance cloning, clone reuse, physical-material survival.
- Build-time: the `CARTRIDGE_TRANSFORMS` entry is proof the model was measured
  against the published dimensions; the `label` mesh name is verified by
  `findLabelMesh` at runtime, and UV correctness is checked by the same
  texture-center marker used for the NES repair.
- Visual: drop the GLB in, and confirm in the spread that (a) ten boxes render
  without fighting over the shared scene, (b) every box shows its OWN game's
  art, (c) the placeholder→real swap doesn't leak materials (devtools memory,
  switching consoles repeatedly), (d) the model sits on the floor centred,
  sized to the archetype.
