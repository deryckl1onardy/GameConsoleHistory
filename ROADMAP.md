# Roadmap — Console Chronicles

The single plan of record for what gets built next and why. Every session in this
repository reads this file first and updates it before finishing.

**Status:** Phase 0 — not started
**Last updated:** 2026-08-22

### Decisions locked with the repo owner (2026-08-22)

| Decision | Answer |
|---|---|
| What counts as success | **Portfolio first, revenue optional.** Ship it, get it seen, keep the revenue door open |
| First audience | **Retro collectors and gamers** — r/gamecollecting, r/retrogaming, retro YouTube |
| Time available | **5–10 hrs per week.** One channel done properly beats five done thinly |
| Era theming — bands | **Eras are the 8 generations.** `eraOf(entry)` returns `entry.generation`, so the existing sidebar grouping and its 6 tests need no change |
| Era theming — scope | **Tier 1 only before launch** (theme, lighting, motion). Rooms are Tier 2, gated |
| Era theming — glow | **Period effects in the 3D layer only.** The DOM stays tonal — panels and chrome keep the existing no-glow standard |
| Era theming — the blur | **Keep the tilt-shift; restore the rooms anyway.** Blurred-but-legible period atmosphere is the intent, not a compromise |

---

## How to use this file

1. **Read it before starting any work in this repository.** It is the plan of record.
2. **Do only what the current phase lists.** Phases are sequential. Do not skip ahead, and
   do not start a later phase because it looks more interesting.
3. **Anything not in the current phase gets confirmed with the repo owner first.** That
   includes "small" additions noticed in passing.
4. **When a task completes, update this file in the same session** — tick its box, update
   the phase `Status:` line and the `Last updated:` date, and add a dated change-log entry
   at the bottom. Not later. Not in the next session.
5. **If a task turns out to be wrong, strike it through and write why.** Never silently
   delete a task — the reasoning is the useful part.
6. **Do not mark a phase done until its verification block actually passes.** Run the
   commands; do not assume.
7. **The "Do NOT build" list is settled, not suggestions.** Each entry has its reason
   recorded. Reopening one is a conversation with the owner, not a judgement call.

> `IMPLEMENTATION_STATUS.md` is **stale and will mislead you.** It marks the "Shelf of
> History" museum browse as done across ~15 rows. That code was deleted in commit
> `aea2bb5` (3,092 lines, 14 files under `src/three/museum/`). `src/store/scene.ts` is the
> truth: the app is a single screen now and the museum shelf is gone. Do not trust that
> file until Phase 0 fixes or deletes it.

---

## The strategic read

**1. This is a reference asset being shipped as a toy.**
22 consoles complete across generations 2–9, 220 games, ~39,000 words of original sourced
prose, 448 cited critic quotes, 27 3D models, 192 passing tests — all behind **one URL**
with the stock Vite title `history-of-video-game-console`, no meta tags, no router, no
analytics, no deploy config. Reference content is found by search and compounds. Toys are
found by a Reddit post that decays in 48 hours. The bottleneck is distribution, not
features.

**2. `src/data/kits/media-archetypes.ts` is the real moat, and it is buried.**
297 lines of original research — forum measurement passes, protector-manufacturer inner
clearances, box scans reconciled against collector consensus — with
`precision: 'exact' | 'approximate'` and a `source` on every entry. Nothing comparable
exists anywhere as structured, cited, machine-readable data. It is also completely free of
the legal problems that encumber the image layer.

**3. Two hard constraints shape the sequencing.**

- *No owned audience.* Email capture ships in Phase 0, not "later". Everything else is
  rented land.
- *Commercial launch is blocked today.* 731 cover/logo/box images are scraped from
  LaunchBox and SteamGridDB (deliberately gitignored). `public/models/consoles/playstation.glb`
  and `ps3.glb` are CC-BY-NC-SA — non-commercial. Fine for a portfolio piece, fatal for a
  paid product. Phase 3 resolves this by design rather than by cleanup.

---

## Phase 0 — Make it exist

**Status:** not started · **Estimate:** ~20 hrs, weeks 1–3

Nothing else in this document matters until this ships. This is the entire job for the
first three weeks.

- [ ] **Routing — turn 1 URL into 242.** New `src/routes.ts`, imported by both the client
      and the build-time prerender. Wire `history.pushState` into `setConsole` /
      `setSection` / `selectGame` (`src/store/scene.ts:152-241`) and a `popstate` listener
      back out. **No router dependency** — the store already holds exactly the state a URL
      needs (`consoleId`, `section`, `selectedGameRank`, `variantId`). Roughly 80 lines.
      Routes: `/:consoleId` · `/:consoleId/games/:rank` · `/:consoleId/:variantId`.

- [ ] **Prerender the text layer.** `react-dom/static`'s `prerender` — React 19.2 is
      already installed, so no new dependency. Prerender the **DOM chrome only**
      (`DetailPanel`, `ConsoleSidebar`, the tab bodies); put `<Canvas>` behind a
      client-only guard, as R3F will not SSR and does not need to.
      This does two jobs at once: crawlers get real content, and it satisfies the global
      design law's *content is visible by default* rule.

- [ ] **Per-route `<head>`.** `index.html` (currently 13 stock lines) becomes a template:
      real `<title>`, `<meta name="description">` built from the existing `tagline` field,
      OG + Twitter card tags, `<link rel="canonical">`, and JSON-LD
      (`VideoGameConsole` / `VideoGame` — this is what wins rich results).

- [ ] **242 OG images, generated once.** Add a hidden `/og/:consoleId` route, then
      `scripts/og-images.mjs` (Playwright) visits all of them and screenshots to
      `public/og/*.png`. Run once, commit the PNGs.
      **Reuse `renderConsole` in `src/three/thumbnails.ts`** — it already applies the
      correct `GLTF_TRANSFORMS` scale, the console's own diorama yaw, and the
      floor-align-and-centre pass. Do not rewrite it.
      This card is the most-reproduced image of the whole project — every Reddit post,
      Discord paste, iMessage preview and search result. No gradient, no eyebrow pill, no
      icon-in-a-tile, no glow. The artifact on a considered surface, the console name in
      the display face, one number.

- [ ] **Credits screen.** CC-BY **legally requires** attribution where the work is
      displayed. `public/models/CREDITS.md` already holds the per-file Sketchfab
      provenance; surface it as a real screen. This is a launch blocker.

- [ ] **Decide the asset-hosting story, then deploy static** (Vercel or Netlify).
      `public/` is 621 MB and ~600 MB of it is gitignored (covers, backs, spines, logos).
      Decide this *before* the first deploy attempt — a build-time fetch step, or an
      object-store bucket. It will otherwise ambush you.

- [ ] **Analytics — Plausible.** Privacy-first suits the archive posture and needs no
      cookie banner. Track: page, time on page, search queries, game selections, share
      clicks.

- [ ] **Email capture.** Not optional — with no owned audience, everything else is rented
      land. And **not** a pill field beside a pill button; the global design law names that
      as the single most-repeated slop component in the file.
      The archive framing gives a native answer: one accession line in the catalogue voice
      the UI already speaks, placed where someone has just finished reading something good
      (end of a console's History tab), not in a modal. Buttondown or Kit, free tier.

- [ ] **Rewrite `README.md`** — currently the stock Vite template. It is the GitHub
      landing page.

- [ ] **Delete the dev harnesses** — `public/test-master-system.html`, `measure.html`,
      `review.html`.

- [ ] **Fix or delete `IMPLEMENTATION_STATUS.md`** — see the warning above. It presents
      deleted code as shipped.

- [ ] **Era theme system, Tier 1** — full spec in
      [`docs/era-theme-implementation.md`](docs/era-theme-implementation.md). Per-era
      colour, display face, 3D light temperature and motion language, keyed on
      `entry.generation`. ~3–4 hrs of the estimate above; the DOM theme is near-free
      because every colour already routes through 7 CSS variables and there are zero
      hardcoded colours in components.
      **Why it belongs in Phase 0 and not later:** it makes the 242 OG share cards differ
      per generation, which is distribution, not polish. Shipping generic and re-skinning
      afterwards is wasted work.

### Phase 0 verification

Do not tick this phase off until all of the following pass.

```bash
npm run build && npm test
```

- All **192 existing tests** still green (roster invariants, frame math, camera shots,
  archetype tables). Nothing in this phase should touch them — if one breaks, the routing
  change leaked into the data layer.
- `dist/` contains **242+ `index.html` files**. Spot-check three at random for the console
  name in `<title>`, a non-empty `<meta name="description">`, and a paragraph of real
  prose in the body — that last one proves the prerender ran.
- **Load `/snes` with JavaScript disabled.** The panel prose must be readable. One test,
  two rules proven: the SEO requirement and *content visible by default*.
- Paste a deployed URL into the Facebook Sharing Debugger, the Twitter card validator, and
  a Discord channel. The OG card renders in all three.
- `/snes` → back → `/ps5` → forward: URL and 3D scene stay in sync, no double camera
  flight.
- Lighthouse on a console page: SEO 100. Note the LCP — the GLBs are heavy and this is the
  number to watch.
- Plausible logs a pageview from a real device on a real network.
- `prefers-reduced-motion` still collapses camera durations (existing `CameraRig.tsx`
  behaviour — confirm routing did not bypass it).

---

## Phase 1 — The distribution engine

**Status:** blocked on Phase 0 · **Estimate:** weeks 4–8

One channel, done properly. At 5–10 hrs/week, spreading across five channels is how this
dies.

- [ ] **Programmatic SEO on the four query clusters.** Not content production — the
      content is already written. This exposes it.

| Cluster | Source data | Why it wins |
|---|---|---|
| **Dimensions** — "SNES cartridge dimensions", "PS1 longbox size", "Switch case dimensions mm" | `media-archetypes.ts` — 13 archetypes, cited, mm-exact | Collectors search this constantly to buy protectors and plan shelves. Current results are forum threads and guesses. You have the cited answer *and* a 3D object at true scale. **Start here.** |
| **Failures** — "why does my NES blink", "red ring of death", "why did my SNES turn yellow" | 44 `failureStates` across the roster | Enormous evergreen volume. The existing writing is better than what ranks. |
| **Why X failed** — Dreamcast, Wii U, Saturn, Xbox One | 22 `summary` paragraphs | Already answered with a real point of view. |
| **Adjusted price** — "how much did a PS2 cost in today's money" | `msrpUsdAdjusted`, all 22 | Uniquely answerable, inherently shareable, zero extra work. |

- [ ] **13 archetype pages** (`/media/jewel-longbox` and siblings) **plus one index page**:
      *every physical game format at true scale, 1977–2025*. That index is a linkable
      asset — the kind of thing that gets cited rather than just visited.

- [ ] **The true-scale comparator.** Drag any two consoles, cartridges or cases side by
      side at true relative scale. ~80% of it already exists — `GameBox.tsx`,
      `media-archetypes.ts`, `media-shells.ts`, `TALLEST_ARCHETYPE_HEIGHT_MM` and the
      shared mm-per-pixel scale. It is the landing surface for the dimensions cluster, it
      produces a share image on every use, and it becomes the artwork for the Phase 2
      poster.

- [ ] **Community seeding — generous, not promotional.** Do **not** post "check out my
      site". Post the *artifact*: the true-scale format chart, as an image, as a
      contribution to r/gamecollecting and r/retrogaming. Answer the dimension questions
      that get asked weekly, with the cited number and its source. The link is a footnote.
      Separately, offer retro-YouTube creators (the 10k–100k long tail, not just the big
      channels) free accurate 3D B-roll renders — they need it and hate sourcing it.

- [ ] **Publish the media-archetype taxonomy** as a standalone MIT-licensed JSON + npm
      package. The data, tests and citations already exist, so this is ~4 hrs. Zero legal
      risk — original research. It makes this project *the source* rather than *a site*,
      and gets cited by emulator front-ends, collector apps and protector manufacturers.

### The Phase 1 gate

This is the point of the whole exercise. Evaluate after **8 weeks live**:

| Signal | Read | Next |
|---|---|---|
| Organic impressions climbing in Search Console, >90s median dwell on console pages, the format chart shared unprompted | **Pass** | Scale the content engine, then start Phase 3 |
| Spikes on posting, nobody returns | Sharing works, retention does not | It is a beautiful demo, not a reference. Keep as portfolio. **Do not build Phase 3.** |
| Neither | The dataset is the salvageable asset | Publish it, let it be cited, treat the site as the showcase |

---

## Phase 2 — The revenue side-door

**Status:** opportunistic, may run alongside Phase 1 · **Estimate:** ~6 hrs

- [ ] **The true-scale format poster** — *every physical game format at true scale,
      1977–2025*. The 13 archetypes drawn as precise technical line diagrams with their
      dimensions and dates.
      Pure original research. Drawn as line work it carries **no trade dress**, and
      therefore none of the licensing exposure that blocks everything else — this is the
      one commercial move available today with zero legal cleanup.
      Print-on-demand (Cotton Bureau / Printful): no inventory, no risk. And it works as
      marketing before it works as revenue — the image alone is the best possible post for
      r/gamecollecting and r/dataisbeautiful.

---

## Gated — Era theme system, Tier 2 (the period rooms)

**Status:** deferred by scope, **not blocked**. Do not start during Phase 0.

Restore the deleted period rooms around each console — furniture, TV, controller — so the
era reads from the environment and not only from the chrome. Spec and recovery commands in
[`docs/era-theme-implementation.md`](docs/era-theme-implementation.md) §8.

The design question that stalled this is **resolved**: keep the tilt-shift focus band and
restore the rooms anyway, because blurred-but-legible period atmosphere is the intent. That
also makes it cheap — blur eats detail, so the props never need GLBs; the deleted `Prop`
component was already a correctly-proportioned box with the right colour and roughness, and
behind a tilt-shift fall-off that is the finished look.

Most of it already exists as unrendered data: `src/data/kits/prop-kit.ts` (9 furniture
types, real mm, 22 material variants, **zero importers**), ~176 authored prop placements,
11 TV specs. The renderer recovers verbatim from `git show 5029346:src/three/Diorama.tsx`.
What must be fixed is the placement bug that caused the removal — a data problem, not an
architecture one.

---

## Phase 3 — The Collector's Shelf

**Status:** BLOCKED behind the Phase 1 gate. Do not start.

Your collection, rendered at true scale, on your actual shelf. Add the games and consoles
you own; see them as accurate 3D objects on a real IKEA Kallax or Detolf, at correct
relative size, and know before you buy whether the next 40 games will fit.

Why this is the right thing to scale into:

- **It is built on what already exists.** Media archetypes give true dimensions for every
  format. `GameBox.tsx` renders any case with per-face art. The 220-game catalog is the
  seed data. `console-forms.ts` and the four-tier registry in
  `src/three/models/registry.tsx` mean new items degrade gracefully instead of breaking.
- **It solves a real, recurring, painful problem.** Cataloguing, display planning and
  insurance valuation are currently done in spreadsheets.
- **It resolves the legal problem by design.** Users upload photos of *their own copies* —
  a cleaner liability posture *and* a better product. Collectors want their actual copy
  with its actual wear, not a stock scan.
- **It has retention and a native viral loop.** Your collection is your data. Sharing your
  shelf *is* the product.
- **The atlas becomes the front door.** 242 SEO pages feed a tool; the tool captures the
  user. Reference content → free tool → user data.

---

## Do NOT build

Settled decisions, with the reason recorded so they are not re-litigated.

| Not this | Why |
|---|---|
| **The museum shelf, rebuilt** | Cut deliberately after seven phases and a revert (`641e219` → `dc575b4` → `aea2bb5`). It is navigation, not distribution. The old code is in git history; finding it is not a reason to restore it |
| **Consoles #23–40** | Marginal content, no new capability. The schema is already proven at 22. (Handhelds or arcade *would* stress the schema — that is an assumption test, not a product) |
| **The remaining 210 `fact` / `editorial` fields** | Currently 10/220 each. Do not write 200 more paragraphs before knowing whether anyone reads the ten that exist |
| **Extracting the engine as a B2B platform** | The schema is console-shaped (`MediaKind`, `IntakeKind`, `animatedParts.ejectLever`, `failureStates`), not a general physical-object schema. Horizontalizing something validated on one domain, by one person, with zero external users is how a year disappears |
| **Paid ads** | Pre-revenue with no PMF signal. Spend after the Phase 1 gate, not before |
| **Product Hunt** | Its audience is makers, not collectors. A spike that does not convert and tells you nothing |

---

## Design-law compliance

Every new surface in this roadmap gets a full point-by-point pass against the global
anti-slop design law (`~/.claude/CLAUDE.md`) before it ships — not a skim, the whole file.

The specific traps in this batch:

- **The OG card** — gradients, eyebrow pills, glows, icon-in-a-tile. It is the most-seen
  image of the project; it has to be composed, not assembled.
- **The email capture** — the pill-field-plus-pill-button row is named in the law as the
  single most-repeated slop component. Do not ship it.
- **The archetype pages** — kicker-over-heading section heads, metadata as tinted pill
  chips, the small-label-over-big-heading opener on every section.
- **The comparator** — dead controls. If it looks interactive it must work, confirmed with
  a real pointer.

---

## Change log

Newest first. One line per completed task or changed decision, dated.

- **2026-08-22** — Era theme system specced into
  [`docs/era-theme-implementation.md`](docs/era-theme-implementation.md) and added to Phase
  0 as Tier 1. Four decisions locked (eras = generations; Tier 1 only before launch; period
  effects in 3D only; keep the tilt-shift and restore the rooms anyway). Tier 2 recorded as
  gated. Exploration found the DOM theme near-free (every colour already routes through 7
  CSS variables, zero hardcoded colours in components) and the 3D era data ~90% authored
  but 0% rendered. Nothing built yet.
- **2026-08-22** — Roadmap created. Strategy study completed: project has never shipped
  (one URL, stock title, no meta/router/analytics/deploy). Decisions locked with owner:
  portfolio-first, retro-collector audience, 5–10 hrs/week. Nothing built yet.
