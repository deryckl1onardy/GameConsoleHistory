# Shelf of History — the console comes to you

> **For the agent executing this.** Repo: `E:\H5 Projects\GameConsoleHistory`
> (React 19 + TypeScript + Vite + React Three Fiber + GSAP + Zustand, Tailwind v4
> via CSS `@theme`, Vitest). Read this whole document before touching anything.
> **All file paths below are relative to the repo root, not to `docs/`.**
>
> Gate command, run after every phase — all three must pass:
> ```bash
> npx tsc --noEmit -p tsconfig.app.json && npx vitest run && npx oxlint
> ```
> Baseline is **236 tests passing**. `oxlint` has 3 pre-existing
> `only-export-components` warnings that are not yours to fix.
>
> **Three rules that override any judgement call:**
> 1. **Never write `rotation` on a `ShelfArtifact` to anything other than the
>    entry's `diorama.consoleRotation[1]`.** This is the invariant the whole
>    shelf→room transition rests on. See "The invariant" below.
> 2. **Never weaken, skip or delete a test to make a phase pass.** If an invariant
>    test goes red, the code is wrong, not the test. Tests whose *subject* is
>    deleted get replacement coverage for the same property — never removal.
> 3. **Do the phases in order.** The ordering is load-bearing, not cosmetic;
>    Phase 5 before Phase 4 puts a camera behind a plinth (reason given in-line).
>
> Work in small commits, one phase per commit. Verify in the browser too, not just
> via tests — this is a look-and-feel change. Use the project's existing dev-server
> tooling rather than launching one manually.

## Context

The hall looks right but navigating it is bad, and some of it is broken rather
than just unpleasant. Verified against the code, not guessed:

- **The camera fights every scroll.** Scroll → 220 ms of dead air → a **1200 ms**
  `power3.inOut` flight. And the settle calls `setFocusGeneration`
  *unconditionally* (`src/three/CameraRig.tsx:451`), which bumps the nav nonce
  even when the station did not change — so half of all scrolls are a 1.4 s
  animation back to where you already were.
- **You can scroll into the void.** `travelHall` does `camera.position.z += delta`
  with no clamp at all (`src/three/CameraRig.tsx:407`). Nothing stops you walking
  through the far wall or backing out of the entrance.
- **It navigates by generation; the collection is consoles.** 8 stops for 22
  machines. The only thing you can do to an individual console is *leave the hall
  through it*.
- **You cannot find a console by name.** The entire index is 8 year-numbers at 40%
  opacity. Finding the N64 requires already knowing it is the "1994" generation.
- **Zero keyboard.** Not one key handler exists in the app. The canvas is not
  focusable.
- **Two interaction bugs.** No drag threshold, so a drag that starts over a console
  fires a click on release and throws you into a room. And every station's hit
  plane is live from anywhere (`src/three/museum/ShelfBay.tsx:214`) while placards
  only draw for the focused station — you can enter a console whose name you were
  never shown.
- **A live mobile bug.** `hallOverviewShot` is dollied by distance. At
  `MAX_DOLLY = 2.2` (any viewport with aspect ≤ 0.808 — i.e. every phone in
  portrait) the camera lands at **z = +21.9**, ~18 m *outside* the shell, framing
  the gallery through a wall that is not there. The containment test only asserts
  `z > farZ`, so it passes.

**The decision:** the camera stops being the thing that travels. It stays put and
the collection presents itself — with the plinths straightened into one row and
focus moving per-console (22 stops), not per-generation (8).

---

## The design

1. **The camera is bolted down while browsing.** Exactly three poses exist:
   `overview`, `stage`, and the room approach. Browsing never moves it. This is
   what structurally eliminates the settle, the snap-back, the scroll-into-void
   and the per-station framing variance — there is no free-floating camera left to
   fight.
2. **The hall glides in 2-D** so the focused console arrives at the stage.
   **It must be X *and* Z, not Z alone** — consoles spread ±0.7 m along X *within*
   a station, so zeroing the stagger does not put them on the centre line. This is
   a feature: the two glide axes are exactly the two keyboard axes (←/→ lateral
   within a station, ↑/↓ longitudinal between them).
3. **The focused console steps forward off its plinth to present itself** — and its
   step distance is **per-console**, sized so every machine lands at the same
   on-screen size. The PS4 (53 mm tall) needs a 0.98 m standoff and the PS5
   (390 mm) needs 1.97 m; rather than dolly the camera, the small object comes
   *nearer*. That keeps the camera genuinely fixed AND preserves the "a console is
   the same on-screen size wherever it lives" property that
   `src/three/museum/museum-shots.ts:72` exists to guarantee.
4. **Plinths straighten** into one row (a shallow diagonal, see Phase 5).
5. **Click a non-focused console → it becomes focused. Click the focused console →
   enter its room.** Makes accidental room-entry structurally impossible and fixes
   the unnamed-console bug. Uniform across every control — the timeline, search and
   rail all *focus*; Enter or a second click *enters*.
6. **New chrome:** a bottom timeline strip (22 marks, positioned **by year** not by
   index), `/` search, the right rail repurposed to 8 generation jumps, and a full
   keyboard map (←/→ console, ↑/↓ generation, Enter, Esc, `/`, Home/End).

---

## The invariant, and the hole in its tests

`T = roomPosition − shelfPosition` must stay a **pure translation** with rotations
untouched — this is what makes the transition seamless, and it is the one thing
that must not break (`src/three/museum/museum-shots.ts:5-25`).

It survives cleanly. `stageWorldPos(id) = STAGE_ANCHOR + presentOffset(id)` is a
**pure function of the id** — no live animated value is ever read — so
`T = spec.consolePosition − stageWorldPos(id)` is still a pure translation, and
rotations are never written. `roomDelta` stops depending on the layout's positions
entirely, which *reduces* the invariant's surface area.

**But two of the three guarding tests are tautologies.**
`src/three/museum/museum-shots.test.ts:26` reduces to
`room.target − t + t === room.target`, true for **any** `t`; the NDC test at `:86`
constructs its shelf pose as `roomPos − t` and translates back, also true for any
`t`. Together with `:48` they pin something real — *"`approachShot` was derived,
not re-declared"* — but they are **not numeric coverage of `T`**, and `T`'s value
is precisely what this redesign puts at risk.

So Phase 1 writes the test that actually binds, while the answer is still trivially
true:
`artifact.position + hallOffsetFor(id) + presentOffset(id) ≡ stageWorldPos(id)`
for all 22, plus `shelfWorldPose(id).rotation ≡ artifact.rotation` for all 22 —
the latter closing a real hole, since the existing yaw guard reads *data* and would
not fire if someone later added "and it turns to face you" to the present step.

> **Do not delete the tautological tests.** They are weak about `T`'s *value* but
> they are the only thing pinning that `approachShot` is **derived from**
> `shotsFor(entry, spec).console` rather than re-declared — which is the failure
> mode `src/three/museum/museum-shots.ts:22` explicitly warns about. Keep them,
> and *add* the binding tests alongside. Equally: if the new binding test goes red
> in Phase 4, the glide maths is wrong — do not adjust the expected value to match
> the observed one.

**Three guards against mid-flight corruption** (the approach shot is computed at
`src/three/CameraRig.tsx:543` and consumed 1660 ms later at `:583` — an animated
offset between those two reads would move the console by the difference):

1. `hallMotion: 'settled' | 'gliding'` in the store; `selectArtifact` refuses
   unless settled. Extends the guard already at
   `src/three/museum/ShelfBay.tsx:100`.
2. Kill the glide and snap to target when `approach` leaves `idle` — the existing
   `FOCUS_HOLD_MS = 260` beat is its natural home.
3. `roomDelta` reads only module constants, so it is *incapable* of being
   mid-flight.

### Two world-vs-local traps that will not fail loudly

- **`src/three/HeroConsole.tsx:68,85`** writes `artifact.position` as a **world**
  position — it is mounted outside `MuseumScene` by design. The moment artifacts
  live in a translated group, the hero sits at the un-glided spot. Must route
  through `shelfWorldPose`.
- **`src/three/museum/ShelfBay.tsx:79,101`** passes a raycast `.point.x`
  (**world**) into `artifactAtX`, which compares against layout-local X. A glide
  with any X component silently selects the *neighbouring* console.

---

## Phases

Ordered so the invariant suite is green at every commit and exactly one variable
changes per phase.

**Phase 1 — Make the invariant explicit. Zero visual change.**
New `src/three/museum/hall-glide.ts` exporting `hallOffset` (fixed at zero for
now), `STAGE_ANCHOR`, `hallOffsetFor(id)`, `presentOffset(id)`, `shelfWorldPose(id)`.
Route `HeroConsole`'s two writes and `src/three/CameraRig.tsx:652` through it. Move
the "not on any shelf" throw into `hallOffsetFor`. **Write the binding tests now.**

**Phase 2 — Fix the overview dolly escape. Shippable alone.**
Add `dolly?: 'distance' | 'none'` to `Shot`; the overview opts out. Add the missing
`z < entranceZ + 4` assertion. Rationale: pulling back is right for an object in
open space, wrong for a camera inside a box — a narrow viewport should crop the
hall's *width*, which carries no content.

**Phase 3 — Per-console focus, chrome only. Camera behaviour unchanged.**
Store gains `focusedId` / `setFocusedConsole` / `hallMotion`; keep `focusGeneration`
as a **derived selector** so `ShelfOverlay`, `MuseumLights` and `ArtifactLabel` keep
working untouched. Add order helpers (`CONSOLE_ORDER` from
`bays.flatMap(b => b.artifacts)` — the only ordering guaranteed to match what the
camera walks past — plus `nextConsole` / `prevConsole` / `firstOfGeneration` /
`consoleAtYear`); this is where `generationNearestZ`'s coverage lands. Build the
timeline strip, `/` search, keyboard map and rail. Marks positioned by year
(guard `earliestYear` returning `0` for a console with no release dates). Adopt
`frameOffsetFor` on the shelf — it currently uses `NO_OFFSET` because there was no
bottom chrome, and the strip changes that.

**Phase 4 — Freeze the camera, introduce the glide. The big one. Row still staggered.**
`stageShot()`; `restingShot` (`src/three/CameraRig.tsx:113`) returns it for
`hallView === 'station'`. Delete `bayShot`/`bayShots`, `travelHall`, the settle
debounce and `generationNearestZ`, migrating their coverage. Glide group + 2-D
tween. Split `focusNavNonce` — pose change and glide are now two independent
animations needing two signals. World→local X conversion at the two `artifactAtX`
call sites. Layout-effect restore of the group position on the retreat remount
(the museum remounts fresh at `retreating`, and a first frame at offset zero would
land the hero where the hall is not). Reduced motion snaps.

**Phase 5 — Straighten the row; rebuild the overview and the year line.**
Stagger → a shallow diagonal (`centerX = (index − 3.5) × 0.40`), which costs nothing
because the glide already needs an X component and guarantees no two plinths share a
screen column. `STATION_SPACING 4.6 → 3.4`. Retune the overview to a three-quarter
view. Note the real problem is **compositional, not occlusion** — a receding row
never occludes itself (further objects project higher), but the stations collapse
into a narrow column where the far one is ~24 px. `YearLine`'s ticks break silently
here (`plinthInnerX` goes negative and clamps to 8 identical stubs) and need a real
redesign — the plinths now sit *on* the line, so it threads through every station.

**Phase 6 — The presenting step + static lighting.**
`presentOffset` goes non-zero; a dedicated `present` group in `ArtifactSlot`
(**not** the hover group — two GSAP tweens on one `position.z` would fight).
`MuseumLights` becomes a static rig aimed at the stage: its per-focus accent tween
disappears and the shadow frustum shrinks from ±5/far-60 to about ±2/far-12, roughly
a **6× gain in shadow texel density** on the one console anyone is looking at.

**Phase 7 — Interaction rules.**
Click-to-focus vs click-to-enter; drag threshold; non-focused consoles sit back.
Revisit `Effects()` — its shelf/room split is justified by "the neighbouring
generations are the content" (`src/three/Scene.tsx:69`), which stops being true at
the stage. The decision becomes per-`hallView`, not per-`screen`.

**Why 4 before 5:** freezing the camera with the staggered row is safe; straightening
while `bayShot` is still live is not — at dolly ≥ 1.5 the bay camera would stand
*behind* the previous station's plinth, directly on the sightline. Today the stagger
hides that.

---

## Files

| Area | Files |
|---|---|
| New | `src/three/museum/hall-glide.ts` |
| Camera & shots | `src/three/CameraRig.tsx`, `src/three/museum/museum-shots.ts`, `src/three/shots.ts` |
| Layout | `src/three/museum/shelf-layout.ts` |
| Scene | `src/three/museum/MuseumScene.tsx`, `src/three/museum/ShelfBay.tsx`, `src/three/museum/ArtifactSlot.tsx`, `src/three/museum/ArtifactLabel.tsx`, `src/three/museum/MuseumLights.tsx`, `src/three/HeroConsole.tsx` |
| State | `src/store/scene.ts`, `src/frame.ts` |
| Chrome | `src/components/ShelfOverlay.tsx` + new timeline/search components |
| Tests | `src/three/museum/museum-shots.test.ts`, `src/three/museum/shelf-layout.test.ts` |

Reuse rather than rebuild: `rotatedFootprintX`/`rotatedFootprintZ`, `artifactAtX`,
`roomDelta`, `approachShot`, `shotCameraPosition`/`aspectDolly`, `frameOffsetFor`,
`APPROACH_TIMING`, `releaseYear`, and the `heroGroupRef` module-ref pattern (which
`hallGroupRef` should copy).

---

## Verification

After **every** phase:

```bash
npx tsc --noEmit -p tsconfig.app.json && npx vitest run && npx oxlint
```

- **The invariant suite is the gate.** `museum-shots.test.ts` must be green at every
  commit — plus the new binding tests from Phase 1, which are what actually prove
  Phase 4 rather than tautologically passing it.
- No test coverage may be deleted. Three properties genuinely change (per-station
  framing → per-console stage framing; stagger → straight row; `generationNearestZ`
  → explicit focus order); each gets replacement coverage, not removal.
- Live in the browser each phase: travel end to end, enter a console and come back
  both ways, check the overview at **portrait aspect** (the dolly bug), confirm
  keyboard reaches everything, and confirm a drag that starts over a console does
  not enter it.
- Screenshots each phase — this is a look-and-feel change.

## Risks

- **Biggest: the two world-vs-local traps** (`HeroConsole`, `artifactAtX`). Neither
  fails loudly; both silently misplace things by the glide offset.
- Mid-flight glide during the approach's 1660 ms two-read gap — three guards above.
- The retreat remount painting one frame at offset zero.
- Per-console present offsets must be computed identically by `ArtifactSlot` and
  `shelfWorldPose`, or the two implementations drift. One helper, one truth.
