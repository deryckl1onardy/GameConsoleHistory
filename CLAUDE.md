# Project instructions for Claude Code

These apply to every session working in this repository, in addition to any
global instructions.

## Read `ROADMAP.md` first — before anything else

`ROADMAP.md` at the repo root is the plan of record. **Read it at the start of
every session, before touching code, before proposing work, before answering
"what should we do next".** It carries the current phase, the tasks in it, the
decisions already locked with the repo owner, and the list of things that have
been deliberately ruled out.

**Work the current phase, and only the current phase.** Phases are sequential.
Do not start a later one because it looks more interesting, and do not fold in
"small" extras noticed along the way. Anything outside the current phase gets
confirmed with the owner before you begin it.

**Update `ROADMAP.md` in the same session as the work — not later.** When a task
completes: tick its checkbox, update that phase's `Status:` line and the file's
`Last updated:` date, and add a dated entry to the change log at the bottom. A
phase is only marked done once its verification block has actually been run and
passed. Reporting work as complete without updating the roadmap is leaving the
job unfinished.

**If a task turns out to be wrong, strike it through and write why.** Never
silently delete one — the reasoning is the part that stops the same idea coming
back in three sessions' time.

**The "Do NOT build" list is settled.** Each entry records why it was ruled out.
Finding the old code in git history is not a reason to restore it. Reopening one
of those decisions is a conversation with the owner, not a judgement call.

> ⚠️ `IMPLEMENTATION_STATUS.md` is **stale and will mislead you.** It marks the
> "Shelf of History" museum browse as done across ~15 rows; that code was deleted
> in commit `aea2bb5` (3,092 lines, 14 files under `src/three/museum/`).
> `src/store/scene.ts` is the truth — the app is a single screen and the museum
> shelf is gone. Do not plan against that file until Phase 0 fixes or deletes it.

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
