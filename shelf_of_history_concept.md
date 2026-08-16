# Shelf of History --- Console Chronicles

## Concept

**Shelf of History** is the primary browsing interface for exploring
video game consoles across generations.

It should feel like a **digital museum archive**, not a conventional
database, product grid, or ecommerce catalog.

The user is effectively walking through the history of console gaming.
Consoles are presented as physical 3D artifacts arranged on shelves by
generation.

The core metaphor is:

> **The timeline lets you travel through history. The Shelf of History
> lets you browse the artifacts. The Console Room lets you examine one
> artifact in its historical context.**

------------------------------------------------------------------------

# 1. Purpose

The Shelf of History solves the problem of:

> "I don't know exactly which console I want to visit. I want to
> browse."

It should support three different discovery behaviors across the overall
product:

1.  **Timeline** --- explore consoles chronologically.
2.  **Search** --- find a known console or game.
3.  **Shelf of History** --- visually browse consoles by generation.

The Shelf is therefore a **discovery / navigation experience**, not the
main console-detail experience.

------------------------------------------------------------------------

# 2. Visual Concept

The screen should resemble a large, dark museum archive containing
physical console artifacts.

Each generation occupies a horizontal shelf.

Example:

``` text
SHELF OF HISTORY

3RD GENERATION
1983–1988

[NES]       [MASTER SYSTEM]       [PC ENGINE]       [TURBOGRAFX]

────────────────────────────────────────────────────────────────

4TH GENERATION
1988–1995

[SNES]      [MEGA DRIVE]          [TURBOGRAFX]      [NEO GEO]

────────────────────────────────────────────────────────────────

5TH GENERATION
1993–2001

[PLAYSTATION]   [N64]             [SATURN]          [DREAMCAST]

────────────────────────────────────────────────────────────────

6TH GENERATION
2000–2006

[PS2]       [GAMECUBE]            [XBOX]            [DREAMCAST]
```

The actual implementation should use **3D console models**, not flat
cards.

The consoles should feel like physical objects sitting on physical
shelves.

------------------------------------------------------------------------

# 3. Visual Hierarchy

The priority should be:

1.  Console objects
2.  Generation
3.  Console name
4.  Era/date
5.  Minimal navigation
6.  Supporting metadata

Avoid turning this into a dense dashboard.

The interface should have generous negative space.

The consoles themselves are the visual content.

------------------------------------------------------------------------

# 4. Page Structure

## Header

At the top:

``` text
CONSOLE CHRONICLES

SHELF OF HISTORY
Explore consoles by generation
```

Optional small controls:

-   Search
-   Timeline
-   Close / Back

Do not create a large traditional navigation bar.

------------------------------------------------------------------------

# 5. Generation Shelves

Each generation is represented by one horizontal shelf.

Every shelf contains:

### Left

Generation metadata:

``` text
4TH GENERATION
1988–1995
04
```

The generation number can be large and low-contrast.

### Center

3D console artifacts:

``` text
SNES       MEGA DRIVE       NEO GEO       PC ENGINE
```

Each console should have:

-   3D model
-   console name
-   release year
-   manufacturer
-   optional short descriptor

### Right

A subtle arrow:

``` text
→
```

This can indicate that more consoles exist beyond the currently visible
items.

------------------------------------------------------------------------

# 6. Console Cards Should NOT Feel Like Cards

Avoid conventional UI cards such as:

``` text
┌──────────────────┐
│ image            │
│ PlayStation 2    │
│ Sony             │
│ 2000             │
└──────────────────┘
```

Instead, the console itself should be the primary object.

Think:

``` text
                 PS2

          ┌──────────────┐
          │              │
          │  3D MODEL    │
          │              │
          └──────────────┘

              PlayStation 2
                  2000
```

The label should feel like a museum artifact label.

------------------------------------------------------------------------

# 6.5. Console Display Diagram

The console display should follow this layout structure:

## 2D Console Display

![Console Display 2D Layout](diagrams/console-2d-display.svg)

*Default state (left) vs. hover state (right) showing console display specifications*

### Key Specifications

**Console Model Container:**
- Primary visual element
- Centered horizontally on shelf
- Vertically aligned with generation label
- Responsive to hover/focus states

**Labels (Museum Style):**
- **Top:** Console codename or variant (subtle, small)
- **Bottom:** Official name, year, manufacturer (hierarchy: name > year > maker)
- Positioned below model with breathing room
- Should feel like artifact museum label card

**Hover Indicators:**
- Subtle forward movement (Z depth)
- Slight scale increase (maintain proportion)
- Soft directional light/highlight
- Dimming of adjacent consoles
- Label clarity enhancement

**Spacing:**
- Consistent margin between adjacent consoles
- Breathing room around model
- No hard edges touching viewport boundaries

------------------------------------------------------------------------

# 7. Interaction: Hover / Focus

When the user hovers over a console:

### Default

The console is naturally lit.

### Hover

The selected console should:

-   subtly move forward
-   slightly increase in scale
-   receive a soft light/highlight
-   show its label more clearly
-   slightly dim neighboring consoles

Do NOT use:

-   giant neon borders
-   excessive glow
-   card expansion
-   large tooltips

The effect should communicate:

> "This is the artifact you are about to inspect."

------------------------------------------------------------------------

# 8. Selecting a Console

Selecting a console is a **spatial transition**, not a normal page
navigation.

Example:

User selects:

**PlayStation 2**

The PS2 should become the visual anchor.

### Phase 1 --- Focus

``` text
Other consoles
     ↓
become slightly darker

             PS2
              ↑
          highlighted
```

### Phase 2 --- Approach

The camera moves toward the PS2.

The PS2 grows larger.

Other consoles and shelves progressively disappear / blur.

The PS2 becomes the dominant object.

### Phase 3 --- Match Position

The PS2 reaches approximately the same screen position and scale that it
will occupy in the Console Detail scene.

This is important.

The two scenes should share a common spatial anchor.

``` text
SHELF VIEW                    DETAIL VIEW

     PS2                          PS2
      ↓                            ↓
  ┌────────┐                  ┌────────┐
  │  PS2   │      →           │  PS2   │
  └────────┘                  └────────┘

  museum shelf                coffee table
```

The console itself should feel continuous between the two scenes.

### Phase 4 --- Environment Transformation

The museum environment transitions into the console's historical
environment.

For PS2:

``` text
Museum shelf
      ↓
camera approaches PS2
      ↓
museum disappears
      ↓
coffee table appears
      ↓
CRT television appears
      ↓
controller appears
      ↓
early-2000s living room appears
      ↓
Console Detail UI appears
```

This should feel like:

> **Taking the console off the museum shelf and entering its era.**

------------------------------------------------------------------------

# 9. Transition Philosophy

Do NOT implement this as:

``` text
Shelf page
    ↓
Route change
    ↓
Console page
```

Instead, implement it as:

``` text
Museum
   ↓
Select artifact
   ↓
Approach artifact
   ↓
Artifact fills viewport
   ↓
Environment transforms
   ↓
Historical room
   ↓
Console detail
```

The user should feel that they have moved through physical space.

------------------------------------------------------------------------

# 10. Console Detail Relationship

The Shelf and Console Detail views have different purposes.

## Shelf of History

Purpose:

> **Browse**

Visual language:

-   Museum
-   Dark archive
-   Shelves
-   Multiple consoles
-   Generations
-   Overview

## Console Detail

Purpose:

> **Examine**

Visual language:

-   Historical room
-   One console
-   Era-specific environment
-   3D inspection
-   Hardware information
-   Games
-   History
-   Fun facts

The transition connects these two experiences.

------------------------------------------------------------------------

# 11. Generation Navigation

The user should be able to move between generations.

Possible interaction:

``` text
3RD GEN
1983–1988

4TH GEN
1988–1995

5TH GEN
1993–2001

6TH GEN
2000–2006
```

Scrolling should move naturally through the shelves.

Do not require the user to open a separate generation page.

The shelves should behave like one continuous museum space.

------------------------------------------------------------------------

# 12. Recommended Navigation

The overall product should have three primary discovery mechanisms.

## Timeline

For chronological exploration.

Example:

``` text
1970 ───── 1980 ───── 1990 ───── 2000 ───── 2010 ───── 2020
                         ●
                        SNES
```

Use when the user wants to answer:

> "What came next?"

------------------------------------------------------------------------

## Search

For intentional lookup.

Example:

``` text
⌕ Search consoles, games...

PlayStation 2
PlayStation
PlayStation 3

Gran Turismo 3
Metal Gear Solid 2
```

Searching for a game can also lead to its console.

Example:

``` text
Search: Metal Gear Solid 2

→ PlayStation 2

→ Enter PS2 Console Room
```

------------------------------------------------------------------------

## Shelf of History

For visual browsing.

Use when the user wants:

> "Show me what consoles existed around this era."

------------------------------------------------------------------------

# 13. Current Console State

The Shelf should remember the user's current console.

Example:

``` text
CURRENT ERA

2000

6TH GENERATION

PlayStation 2
```

This can appear subtly in the interface.

It should never dominate the page.

------------------------------------------------------------------------

# 14. PS2 Example

When the user selects PS2 from the 6th Generation shelf:

``` text
6TH GENERATION
2000–2006

       [ PS2 ]        [ GAMECUBE ]       [ XBOX ]

          ↓

      SELECT PS2

          ↓

    CAMERA APPROACHES

          ↓

     PS2 FILLS VIEW

          ↓

  MUSEUM TRANSITIONS

          ↓

   EARLY-2000s ROOM

          ↓

      CONSOLE DETAIL
```

The destination scene contains:

-   PlayStation 2
-   DualShock 2 controller
-   CRT television
-   PS2 game cases
-   DVD player / early-2000s media objects
-   period-appropriate furniture
-   early-2000s lighting

------------------------------------------------------------------------

# 15. Back Navigation

Back navigation should reverse the spatial transition.

Console Room:

``` text
PS2 historical room
       ↓
camera pulls away
       ↓
room dissolves
       ↓
PS2 becomes isolated
       ↓
museum shelf returns
       ↓
PS2 settles back into shelf
       ↓
Shelf of History
```

This creates a consistent spatial metaphor.

------------------------------------------------------------------------

# 16. Animation Principles

Animations should be:

-   slow enough to feel intentional
-   smooth
-   physically motivated
-   subtle
-   cinematic

Avoid:

-   aggressive zooms
-   flashy UI transitions
-   excessive particles
-   game-like HUD effects
-   unnecessary loading animations

The transition should feel like moving a physical museum object.

------------------------------------------------------------------------

# 17. Technical Implementation Direction

The implementation can be built as a shared 3D scene system.

Conceptually:

``` text
ShelfScene
    ├── GenerationShelf
    │     ├── ConsoleModel
    │     ├── ConsoleModel
    │     └── ConsoleModel
    │
    └── Navigation

ConsoleScene
    ├── HistoricalRoom
    ├── ConsoleModel
    ├── ControllerModel
    ├── GameModels
    └── InformationUI
```

The selected console should be represented by a shared console asset.

Example:

``` text
ConsoleAsset: PS2
    model
    materials
    metadata
    releaseYear
    manufacturer
    generation
    historicalRoom
    controller
    games
```

This allows the same PS2 model to be used in:

-   Shelf of History
-   Console Detail
-   potentially search results
-   generation browsing

------------------------------------------------------------------------

# 18. Important UX Constraint

The Shelf of History should **not become a spreadsheet of consoles**.

Do not optimize for showing the maximum number of consoles at once.

Optimize for:

> **recognition + curiosity + exploration.**

It is okay if only 4--6 consoles are visible per shelf.

The user can scroll horizontally or use the arrow to discover more.

------------------------------------------------------------------------

# 19. Overall Product Metaphor

The complete experience should feel like this:

``` text
                  CONSOLE CHRONICLES

                         ↓

                 SHELF OF HISTORY
                   "Browse history"

                         ↓

                   Select PS2

                         ↓

                 Take PS2 from shelf

                         ↓

                  Enter its era

                         ↓

                 CONSOLE ROOM
                   "Examine PS2"

                         ↓

                    Explore

              ┌──────────┼──────────┐
              ↓          ↓          ↓
           Hardware     Games     History

                         ↓

                  Pick up a game

                         ↓

                  GAME ARTIFACT
```

The fundamental design principle is:

> **Never make the user feel like they are navigating between database
> pages. Make them feel like they are moving through a physical museum
> of video game history.**
