# Missing box art

A tracking list of games on the box/case consoles (front/back/spine sourced
from the LaunchBox Games Database via `scripts/fetch-boxart.mjs`) that don't
yet have a complete, real scan on every face. Generated from the
`npm run boxart` run on 2026-08-20.

Cartridge consoles (Atari 2600, NES, Master System, Genesis, SNES, N64) are
out of scope for this list — they print a small label plate, not a full box,
and are sourced from SteamGridDB via `scripts/fetch-covers.mjs` instead.
**Master System is complete on all three faces** from hand-added scans and
isn't listed below either.

Re-running `npm run boxart` periodically may close some of these gaps as
LaunchBox's community contributes more scans, especially for the newest
generation.

## No match found at all (18 games)

LaunchBox has no entry for this exact title on this exact platform — usually
a long-form regional edition name, or a game the community hasn't catalogued
for that platform yet. Front, back, and spine are all still on the
procedural fallback (placeholder cover, flat-colour spine, no back print).

| Console | # | Title |
|---|---|---|
| Saturn | 2 | Sakura Wars |
| PlayStation | 6 | Harry Potter and the Philosopher's Stone |
| Dreamcast | 4 | Resident Evil – Code: Veronica |
| Xbox One | 7 | Red Dead Redemption 2 |
| Switch | 6 | Pokémon Sword and Shield |
| Switch | 7 | Pokémon Scarlet and Violet |
| PS5 | 6 | Helldivers 2 |
| PS5 | 9 | Ghost of Yōtei |
| Xbox Series | 1 | Call of Duty: Modern Warfare II |
| Xbox Series | 2 | Starfield |
| Xbox Series | 5 | Elden Ring |
| Xbox Series | 6 | FIFA 23 |
| Xbox Series | 7 | Diablo IV |
| Xbox Series | 8 | Grand Theft Auto V |
| Xbox Series | 10 | Sea of Thieves |
| Switch 2 | 3 | Super Mario Party Jamboree – Nintendo Switch 2 Edition |
| Switch 2 | 4 | Kirby and the Forgotten Land – Nintendo Switch 2 Edition |
| Switch 2 | 5 | The Legend of Zelda: Breath of the Wild – Nintendo Switch 2 Edition |

## Found the game, missing specific faces (27 games)

The game matched on the right platform, but LaunchBox has no contributed
scan for one or more of the three faces yet. Front still shows a real scan
unless noted **front** below.

| Console | # | Title | Missing |
|---|---|---|---|
| GameCube | 10 | The Legend of Zelda: Twilight Princess | spine |
| Xbox 360 | 1 | Kinect Adventures! | spine |
| PS3 | 5 | Uncharted 2: Among Thieves | spine |
| PS4 | 1 | Grand Theft Auto V | spine |
| PS4 | 5 | Uncharted 4: A Thief's End | back, spine |
| PS4 | 7 | Minecraft: PlayStation 4 Edition | back, spine |
| Xbox One | 1 | Grand Theft Auto V | back |
| Xbox One | 2 | Call of Duty: Black Ops III | back, spine |
| Xbox One | 3 | Minecraft | back, spine |
| Xbox One | 5 | Halo 5: Guardians | back, spine |
| Xbox One | 6 | Fallout 4 | back, spine |
| Xbox One | 8 | FIFA 17 | back, spine |
| Xbox One | 9 | Forza Horizon 4 | back, spine |
| PS5 | 2 | Gran Turismo 7 | back, spine |
| PS5 | 3 | EA Sports FC 26 | **front**, back, spine |
| PS5 | 4 | Resident Evil 4 | **front**, back, spine |
| PS5 | 5 | Black Myth: Wukong | back, spine |
| PS5 | 7 | Forza Horizon 5 | **front**, back, spine |
| Xbox Series | 3 | Halo Infinite | back, spine |
| Xbox Series | 4 | Forza Horizon 5 | spine |
| Xbox Series | 9 | Hogwarts Legacy | spine |
| Switch 2 | 1 | Mario Kart World | back, spine |
| Switch 2 | 6 | Cyberpunk 2077: Ultimate Edition | spine |
| Switch 2 | 7 | Split Fiction | back, spine |
| Switch 2 | 8 | Street Fighter 6 | back, spine |
| Switch 2 | 9 | Sid Meier's Civilization VII | back, spine |
| Switch 2 | 10 | Hogwarts Legacy | spine |

## Pattern

Gaps concentrate almost entirely in the two newest console generations
(PS5, Xbox Series, Switch 2) plus a handful of digital-heavy or endlessly
re-released titles (the various Minecraft editions, GTA V's re-releases).
Older consoles — Saturn, PS1, Dreamcast, PS2, Xbox, Xbox 360, PS3, Wii,
Wii U — are essentially perfect across all three faces already. LaunchBox's
community contributors simply haven't caught up on physical box scans for
very recent or live-service-first games yet.

## Closing the gap

- **Re-run the script.** `npm run boxart` (no `--force`) only re-attempts
  keys that are still missing — safe to run again after LaunchBox's
  community adds more scans.
- **Loosen title matching.** `pickBestCard` in `scripts/fetch-boxart.mjs`
  currently falls back to the platform's first search result when no exact
  title match is found — the long "no platform match" list above is mostly
  titles LaunchBox files under a different exact name (an edition suffix,
  a colon variant). Worth a manual look-up for the highest-value misses.
- **Hand-source them**, the same way the Master System scans were added:
  drop a file at `public/covers-back/<console>/<rank>-<slug>.<ext>` and/or
  `public/covers-spine/<console>/<rank>-<slug>.<ext>`, then add one line to
  `src/data/covers-back.generated.ts` / `covers-spine.generated.ts`.
