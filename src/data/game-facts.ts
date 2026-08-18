import type { Game, GameFact } from '@/types/console'

/**
 * Hand-researched per-game facts and US launch prices.
 *
 * This file is the deliverable of the research pilot: it is written by an
 * agent with a web browser, one game at a time, and every value in it has a
 * real source recorded next to it. It looks like `covers.generated.ts` but is
 * the opposite of that file: covers are scraped and regenerable, this is
 * committed and human-reviewed. Do NOT regenerate it, and do not add a value
 * from memory — if a fact or price could not be found with a credible source,
 * it stays absent. An absent field is a normal, designed state (the artifact
 * view renders around it), while a plausible-sounding invention is not.
 *
 * Keyed `${consoleId}:${rank}`, merged onto entries by `enrichGame` below —
 * deliberately kept OUT of the 22 console data files so each research batch
 * is one reviewable diff instead of 22 churned files.
 *
 * Facts follow the same bar as the console facts in nes.ts: specific and
 * checkable, a development detail, a commercial oddity or a technical
 * constraint, never a plot summary. The `source` voice matches
 * media-archetypes.ts — a short sentence naming the document that actually
 * states the value.
 *
 * Prices are US launch MSRPs. Pre-2000 game prices are the known hard case:
 * they varied by region, year and revision, and for retro titles often
 * survive only in period advertisements. `msrpUsdAdjusted` is arithmetic, not
 * research — BLS CPI-U annual averages converted to 2025 dollars with the
 * same base the console data already uses (NES's $180 -> $540 pins 2025 at
 * ~3x 1985), rounded to whole dollars. The 1986 Duck Hunt / Excitebike
 * figures come from a period Nintendo retail catalog quoted in a collector
 * thread and are marked approximate.
 */

export type GameEnrichment = {
  fact?: GameFact
  /**
   * The game's "why it matters" paragraph — the editorial story, sourced
   * like every fact. Absent whenever nothing checkable was found, exactly
   * like `fact`.
   */
  editorial?: { body: string; source: string }
  msrpUsd?: number
  msrpUsdAdjusted?: number
  msrpSource?: string
}

const GAME_FACTS: Record<string, GameEnrichment> = {
  'nes:1': {
    fact: {
      title: 'The whole game fit in 32 KB, with about 20 bytes to spare',
      body: 'The cartridge held 32 KB of program code and data plus 8 KB of graphics. After the music was added, only about 20 bytes of open space remained, and Miyamoto spent them on a crown sprite that appears beside the life counter once the player reaches ten lives.',
      source: 'Wikipedia, "Super Mario Bros.", Development section.',
    },
    editorial: {
      body: "Nintendo's American recovery plan hinged on this one cartridge. Bundled with the console rather than sold separately, it gave every NES owner the same indispensable game and set the template for the pack-in — a console's fate riding on a single title. It became the best-selling NES game by a wide margin, and for years held the record as the best-selling video game in the world.",
      source: 'Wikipedia, "Super Mario Bros.", Reception and legacy.',
    },
    // No credible standalone US launch price was found — the game shipped
    // with the NES (the $199 Deluxe Set bundle) and separately-reported
    // figures (~$25) rest on forum recollections, not documents. Left out.
  },

  'nes:2': {
    fact: {
      title: 'It only works on a CRT television',
      body: 'The NES Zapper figures out where it is pointed by reading the timing of the screen\'s electron beam as it sweeps the picture, and only a CRT draws one. A flat panel never paints that way, which is why Duck Hunt, like every Zapper game, cannot run on a modern television.',
      source: 'Wikipedia, "Duck Hunt" (players fire the NES Zapper at a CRT television), citing How-To Geek on why the Zapper fails on HDTVs.',
    },
    editorial: {
      body: "Shipped in the same box as the console in North America, Duck Hunt turned the Zapper from a novelty into a household object — the dog's mocking laugh became one of the most recognised sounds in games, and the light-gun genre's biggest moment. It is the second best-selling NES game ever, almost entirely on the strength of being packed in.",
      source: 'Wikipedia, "Duck Hunt" (bundled with the NES; the dog and his laugh).',
    },
    msrpUsd: 29.99,
    msrpUsdAdjusted: 88,
    msrpSource: '1986 Nintendo retail catalog (Duck Hunt at $29.99), quoted with inflation adjustments in the r/nintendo thread "1986 Nintendo console, accessories, and games adjusted for inflation".',
  },

  'nes:3': {
    fact: {
      title: 'A ROM chip shortage delayed its American release',
      body: 'Japan got Super Mario Bros. 3 in October 1988; North America waited until February 1990 because a worldwide shortage of ROM chips pushed Nintendo\'s release schedule back. Nintendo filled the gap by featuring the game in the 1989 film The Wizard.',
      source: 'Wikipedia, "Super Mario Bros. 3", Development and release section.',
    },
    editorial: {
      body: "The most anticipated cartridge of its era. A worldwide ROM shortage delayed the American release by over a year, and Nintendo's response — premiering the game in the 1989 film The Wizard and backing it with an aggressive ad campaign — turned a supply problem into publicity. It went on to become the best-selling NES game sold on its own, at 18 million copies.",
      source: 'Wikipedia, "Super Mario Bros. 3", Development and release.',
    },
    msrpUsd: 49.99,
    msrpUsdAdjusted: 124,
    msrpSource: 'Widely reported US launch price of $49.99 in 1990 (e.g. Hacker News thread "Super Mario Bros 3 cost $49.99 in 1990").',
  },

  'nes:4': {
    fact: {
      title: 'Two companies went to federal court over it',
      body: 'Tengen, Atari\'s arcade arm, shipped its own NES Tetris in May 1989. A month later a federal judge granted Nintendo an injunction, and in November 1989 summary judgment gave Nintendo the console rights outright. The version in this spread is the one that won.',
      source: 'Wikipedia, "Tetris", Legal battles section.',
    },
    editorial: {
      body: "Shipped inside the NES itself in North America, Nintendo's Tetris did for the console what it would soon do for the Game Boy: prove that one puzzle game could move hardware. The federal court fight over who owned the console rights — won by Nintendo a month after Tengen shipped its own version — remains one of the most consequential licensing disputes in game history.",
      source: 'Wikipedia, "Tetris" (bundled with the NES in North America; the legal battles).',
    },
    // The NES Tetris launch price is not documented in any source found;
    // period prices for it vary. Left out.
  },

  'nes:5': {
    fact: {
      title: 'The first Mario game where Mario and Luigi had different heights',
      body: 'The Western Super Mario Bros. 2 is a reskin of Yume Kōjō: Doki Doki Panic, a 1987 festival game for Fuji Television, with its four mascots swapped for the Mario cast. The conversion was the first time Mario and Luigi were visibly different heights — Luigi\'s longer legs existed to justify his higher jump.',
      source: 'Wikipedia, "Super Mario Bros. 2", Development / conversion section.',
    },
    editorial: {
      body: "Rarely has a sequel been less of one: the Western Super Mario Bros. 2 is a reskinned Japanese festival game, Doki Doki Panic, swapped into the Mario cast because the actual Japanese sequel was judged too difficult for American players. It gave the series its first playable princess and its first differently-proportioned Mario brothers — and its stranger, more experimental level design has aged into a cult favourite.",
      source: 'Wikipedia, "Super Mario Bros. 2", Development / conversion.',
    },
    // No credible US launch price found for the October 1988 release. Left out.
  },

  'nes:6': {
    fact: {
      title: 'The box had a window cut into it',
      body: 'Nintendo\'s American packaging cut a hole in the front of the box so the gold cartridge was visible through it — the cartridge\'s unusual colour was part of the pitch. The gold shell remains the most recognisable NES cartridge ever made.',
      source: 'Wikipedia, "The Legend of Zelda", American release section.',
    },
    editorial: {
      body: "The cartridge Nintendo packaged in a box with a window cut into the front — the gold shell was the pitch itself. It was the first NES cartridge with battery-backed saving, turning a console game into a persistent world, and it launched a franchise that has defined Nintendo ever since.",
      source: 'Wikipedia, "The Legend of Zelda (video game)", American release (battery-backed saving; the franchise).',
    },
    msrpUsd: 49.99,
    msrpUsdAdjusted: 142,
    msrpSource: 'Retail price of $49.99 at the 1987 US release, per Joshua Kennon ("In 1986, The Legend of Zelda was released with a retail price of $49.99") and Heritage Auctions coverage.',
  },

  'nes:7': {
    fact: {
      title: '2.5 million copies in six weeks',
      body: 'Within six weeks of its North American release, Dr. Mario had sold 2.5 million copies — fast enough to prove the puzzle craze Tetris had started had legs of its own, and nearly a third of what the original Super Mario Bros. sold in its entire run.',
      source: 'Wikipedia, "Dr. Mario", Reception section.',
    },
    editorial: {
      body: "Miyamoto's in-house answer to Tetris: a puzzle game about matching capsules to viruses rather than stacking falling blocks, released at the height of the puzzle craze. Two and a half million copies in six weeks proved the genre was bigger than one game — and its capsule design has been remade on nearly every Nintendo console since.",
      source: 'Wikipedia, "Dr. Mario", Reception.',
    },
    // No credible US launch price found for the October 1990 release. Left out.
  },

  'nes:8': {
    fact: {
      title: 'The only Zelda with experience points',
      body: 'Zelda II gave Link experience points, level-ups and limited lives — role-playing mechanics no canonical Zelda game has used since. The series returned to item-based progression with A Link to the Past and never went back.',
      source: 'Wikipedia, "Zelda II: The Adventure of Link" (the role-playing elements "have not been used since in canonical games").',
    },
    editorial: {
      body: "The sequel Nintendo chose not to repeat: side-scrolling combat, experience points and limited lives — role-playing mechanics no canonical Zelda has used since. Released barely a year after the original, it is the series' most divisive entry, and it marks the moment Nintendo was still figuring out what a Zelda game was.",
      source: 'Wikipedia, "Zelda II: The Adventure of Link".',
    },
    // Sources conflict ($49.99 standard vs a $64 period catalog listing), so
    // no price is recorded rather than a guessed one. Left out.
  },

  'nes:9': {
    fact: {
      title: 'Its engine became Super Mario Bros.\'s',
      body: 'The side-scrolling engine Miyamoto\'s team built for Excitebike is the same one that runs Super Mario Bros. It is the reason Mario accelerates from a walk into a run smoothly instead of moving at one constant speed.',
      source: 'Wikipedia, "Excitebike" (the engine "was later used to develop Super Mario Bros.").',
    },
    editorial: {
      body: "Miyamoto's team built the side-scrolling engine for this motorcycle racer, then reused it for Super Mario Bros. — the reason Mario glides from a walk into a run instead of moving at one constant speed. A launch-window title whose design outlived its genre.",
      source: 'Wikipedia, "Excitebike".',
    },
    msrpUsd: 29.99,
    msrpUsdAdjusted: 88,
    msrpSource: '1986 Nintendo retail catalog (Excitebike at $29.99), quoted with inflation adjustments in the r/nintendo thread "1986 Nintendo console, accessories, and games adjusted for inflation".',
  },

  'nes:10': {
    fact: {
      title: 'Programmed by Satoru Iwata, alone',
      body: 'Golf was programmed by a young Satoru Iwata, decades before he became Nintendo\'s president — he later said he was the game\'s only programmer. The Switch hid the game inside its own firmware as a tribute to him.',
      source: 'Wikipedia, "Golf (1984 video game)" (Iwata as sole programmer; the hidden Switch tribute), citing the Iwata Asks interview.',
    },
    editorial: {
      body: "Programmed alone by Satoru Iwata — before HAL Laboratory's famous rise, decades before he became Nintendo's president. Decades later, Nintendo hid the game inside the Switch's own firmware as a tribute to him. Few launch titles carry a biography like that one.",
      source: 'Wikipedia, "Golf (1984 video game)"; the hidden Switch tribute.',
    },
    // No credible US launch price found. Left out.
  },
}

/** The enrichment for a given console/game, or null when none is recorded. */
export function enrichmentFor(consoleId: string, rank: number): GameEnrichment | null {
  return GAME_FACTS[`${consoleId}:${rank}`] ?? null
}

/** Merges the researched enrichment onto a game without mutating it. */
export function enrichGame(game: Game, consoleId: string): Game {
  const extra = enrichmentFor(consoleId, game.rank)
  return extra ? { ...game, ...extra } : game
}
