# Implementation spec: physical games in the Games tab

**Status:** ready to execute. Written to be self-contained — you do not need any
prior conversation. Read this whole file before touching code.

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
| Styling | **Tailwind v4, CSS-first config.** No CSS modules. No styled-components. |
| Import alias | `@` → `./src` (see `vite.config.ts`) |
| Tests | vitest 4. **There is no `test` script** — run `npx vitest run` |
| Lint | `npm run lint` (oxlint) |
| Build | `npm run build` (`tsc -b && vite build`) |
| Dev | `npm run dev` |

### Design tokens

The entire stylesheet is `src/index.css`, 112 lines. Tokens:

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

Opacity-suffix utilities are the dominant idiom: `text-ink/70`, `border-ink/10`,
`bg-paper/92`. Amber is used **only** for section headings, rank numbers and
small icons — never as a fill.

### House classes (copy these exactly for any new panel UI)

| Role | Classes |
|---|---|
| Section heading | `text-[10px] uppercase tracking-[0.18em] text-amber/70` |
| Sub-heading | `text-[13px] font-medium text-ink` |
| Body prose | `text-[13px] leading-relaxed text-ink/70` |
| Caption / label | `text-[10px] uppercase tracking-[0.14em] text-ink/40` |
| Big number | `font-display text-xl tabular-nums text-ink` |
| Divider | `border-t border-ink/10 pt-5` |
| Section spacing | `space-y-6` |
| Interactive row | `rounded-lg px-2 py-2 transition` + `bg-ink/8` active / `hover:bg-ink/5` |

### Code conventions in this repo

- **Comments explain *why*, at length, in prose.** Every non-trivial file opens
  with a multi-paragraph header explaining the decision behind it. Match this —
  terse code with no rationale is off-voice here.
- Geometry maths lives in **pure, React-free, renderer-free modules** under
  `src/three/geometry/` so it can be unit-tested. Dimensional accuracy is a
  stated product requirement and this separation is how it is enforced.
- Data is in millimetres. The scene is in metres. `MM = 0.001` is exported from
  `src/data/kits/media-archetypes.ts`. Never hardcode `0.001`.
- Data that has a real-world source carries `precision: 'exact' | 'approximate'`
  **and** a `source: string`. Preserve this convention in anything new.
- No em dashes in prose you write into the UI. Use a hyphen, a colon, or split
  the sentence.

---

## 1. The problem

Pressing the **Games** tab shows a plain text list of ten titles. The tab's own
intro copy already promises *"The ten best-selling games, at their real box
size."* (`src/components/room/panel-copy.ts:30`). Nothing on screen keeps that
promise.

The machinery to keep it **already exists and is orphaned** — it compiles, it is
unit-tested, and it is imported by nothing:

| File | State |
|---|---|
| `src/three/GameBox.tsx` | One game box at true published mm. **Imported by nothing.** |
| `src/three/GameShelf.tsx` | Lays out the ten on a wooden carcass. **Imported by nothing.** |
| `src/three/geometry/gameBox.ts` | Pure layout maths. Tested by `gameBox.test.ts`. |
| `src/three/covers.ts` | Procedural placeholder cover textures. |
| `src/data/kits/media-archetypes.ts` | 11 archetypes, 8 at `precision: 'exact'`, all sourced. |

Three things unplugged it:

1. `src/three/Diorama.tsx` stopped rendering `<GameShelf>` during a clipping
   cleanup. Its `entry` and `archetypeId` props are still declared and unused —
   deliberately retained so the signature survives restoration. Read that file's
   header comment before you change it.
2. `src/store/scene.ts:59-61` — `TAB_FOR_MODE` and `MODE_FOR_TAB` were emptied
   to `{}`, so pressing a tab moves no camera. The comment there says restoring
   an entry "is the whole fix once the room set comes back".
3. `spec.shelfPosition` (e.g. NES: `[-1.35, 0.55, -1.52]`) points at a wall that
   no longer exists. The console sits at `spec.consolePosition` (NES:
   `[0.44, 0.5, -1.02]`). The `library` camera shot in `src/three/shots.ts`
   still derives from `shelfPosition`, so today it would fly to empty space.

Two accuracy gaps remain even once it is plugged back in:

- `GameBox`'s `SHELL` map keys on `archetype.kind`, so **all seven cartridge
  archetypes render as the same grey box**. An NES Game Pak, a black Genesis
  cart and an N64 cart are indistinguishable.
- `cornerRadiusMm` exists on every archetype and is **used by nothing**.

---

## 2. Decisions already made (do not relitigate)

These were chosen by the product owner. Build to them.

1. **Both surfaces**, with 3D as the centrepiece: the boxes appear as real
   objects in the 3D scene *and* as an accurate figure beside every list row.
2. **No wooden shelf.** The boxes stand on the same clean stage as the console.
   The wooden carcass in `GameShelf.tsx` is deleted, not restored — a lone
   bookshelf in a space that otherwise holds only a shadow-catching floor reads
   as a leftover prop, and it is what got pulled for clipping.
3. **Per-platform shell accuracy** for all 11 archetypes.
4. **Cover art from SteamGridDB**, with the procedural label as a permanent
   fallback.

### Constraints on the SteamGridDB work

SteamGridDB hosts community-uploaded art — mostly publisher key art, some
fan-made. Build the pipeline **opt-in and reversible**:

- `public/covers/` and `.env` go in `.gitignore`. Nothing copyrighted enters git
  history unless the owner deliberately commits it.
- The API key is read from `process.env.STEAMGRIDDB_KEY`. **Do not hardcode a
  key, do not prompt for one, do not commit one.** If it is absent, the script
  exits with a clear message.
- The fetch script prints a per-title hit/miss report. Coverage for pre-2000
  console titles is thin and title matching is ambiguous — make the misses
  visible rather than silently wrong.
- The procedural label always renders first; art swaps in when loaded. A box is
  never blank waiting on a file.
- `panel-copy.ts`'s footer changes from *"Cover art shown is placeholder"* to a
  real attribution line.

---

## 3. Current state of the files you will touch

Read these before editing. Key excerpts:

### `src/data/kits/media-archetypes.ts`

```ts
export const MEDIA_ARCHETYPES: Record<MediaArchetypeId, MediaArchetype> = { ... }
export const MM = 0.001
export function archetype(id: MediaArchetypeId): MediaArchetype  // throws on unknown
export function archetypeSizeMetres(id): [number, number, number]
```

| Archetype | W×H×D mm | corner mm | precision | Consoles |
|---|---|---|---|---|
| `cart-atari-2600` | 102×70×16 | 3 | approximate | atari-2600 |
| `cart-nes` | 120×134×20 | 4 | approximate | nes |
| `cart-sms` | 110×100×15 | 3 | approximate | master-system |
| `cart-genesis` | 108×70×17 | 6 | approximate | genesis |
| `cart-snes-na` | 136×88×20 | 4 | **exact** | snes |
| `cart-snes-jp` | 130×86×20 | 6 | **exact** | snes variant (Super Famicom) |
| `cart-n64` | 116×76.6×18.5 | 4 | **exact** | n64 |
| `jewel-cd` | 125×142×10 | 2 | **exact** | playstation, saturn, dreamcast |
| `dvd-keepcase` | 135×190×14 | 3 | **exact** | ps2, xbox, gamecube, wii, xbox-360 |
| `bluray-case` | 135×171×12 | 3 | **exact** | ps3, ps4, ps5, xbox-one, xbox-series, wii-u |
| `switch-case` | 105×170×11 | 4 | approximate | switch, switch-2 |

Cartridges carry `cartridgeLabel: { widthMm, heightMm, offsetYMm, precision }`;
cases carry `cartridgeLabel: null` and `hasBackArt: true`.

### `src/three/geometry/gameBox.ts` (pure, tested)

Exports: `BOX_FACE`, `boxSizeMetres(a)`, `labelPlane(a)` (returns `null` for
cases), `coverAspect(a)`, `shelfMetrics(opts)`, `layoutShelf(opts)`,
`shelfExtent(slots, a)`. `LABEL_PROUD_MM = 0.15` keeps a cartridge sticker off
the shell to avoid z-fighting.

Local space for a box, authored face-on to the camera:
`+X = right (width)`, `+Y = up (height)`, `+Z = front (depth)`.

### `src/three/GameBox.tsx`

```ts
const SHELL = {
  cartridge: { color: '#8d8b86', roughness: 0.62, metalness: 0 },
  optical:   { color: '#1d1c1f', roughness: 0.32, metalness: 0 },
  card:      { color: '#c8382f', roughness: 0.4,  metalness: 0 },
} as const
```

Renders `<boxGeometry args={[w,h,d]}>` plus a printed plane. `lift = selected ?
0.05 : hovered ? 0.012 : 0`. Hover and select both set
`emissive="#ffffff"` on the print material.

### `src/store/scene.ts`

```ts
const TAB_FOR_MODE: Partial<Record<ViewMode, PanelTab>> = {}
const MODE_FOR_TAB: Partial<Record<PanelTab, ViewMode>> = {}
```

`setPanelTab` applies `MODE_FOR_TAB[tab] ?? s.mode`. `setMode` applies
`TAB_FOR_MODE[mode] ?? s.panelTab`.

`selectGame(rank)` (line ~184) sets `panelTab: 'games'`, `panelOpen: true` and
`playback: 'selected'` **inside its own `set()`** — it does *not* route through
`setPanelTab`, so it will bypass `MODE_FOR_TAB`. This is a real gotcha; see
task 4.

`ViewMode = 'console' | 'diorama' | 'library' | 'controller' | 'compare'`.
`PanelTab = 'overview' | 'games' | 'hardware' | 'history'`.

### `src/three/shots.ts`

`shotsFor(entry, spec)` returns a `Record<RoomShotId, Shot>` with all five of
`console | diorama | library | controller | tv`. `shots.test.ts` asserts every
one exists. The `library` shot currently targets `spec.shelfPosition` plus half
a `shelfExtent` stack height, `distance: 1.35` hardcoded.

`aspectDolly(aspect)` pulls the camera back on narrow viewports
(`BASE_ASPECT = 16/9`, `MAX_DOLLY = 2.2`).

### `src/three/CameraRig.tsx`

The **only** thing allowed to move the camera. `MODE_TO_SHOT` already maps
`library: 'library'`. It reacts to `mode` changes via `destinationKey`. You
should not need to change this file.

### `src/three/Scene.tsx`

```ts
const CAMERA = { fov: 24, position: [7.5, 5.7, 8.75], near: 0.05, far: 120 }
```

Mounts `<Diorama entry={entry} spec={spec} archetypeId={archetypeId} />` inside
`<Suspense>`. `<HeroConsole />` is mounted unconditionally **outside** Suspense
and is the single owner of the console model — never render a console anywhere
else.

`Effects()` applies a TiltShift2 focus band at `start=[0, 0.44 + offset.dy]`,
`end=[1, 0.64 + offset.dy]`. Anything outside that screen band renders blurred.

### `src/components/room/tabs/GamesTab.tsx`

71 lines. No props. Reads `useActiveConsole().games`, `selectedGameRank`,
`selectGame`. Has a `useEffect` that scrolls `[data-rank="${selected}"]` into
view when the selection originated in 3D. Clicking an active row toggles it off.

---

## 4. Tasks

Do them in this order. Each is independently reviewable.

### Task 1 — Per-platform shell kit

**New file:** `src/data/kits/media-shells.ts`

Case colour is a **per-console** fact, not per-archetype: `bluray-case` covers
PS3, PS4 (blue), PS5 (white), Xbox One (green), Xbox Series (black) and Wii U.
So: two tables plus one resolver.

```ts
export type ShellStyle = {
  /** Main plastic body. */
  body: string
  roughness: number
  /** Cartridge label recess, or a case's inner leaf. */
  recess?: string
  /** The black tray visible behind a clear jewel case front. */
  tray?: string
  /** A printed sleeve held under clear polypropylene, as on a keepcase. */
  clearSleeve: boolean
  precision: 'exact' | 'approximate'
  source: string
}

export const ARCHETYPE_SHELLS: Record<MediaArchetypeId, ShellStyle>
export const CONSOLE_SHELL_OVERRIDES: Partial<Record<string, Partial<ShellStyle>>>
export function shellFor(archetypeId: MediaArchetypeId, consoleId: string): ShellStyle
```

`shellFor` returns `{ ...ARCHETYPE_SHELLS[archetypeId], ...CONSOLE_SHELL_OVERRIDES[consoleId] }`.

**Starting values.** These are collector-consensus colours. Mark them
`precision: 'approximate'` with an honest `source` string unless you can cite a
manufacturer spec — follow the posture `MEDIA_ARCHETYPES` already sets, which
openly labels its own approximations and says "re-measure before X ships".

| Archetype | body | notes |
|---|---|---|
| `cart-atari-2600` | `#1b1b1d` | black, ribbed top face |
| `cart-nes` | `#b6b3a8` | light grey, recess `#a9a69b` |
| `cart-sms` | `#1a1a1c` | black |
| `cart-genesis` | `#141416` | black, matte |
| `cart-snes-na` | `#a9a69c` | grey |
| `cart-snes-jp` | `#c9c6bc` | lighter grey |
| `cart-n64` | `#8e8b83` | grey |
| `jewel-cd` | `#e8ecef` | clear polystyrene, `tray: '#1a1a1a'` |
| `dvd-keepcase` | `#111113` | black, `clearSleeve: true` |
| `bluray-case` | `#141416` | black, `clearSleeve: true` |
| `switch-case` | `#c8382f` | red |

| Console override | body |
|---|---|
| `ps2` | `#1a3ea8` (blue) |
| `xbox` | `#0e7a1b` (green) |
| `wii` | `#e9e9e6` (white) |
| `xbox-360` | `#107c10` (green) |
| `ps4` | `#1c4fbb` (blue) |
| `ps5` | `#f0f0ee` (white) |
| `xbox-one` | `#107c10` (green) |
| `wii-u` | `#2e6fd4` (blue) |
| `dreamcast` | `tray: '#f2f2f0'` (white tray) |

**Do not modify the 22 files in `src/data/consoles/`.** Everything lives in the
kit.

**New test:** `src/data/kits/media-shells.test.ts`
- every `MediaArchetypeId` has an entry in `ARCHETYPE_SHELLS`
- every key of `CONSOLE_SHELL_OVERRIDES` resolves via `getConsole(id)` (from
  `@/data/consoles`) — this catches typo'd console ids
- every colour string matches `/^#[0-9a-f]{6}$/i`

### Task 2 — `GameBox.tsx`: real shells, real corners

1. Add `consoleId: string` to `GameBoxProps`. Replace the `SHELL` constant with
   `shellFor(archetype.id, consoleId)`.
2. **Use `cornerRadiusMm`.** Add to `src/three/geometry/gameBox.ts`:

   ```ts
   /** Rounded-rect profile for an archetype, in metres, centred on the origin. */
   export function boxProfile(a: MediaArchetype): { w: number; h: number; r: number }
   ```

   In `GameBox`, build the shell from a `THREE.Shape` (rounded rect via
   `quadraticCurveTo` at each corner) extruded along Z by `depth` with
   `bevelEnabled: true, bevelSize: 0.3 * MM, bevelThickness: 0.3 * MM,
   bevelSegments: 2`. `ExtrudeGeometry` extrudes along +Z from z=0, so translate
   the geometry by `-depth/2` on Z to keep the box centred (the existing
   `labelPlane` positions assume a centred box). Memoise it and **dispose it on
   unmount** — `useEffect(() => () => geometry.dispose(), [geometry])`.
3. Cartridges: add an inset recess plane behind the existing label plane, in
   `shell.recess`, sized ~2mm larger than the label on each side, at
   `z = depth/2 + 0.05 * MM`.
4. Optical cases: add a printed spine strip on the −X face.
5. Jewel cases (`tray` set): render the tray as a thin dark plane just inside
   the back face.
6. **Remove the `emissive="#ffffff"` wash on hover and select.** A white glow on
   hover is a generic tell. Hover becomes a small tonal brighten of the shell
   colour instead. Keep the **50mm lift on selection only** — picking a game up
   is this app's own metaphor. Delete the 12mm hover lift.

### Task 3 — `MediaSpread.tsx` replaces `GameShelf.tsx`

**Delete** `src/three/GameShelf.tsx` (the wooden `ShelfUnit` goes with it).
**New file:** `src/three/MediaSpread.tsx`.

Cases and cartridges stand up unaided, so no furniture is needed to be honest.

**Arrangement:** two staggered ranks standing upright, faced out, raked back ~8°
about X. The back rank is offset half a pitch in +X and back in +Z so no box is
fully hidden. All boxes sit on the floor plane (their base at the floor, i.e.
`y = height/2` before rake).

**In `src/three/geometry/gameBox.ts`** — replace `layoutShelf` / `shelfExtent` /
`shelfMetrics` with the spread equivalents (the shelf versions have no remaining
consumer once `GameShelf.tsx` is gone):

```ts
export type SpreadOptions = {
  archetype: MediaArchetype
  count: number
  ranks?: number      // default 2
  gapMm?: number      // default 6
  rankDepthMm?: number // default = box depth * 2.2
  rakeDeg?: number    // default 8
}
export type SpreadSlot = {
  index: number
  rank: number
  column: number
  position: [number, number, number]  // metres, relative to the spread anchor
  rotation: [number, number, number]
}
export function layoutSpread(o: SpreadOptions): SpreadSlot[]
export function spreadExtent(slots: SpreadSlot[], a: MediaArchetype): { width: number; height: number; depth: number }
```

Split `count` across `ranks` as evenly as possible, front rank first. Centre
each rank on its own occupancy (the existing `layoutShelf` already does this
correctly for rows — reuse the same centring logic so a short back rank sits
centred rather than hanging off the left edge).

Also add, in the same module:

```ts
/**
 * Where the spread sits: on the console's own floor plane, beside it.
 * Derived rather than authored so all 22 consoles inherit it, and so the
 * camera and the contents read the SAME anchor.
 */
export function mediaAnchor(entry: ConsoleEntry, spec: DioramaSpec): [number, number, number]
```

Base it on `spec.consolePosition` offset in +X by
`(entry.dimensions.width * MM) / 2 + spreadWidth / 2 + clearance`, at the
console's own floor Y. **Do not use `spec.shelfPosition`** — it points at a
deleted wall.

`MediaSpread` reads `selectedGameRank` / `selectGame` from the store exactly as
`GameShelf` did, and renders one `<GameBox>` per slot passing `consoleId`.

**Mount it in `src/three/Diorama.tsx`**, which already receives `entry` and
`archetypeId` for precisely this purpose (see that file's header). Mount it
**unconditionally**, not gated on `mode === 'library'` — no pop-in, and the
boxes standing beside the console in the resting shot *are* the size comparison.

Update `src/three/geometry/gameBox.test.ts` for the renamed/new functions.

### Task 4 — Camera and tab wiring

**`src/three/shots.ts`:**
- Import `layoutSpread`, `spreadExtent`, `mediaAnchor` instead of the shelf ones.
- Retarget `library` to `mediaAnchor(entry, spec)` raised by half the box height.
- **Derive `distance` from `spreadExtent().width` and the lens** instead of the
  hardcoded `1.35`, so a narrow NES cart spread and a wide DVD keepcase spread
  both frame correctly:

  ```ts
  export const CAMERA_FOV_DEG = 24
  // horizontal half-angle at BASE_ASPECT
  const hHalf = Math.atan(Math.tan((CAMERA_FOV_DEG * Math.PI / 180) / 2) * BASE_ASPECT)
  const distance = (extent.width / 2) / Math.tan(hHalf) * 1.18  // 1.18 = padding
  ```
- **`src/three/Scene.tsx`: change `CAMERA.fov` to read `CAMERA_FOV_DEG`** so one
  number drives both the lens and the framing maths. This repo already enforces
  that discipline between the panel and the camera via `frame.ts`; match it.

**`src/store/scene.ts`:**

```ts
const TAB_FOR_MODE: Partial<Record<ViewMode, PanelTab>> = { library: 'games' }

const MODE_FOR_TAB: Partial<Record<PanelTab, ViewMode>> = {
  overview: 'console',
  games: 'library',
  hardware: 'console',
  history: 'console',
}
```

Rewrite the stale comment above them — it currently explains why they are empty.

**The gotcha:** `selectGame` sets `panelTab: 'games'` inside its own `set()` and
so bypasses `setPanelTab`'s map. Clicking a box in 3D would highlight the row
but leave the camera behind. Add `mode: 'library'` to that same `set()`.

**`src/three/shots.test.ts`:** assert the `library` shot targets the media anchor
and that its distance grows with archetype width (e.g. `dvd-keepcase` frames
further out than `cart-genesis`).

### Task 5 — `MediaFigure.tsx` in the panel

**New file:** `src/components/room/MediaFigure.tsx`

An **SVG** figure per list row, drawn straight from the archetype dimensions and
the shell kit. DOM, not offscreen WebGL — crisp at any DPI, cheap, and it
inherits the panel's own colour language.

```tsx
export function MediaFigure({
  archetype, shell, game, coverUrl, heightPx,
}: { ... })
```

- True aspect from `archetype.dimensions`, true `cornerRadiusMm` scaled the same
  way as the width/height so the rounding is proportionally correct.
- Fill with `shell.body`.
- Place the cover art in the **correct printed area**: the label rect from
  `labelPlane(archetype)` for a cartridge, the full face for a case. Use
  `<image preserveAspectRatio="xMidYMid slice">` inside a `<clipPath>`.
- Scale so the **tallest archetype** (`dvd-keepcase`, 190mm) fills `heightPx` and
  every other archetype scales down proportionally from the same mm-per-px
  ratio. This gives true relative scale *across* consoles, which is the point.
- No drop shadow, no glow, no container tile behind it. The figure is the object.

**`GamesTab.tsx`:** add the figure as a leading column in each row. Keep the
existing scroll-sync `useEffect`, the `aria-pressed` toggle, and the inline
blurb expansion exactly as they are.

Above the list, add one provenance line in the house style:

```
[amber heading] NES Game Pak
[body]          120 × 134 × 20 mm · shell dimensions are collector consensus
```

Pull `archetype.label`, `archetype.dimensions` and `archetype.source`. Plain
text — **not** a pill, **not** a chip, **not** a badge.

### Task 6 — Cover art pipeline

**Resolver.** `Game.cover?: string` already exists in `src/types/console.ts` and
is unpopulated across all 220 entries. Add:

```ts
// src/data/covers.ts
export function coverFor(consoleId: string, game: Game): string | null
// game.cover  →  COVERS[`${consoleId}:${game.rank}`]  →  null (caller falls back)
```

**Generated manifest.** `src/data/covers.generated.ts` —
`export const COVERS: Record<string, string>` keyed `'consoleId:rank'`. Written
by the script so the 220 data lines never churn. Commit it with an empty object
and a header comment saying it is generated.

**Fetch script.** `scripts/fetch-covers.mjs`, wired as `"covers": "node
scripts/fetch-covers.mjs"` in `package.json`.

- Read `process.env.STEAMGRIDDB_KEY`. If absent, print how to set it in `.env`
  and exit 1.
- Per game: `GET /api/v2/search/autocomplete/{title}` → best match →
  `GET /api/v2/grids/game/{id}?dimensions=600x900&types=static`.
- **Aspect caveat:** grids are 600×900 (aspect 0.667). That is close to a DVD
  keepcase (0.711) and a Blu-ray case (0.789), but an SNES cartridge *label* is
  96×56mm — aspect **1.71**, landscape. A portrait grid crops that badly. For
  archetypes whose `coverAspect(a) > 1`, prefer a landscape **hero** asset
  (`/api/v2/heroes/game/{id}`) and fall back to a centre-crop of the grid.
- Write `public/covers/<consoleId>/<rank>-<slug>.jpg`, resized to ~512px on the
  long edge via **`sharp`** (one new devDependency).
- Print a hit/miss table at the end. Misses are expected and must be visible.
- Rate-limit politely (serialise, small delay between calls).

**Three-side loading.** In `GameBox`, load the art with `TextureLoader`,
`texture.colorSpace = SRGBColorSpace`. **The procedural placeholder renders
first and the art swaps in on load** — never leave a box blank waiting on a
file. Cover-fit via `texture.repeat` / `texture.offset` computed against
`coverAspect(archetype)`.

**Rewrite the procedural fallback in `src/three/covers.ts`.** The current version
hashes the title into a random two-colour gradient with big uppercase text over
a dark scrim. Ten random gradients side by side is the loudest generic-AI tell
on the page. Replace with an honest printed label:

- label stock colour from `shell.recess` (or a warm off-white for cases),
- the title set in the app's own **Sentient** display face (it is self-hosted in
  `public/fonts/`; use `document.fonts.load` before drawing, and re-draw once
  the font resolves so the first paint is not a fallback face),
- publisher and year small beneath,
- no gradient, no hashed palette, no scrim.

Keep the existing `CACHE` map and the `clearCoverCache()` test seam.

**`.gitignore`:** add `public/covers/` and `.env`.

**`src/components/room/panel-copy.ts`:** replace *"Cover art shown is
placeholder."* in `COPY.footer` with a real attribution line. Add the strings
for the new archetype header.

---

## 5. Files summary

**New**
`src/data/kits/media-shells.ts`, `src/data/kits/media-shells.test.ts`,
`src/three/MediaSpread.tsx`, `src/components/room/MediaFigure.tsx`,
`src/data/covers.ts`, `src/data/covers.generated.ts`,
`scripts/fetch-covers.mjs`

**Modified**
`src/three/GameBox.tsx`, `src/three/geometry/gameBox.ts`,
`src/three/geometry/gameBox.test.ts`, `src/three/shots.ts`,
`src/three/shots.test.ts`, `src/three/Diorama.tsx`, `src/three/Scene.tsx`,
`src/three/covers.ts`, `src/store/scene.ts`,
`src/components/room/tabs/GamesTab.tsx`, `src/components/room/panel-copy.ts`,
`package.json`, `.gitignore`

**Deleted**
`src/three/GameShelf.tsx`

---

## 6. Verification — all of it, not a sample

1. `npx vitest run` — media-shells, gameBox layout/geometry, shots.
2. `npm run build` (runs `tsc -b`) and `npm run lint`. Both must pass clean.
3. `npm run dev`, then in a browser:
   - Press **Games** → the camera glides to the spread. Ten boxes standing, at
     plausible size against the console.
   - Click a box in 3D → its list row highlights and scrolls into view.
   - Click a list row → that box lifts. Click it again → it drops.
   - Switch to **Hardware** → the camera returns to the console shot.
   - Cycle `nes → ps2 → switch → n64 → playstation`. Shells must visibly
     differ. The spread must reframe per archetype. No box may clip the console,
     the floor plane or another box.
   - Browser console clean — no warnings, no errors.
   - **Check the tilt-shift band.** `Effects()` blurs everything outside
     `y ∈ [0.44 + dy, 0.64 + dy]` in screen space. Confirm the spread lands
     inside it in the library shot rather than rendering permanently blurred.
   - Resize to 375px wide → compact layout. Panel figures still legible, spread
     still framed (this exercises the `aspectDolly` path).
4. Screenshot the library shot and the Games tab.

### 7. Final design pass — required before calling this done

The owner holds this project to a strict anti-slop standard. Walk the new UI
against these specifically and fix anything that falls short:

- **No gradient cover art.** No hashed palettes. The fallback label is
  typographic.
- **No glow, no emissive wash, no bloom halo** on hover or selection. Tonal
  shifts only.
- **No all-around drop shadow** on the SVG figures or anywhere else. If depth is
  genuinely needed it is tight, low-offset and tinted to the surface — never a
  soft black bloom on all sides.
- **No container tile behind a mark.** The media figure is the object; it does
  not sit in a rounded box.
- **No pills or chips** for the dimensions and precision line. Plain type, house
  classes.
- **No hover lift on buttons.** The 50mm lift belongs to the 3D box on
  *selection* only.
- **Nothing hidden behind an entrance animation.** All content must be visible
  by default with no JS and no animation having run. Never animate from
  `opacity: 0`.
- **Clear the cut.** Anything near an `overflow: hidden`, a clip path or a fixed
  height must be padded clear of it. Zoom into the clipped edge and check
  pixel-for-pixel — the panel columns each have their own `overflow-y-auto`.
- **Centering must be proven, not eyeballed.** In SVG, `text-anchor: middle`
  handles horizontal only; vertical needs `dominant-baseline: central` or a
  measured `dy`.
- **Every control must actually work** when clicked in a real browser. No dead
  affordances.
