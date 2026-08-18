# Implementation spec: promote Games to a top-level section, with a Game Artifact view

**Status:** ready to execute, but **Phase 0 gates everything else** — read it before
planning the rest. Written to be self-contained; you do not need any prior
conversation.

**Repo:** `E:\H5 Projects\GameConsoleHistory`
**Branch:** work on a new branch off `main`.

---

## 0. Project orientation

| Thing | Value |
|---|---|
| Stack | Vite 8 + React 19 + TypeScript 6 |
| 3D | three 0.185, @react-three/fiber 9, @react-three/drei 10, @react-three/postprocessing 3 |
| State | zustand 5, single store at `src/store/scene.ts` |
| Animation | gsap 3 |
| Styling | **Tailwind v4, CSS-first config.** No CSS modules, no styled-components |
| Import alias | `@` → `./src` |
| Tests | vitest 4. **There is no `test` script** — run `npx vitest run` |
| Lint | `npm run lint` (oxlint) |
| Build | `npm run build` (`tsc -b && vite build`) |
| Dev | `npm run dev` |

### Design tokens

The entire stylesheet is `src/index.css`. Tokens:

```css
@theme {
  --color-ink: #12100e;
  --color-ink-soft: #262220;
  --color-parchment: #f4efe6;
  --color-parchment-dim: #e5dccd;
  --color-phosphor: #6ee7a8;   /* defined, currently unused */
  --color-amber: #d98c34;      /* the single accent */
  --color-paper: #fbfbf9;

  --font-display: 'Sentient', ui-serif, Georgia, serif;  /* self-hosted, public/fonts/ */
  --font-sans: ui-sans-serif, system-ui, sans-serif;
}
```

**Do not add a font. Do not add a colour.** `font-display` (Sentient) is
reserved for titles and numbers; amber is used only for small headings, rank
numbers and small icons — never as a fill.

### House classes (copy these exactly)

| Role | Classes |
|---|---|
| Section heading | `text-[10px] uppercase tracking-[0.18em] text-amber/70` |
| Fun-fact eyebrow | `text-[10px] uppercase tracking-[0.22em] text-amber/80` |
| Sub-heading | `text-[13px] font-medium text-ink` |
| Body prose | `text-[13px] leading-relaxed text-ink/70` |
| Caption / label | `text-[10px] uppercase tracking-[0.14em] text-ink/40` |
| Hero number | `font-display text-4xl tabular-nums text-ink` (compact: `text-3xl`) |
| Fun-fact title | `font-display text-lg leading-snug text-ink` |
| Divider | `border-t border-ink/10 pt-5` |
| Interactive row | `rounded-lg px-2 py-2 transition` + `bg-ink/8` active / `hover:bg-ink/5` |

### Code conventions

- **Comments explain *why*, at length, in prose.** Every non-trivial file opens
  with a multi-paragraph header explaining the decision behind it. Match this.
- Data with a real-world origin carries `source: string` (and often
  `precision: 'exact' | 'approximate'`). See `src/data/kits/media-archetypes.ts`
  and `src/three/models/gltf-transforms.ts` for the established voice.
- Geometry/derivation maths lives in **pure, React-free modules** so it can be
  unit-tested. Data is millimetres; the scene is metres (`MM = 0.001`).
- No em dashes in UI copy you write. Hyphen, colon, or split the sentence.

---

## 1. The goal, and the finding that shapes it

Today the app is one screen — a console room — with a bottom `DetailPanel`
carrying four peer tabs: Overview / Games / Hardware / History. Games is the odd
one out: it is the only tab backed by a real 3D subject (`MediaSpread` — ten
true-scale boxes with real SteamGridDB cover art, and real cartridge GLBs for
NES/SNES), yet it sits as a sibling of three text tabs.

**Goal:** promote Games to a top-level section beside Console, give it a panel as
rich as the console's, and let clicking one game open a dedicated **Game
Artifact** view — the step `IMPLEMENTATION_STATUS.md` §19 and
`shelf_of_history_concept.md` both call for and mark as not started.

### The data gap (read this before designing any panel content)

| | `ConsoleEntry` | `Game` |
|---|---|---|
| Real fields | ~25 — `specs`, `relatableSpecs`, `facts[]`, `failureStates[]`, `variants[]`, `controllers[]`, `dimensions`, `msrpUsd` + `msrpUsdAdjusted`, `hardwareDiagram`, `sources[]` | **7** |

`Game` in full, from `src/types/console.ts`:

```ts
export type Game = {
  rank: number
  title: string
  year: number
  unitsSold: number
  developer: string
  publisher: string
  cover?: string        // now resolved via src/data/covers.ts (219/220 populated)
  clip?: GameClip       // never populated
  youtubeId?: string    // never populated
  blurb: string
}
```

There is **no per-game fact and no per-game price anywhere in the repo**.
`Fact[]` is console-level only:

```ts
export type Fact = { id: string; title: string; body: string; anchor?: [number, number, number] }
```

So a Games panel mirroring the console's richness needs data that does not exist.
Two things fill it, and both are in scope:

1. **Derived metrics** — free, verifiable, no authoring. Chiefly **attach rate**:
   `game.unitsSold / entry.unitsSold`. Super Mario Bros. is 40,240,000 against an
   NES install base of 61,910,000 → 65%, i.e. *two of every three NES owners had
   it*. This is exactly the move `relatableSpecs` already makes for hardware.
2. **Researched facts and prices** — agent-researched, every value sourced. See
   Phase 0.

---

## 2. Decisions (locked — do not relitigate)

1. **Data:** hand-authored per-game facts and prices, **researched by agent**.
2. **Switcher:** large and editorial, set in Sentient. Not a pill, not a
   segmented control, not tracked-out caps.
3. **3D:** the console slides away; the games take the stage.
4. **Depth:** clicking a game opens a full Game Artifact view.

---

## 3. Phase 0 — research pilot (DO THIS FIRST, THEN STOP)

**Scope: NES only, 10 games.** Do not research all 220 before reporting.

The assumption being tested is *"reliable per-game facts and prices are findable
at scale."* Expect a good hit rate on facts and a poor one on pre-2000 launch
prices — game MSRPs varied by region, year and revision, and for retro titles
often survive only in period magazine advertisements. Measuring that ratio on 10
games is cheap; discovering it on game 180 is not.

### Rules

- **Never write a value from memory.** Every fact and every price needs a real
  source found via `WebSearch` / `WebFetch`, recorded as a `source` string.
- **A good fun fact is specific and checkable** — a development detail, a
  commercial oddity, a technical constraint. Not a plot summary, not "it was very
  popular", not marketing copy.
- **If nothing credible is found, leave the field out.** An absent fact is a
  normal, designed state (see Task 5). A plausible-sounding invention is not.
- Match the `source` voice already used in `src/data/kits/media-archetypes.ts`.

### Deliverable

Write `src/data/game-facts.ts` (see Task 1 for the shape) covering
`nes:1` … `nes:10`, then **report**:

- facts found / 10
- prices found / 10
- which sources proved usable

Then stop and let the repo owner decide whether to continue to the other 21
consoles. That decision is theirs, not yours.

---

## 4. Current state of the files you will touch

### `src/App.tsx`
A flex split: `<ConsoleSidebar />` (real layout sibling) + a `relative flex-1`
area holding `<Scene />` and a `pointer-events-none absolute inset-0` overlay
containing `<RoomChrome />`. Double-click on `CANVAS` calls `bumpReframe()`.
Sets `reducedMotion` from `prefers-reduced-motion` and `layout` from a 1100px
media query.

### `src/components/room/RoomChrome.tsx`
Renders `<ConsoleNav />`, `<ViewportControls />`, `<DetailPanel />` inside a
`pointer-events-none absolute inset-0`. **DOM order is load-bearing — there are
no z-index classes anywhere in the app.**

### `src/components/room/ConsoleNav.tsx`
`<header className="pointer-events-auto absolute inset-x-0 top-0 flex h-14 items-center gap-3 border-b border-ink/10 px-8">`
Contains: hamburger (compact only), the `Console Chronicles` wordmark at
`text-[11px] uppercase tracking-[0.28em] text-ink/70`, a hairline separator,
prev/next console buttons, and `<ProductLogo>` + release year. Owns window-wide
`ArrowLeft`/`ArrowRight` keys.

### `src/frame.ts`
The single source of the layout contract, read by **both** the chrome and
`CameraRig`:

```ts
export const ROOM_CHROME = {
  panelH: 0.32, topH: 0.1, titleW: 0.34, collapsedPanelH: 0.08,
  compact: { panelH: 0.45, topH: 0.16, titleW: 0, collapsedPanelH: 0.08 },
} as const
```

`frameOffsetFor()` derives `dy = clamp((panelH - topH) / 2, 0, 0.2)` — the lift
that centres the console in the clear band. `frame.test.ts` pins this.

### `src/store/scene.ts`
```ts
export type ViewMode = 'console' | 'diorama' | 'library' | 'controller' | 'compare'
export type PanelTab = 'overview' | 'games' | 'hardware' | 'history'

const TAB_FOR_MODE: Partial<Record<ViewMode, PanelTab>> = { library: 'games' }
const MODE_FOR_TAB: Partial<Record<PanelTab, ViewMode>> = {
  overview: 'console', games: 'library', hardware: 'console', history: 'console',
}
```
`setPanelTab` applies `MODE_FOR_TAB`. **`selectGame(rank)` sets `panelTab`,
`panelOpen`, `mode: 'library'` and `playback` inside its own `set()`** — it does
NOT route through `setPanelTab`. This has already caused one bug; keep it in sync
by hand.

### `src/components/room/DetailPanel.tsx`
Bottom-anchored `<aside>`, height from `ROOM_CHROME` fractions. Two structurally
different layouts:
- **wide**: CSS grid `3fr / 4fr / 3fr` (or `2fr / 3fr` with no facts) —
  `PanelSummary` | tabNav + tabBody | `FunFactCard`, each column with its **own**
  `overflow-y-auto`.
- **compact**: **ONE** `overflow-y-auto` for everything; tabNav is `sticky top-0`;
  `FunFactCard` omitted.

Tab dispatch is a flat conditional: `{tab === 'games' && <GamesTab />}`.

### `src/components/room/PanelSummary.tsx`
Left column: hero stat (units sold, `font-display text-4xl`), two `SecondaryStat`
cells in a 2-col grid (price, CPU), then the summary paragraph and the muted
footer. Numbers come **first** and are `shrink-0` — the panel is short and they
were reliably pushed out of view otherwise. No scroll of its own.

### `src/components/room/FunFactCard.tsx`
Plain content, not a card (its own header explains it used to be a floating
bordered box and that read as disconnected). Rotates `entry.facts` every 8s with
a 350ms opacity fade. Renders `null` when `facts.length === 0`.
Eyebrow → `font-display text-lg` title → body prose.

### `src/three/shots.ts`
`shotsFor(entry, spec)` returns an exhaustive `Record<RoomShotId, Shot>` over
`console | diorama | library | controller | tv`. `library` targets
`mediaAnchor(entry, spec)` and derives its distance from `spreadExtent().width`
and `CAMERA_FOV_DEG`. The file header notes `stage`/`hall` belong to the museum
and stay **out** of `shotsFor`'s record while joining the `ShotId` union — that
is the precedent to follow for `artifact` (Task 4).

### `src/three/HeroConsole.tsx`
The **one** instance of the active console. `useGLTF` caches by URL, so exactly
one component may own it. Exports `heroGroupRef` and positions imperatively in a
`useLayoutEffect` from `spec.consolePosition` / `consoleRotation`.

### `src/three/MediaSpread.tsx` / `src/three/Diorama.tsx`
`MediaSpread` lays out `entry.games` via `layoutSpread(...)` with
`MEDIA_SPREAD_RANKS` and renders one `<GameBox>` per slot. `Diorama` mounts it
**only when `panelTab === 'games'`**:
```tsx
const showSpread = useScene((s) => s.panelTab === 'games')
...
{showSpread && <MediaSpread entry={entry} archetypeId={archetypeId} position={spreadAnchor} />}
```
This gate moves to the new `section` state in Task 2.

---

## 5. Tasks

### Task 1 — Data model

**`src/types/console.ts`** — extend `Game` with optional, sourced fields.
Mirror `Fact`'s `title`/`body` shape so the games fun-fact renders identically
to the console one:

```ts
export type GameFact = {
  title: string
  body: string
  /** Where this came from. Never write a fact without one. */
  source: string
}

export type Game = {
  // ...existing 7 fields unchanged
  fact?: GameFact
  /** US launch MSRP. Absent whenever no credible source was found. */
  msrpUsd?: number
  msrpUsdAdjusted?: number
  msrpSource?: string
}
```

**New file: `src/data/game-facts.ts`** — hand-curated, **not** generated. Keyed
`` `${consoleId}:${rank}` ``, merged onto entries by a small resolver. Keeping it
out of the 22 console data files means one reviewable diff per research batch
instead of 22 churned files. It looks like `covers.generated.ts` but is committed
and human-reviewed — say so in its header so nobody regenerates it.

**New file: `src/data/game-metrics.ts`** — pure, testable, needs no new data:

```ts
/**
 * Share of the console's install base that bought this game.
 * Returns null above 1.0 on purpose: a very-early-life console (switch-2
 * today) can have a game approaching its own install base, and "1.2 of every
 * 1 owner" is nonsense. Callers drop the block rather than print it.
 */
export function attachRate(game: Game, entry: ConsoleEntry): number | null

/** Years between the console's first release and the game's year. 0 = launch title. */
export function yearsAfterLaunch(game: Game, entry: ConsoleEntry): number

/** This game's share of the summed sales of the console's recorded top ten. */
export function shareOfTopTen(game: Game, entry: ConsoleEntry): number
```

**Test** (`game-metrics.test.ts`): the `attachRate > 1 → null` case explicitly;
a launch title yielding `yearsAfterLaunch === 0`; shares summing to 1 across a
console's ten.

### Task 2 — State model

**`src/store/scene.ts`:**

```ts
export type Section = 'console' | 'games'
export type ConsoleTab = 'overview' | 'hardware' | 'history'   // 'games' leaves
export type ViewMode = 'console' | 'diorama' | 'library' | 'controller' | 'compare' | 'artifact'
```

- Add `section: Section` + `setSection`.
- Narrow `panelTab` to `ConsoleTab`; rewrite `MODE_FOR_TAB` / `TAB_FOR_MODE`
  against `Section` rather than tab.
- Camera mode follows: `console` → `'console'`; `games` → `'library'`;
  `games` **with `selectedGameRank !== null`** → `'artifact'`.
- Games section reads its existing `selectedGameRank`: `null` = the list view,
  set = the artifact view.
- **Update `selectGame`** for the new model — it sets `mode`/`panelTab` inside
  its own `set()` and bypasses `setPanelTab`. It must now set
  `section: 'games'` and `mode: 'artifact'`.
- `setConsole` resets `selectedGameRank` already; make sure it also lands on a
  sane `section`.
- **`Diorama.tsx`**: change the spread gate from `panelTab === 'games'` to
  `section === 'games'`.

### Task 3 — The switcher (`src/components/room/SectionSwitch.tsx`, new)

Two words in Sentient at real size, left-aligned, in its own row directly under
`ConsoleNav`'s 56px strip, mounted in `RoomChrome` **after** `ConsoleNav` (DOM
order is the stacking order — there are no z-index classes in this app).

```tsx
<nav role="tablist" aria-label="Section"
     className="pointer-events-auto absolute left-8 top-14 flex items-baseline gap-6 pt-5">
  {/* each: */}
  <button role="tab" aria-selected={active} tabIndex={active ? 0 : -1}
    className={[
      'font-display text-[28px] leading-none transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/60 rounded-sm',
      active ? 'text-ink' : 'text-ink/25 hover:text-ink/50',
    ].join(' ')}>
```

- Separator: **spacing only**. No hairline rule.
- Active state is a tonal shift **on the type itself** — no underline, no dot,
  no sliding indicator, no lift.
- Arrow-key navigation between the two tabs (standard tablist behaviour).

**Why not tracked caps:** the app already spends that treatment twice — the
`Console Chronicles` wordmark at `tracking-[0.28em]` and section headings at
`tracking-[0.18em] text-amber/70`. A third would read as one costume on every
small string. Sentient at size is the differentiated choice and is already
in-system (`font-display` is reserved for titles and numbers).

**`src/frame.ts`:** `topH` must grow to cover the new row, or the camera will
frame the console under it. The header is 56px; the switch row adds roughly
60px. Re-derive both values (wide `0.1` → about `0.15`; compact `0.16` → about
`0.21`) against a real viewport rather than trusting those numbers, and update
`frame.test.ts`.

### Task 4 — 3D: the console slides away

`HeroConsole` stays **mounted**. It owns the single `useGLTF` instance;
unmounting would re-parse the GLB and pop on return. It already exports
`heroGroupRef` for exactly this kind of imperative move.

- Entering `games`: GSAP-tween the hero group clear of frame.
- Returning to `console`: tween back to `spec.consolePosition`.
- **Gate both on `reducedMotion`** — snap instead of tween.
- Kill any in-flight tween before starting a new one; rapid switching otherwise
  leaves two tweens fighting over one transform (the same discipline
  `CameraRig.applyShot` already documents).

**`shots.ts`** gains an `artifact` shot. Follow the `stage`/`hall` precedent:
add `'artifact'` to the `ShotId` union but keep it **out** of `shotsFor`'s
exhaustive record, since it depends on a selected rank that `shotsFor(entry, spec)`
does not receive. Export it separately:

```ts
export function artifactShotFor(entry: ConsoleEntry, spec: DioramaSpec, rank: number): Shot
```

Derive the target from the same `layoutSpread` + `mediaAnchor` the spread itself
uses, so the camera and the contents cannot disagree. `CameraRig` picks it when
`mode === 'artifact' && selectedGameRank !== null`.

In artifact mode, drop the other nine boxes to low opacity so the subject reads.

### Task 5 — Panel: reuse the shell, swap the content

**Do not invent a new panel shape.** `DetailPanel`'s three-column grid already
works and is the room's one composed object. The Games section fills the same
three regions:

| Region | Console section | Games section (artifact) |
|---|---|---|
| Left | `PanelSummary` | Game hero stat (units sold) · attach rate · arrived-N-years-after-launch · developer / publisher |
| Middle | Overview / Hardware / History | Cover · blurb · media archetype + provenance · launch price *(if sourced)* |
| Right | `FunFactCard` | Game fun fact *(if sourced)* |

- **New:** `src/components/room/tabs/GameArtifact.tsx`.
- Games list view keeps today's `GamesTab` (rows + `MediaFigure`), with a back
  affordance from artifact → list.
- **Every `fact` / `msrpUsd` block renders only when present.** Absence is a
  normal state, not an error state and not a placeholder.
- Compact layout keeps its single-scroll rule — one `overflow-y-auto`, never two.
- New copy goes in `src/components/room/panel-copy.ts`, which is the one place
  the room's strings live.

---

## 6. Files

**New:** `src/components/room/SectionSwitch.tsx`,
`src/components/room/tabs/GameArtifact.tsx`, `src/data/game-facts.ts`,
`src/data/game-metrics.ts`, `src/data/game-metrics.test.ts`

**Modified:** `src/types/console.ts`, `src/store/scene.ts`, `src/frame.ts`,
`src/frame.test.ts`, `src/components/room/RoomChrome.tsx`,
`src/components/room/DetailPanel.tsx`, `src/components/room/tabs/GamesTab.tsx`,
`src/components/room/panel-copy.ts`, `src/three/shots.ts`,
`src/three/shots.test.ts`, `src/three/HeroConsole.tsx`, `src/three/Diorama.tsx`,
`src/three/MediaSpread.tsx`

---

## 7. Verification — all of it, not a sample

1. `npx vitest run` — game-metrics (including the `attachRate > 1 → null` case),
   shots (the artifact shot derives from the same slot the spread uses), frame.
2. `npm run build` (runs `tsc -b`) and `npm run lint`. Both clean.
3. `npm run dev`, then in a browser:
   - Switch Console ↔ Games. The console tweens out and back. **Watch the
     network panel: the GLB must not re-fetch** — that would prove the hero
     unmounted.
   - Click a game → camera flies to that cartridge, panel becomes that game.
   - Back returns to the list, with the camera returning to the spread.
   - Cycle `nes → ps2 → switch → n64`. Nothing clips, the spread reframes.
   - **Find a game with no researched fact and no price** and confirm it renders
     cleanly with those blocks simply absent.
   - Resize to 375px — compact layout, single scroll, switcher still legible.
   - `read_console_messages` clean.
4. Screenshot both sections and the artifact view.

### 8. Final design pass — required before calling this done

The repo owner holds this project to a strict anti-slop standard
(`~/.claude/CLAUDE.md`). Walk the new UI against these specifically:

- **The switcher is not** a pill, a segmented control, tracked-out caps, a
  filled+outlined button pair, or an active-item dot/underline.
- **No hover lift** on any button. Tonal shifts only. (The 3D box's lift on
  *selection* is the app's own pick-up-a-game metaphor and stays.)
- **No glow, no emissive wash, no all-around drop shadow.** If depth is needed
  it is tight, low-offset and tinted to the surface.
- **No icon or logo sitting in a filled tile/chip/box.**
- **No pills for metadata.** Real typographic hierarchy instead.
- **Nothing gated behind an entrance animation.** All content visible with no JS
  and no animation having run. Never animate from `opacity: 0`.
- **Clear the cut.** Anything near an `overflow: hidden` or a fixed height must
  be padded clear of it — each panel column has its own scroll container. Zoom
  into the clipped edge and check pixel-for-pixel.
- **Centering must be proven, not eyeballed.**
- **Every control must actually work under a real click in a browser.**
- Text must clear its background by a real value gap — check the inactive
  switcher state (`text-ink/25`) against the live 3D backdrop it floats over,
  which is a light gallery colour that varies per console.
