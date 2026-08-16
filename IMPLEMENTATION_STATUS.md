# Implementation Status — Console Chronicles

Tracking how far the product has come relative to the **grand plan**
([`shelf_of_history_concept.md`](./shelf_of_history_concept.md)) and the
console-detail redesign plan (the "soft-puppy" plan — originally
`~/.claude/plans/i-feel-like-its-soft-puppy.md`, now fully executed).

Legend: ✅ done · 🟡 partial · ⏳ deferred (planned, explicitly not started) · ⬜ not started

---

## 1. The grand plan (`shelf_of_history_concept.md`)

### The core experience

| § | Idea | Status | Notes |
|---|---|---|---|
| 1 | Three discovery behaviours: Timeline, Search, Shelf | 🟡 | **Shelf of History**: done. **Timeline**: deferred (navigation feature, overlaps the decade scrubber). **Search**: not started. |
| 8 | Selecting a console is a *spatial transition* | ✅ | Full choreography: focus → approach flight → pixel-exact handoff → arriving (room lights ramp, camera frame offset tweens in) → room idle. See `src/three/CameraRig.tsx` + `src/three/museum/approach.ts`. |
| 9 | Transition philosophy — no route change | ✅ | Shelf and room are one continuous 3D space; the hero console is one shared instance (`HeroConsole.tsx`), the shelf→room move is a rigid translation proven exact by `museum-shots.test.ts`. |
| 15 | Back navigation reverses the transition | ✅ | Brand mark / retreat: offset zeroed, mirrored teleport, camera flies back to the bay. |
| 16 | Animation principles (slow, physical, subtle) | ✅ | GSAP throughout; `prefers-reduced-motion` collapses every duration to 0. |

### The Shelf of History

| § | Idea | Status | Notes |
|---|---|---|---|
| 2 | Dark museum archive, artifacts on generation shelves | ✅ | `src/three/museum/` — real GLB consoles on boards stacked by generation, warm near-black hall (`Scene.tsx` backdrop). |
| 3 | Visual hierarchy: consoles > generation > name > era | ✅ | Artifacts and labels are the subject; chrome is a spare header + generation rail (`ShelfOverlay.tsx`). |
| 4 | Page structure: header + generation shelves | ✅ | Header + generation rail; no search/timeline controls yet. |
| 5 | Generation shelves: left metadata, center artifacts, right arrow | 🟡 | Left metadata and centre artifacts done; the per-shelf right "more consoles" arrow is not implemented (the generation rail covers navigation). |
| 6 | Consoles are artifacts, not cards | ✅ | Museum labels via drei `<Html>` at the board lip (`ArtifactLabel.tsx`), not UI cards. |
| 6.5 | Display diagram: labels, hover states | ✅ | Top codename / bottom name-year-maker labels; hover steps the artifact forward + scales + dims neighbours (`ArtifactSlot.tsx`). |
| 7 | Hover/focus behaviour | ✅ | Forward step + scale + label brightening, GSAP, reduced-motion aware. No neon/glow/cards. |
| 11 | Generation navigation — continuous museum space | ✅ | Bays stack vertically; the generation rail jumps bays; **left-drag and the wheel both pan the camera up/down between shelves** (see change log, 2026-08-15). |
| 13 | "Current console" indicator on the shelf | ✅ | A slim brass plate inlaid in the board's front lip under the active artifact (`ShelfBay.tsx`'s `CurrentMarker`) — a museum's engraved exhibit plate, not a glow. Lit by the hall, so it dims with the approach for free. |
| 18 | 4–6 consoles per shelf, discovery over density | ✅ | `shelf-layout.ts` lays out a handful per bay. |

### The Console Room

| § | Idea | Status | Notes |
|---|---|---|---|
| 10 | Room = examine; Shelf = browse | ✅ | Two screens, one shared console instance. |
| 14 | PS2 example scene | ✅ | PS2 is a built console with a full diorama spec (`src/data/consoles/ps2.ts`); the era-room staging (props, CRT, lighting) is data-driven (`DioramaSpec`). |
| 17 | Technical implementation: shared asset, one schema | ✅ | Every console is pure data (`src/types/console.ts`); the room chrome (title block, detail panel, tabs, annotated diagram, fun-fact card) lives in `src/components/room/`. |
| 12 | Recommended navigation: Timeline / Search / Shelf | 🟡 | Shelf done; Timeline deferred; Search not started. |
| 19 | End-to-end metaphor incl. **Game Artifact** | 🟡 | Shelf → Room done; picking up a game and entering a game artifact view is not started (game boxes and the insert/eject sequence exist in the room). |

### Console coverage

| Item | Status | Notes |
|---|---|---|
| Roster | ✅ | All 22 mainline consoles from gen 2–9 in `src/data/roster.ts`. |
| Built dioramas | ✅ | **22 of 22.** Nothing renders as a dimmed "soon" placeholder any more. The 10 added in 2026-08-16 are form-built (swept shells) rather than GLB-built; the registry resolves a dropped-in GLB first, so each upgrades with no code change. |
| Regional variants | ✅ | Schema + data (e.g. SNES ↔ Super Famicom swaps hardware *and* room; Xbox Series S is a variant of Series X). |
| Annotated hardware diagrams | 🟡 | Slot + fallback rungs + one authored case (SNES). Art exists in `diagrams/` but is **not wired up** — see Open threads. |

---

## 2. The console-detail redesign plan (fully executed, 2026-08-15)

The room was two full-height side rails; it is now the reference layout — brand
mark top-left (doubles as back-to-shelf), big display title block with a
generation descriptor ("16-bit console" for the SNES, "Ninth generation" for
the PS5), a gesture-legend + reset cluster on the right, and a **wide bottom
panel** (overview column + tabbed column) with a fun-fact card floating above
it. Camera reframing is a pure projection shift (`PerspectiveCamera.setViewOffset`
in ratio form) shared with the chrome via `src/frame.ts`, so the two can never
drift.

| Phase | Deliverable | Status |
|---|---|---|
| 0 | Frame contract: `src/frame.ts` + tests, wired into CameraRig | ✅ |
| 1 | Camera reframe: offset tweened on `arriving`/`retreating`, zero at both handoffs, TiltShift band tracks the lifted subject | ✅ |
| 2 | Icons (`icons.tsx`), one formatter (`format.ts`), BrandMark, ConsoleTitle, ViewportControls, RoomChrome; deleted `ConsolePicker`/`ModeBar`/`public/icons.svg`/`pickerOpen`; `GENERATION_BITS` | ✅ |
| 3 | DetailPanel + PanelSummary + stat blocks + four tabs (`overview/games/hardware/history`) + collapse chevron; deleted `InfoPanel`; `PanelTab` renamed | ✅ |
| 4 | Diagram slot: `hardwareDiagram` type, HardwareDiagram fallback rungs, `public/diagrams/README.md`, SNES callouts | ✅ |
| 5 | Responsive `layout` field at 1100px, compact variants, pan enabled, `reframeNonce` reset | ✅ |

Notable fix found while executing: three r185's `setViewOffset` silently
overwrites `camera.aspect` — `applyFrameOffset` preserves it (pinned by a test).
Two intentional deviations: icons render at 13–15px rather than the plan's
16/20/24px targets, and the TiltShift band shift (+dy) is test-pinned but
awaits a final visual eyeball.

---

## 3. Change log

### 2026-08-16 — the roster completed, and the work committed

The whole project was uncommitted before this session: ~2,100 changed lines
and 85 untracked files sitting on a single "Initial commit". It is now five
thematic commits (data atlas, museum shelf, console room, models/assets,
docs) on `main`, pushed to `origin`. The local branch was renamed from
`master` to match the remote.

**The roster is complete: 22 of 22.** The ten missing consoles — Dreamcast,
Xbox, GameCube, Xbox 360, Wii, Wii U, Xbox One, Switch, Xbox Series, Switch
2 — are each a data entry plus a swept `ConsoleForm`, plus a `ControllerForm`
for their pad. No GLB exists for any of them, and none is needed: the model
registry resolves a dropped-in GLB *first*, so each console is real and
selectable now and upgrades later with zero code changes.

Three shapes a swept profile provably cannot hold, all flagged in their form
comments for a bespoke registry override: the GameCube's moulded rear handle,
the Xbox 360's concave waist (the pinch is on the left and right faces, and a
profile is constant across the sweep), and the Switch/Switch 2's dock-plus-
tablet split (their forms describe the dock, which is what the diorama
stages). All three are dimensionally correct without it.

**Grand plan §13 landed**: the current console is marked by a slim brass plate
inlaid in the shelf's front lip — a museum's engraved exhibit plate rather
than a glow, and 3D geometry, so the hall's own lights dim it through the
approach with no opacity handling.

Four tests were wrong and are now right, three of them caught by the new
consoles rather than by review:

- `ConsoleFromForm` renders a `power_led` mesh unconditionally for *every*
  console, so a form declaring its own would silently resolve one name to two
  meshes. A new kit-wide loop pins it, along with bounding boxes, animated-part
  resolution and footprint containment for every swept form — so a console
  added later is covered the moment its form lands.
- The roster test required every optical console to name a tray or lid mesh.
  A slot-loader has neither, and `IntakeKind` already documents `front-slot`
  for exactly that group (Wii, PS3, Xbox 360 S, PS5). Widened to tray, lid or
  slot.
- `museum-shots` asserted the PS5's bay and the PS4's had matching board
  lengths, true only by coincidence of how many consoles happened to be built
  per generation. Rewritten against synthetic bays so the rule under test —
  a bay is framed by `max(width-fit, height-fit)` — holds one variable fixed
  by construction. Its first replacement then made the same mistake (pinning
  the PS5's bay as the narrowest, which gen 9 growing to three consoles broke)
  and was tightened again.

192 tests pass, typecheck is clean, lint is unchanged at 3 pre-existing
warnings.

### 2026-08-16 — centered console + contact shadow

User pass on the room found the console pushed off-centre (it sat around 63%
of the viewport width) and floating with no shadow — the room has no floor
(Diorama is lights only), so nothing grounded it.

- **Centred horizontally**: the console shot already aims dead-on at the
  console, so the off-centring came entirely from the frame offset's `dx`
  dodge (`-0.13`), which had been pushing the subject right to clear the
  left title column. The title column is top-aligned, not a band the console
  sits under, so the dodge was unnecessary: `frameOffsetFor` now returns
  `dx = 0` on every layout (verified live: console NDC x = 0 exactly, 50%
  of viewport width). The vertical lift (`dy`, clear-band centring) is
  unchanged. `frame.test.ts` updated to pin `dx === 0`; the dead `MAX_DX`
  rail removed.
- **Contact shadow**: new `src/three/ContactShadow.tsx` — a fake soft
  contact shadow (canvas radial-gradient disc, no asset file, no shadow
  pass) sitting 1mm below the console's base, radius sized off the real
  footprint (max width/depth × 0.9, rotation-invariant so the room yaw
  never fights it). Wired into `Diorama`; fades in over the arrival and out
  on the retreat on the same clocks as the room lights (verified live:
  opacity 0.7 at rest, correct radius/position).

Typecheck, all 144 tests, lint (3 pre-existing warnings), and the production
build are clean.

### 2026-08-16 — the museum wall was hiding the hero during the arrival

Still seeing the console "disappear and reappear" after the stale-pose fix.
Root cause this time was pure occlusion, not a pose: the room's console
position is at z ≈ -1.0, but the museum's back wall is an opaque plane at
z ≈ -0.26 — and the museum stays mounted through the whole arrival so its
lights can dim while the room's ramp in. At the handoff the hero teleports to
the room position, i.e. BEHIND the wall, so from handoff until `idle` (900ms)
the console was completely hidden, and only reappeared when the museum
unmounted. The camera flying in and the console vanishing at the swap is
exactly what the user kept seeing.

Fix (`MuseumScene.tsx`): the wall now fades OUT over the arrival (opacity
1 → 0 on the same 900ms clock as the room lights ramping in and the museum
going dark) — the hero is progressively revealed as it is progressively lit,
never hard-occluded. On retreat the wall remounts FROM transparent (layout
effect before first paint) and fades back to 1 in step with the museum
lights' own 0.45s remount ramp. Direct loads are unaffected: a fresh shelf
load mounts the wall opaque (approach === 'idle'); a direct room load never
mounts the museum.

Verified live both directions: arrival wall opacity 0.94 → 0.11 → unmounted;
retreat 0.53 → 0.97 → 1. Typecheck, all 144 tests, lint (3 pre-existing
warnings), and the production build are clean.

### 2026-08-15 — handoff feel: no drift, no flash, no snap

User pass on the actual handoff found three perceptual defects around the
(already pixel-exact) geometry translation:

1. **The console drifted after the camera stopped.** The frame offset (the
   lift that clears the bottom panel) used to tween in during `arriving` —
   the camera finished its flight and THEN the console slid upward. It now
   ramps in DURING the flight, so the console arrives already at its final
   screen position; the offset is held constant across the handoff (full on
   both sides of the teleport) instead of being zeroed there.
2. **A one-frame flash at the handoff.** The room's lights mount at their
   full JSX intensities, and the old `useEffect`-based ramps zeroed them
   only AFTER first paint — one overexposed double-lit frame. All
   mount-time zeroing (Diorama lights, museum lights on retreat remount,
   the backdrop sheet, the room chrome) now runs in `useLayoutEffect`, so
   the zeroed state lands before the first paint.
3. **A sub-pixel snap at the teleport.** The flight tween could be killed a
   frame short of its exact end, so the teleport started a few pixels off
   and the intro's own snap visibly corrected it. The handoff now snaps the
   camera to the EXACT approach-shot pose before translating.

The invariant "the console stays on the same pixels across the handoff even
with the frame offset applied" is pinned by a new test in
`museum-shots.test.ts` (every console × every dolly, NDC-identical before and
after the translation with the offset applied).

### 2026-08-15 — the vanished console (stale hero pose)

User pass found the console disappearing during the flight. Root cause: the
clicked artifact's own slot is SKIPPED once it becomes the active console
(`ShelfBay` filters `a.id !== consoleId`), but `HeroConsole`'s position reset
was gated on `approach === 'idle'` — so the hero stayed at the PREVIOUS
active console's spot while the camera flew to the newly clicked one's. The
camera was flying at an empty board until the handoff teleported the console
into the room.

Fix: a `useLayoutEffect` in `HeroConsole` (NOT gated on `approach`) snaps the
hero to the active artifact's shelf pose whenever the shelf is showing — the
very first painted frame of the new console is already in place, and the
flight flies to a spot where the console actually stands. It cannot fight the
choreography: the forward teleport happens after `screen` flips to 'room'
(guard returns), and the retreat teleport sets exactly this pose. Side
benefit: a fresh shelf load no longer paints one frame of the hero at the
origin.

### 2026-08-15 — transition polish (shelf ↔ room)

The geometry handoff was already pixel-exact (the hero console is ONE shared
instance, teleported by a rigid translation); the seams were everything AROUND
it. The whole transition now shares one clock (the `arriving`/`retreating`
beats in `approach.ts`):

- **Light choreography**: `MuseumLights` dips on `focusing` (the 260ms hold
  now has a beat), recovers to full for the flight (so the handoff happens at
  full museum light), then goes DARK over the arrival while the room's lights
  ramp in — the hero console's illumination crosses over continuously, and
  the museum is provably dark when it unmounts at `idle`, so the unlit
  shelves vanish into black instead of popping out of frame. On retreat the
  museum remounts dark and ramps back up as the room fades down.
- **Background crossfade**: `scene.background` is now tweened (a managed
  `Background` component) — the hall warms into the era room's backdrop over
  the arrival and cools back over the retreat fade, instead of snapping at
  the handoff. The room's unlit backdrop sheet fades in/out in step.
- **Chrome fades**: the shelf rail/header and the artifact labels fade out as
  the approach begins and in after the retreat lands; the room chrome fades
  in with the room's lights (and out before the retreat teleport).
- **Defensive kill**: the flight tween is killed at both handoffs so no stray
  GSAP `onUpdate` can land after the teleport and rewrite the camera with
  pre-translation values.

### 2026-08-15 — soft-puppy plan executed + shelf drag gesture
- Executed the full detail-redesign plan (Phase 0–5 above): new `src/components/room/`
  chrome, frame contract, camera reframe, diagram slot, responsive layout.
- Fixed the `setViewOffset` aspect-clobber bug in `src/frame.ts`.
- **Shelf gestures**: left-drag AND the mouse wheel on the Shelf of History
  now pan the camera **up/down** (world Y, scaling with the camera's
  standoff) instead of orbiting or zooming. Rotate, OrbitControls' own pan,
  and zoom are disabled on the shelf; horizontal drag movement is ignored
  and the wheel uses the same per-pixel scale as the drag. The room keeps
  its full orbit/pan/zoom set. See `CameraRig.tsx` (the shelf gesture
  effect) and the `enableRotate`/`enablePan`/`enableZoom` props.

### Earlier (pre-existing, in the uncommitted working tree before this session)
- The Shelf of History itself: museum scene, bay layout, artifact slots and
  labels, hover choreography, approach/retreat transitions, generation rail.
- The data atlas: roster, per-console entries, kits (console forms, controller
  forms, media archetypes), GLB model pipeline and generated models.
- The room's 3D diorama: Diorama/DioramaSpec, game shelf + insert/eject
  playback, controllers, CRT + shader stack.

---

## 4. Open threads

- **`public/models/CREDITS.md` is empty while 12 third-party GLBs are in use.**
  The table still reads `_(none yet)_`. The code comments in
  `gltf-transforms.ts` identify these as Sketchfab exports, and CREDITS.md's
  own text says a CC-BY licence "is only honoured if the credit is actually
  written down somewhere, and this is that somewhere". Needs the source URL,
  author and licence for each of the 12 — only whoever downloaded them knows.
- **The hardware diagram art does not match the architecture.** Six finished
  PNGs sit in `diagrams/` (Atari 2600, NES, Master System, SNES, Genesis,
  PS1) but every one has its labels, leader lines and label pills *baked into
  the image*, which is precisely what `public/diagrams/README.md` forbids:
  "Labels and leader lines are typography — they must match the app, so they
  are never baked into the image." Consequences if dropped in as-is: the SNES
  would render **double-labelled** (it declares 8 callouts, and rung 1 of
  `HardwareDiagram` overlays the app's own leader lines on top of the art),
  and all six are purple-on-black against the room's warm parchment palette.
  Two ways forward: regenerate the art clean (console only, no labels, warm
  palette) and keep the authored callouts, or keep these as illustrations and
  strip the callouts from the data. Not wired up either way — deliberately.
- TiltShift band: still needs a visual eyeball on the lifted console (wide +
  compact). Not verifiable from a headless session: with the preview pane
  hidden the page reports `document.hidden === true`, so rAF never fires, R3F
  never renders a frame, and even the drei `<Html>` artifact labels never
  mount. Needs the preview pane open.
- The three bespoke shells: GameCube handle, Xbox 360 waist, Switch dock +
  tablet (see the change log for why a swept profile cannot express them).
- Controller and TV GLBs: `public/models/controllers/` and `tvs/` are both
  empty, so every pad and television is form-built or a sized block.
- Timeline navigation, Search, and the Game Artifact view (grand plan §12/§19).
