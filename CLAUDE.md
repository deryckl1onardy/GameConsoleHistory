# Project instructions for Claude Code

These apply to every session working in this repository, in addition to any
global instructions.

## Cartridge (and other physical game-media) 3D models: never build from scratch

A cartridge model is always **sourced from a real downloaded/provided asset**
(a Sketchfab download or similar) — **never authored procedurally from
scratch**, and never replaced with a primitive/generated stand-in as a "fix"
for a rendering bug in the sourced model.

This rule exists because it was violated twice in the same session: the SNES
cartridge was replaced with a procedurally-generated shell
(`scripts/build-snes-cartridge.mjs`, since deleted) instead of fixing the
actual user-supplied Sketchfab file (`snes_cartridge.glb`). Both times the
user had to point at reference screenshots and explain the generated model
wasn't what they wanted, after work had already gone into building and
wiring it up.

**If a cartridge model renders wrong, the fix is always to reprocess or patch
the sourced file** — rename/resize its label mesh, fix UV winding or range,
adjust `CARTRIDGE_TRANSFORMS` in `src/three/models/gltf-transforms.ts`
(`scale`, `rotationY`, `labelOffsetMm`, `mirrorLabelU`, `hideMeshIndices`,
`stripShellTexture`) — never to generate a replacement in code.

**The NES cartridge is the reference example of the correct end-to-end
process.** Full detail — which script does what, the artwork contract, the
authoring checklist — lives in `docs/cartridge-models.md`. Read that before
touching anything under `public/models/cartridges/` or
`.img2threejs/cart/`.
