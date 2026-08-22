# Era theme system — implementation spec

Per-era visual, material and motion treatment across the 22-console atlas, driven by a
token system rather than per-era page designs.

**Status:** not started · **Tier 1 estimate:** ~3–4 days · **Created:** 2026-08-22

This spec is self-contained. An agent starting cold, with only this file and the repo,
should be able to execute Tier 1 without re-deriving anything. Every value it needs is
either here or behind a git command printed here.

Read `ROADMAP.md` first — it is the plan of record and this is one of its Phase 0 tasks.

---

## 1. What this is

The repo owner produced a design matrix defining an era-appropriate treatment per console
generation: eight variables (material, environment, lighting, accent colour, typography,
texture, UI behaviour, sound) that each era overrides while the information architecture
stays fixed.

Their stated goal, verbatim:

> *"Do not create an '80s skin. Create an 80s experience using material, environment,
> lighting, typography, motion, sound, and content."*

Same museum building, different exhibition rooms. The sidebar, top nav, Console/Games
switch, 3D viewport, viewport controls, panel tabs, stats and fun-fact cards all keep
their structure and position in every era. Only the eight variables move.

### Locked decisions

These were settled with the owner. Do not re-open them without asking.

| Question | Answer |
|---|---|
| **Era bands** | Eras **are** the 8 generations. `eraOf(entry)` returns `entry.generation` |
| **Scope before launch** | **Tier 1 only** — theme, lighting, motion. Runs alongside ROADMAP Phase 0 |
| **Glow / scanlines** | Period effects in the **3D layer only**. The DOM stays tonal — panels, sidebar and chrome keep the project's existing no-glow standard |
| **Tilt-shift blur vs. rooms** | **Keep the tilt-shift; restore the rooms anyway.** Blurred-but-legible period atmosphere is the intent, not a compromise |

### Why Tier 1 runs alongside Phase 0 rather than after it

ROADMAP Phase 0 generates 242 OG share cards. With era theming those cards differ per
generation, which makes them a distribution asset rather than 242 near-identical images.
Shipping generic and re-skinning afterwards is wasted work.

---

## 2. The era model

**`EraId` is `Generation`** — the same type, not a parallel one.

```ts
export type EraId = Generation  // 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
export function eraOf(entry: ConsoleEntry): EraId { return entry.generation }
```

This single choice is what makes the change cheap:

- `sidebarGroups()` (`src/data/consoles/index.ts:107`) already groups by generation. **No
  change.**
- `src/data/consoles/sidebar-groups.test.ts` (6 tests) and the grouping block in
  `roster.test.ts` keep passing **untouched**.
- `GENERATION_ERAS` (`src/data/roster.ts:265-274`) already has an authored caption for all
  8 eras — "1994: the jump to 3D", "2012: the living room saturates".
- No tie-break rules, no straddling consoles, no new `year` source of truth. (Note
  `master-system` is inconsistent today — `roster.ts` says `year: 1985`, the data file says
  NA 1986 — but under generation alignment this does not affect era assignment at all.)

Generation 1 has zero consoles in the roster, so there are 8 eras, not 9.

### The owner's 9 board rows map onto 8 generations

| Board row | Era | Consoles |
|---|---|---|
| 01 The Experiment | **Gen 2** (1977) | Atari 2600 |
| 02 The Arcade **+** 03 The Recovery | **Gen 3** (1983) | NES, Master System |
| 04 The 16-Bit War | **Gen 4** (1988) | Genesis, SNES |
| 05 (the 1994 PlayStation row) | **Gen 5** (1994) | Saturn, PlayStation, N64 |
| 06 The Digital Living Room | **Gen 6** (1998) | Dreamcast, PS2, Xbox, GameCube |
| 07 The HD Era | **Gen 7** (2005) | Xbox 360, PS3, Wii |
| 08 The Connected Era | **Gen 8** (2012) | Wii U, PS4, Xbox One, Switch |
| 09 The Ecosystem | **Gen 9** (2020) | PS5, Xbox Series, Switch 2 |

**The one merge:** "The Arcade" is the only board row with no home console of its own, so
its CRT / scanline / neon material language folds into Gen 3. This is period-correct — the
NES era *was* the arcade-at-home era.

**For the record**, the source board had numbering errors that generation alignment
resolves: two rows numbered 09, no row 06, era 05 labelled "2000–2005 / PS2·Xbox·GameCube"
while its example screen showed 1994 PlayStation, and one row reading "2020–2019". The
bands as drawn also overlapped at 1983 and 2005, with NES and Xbox 360 sitting exactly on
those boundaries.

---

## 3. Tier 1 — four axes, only one of which is colour

A colour swap alone is exactly the skin the owner asked not to build. Four independent
axes move, and only one is paint. **This is the defence of the whole approach, so it has
to be true in the result, not just in the plan.**

### Axis 1 — Lighting (3D, physically real)

Already live and already authored. `src/three/Diorama.tsx` drives ambient + key light from
`spec.lighting.tempK` / `intensity` / `keyPosition`, and all 22 presets exist in the
console data — 2700K for the Atari's tungsten den through 4500K for the Switch 2. A colour
temperature change physically alters how the object reads. That is material, not paint.

The missing piece is **`backdrop`**, which was flattened to a single `#eeeeea` for all 22
consoles in commit `38a3c16` ("Make every room's background as white as the shelf").
Restore it — see §6 for every value.

`src/three/Scene.tsx` already reads `spec.lighting.backdrop` in two places (`Backdrop()`
and `Background()`), so this is a **data-only change with zero plumbing.**

Use a base/override shape: an era default in `ERAS`, a per-console override in the console
data. This is the same pattern `src/data/kits/media-shells.ts` already uses with
`ARCHETYPE_SHELLS` + `CONSOLE_SHELL_OVERRIDES` + `shellFor()`.

### Axis 2 — Motion (behaviour)

There is no motion config in this repo today. One GSAP tween, in one file, with `1200`ms
and `'power3.inOut'` written inline at `src/three/CameraRig.tsx:139-140`.

Create `src/motion.ts` as the direct analogue of the existing `src/frame.ts` — pure, no
store, trivially unit-testable:

```ts
export type MotionProfile = {
  cameraMs: number
  ease: string
  uiMs: number
  uiEase: string
}

export function motionFor(era: EraId, reducedMotion: boolean): MotionProfile
```

Character per era, from the board:

| Era | Motion language |
|---|---|
| Gen 2 | Slow, physical, weighty. Things move like paper and mechanism |
| Gen 3 | Snappy, arcade. Quick, reactive, a little bouncy |
| Gen 4 | Energetic, fast. Magazine-flip pace |
| Gen 5 | 3D and rotational. Longer arcs, things turn through space |
| Gen 6 | Layered. Panels slide and fade over one another |
| Gen 7 | Smooth, fluid. Fade and scale |
| Gen 8 | Minimal micro-interactions |
| Gen 9 | Spatial. Parallax and depth |

**Gen 9 must return exactly `{ cameraMs: 1200, ease: 'power3.inOut' }`** — today's values —
so nothing regresses at the default. A unit test pins this.

`reducedMotion: true` collapses **every** duration to 0. Today `prefers-reduced-motion` is
read into the store but consumed by only one component; this is where that becomes a real
contract.

### Axis 3 — Typography (voice), family only

Three faces. Two are already on disk.

| Era | Face | Status |
|---|---|---|
| Gen 2 | A technical monospace | To source. Period-correct for a 1977 manual — this is genuinely *data*, which is what keeps it clear of the "monospace as house voice" trap |
| Gen 3–5 | **Sentient** | **Already self-hosted** at `public/fonts/sentient-{regular,italic,medium}.woff2` with live `@font-face` blocks at `src/index.css:11-31` — and **nothing references the family**. Licensed (Fontshare), paid for, currently ~73 KB of dead weight |
| Gen 6–9 | **Bebas Neue** | The current `--font-display`. Unchanged |

Do not go hunting for eight display faces. The signature face has to be a real decision,
and the global design law rejects the Google-font shelf for anything carrying identity.
Three faces, two already licensed and on disk, is the honest scope.

**Family only.** See §7 for why sizing and tracking are out of scope.

### Axis 4 — Surface texture (material)

A per-era substrate on the panel and rail backgrounds — paper grain for Gen 2, CRT for Gen
3, print halftone for Gen 4, plastic, metal, glass, flat.

**Behind content, never over it.** Grain on top of text is a named failure in the design
law: it muddies legibility and the effect that was meant to feel tactile just hurts.

---

## 4. File-by-file work

| File | Change |
|---|---|
| `src/data/eras.ts` | **New.** `EraTheme` type, `ERAS: Record<Generation, EraTheme>`, `eraOf()`. Each entry carries `colors` (the four live tokens), `display`, `motion`, `backdrop`, `texture` |
| `src/motion.ts` | **New.** `motionFor(era, reducedMotion)`. Modelled on `src/frame.ts` |
| `src/index.css` | 8 **unlayered** `[data-era="N"]` blocks; the **three** scrollbar `rgba(244, 239, 230, …)` values at lines 109 / 119 / 123 → `color-mix()`; per-era `--font-display`; and a `@media (prefers-reduced-motion: reduce)` block — the file currently has **none** |
| `src/App.tsx:56` | Add `data-era={entry.generation}` to `<div className="flex h-full w-full overflow-hidden">` — the single common ancestor of the sidebar and the room chrome |
| `src/three/CameraRig.tsx:139-140` | Inline `1200` / `'power3.inOut'` → `motionFor()`. **Leave the tween guard and clamp logic alone** — see §7 |
| `src/data/consoles/*.ts` | Restore `diorama.lighting.backdrop` from the table in §6. 22 one-line data edits, plus one variant override |
| `src/three/Scene.tsx` | Restore **both** `Vignette` instances — see §6 |
| `src/components/room/MediaFigure.tsx:67` | `const stock = shell.recess ?? '#f4efe6'` — the only raw hex in the component tree. → the token |
| `src/components/room/FunFactCard.tsx:28-34` | Gate the 8-second auto-rotate (`setInterval(…, 8000)` + a 350 ms cross-fade) on `reducedMotion`. A real accessibility gap that exists today, independent of this feature |
| `docs/physical-games-implementation.md` | Its design-token block is stale — still names Sentient as `--font-display`, and says the stylesheet is 112 lines (it is 124). Correct it, or later work gets written against wrong values |

**No other component should need editing.** See the verification gate in §10.

---

## 5. Why the DOM theme is nearly free

Verified against the compiled CSS, not assumed.

Every colour in the app routes through 7 `@theme` custom properties in `src/index.css`:
`--color-ink`, `--color-ink-soft`, `--color-parchment`, `--color-parchment-dim`,
`--color-phosphor`, `--color-amber`, `--color-paper`. There are **zero hardcoded colours in
the component layer** — one stray hex (`MediaFigure.tsx:67`) and three rgba in the
scrollbar rule.

Tailwind 4 compiles opacity modifiers to a `color-mix()` on the variable:

```css
.text-ink\/70 { color: #12100eb3 }
@supports (color: color-mix(in lab, red, red)) {
  .text-ink\/70 { color: color-mix(in oklab, var(--color-ink) 70%, transparent) }
}
```

Every evergreen browser takes the `@supports` branch (`color-mix` has been Baseline since
2023); the baked literal is only a legacy fallback. **So overriding `--color-ink` re-themes
`text-ink/70` as well as `text-ink`, with no component edits at all.**

Two tokens are already dead and can be dropped or repurposed: `--color-phosphor` and
`--color-ink-soft` have **zero** usages.

---

## 6. Reference data

### The 22 backdrop values

Recovered from `git show 38a3c16^:src/data/consoles/<id>.ts`. Verified, not transcribed.

| Console | Backdrop | | Console | Backdrop |
|---|---|---|---|---|
| `atari-2600` | `#332821` | | `xbox` | `#191c22` |
| `nes` | `#292d33` | | `gamecube` | `#232630` |
| `master-system` | `#25292f` | | `xbox-360` | `#16181d` |
| `genesis` | `#241f2b` | | `ps3` | `#1e2028` |
| `snes` | `#2b2621` | | `wii` | `#252831` |
| `saturn` | `#22242c` | | `wii-u` | `#1b1d24` |
| `playstation` | `#20222a` | | `ps4` | `#1b1d24` |
| `n64` | `#242730` | | `xbox-one` | `#15171c` |
| `dreamcast` | `#1f2230` | | `switch` | `#242833` |
| `ps2` | `#1e2028` | | `ps5` | `#191b22` |
| | | | `xbox-series` | `#131519` |
| | | | `switch-2` | `#262a35` |

**One variant override:** `snes.ts` is the only file with two backdrops. The base is
`#2b2621`; the Super Famicom variant (`variants[0].dioramaOverrides.lighting`) is
`#2a2f35`. Every other console has exactly one. Restore both.

To re-verify any value:

```bash
git show 38a3c16^:src/data/consoles/snes.ts | grep -n backdrop
```

### The Vignette — there are TWO instances

`src/three/Scene.tsx` has a Vignette in **both** the low-quality and high-quality paths,
and `38a3c16` flattened them to the same value. Restore both, to their **different**
originals:

| Path | Line (approx) | Now | Restore to |
|---|---|---|---|
| Low quality | 108 | `offset={0.4} darkness={0.22}` | `offset={0.28} darkness={0.72}` |
| High quality | 138 | `offset={0.4} darkness={0.22}` | `offset={0.24} darkness={0.68}` |

**This is coupled to the backdrops.** The vignette was lowered *because* the old value read
as dirt against a white backdrop. Restoring dark backdrops without restoring the vignette
leaves the scene flat; restoring the vignette without the backdrops makes it look dirty.
Do both or neither.

---

## 7. Gotchas

These will silently break the work if missed.

**CSS overrides must be unlayered.** `@theme` emits its variables into `:root` inside
`@layer theme`. An **unlayered** `[data-era="4"] { --color-ink: … }` rule beats layered
rules regardless of specificity, which is exactly what is wanted. Do not wrap the era
blocks in a `@layer`.

**`--color-paper` is hand-matched to the 3D backdrop.** This is documented at
`src/index.css:54-63`: the DOM's near-white paper is deliberately matched to the 3D scene's
background so panels floating over the room read as the same material. If backdrops go
per-era and `--color-paper` does not, that match silently breaks.
**Put `backdrop` and `colors.paper` in the same `EraTheme` object** so they cannot drift.
This is the same discipline `src/frame.ts` uses to stop the camera and the DOM chrome
reading two different answers.

**Do not touch `CameraRig`'s tween guard or clamp logic.** `active.current?.kill()` exists
because rapid mode switching otherwise leaves two tweens fighting over the camera. The
clamp-relaxing block exists because OrbitControls re-derives and clamps the camera's
spherical position on every internal `update()`, so a tween that leaves any clamp engaged
gets **silently fought and corrupted mid-flight**. Both fix documented real bugs. Change
only the `duration` and `ease` values.

**Per-era type *sizing* is not free.** `text-[10px]`, `text-[13px]`, `tracking-[0.18em]`
and friends appear 80+ times as arbitrary Tailwind values with **no indirection at all**.
Changing font *family* is free (it routes through `--font-display`); changing sizing or
tracking means tokenising all of them first. That is the one un-tokenised axis in the
entire styling layer, and it is why Tier 1 is family-only.

**Eight palettes is eight chances to ship an unreadable one.** Body text must clear its
background by a real value gap in every era. This failure mode is silent — it looks fine in
the era you were working in.

---

## 8. Tier 2 — the period rooms (deferred, not blocked)

Do not start this during Tier 1. It is recorded here because the blocking design question
is **resolved** and the cost is far lower than it looks.

### The blur question, resolved

`src/three/Scene.tsx` applies a screen-space tilt-shift focus band at `[0.44, 0.64]`
(`bandStart`/`bandEnd`, lines 83-84, offset by `frameOffset.dy`). Anything outside that
band renders permanently blurred — which is where restored room props would sit.

**The owner's call: keep the tilt-shift and restore the rooms anyway.** Blurred-but-legible
period atmosphere is the intent. This is how tilt-shift miniature photography actually
works: the sharp band is the subject, and everything around it falls off into blur that
still carries colour, form and light. A blurred rust-orange shag rug and a blurred brass
lamp read as *1977* without competing with the console.

### Why this makes Tier 2 cheap

**Blur eats detail, so the props never need GLBs.** The deleted `Prop` component was
already a correctly-proportioned box carrying the kit variant's colour, roughness and
metalness — and behind a tilt-shift fall-off, that is the finished look, not a placeholder.
What must be right is **silhouette, colour and light**, not geometry.

The original code's own comment anticipated this: *"the placeholder path IS the layout."*
Blur makes the placeholder path the finished surface too.

### What already exists

- `src/data/kits/prop-kit.ts` — 9 furniture types, real mm dimensions, 22 material
  variants. **Zero importers today.**
- ~176 authored prop placements (8 props × 22 consoles), each with position, rotation,
  scale and variant.
- 11 distinct TV specs with a curvature progression from 0.85 (1977 CRT) to flat panel.
- 7 room kit ids (`living-70s-na`, `living-80s-na`, `den-90s-na`, `den-2000s-na`,
  `living-2010s-na`, `living-2020s-na`, plus `living-jp-90s` for the Super Famicom).

### What must be fixed

**The placement bug that caused the removal.** It is a **placement-data bug, not
architecture.** `RoomShell` builds its floor at `y=0`, but every console is authored at
`consolePosition ≈ [0.44, 0.5, -1.02]` — half a metre in the air with nothing under it —
and `x=0.44` sits *inside* the 1100mm-wide `tv-stand` prop's volume. Clipping reads as
broken even when blurred.

Recover the deleted renderer verbatim:

```bash
git show 5029346:src/three/Diorama.tsx
```

188 lines, containing `RoomShell`, `Prop` and `TvPlaceholder`. The `GameShelf` is at
`git show 461ba1c:src/three/GameShelf.tsx`, though `MediaSpread` supersedes it.

### The ready-made hook for era transitions

The `Playback` state machine in `src/store/scene.ts` — `browsing → selected → inserting →
booting → playing → ejecting`, with a `TRANSITIONS` guard table — is **fully implemented
and consumed by nothing**. That is where the owner's 5-step era transition choreography
(material fades → lighting shifts → UI transforms → new era arrives) belongs.

---

## 9. Out of scope

Each with its reason, so scope cannot creep.

| Not in Tier 1 | Why |
|---|---|
| Room environments, props, TVs, controllers | Tier 2. Deferred by scope, not cancelled — see §8 |
| Per-era type sizing and tracking | 80+ arbitrary Tailwind values with no indirection. Family is free; sizing means tokenising first |
| **Sound** | Genuinely greenfield. There is no `AudioContext`, no audio package, no audio assets, and no `Game.clip` is populated anywhere. It needs an asset pipeline, a playback layer, mute/volume state, autoplay-gesture unlock and its own reduced-motion contract |
| Era transition choreography | Needs the rooms to mean anything. The `Playback` hook is waiting |
| Rebuilding the museum shelf | Settled decision — see the "Do NOT build" table in `ROADMAP.md` |

---

## 10. Verification

```bash
npm run build && npm test
```

- **All 192 existing tests green.** In particular `sidebar-groups.test.ts` (6 tests) and
  the grouping block in `roster.test.ts` must pass **untouched**. If either needs editing,
  the era model drifted off `generation` and the cheap path was lost — stop and reconsider.
- **New tests.** `eras.test.ts`: every generation 2–9 has an entry; every entry's colours
  clear a contrast ratio against its own `paper`; `eraOf()` is total over the roster.
  `motion.test.ts`: `reducedMotion` collapses every duration to 0; **Gen 9 returns exactly
  `1200` / `power3.inOut`**, pinning the no-regression claim.
- **Walk all 22 consoles in the browser.** Colour, display face, backdrop and light
  temperature must visibly change at each generation boundary and stay stable within one.
- **Read a panel in every era.** Body text must clear its background by a real value gap.
  This is the one way an 8-palette system fails badly, and it fails silently.
- **`prefers-reduced-motion: reduce`** in devtools: the camera snaps, the FunFactCard stops
  auto-rotating, and CSS transitions collapse. Verify all three — only the first works
  today.
- **No DOM element gained a glow, emissive fill or bloom.** Gen 3 and Gen 4 are where this
  creeps in. Period effects belong to the 3D layer only.
- **`git diff --stat src/components/` should show exactly two files** — `MediaFigure.tsx`
  and `FunFactCard.tsx`. If components are being edited in order to theme them, the
  CSS-variable approach has been abandoned by accident. This is the sharpest single check
  in this document.

---

## 11. Design-law compliance

Every surface here gets a full point-by-point pass against the global anti-slop design law
(`~/.claude/CLAUDE.md`) before it is called done — the whole file, not a skim.

The specific traps this change invites:

- **The same skeleton, recolored.** This is the one that matters. Four axes must actually
  move in the shipped result — lighting, motion, type and material, not just colour. If an
  era reads as the previous era with a new palette, the work has failed on its own terms.
- **Saturated accent colour.** Era accents must be tonal shifts — a value moved lighter or
  darker, usually desaturated — never poster-bright fills. Eight vivid accents would read
  as a template with a theme switcher.
- **Grain sitting on top of content.** Texture goes behind, always. Never over text.
- **Colliding colours and hard seams.** Eight palettes is eight chances to ship a muddy
  one, and eight boundaries where one era's tone has to hand off to the next.
- **The inner-glow box and background glow.** Locked out of the DOM by decision. The 3D
  layer may use period-accurate CRT effects; a bordered pill that lights up from inside is
  still slop in 1983.
