# Hardware diagrams

**Superseded.** The annotated hardware diagram used to be a flat image
dropped in here, with leader-line coordinates authored as fractions of that
specific image's crop. It is now a set of hotspots anchored straight into
the console's own 3D model — no image, no crop, no coordinate drift the
moment either one changed. See `HardwareCallout` in `src/types/console.ts`
and `src/three/HardwareAnnotations.tsx`.

This directory (and the sibling `diagrams/` at the repo root, which holds
six finished but never-wired illustrations) is kept only as a record of the
approach that came before. Nothing in the app reads from either any more.

## The current convention

A console opts in by adding a `hardwareDiagram` to its data file
(`src/data/consoles/<id>.ts`):

```ts
hardwareDiagram: {
  callouts: [
    {
      label: 'Power switch — flat on the top deck, not the front face',
      // The exact point on the shell, in the console's own local metres —
      // same convention as Fact.anchor: origin at the floor-centre, 1:1
      // with `dimensions`.
      anchor: [-0.05, 0.0412, 0.113],
      // Delta from anchor to where the leader line ends and the label
      // floats, so the pill never sits on top of the part it names.
      labelOffset: [-0.03, 0.05, 0.015],
    },
    // …
  ],
},
```

`anchor` should be measured, not guessed — the SNES's five callouts (the
proving case) were computed from the exact same measured reference data
that drives its fallback shell in `console-forms.ts` (profile, control and
intake positions, themselves sourced from real reference photographs), not
eyeballed against a picture. For a console that renders from a dropped-in
GLB with no comparable measured form data, the next-best source is the
model's own geometry, inspected directly (the `/measure.html` harness this
project already uses for GLB scale-fitting works for this too).

Missing `hardwareDiagram` is never an error state: the Hardware tab simply
has no callouts to show, in 3D or in the panel's own companion list
(`HardwareDiagram.tsx`).
