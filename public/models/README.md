# Drop-in 3D models

Put a `.glb` file at the right path below and it appears automatically — no
registration step. If it's not there yet, nothing breaks: the existing
procedural or placeholder model just keeps showing.

One caveat worth reading before you paste anything: appearing and appearing
at the *right size* are two different things. See
[a dropped-in file also needs a scale entry](#a-dropped-in-file-also-needs-a-scale-entry).

**Format:** `.glb` only (binary glTF — one self-contained file with mesh,
materials and textures baked in). Not `.gltf` — that format splits into a
`.gltf` + `.bin` + separate texture files, easy to end up with only half the
pieces after a paste. If a download only offers `.gltf`, most viewers
(including Sketchfab's) let you pick "glTF Binary (.glb)" as the download
format instead — use that.

**Filenames are exact and lowercase**, matching each console/controller/TV's
`id` in the data files (`src/data/consoles/*.ts`).

## Consoles → `public/models/consoles/<id>.glb`

The full ~22-console roster (`src/data/roster.ts`), in release order:

| id | Console |
|---|---|
| `atari-2600.glb` | Atari Video Computer System (2600) |
| `nes.glb` | Nintendo Entertainment System |
| `master-system.glb` | Sega Master System |
| `genesis.glb` | Sega Genesis / Mega Drive |
| `snes.glb` | Super Nintendo Entertainment System |
| `super-famicom.glb` | Super Famicom (SNES's Japanese regional variant) |
| `saturn.glb` | Sega Saturn |
| `playstation.glb` | Sony PlayStation |
| `n64.glb` | Nintendo 64 |
| `dreamcast.glb` | Sega Dreamcast |
| `ps2.glb` | PlayStation 2 |
| `xbox.glb` | Microsoft Xbox |
| `gamecube.glb` | Nintendo GameCube |
| `xbox-360.glb` | Xbox 360 |
| `ps3.glb` | PlayStation 3 |
| `wii.glb` | Wii |
| `wii-u.glb` | Wii U |
| `ps4.glb` | PlayStation 4 |
| `xbox-one.glb` | Xbox One |
| `switch.glb` | Nintendo Switch |
| `ps5.glb` | PlayStation 5 |
| `xbox-series.glb` | Xbox Series X\|S |
| `switch-2.glb` | Nintendo Switch 2 |

**Twelve are wired in and rendering today**: `atari-2600`, `nes`,
`master-system`, `genesis`, `snes`, `saturn`, `playstation`, `n64`, `ps2`,
`ps3`, `ps4`, `ps5` — each has a data file in `src/data/consoles/` and a file
on disk here. The rest of the table shows as "not built yet" in the picker
until a data file exists for them.

### A dropped-in file also needs a scale entry

Pasting a `.glb` in is enough to make it *appear*, but not to make it appear
at the right **size**. Exports carry no consistent unit convention — some
arrive unit-cube-normalised, some in centimetres, some already in metres — so
until an id has an entry in `src/three/models/gltf-transforms.ts` it renders
at scale 1, which for most files means wildly too large or invisibly small.

That table doubles as the manifest of models known to exist: an id only earns
an entry by having its scale measured against the actual file, so consoles
listed there skip the runtime existence check entirely and load directly.
Files not listed are still discovered by a `HEAD` request at load time, so
drop-in still works — measuring is what turns a discovery into a permanent,
correctly-sized one.

So the full loop for a new model is: paste the file → look at it in the app →
say if it's the wrong size or facing the wrong way → a measured scale (and
any `hideMeshIndices` for bundled controllers/cartridges) gets added.

## Controllers → `public/models/controllers/<id>.glb`

Defined per-console in each console's data file. **None of these have a file
yet** — every controller currently renders from its parametric form spec in
`src/data/kits/controller-forms.ts`, which is a real shape, not a placeholder
box. Dropping a `.glb` in overrides it.

| id | Controller |
|---|---|
| `cx40.glb` | Atari 2600 joystick |
| `nes-pad.glb` | NES controller |
| `sms-pad.glb` | Master System pad |
| `genesis-pad.glb` | Genesis 3-button pad |
| `snes-pad.glb` | SNES controller |
| `saturn-pad.glb` | Saturn 6-button pad (Model 2) |
| `dualshock.glb` | PlayStation DualShock |
| `n64-pad.glb` | Nintendo 64 controller |
| `dualshock-2.glb` | PlayStation 2 DualShock 2 |
| `dualshock-3.glb` | PlayStation 3 DualShock 3 |
| `dualshock-4.glb` | PlayStation 4 DualShock 4 |
| `dualsense.glb` | PlayStation 5 DualSense |

## TVs → `public/models/tvs/<id>.glb`

**Not wired up yet.** The diorama TV is generated parametrically from each
console's `diorama.tv` spec (screen size, cabinet dimensions, curvature,
bezel inset), so dropping a file in here currently has no effect — a loader
needs adding first.

## Scale and orientation

Everything in the scene is real-world **metres**, sitting on the floor at
`y = 0`, centred on `x = 0` / `z = 0`. Most downloaded models — especially
AI-generated ones — come out at an arbitrary scale and facing an arbitrary
direction.

The loader handles **position** on its own: it floor-aligns and centres each
model from its own bounding box, computed only from the meshes left visible,
so a bundled controller or cartridge can't drag the console off the floor.

**Scale and rotation it does not guess.** Both are per-model numbers in
`src/three/models/gltf-transforms.ts` (not `registry.tsx`, and never a
re-export), each one derived by measuring the model's raw bounding box
against the console's real published dimensions. Drop the file in, look at it
in the app, and say if it's the wrong size or facing the wrong way.

`hideMeshIndices` in the same file removes bundled extras — several of these
models ship a detached controller and cable fused into the same scene as the
console.

## Licensing

If a model requires attribution (Creative Commons "CC Attribution" and
similar), note the model's source URL, author, and license in
`public/models/CREDITS.md` when you add it — that file is a stub waiting for
entries, not yet linked anywhere else, so it needs to actually get filled in
for the credit to mean anything.
