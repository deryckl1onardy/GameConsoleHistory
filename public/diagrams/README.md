# Hardware diagrams

The annotated hardware diagrams for the room's Hardware tab.

## The convention

- Art lives at `public/diagrams/consoles/<id>.svg|.png` where `<id>` is the
  console's id (`snes`, `ps2`, …).
- The app builds the **slot**, not the art: an `<img>` plus real DOM/SVG
  leader lines laid out from `ConsoleEntry.hardwareDiagram.callouts`. Labels
  and leader lines are typography — they must match the app, so they are
  never baked into the image.
- Art is AI-generated and dropped in. A missing file is **never an error
  state**: the diagram slot degrades gracefully (art → callouts as a plain
  list → nothing). No HEAD probes — `<img onError>` catches both a 404 and
  Vite's SPA fallback (an HTML body fails to decode as an image).

## Callout coordinates

`HardwareCallout.x` / `.y` are **fractions of the image box** (0–1, origin
top-left), plus a `side` (`'left'` | `'right'`) saying which edge the leader
line springs toward.

> ⚠️ **Coordinates are coupled to a specific crop.** Regenerating the art
> silently misplaces every leader line — the same caveat the models README
> states about its scale. If you regenerate the art, re-author the callouts.

## Authoring

```ts
// in src/data/consoles/<id>.ts
hardwareDiagram: {
  image: '/diagrams/consoles/<id>.svg',
  callouts: [
    { label: 'Power and reset keys', x: 0.18, y: 0.3, side: 'left' },
    // …
  ],
},
```

The SNES (`src/data/consoles/snes.ts`) is the proving case: its callouts are
authored and its art is the next file to drop in.
