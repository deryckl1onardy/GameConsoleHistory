import type { Game, GameCriticQuote, GameFact } from '@/types/console'

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
  /**
   * A real synopsis of what the game is — genre, setting, what you actually
   * do — as opposed to `blurb`'s one-line hook (written by hand in each
   * console file) or `editorial`'s "why it matters" angle. Sourced like
   * everything else here; not a marketing paraphrase.
   */
  description?: string
  fact?: GameFact
  /**
   * The game's "why it matters" paragraph — the editorial story, sourced
   * like every fact. Absent whenever nothing checkable was found, exactly
   * like `fact`.
   */
  editorial?: { body: string; source: string }
  /**
   * Real review excerpts, quoted and cited — never invented. Left out
   * entirely when no checkable contemporary or retrospective review could
   * be found, the same posture as every other field here.
   */
  criticReception?: GameCriticQuote[]
  msrpUsd?: number
  msrpUsdAdjusted?: number
  msrpSource?: string
}

const GAME_FACTS: Record<string, GameEnrichment> = {
  'nes:1': {
    description:
      "A side-scrolling platformer: the player runs and jumps Mario, or Luigi in two-player, through eight worlds of four stages each, stomping enemies, grabbing Super Mushrooms and Fire Flowers, and racing to the flagpole at the end of each stage to rescue Princess Toadstool from Bowser.",
    criticReception: [
      {
        outlet: 'Computer and Video Games',
        quote:
          'Cute and comical graphics and lively music, representing truly addictive action games worthy of a spot in the hall of fame.',
        score: '95%',
        source: 'Wikipedia, "Super Mario Bros.", Reception, quoting Computer and Video Games.',
      },
      {
        outlet: 'IGN',
        quote: 'The greatest video game of all time.',
        source: 'Wikipedia, "Super Mario Bros.", Reception, quoting IGN.',
      },
    ],
    fact: {
      title: 'The whole game fit in 32 KB, with about 20 bytes to spare',
      body: 'The cartridge held 32 KB of program code and data plus 8 KB of graphics. After the music was added, only about 20 bytes of open space remained, and Miyamoto spent them on a crown sprite that appears beside the life counter once the player reaches ten lives.',
      source: 'Wikipedia, "Super Mario Bros.", Development section.',
    },
    editorial: {
      body: "Nintendo's American recovery plan hinged on this one cartridge. Bundled with the console rather than sold separately, it gave every NES owner the same indispensable game and set the template for the pack-in: a console's fate riding on a single title. It became the best-selling NES game by a wide margin, and for years held the record as the best-selling video game in the world.",
      source: 'Wikipedia, "Super Mario Bros.", Reception and legacy.',
    },
    // No credible standalone US launch price was found — the game shipped
    // with the NES (the $199 Deluxe Set bundle) and separately-reported
    // figures (~$25) rest on forum recollections, not documents. Left out.
  },

  'nes:2': {
    description:
      "A light-gun shooter played with the NES Zapper aimed at the television: the player fires at ducks flushed up out of the grass, or clay pigeons in the game's third mode, with three shots per round and the targets moving faster each round.",
    criticReception: [
      {
        outlet: 'RePlay Magazine',
        quote:
          "Duck Hunt and Hogan's Alley sported simulated handguns on a wire cable, and pop, pop, pop, you do your thing just like in the old days, only at video targets.",
        source: 'Wikipedia, "Duck Hunt", Reception, quoting Eddie Adlum in RePlay Magazine (1985).',
      },
      {
        outlet: 'USgamer',
        quote:
          "Paired with the NES Zapper, it made the NES memorable, and was one of the key factors behind the console's success.",
        source: 'Wikipedia, "Duck Hunt", Reception, quoting Jeremy Parish.',
      },
    ],
    fact: {
      title: 'It only works on a CRT television',
      body: 'The NES Zapper figures out where it is pointed by reading the timing of the screen\'s electron beam as it sweeps the picture, and only a CRT draws one. A flat panel never paints that way, which is why Duck Hunt, like every Zapper game, cannot run on a modern television.',
      source: 'Wikipedia, "Duck Hunt" (players fire the NES Zapper at a CRT television), citing How-To Geek on why the Zapper fails on HDTVs.',
    },
    editorial: {
      body: "Shipped in the same box as the console in North America, Duck Hunt turned the Zapper from a novelty into a household object. The dog's mocking laugh became one of the most recognised sounds in games, and the light-gun genre's biggest moment. It is the second best-selling NES game ever, almost entirely on the strength of being packed in.",
      source: 'Wikipedia, "Duck Hunt" (bundled with the NES; the dog and his laugh).',
    },
    msrpUsd: 29.99,
    msrpUsdAdjusted: 88,
    msrpSource: '1986 Nintendo retail catalog (Duck Hunt at $29.99), quoted with inflation adjustments in the r/nintendo thread "1986 Nintendo console, accessories, and games adjusted for inflation".',
  },

  'nes:3': {
    description:
      "The series' first world map: the player steers Mario or Luigi across eight kingdoms of linked stages, picking up power-ups like the Tanooki Suit and Super Leaf that let him fly and glide, before each world's airship boss and the final confrontation with Bowser.",
    criticReception: [
      {
        outlet: 'Computer and Video Games',
        quote: 'The Mona Lisa of gaming: astoundingly brilliant in every way, shape, and form.',
        score: '98%',
        source: 'Wikipedia, "Super Mario Bros. 3", Reception, quoting Paul Rand in Computer and Video Games.',
      },
      {
        outlet: 'Mean Machines',
        quote: 'The finest game he had ever played.',
        source: 'Wikipedia, "Super Mario Bros. 3", Reception, quoting Julian Rignall in Mean Machines.',
      },
    ],
    fact: {
      title: 'A ROM chip shortage delayed its American release',
      body: 'Japan got Super Mario Bros. 3 in October 1988; North America waited until February 1990 because a worldwide shortage of ROM chips pushed Nintendo\'s release schedule back. Nintendo filled the gap by featuring the game in the 1989 film The Wizard.',
      source: 'Wikipedia, "Super Mario Bros. 3", Development and release section.',
    },
    editorial: {
      body: "The most anticipated cartridge of its era. A worldwide ROM shortage delayed the American release by over a year, and Nintendo's response, premiering the game in the 1989 film The Wizard and backing it with an aggressive ad campaign, turned a supply problem into publicity. It went on to become the best-selling NES game sold on its own, at 18 million copies.",
      source: 'Wikipedia, "Super Mario Bros. 3", Development and release.',
    },
    msrpUsd: 49.99,
    msrpUsdAdjusted: 124,
    msrpSource: 'Widely reported US launch price of $49.99 in 1990 (e.g. Hacker News thread "Super Mario Bros 3 cost $49.99 in 1990").',
  },

  'nes:4': {
    description:
      "A puzzle game where falling tetromino pieces have to be rotated and slotted together to clear horizontal lines, in a score-focused A-Type mode or a line-count B-Type mode with an adjustable starting level. This is Nintendo's own port; a rival Tengen version, pulled from shelves by the licensing ruling described below, is the one most contemporary reviewers actually preferred.",
    criticReception: [
      {
        outlet: 'IGN',
        quote: "Almost everyone considered Nintendo's version inferior to Atari's Tetris.",
        source: 'Wikipedia, "Tetris (NES video game)", Reception, quoting IGN.',
      },
      {
        outlet: 'Aktueller Software Markt',
        quote:
          'Praised the adjustable starting level and the musical score, though found the graphics merely adequate.',
        source: 'Wikipedia, "Tetris (NES video game)", Reception, quoting Aktueller Software Markt (West Germany).',
      },
    ],
    fact: {
      title: 'Two companies went to federal court over it',
      body: 'Tengen, Atari\'s arcade arm, shipped its own NES Tetris in May 1989. A month later a federal judge granted Nintendo an injunction, and in November 1989 summary judgment gave Nintendo the console rights outright. The version in this spread is the one that won.',
      source: 'Wikipedia, "Tetris", Legal battles section.',
    },
    editorial: {
      body: "Shipped inside the NES itself in North America, Nintendo's Tetris did for the console what it would soon do for the Game Boy: prove that one puzzle game could move hardware. The federal court fight over who owned the console rights, won by Nintendo a month after Tengen shipped its own version, remains one of the most consequential licensing disputes in game history.",
      source: 'Wikipedia, "Tetris" (bundled with the NES in North America; the legal battles).',
    },
    // The NES Tetris launch price is not documented in any source found;
    // period prices for it vary. Left out.
  },

  'nes:5': {
    description:
      'A reskin of a different Japanese game rather than a true sequel: the player picks one of four characters, each with its own jump and strength, and clears seven worlds by pulling vegetables and enemies out of the ground to throw them, rather than the series\' usual stomp.',
    criticReception: [
      {
        outlet: 'Computer and Video Games',
        score: '97%',
        source: 'Wikipedia, "Super Mario Bros. 2", Reception, citing Computer and Video Games (July 1989).',
      },
      {
        outlet: 'IGN',
        quote: 'One of the most polished and creative platformers of the era.',
        score: '8.5/10',
        source: 'Wikipedia, "Super Mario Bros. 2", Reception, quoting IGN.',
      },
    ],
    fact: {
      title: 'The first Mario game where Mario and Luigi had different heights',
      body: 'The Western Super Mario Bros. 2 is a reskin of Yume Kōjō: Doki Doki Panic, a 1987 festival game for Fuji Television, with its four mascots swapped for the Mario cast. The conversion was the first time Mario and Luigi were visibly different heights: Luigi\'s longer legs existed to justify his higher jump.',
      source: 'Wikipedia, "Super Mario Bros. 2", Development / conversion section.',
    },
    editorial: {
      body: "Rarely has a sequel been less of one: the Western Super Mario Bros. 2 is a reskinned Japanese festival game, Doki Doki Panic, swapped into the Mario cast because the actual Japanese sequel was judged too difficult for American players. It gave the series its first playable princess and its first differently-proportioned Mario brothers, and its stranger, more experimental level design has aged into a cult favourite.",
      source: 'Wikipedia, "Super Mario Bros. 2", Development / conversion.',
    },
    // No credible US launch price found for the October 1988 release. Left out.
  },

  'nes:6': {
    description:
      'An action-adventure played from a top-down view: the player explores an open overworld and eight maze-like dungeons as Link, fighting enemies and solving puzzles to collect pieces of the Triforce and rescue Princess Zelda, with progress saved onto a battery inside the cartridge itself.',
    criticReception: [
      {
        outlet: 'Computer Entertainer',
        quote:
          'An excellent adventure game with more to offer than the typical hack-and-slash epics, praising its charming graphics, superb original music, excellent animation.',
        source: 'Wikipedia, "The Legend of Zelda (video game)", Reception, quoting Computer Entertainer.',
      },
      {
        outlet: 'Computer Gaming World',
        quote: 'The best adventure of the year.',
        source: 'Wikipedia, "The Legend of Zelda (video game)", Reception, quoting Computer Gaming World (1988).',
      },
    ],
    fact: {
      title: 'The box had a window cut into it',
      body: 'Nintendo\'s American packaging cut a hole in the front of the box so the gold cartridge was visible through it: the cartridge\'s unusual colour was part of the pitch. The gold shell remains the most recognisable NES cartridge ever made.',
      source: 'Wikipedia, "The Legend of Zelda", American release section.',
    },
    editorial: {
      body: "The cartridge Nintendo packaged in a box with a window cut into the front: the gold shell was the pitch itself. It was the first NES cartridge with battery-backed saving, turning a console game into a persistent world, and it launched a franchise that has defined Nintendo ever since.",
      source: 'Wikipedia, "The Legend of Zelda (video game)", American release (battery-backed saving; the franchise).',
    },
    msrpUsd: 49.99,
    msrpUsdAdjusted: 142,
    msrpSource: 'Retail price of $49.99 at the 1987 US release, per Joshua Kennon ("In 1986, The Legend of Zelda was released with a retail price of $49.99") and Heritage Auctions coverage.',
  },

  'nes:7': {
    description:
      'A falling-block puzzle game in the Tetris mold: the player rotates and drops two-colour pill capsules into a bottle, matching four or more of the same colour in a row to clear the viruses filling it, across 21 levels of rising difficulty.',
    criticReception: [
      {
        outlet: 'Famitsu',
        quote: 'Fun, despite its similarity to Tetris, with the two-player mode more fun to play.',
        source: "Wikipedia, \"Dr. Mario\", Reception, quoting Famitsu's NES reviewers.",
      },
      {
        outlet: 'AllGame',
        quote: 'One of the best, combining a smooth learning curve, playful graphics and memorable tunes.',
        score: '4/5',
        source: 'Wikipedia, "Dr. Mario", Reception, quoting AllGame (NES version).',
      },
    ],
    fact: {
      title: '2.5 million copies in six weeks',
      body: 'Within six weeks of its North American release, Dr. Mario had sold 2.5 million copies, fast enough to prove the puzzle craze Tetris had started had legs of its own, and nearly a third of what the original Super Mario Bros. sold in its entire run.',
      source: 'Wikipedia, "Dr. Mario", Reception section.',
    },
    editorial: {
      body: "Miyamoto's in-house answer to Tetris: a puzzle game about matching capsules to viruses rather than stacking falling blocks, released at the height of the puzzle craze. Two and a half million copies in six weeks proved the genre was bigger than one game, and its capsule design has been remade on nearly every Nintendo console since.",
      source: 'Wikipedia, "Dr. Mario", Reception.',
    },
    // No credible US launch price found for the October 1990 release. Left out.
  },

  'nes:8': {
    description:
      'A dual-perspective action-RPG: the player walks Link across a top-down overworld map between towns and dungeons, then fights in side-scrolling combat sequences, using experience points earned from enemies to raise his attack, magic and life stats.',
    criticReception: [
      {
        outlet: 'Famicom Hisshoubon',
        quote: 'The perfect combination of puzzle-solving and action, twice as fun as the previous Zelda game.',
        source: 'Wikipedia, "Zelda II: The Adventure of Link", Reception, quoting Famicom Hisshoubon.',
      },
      {
        outlet: 'Computer Entertainer',
        quote:
          'A worthy successor to The Legend of Zelda that, while difficult, has a tremendous amount of play value.',
        source: 'Wikipedia, "Zelda II: The Adventure of Link", Reception, quoting Computer Entertainer.',
      },
    ],
    fact: {
      title: 'The only Zelda with experience points',
      body: 'Zelda II gave Link experience points, level-ups and limited lives: role-playing mechanics no canonical Zelda game has used since. The series returned to item-based progression with A Link to the Past and never went back.',
      source: 'Wikipedia, "Zelda II: The Adventure of Link" (the role-playing elements "have not been used since in canonical games").',
    },
    editorial: {
      body: "The sequel Nintendo chose not to repeat: side-scrolling combat, experience points and limited lives, role-playing mechanics no canonical Zelda has used since. Released barely a year after the original, it is the series' most divisive entry, and it marks the moment Nintendo was still figuring out what a Zelda game was.",
      source: 'Wikipedia, "Zelda II: The Adventure of Link".',
    },
    // Sources conflict ($49.99 standard vs a $64 period catalog listing), so
    // no price is recorded rather than a guessed one. Left out.
  },

  'nes:9': {
    description:
      "A side-scrolling motocross racer: the player guns a dirt bike down a track of jumps and hurdles, balancing the A-button throttle against a B-button turbo boost that risks overheating the engine, and can design and save custom tracks of their own in the game's Design Mode.",
    criticReception: [
      {
        outlet: 'AllGame',
        quote:
          'A staple of any NES collection, with a design mode that was the first of its kind in a console game.',
        score: '5/5',
        source: 'Wikipedia, "Excitebike", Reception, quoting AllGame.',
      },
      {
        outlet: 'IGN',
        quote: "Ridiculously addictive, and proof that video games don't need flashy graphics or complex AI to actually be fun.",
        source: 'Wikipedia, "Excitebike", Reception, quoting IGN (2007).',
      },
    ],
    fact: {
      title: 'Its engine became Super Mario Bros.\'s',
      body: 'The side-scrolling engine Miyamoto\'s team built for Excitebike is the same one that runs Super Mario Bros. It is the reason Mario accelerates from a walk into a run smoothly instead of moving at one constant speed.',
      source: 'Wikipedia, "Excitebike" (the engine "was later used to develop Super Mario Bros.").',
    },
    editorial: {
      body: "Miyamoto's team built the side-scrolling engine for this motorcycle racer, then reused it for Super Mario Bros. That's the reason Mario glides from a walk into a run instead of moving at one constant speed. A launch-window title whose design outlived its genre.",
      source: 'Wikipedia, "Excitebike".',
    },
    msrpUsd: 29.99,
    msrpUsdAdjusted: 88,
    msrpSource: '1986 Nintendo retail catalog (Excitebike at $29.99), quoted with inflation adjustments in the r/nintendo thread "1986 Nintendo console, accessories, and games adjusted for inflation".',
  },

  'nes:10': {
    description:
      "An 18-hole golf simulation played from an overhead view, with a power-and-accuracy swing meter that became the template every golf game since has followed, letting the player choose stroke play alone or head-to-head match play against a second player.",
    criticReception: [
      {
        outlet: "Games Don't Suck",
        quote:
          'May not have flashy graphics, unlockable gear, or a world tour mode, but what it does have is timeless simplicity and a place in gaming history.',
        source: "Games Don't Suck, \"Revisiting Golf on the NES (1984): Nintendo's Quiet Trailblazer\" (retrospective review).",
      },
    ],
    fact: {
      title: 'Programmed by Satoru Iwata, alone',
      body: 'Golf was programmed by a young Satoru Iwata, decades before he became Nintendo\'s president. He later said he was the game\'s only programmer. The Switch hid the game inside its own firmware as a tribute to him.',
      source: 'Wikipedia, "Golf (1984 video game)" (Iwata as sole programmer; the hidden Switch tribute), citing the Iwata Asks interview.',
    },
    editorial: {
      body: "Programmed alone by Satoru Iwata, before HAL Laboratory's famous rise, decades before he became Nintendo's president. Decades later, Nintendo hid the game inside the Switch's own firmware as a tribute to him. Few launch titles carry a biography like that one.",
      source: 'Wikipedia, "Golf (1984 video game)"; the hidden Switch tribute.',
    },
    // No credible US launch price found. Left out.
  },

  // --- Atari 2600 -----------------------------------------------------
  // Pilot batch for the description/criticReception fields: every quote
  // below is copied verbatim from the cited outlet as reported in the
  // named source, never paraphrased into a fake first-person voice. Where
  // a period magazine's score survived but its actual review prose did
  // not, the entry carries `score` alone rather than inventing a line —
  // the same "absent is a normal state" posture as `fact` and `editorial`.

  'atari-2600:1': {
    description:
      'The player steers Pac-Man around a single maze, eating dots and fruit while four ghosts give chase; a power pill briefly turns the ghosts blue and edible. This Atari 2600 port renders the whole chase on one looping, heavily flickering maze instead of the arcade\'s multiple layouts, with adjustable difficulty and an alternating two-player mode.',
    criticReception: [
      {
        outlet: 'Electronic Games',
        quote:
          "It's astonishing to see a home version of a classic arcade contest so devoid of what gave the original its charm.",
        score: '4/10',
        source: 'Wikipedia, "Pac-Man (Atari 2600 video game)", Reception, quoting Electronic Games (May 11, 1982).',
      },
      {
        outlet: 'Video Games Player',
        quote: 'Just awful.',
        score: 'B−',
        source: 'Wikipedia, "Pac-Man (Atari 2600 video game)", Reception, quoting Video Games Player (Fall 1982).',
      },
      {
        outlet: 'Next Generation',
        quote: 'Worst coin-op conversion of all time.',
        source: 'Wikipedia, "Pac-Man (Atari 2600 video game)", Reception, quoting Next Generation (April 1998).',
      },
    ],
  },

  'atari-2600:2': {
    description:
      'A fixed shooter: the player slides a laser cannon along the bottom of the screen, firing up at 36 aliens descending in formation before they reach the ground, while dodging their fire behind four moving shields. The Atari 2600 version bundles 112 game variations (zigzagging shots, invisible enemies, a two-player mode) rather than one fixed arcade layout, and its release is credited with driving a wave of console sales in 1980.',
    criticReception: [
      {
        outlet: 'Electronic Games',
        quote:
          "High rankings for single-player gameplay, while only finding the game's graphics and sound to be merely good.",
        score: '10/10',
        source: 'Wikipedia, "Space Invaders (Atari 2600 video game)", Reception section, quoting Electronic Games.',
      },
      {
        outlet: 'The Complete Guide to Electronic Games',
        quote: 'A highly competitive reaction game, and one of the best available.',
        score: '5/5',
        source:
          'Wikipedia, "Space Invaders (Atari 2600 video game)", Reception section, quoting The Complete Guide to Electronic Games.',
      },
    ],
  },

  'atari-2600:3': {
    description:
      "As Mario, the player climbs ladders and times jumps across a construction site to reach Pauline at the top, dodging barrels and fireballs Donkey Kong throws down. Programmer Garry Kitchen had three to four months to build the Atari 2600 port and had to cut two of the arcade original's four stages to fit the console's memory.",
    criticReception: [
      {
        outlet: 'Joystik',
        score: '1/5',
        source:
          'Wikipedia, "Donkey Kong (1981 video game)", citing Joystik\'s contemporary review of the Atari VCS version.',
      },
      {
        outlet: 'Computer and Video Games',
        score: '32%',
        source:
          'Wikipedia, "Donkey Kong (1981 video game)", citing Computer and Video Games\' review of the Atari VCS version.',
      },
      {
        outlet: 'Old School Gamer Magazine',
        quote:
          "Donkey Kong is fun on the 2600. Even though two screens are missing and the rivet screen feels a little phoned in, the essence is there.",
        source: 'Old School Gamer Magazine, "Donkey Kong for the Atari 2600" (retrospective review).',
      },
    ],
  },

  'atari-2600:4': {
    description:
      "The player runs Pitfall Harry through a jungle, swinging vines, leaping crocodiles and ladders, and dodging scorpions and quicksand to collect 32 treasures before a 20-minute timer runs out. Each screen loads independently rather than scrolling, and losing all lives, or running out the clock, ends the expedition wherever Harry stands.",
    criticReception: [
      {
        outlet: 'Arcade Express',
        quote: 'May well be the best adventure game yet produced for the VCS.',
        score: '8/10',
        source: 'Wikipedia, "Pitfall!", Reception section, quoting Arcade Express.',
      },
      {
        outlet: 'Blip',
        quote:
          "This is one case where inspiration didn't lead to imitation. Pitfall is its own game. It's also a heck of a lot of fun.",
        source: 'Wikipedia, "Pitfall!", Reception section, quoting Blip magazine.',
      },
    ],
  },

  'atari-2600:5': {
    description:
      'The player pilots a triangular ship adrift in an asteroid field, rotating and thrusting to line up shots on rocks that split into smaller, faster pieces when hit, while flying saucers periodically fire back. Programmers Brad Stewart and Bob Smith could not fit the game into a standard 4 KB cartridge and built the first Atari 2600 game to use bank switching to reach 8 KB.',
    criticReception: [
      {
        outlet: 'Electronic Fun with Computers & Games',
        score: 'A',
        source: 'Wikipedia, "Asteroids (video game)", citing Electronic Fun with Computers & Games\' review of the Atari VCS version.',
      },
      {
        outlet: 'The Space Gamer',
        quote: "A virtual duplicate of the ever-popular Atari arcade game.",
        source:
          'Wikipedia, "Asteroids (video game)", quoting Richard A. Edwards\' review in The Space Gamer.',
      },
    ],
  },

  'atari-2600:6': {
    description:
      "The player flies a ship back and forth over a scrolling planet's surface, shooting invading aliens and catching humanoids they try to abduct before the humanoids fall or the aliens carry them off-screen. Programmer Bob Polaro remapped the arcade's five-button attack panel onto the 2600's single-button joystick, cycling laser fire, smart bombs and hyperspace by the ship's height on screen.",
    criticReception: [
      {
        outlet: 'Computer and Video Games',
        score: '90%',
        source: 'Wikipedia, "Defender (1981 video game)", citing Computer and Video Games\' review of the Atari 2600 version.',
      },
      {
        outlet: 'The Space Gamer',
        quote: "Should be in players' game library.",
        source: 'Wikipedia, "Defender (1981 video game)", quoting Ed Driscoll\'s review in The Space Gamer.',
      },
    ],
  },

  'atari-2600:7': {
    description:
      "The player guides E.T. across a top-down landscape, falling into and climbing out of pits while assembling three pieces of a phone to call home. Reese's Pieces scattered around the map refill E.T.'s energy, and the player must dodge a scientist and an FBI agent before reaching a landing zone within the time limit.",
    criticReception: [
      {
        outlet: 'Vidiot',
        quote:
          "About the only flaw with an otherwise A-1 game is that E.T. tends to be somewhat clumsy and repeatedly falls into holes.",
        source: 'Wikipedia, "E.T. the Extra-Terrestrial (video game)", Reception section, quoting Kevin Christopher in Vidiot.',
      },
      {
        outlet: 'GameSpy',
        quote: 'Convoluted and inane.',
        source:
          'Wikipedia, "E.T. the Extra-Terrestrial (video game)", Reception section, quoting GameSpy\'s Classic Gaming retrospective.',
      },
    ],
  },

  'atari-2600:8': {
    description:
      "The same maze chase as the original Pac-Man, but with four mazes that alternate through a round instead of one, fruit that moves instead of sitting still, and ghosts with less predictable patterns. General Computer Corporation's Atari 2600 port lets the player set how many ghosts are loose in the maze, an option the arcade original never offered.",
    criticReception: [
      {
        outlet: 'Data Driven Gamer',
        quote: "This is an excellent conversion of a great game, and tends to be overshadowed by its predecessor's infamy.",
        score: 'Good',
        source: 'Data Driven Gamer, Ahab, "Game 198: Ms. Pac-Man (Atari 2600)" (retrospective review).',
      },
      {
        outlet: 'HonestGamers',
        quote:
          "It's just as good as the arcade version. Maybe it doesn't exude the charm its big sister does, but it replicates its arcade counterpart far better than a vast portion of the 2600's library.",
        score: '4.5/5',
        source: 'HonestGamers, Joseph Shaffer, "Ms. Pac-Man (Atari 2600) Review" (April 23, 2012).',
      },
    ],
  },

  'atari-2600:9': {
    description:
      "The player slides a laser cannon along the bottom of the screen, shooting waves of winged demons whose attack patterns grow more erratic and whose hits sometimes split one demon into two. Imagic, a studio founded by programmers who had just left Atari over royalty disputes, built it as one of the third-party wave's biggest commercial hits.",
    criticReception: [
      {
        outlet: 'Video',
        quote: 'Had the best graphics among the most recent Atari 2600 games.',
        score: '9.5/10',
        source: 'Wikipedia, "Demon Attack", Reception section, quoting Bill Kunkel and Arnie Katz in Video (1982).',
      },
      {
        outlet: 'GameSpy',
        quote: 'A standout due to its fast-paced action, responsive control, and audio-visual appeal.',
        source: 'Wikipedia, "Demon Attack", Reception section, quoting William Cassidy in GameSpy (2002).',
      },
    ],
  },

  'atari-2600:10': {
    description:
      'A first-person racer: the player steers a car down a road rendered from a handful of moving dots and pylons, using a paddle controller to turn and holding the button to accelerate, across three difficulty levels of progressively sharper curves. Programmer Rob Fulop\'s home version added roadside houses and trees, other cars to avoid, and eight game variations the arcade original never had, while dropping its gear-shifting.',
    criticReception: [
      {
        outlet: 'Video Games Player',
        score: 'A−',
        source: 'Wikipedia, "Night Driver (video game)", citing Video Games Player\'s review of the Atari VCS version.',
      },
    ],
  },

  // --- Master System ----------------------------------------------------

  'master-system:1': {
    description:
      "A side-scrolling platformer across 17 stages: the player punches enemies and breaks rocks as Alex Kidd, buying vehicles and items with money collected along the way, and settling occasional showdowns with Janken's henchmen in rock-paper-scissors before the final boss.",
    criticReception: [
      {
        outlet: 'IGN',
        quote:
          'An exceptional platformer with loads of action and some great puzzle-solving challenges that still holds up remarkably well.',
        score: '9/10',
        source: 'Wikipedia, "Alex Kidd in Miracle World", Reception, quoting IGN.',
      },
      {
        outlet: 'Computer and Video Games',
        quote: "Sega's answer to Mario, with absorbing gameplay that will have players glued to the screen for hours on end.",
        score: '87%',
        source: 'Wikipedia, "Alex Kidd in Miracle World", Reception, quoting Computer and Video Games.',
      },
    ],
  },

  'master-system:2': {
    description:
      "A side-scrolling platformer built as its own, differently-designed take on the Genesis original: the player runs Sonic through six zones of two acts each, collecting rings for protection and searching for Chaos Emeralds, with level design built around exploration rather than the 16-bit game's speed.",
    criticReception: [
      {
        outlet: 'Electronic Gaming Monthly',
        quote: 'A polished recreation of the 16-bit game, with its features brought to the 8-bit systems intact.',
        score: '9/10',
        source: 'Wikipedia, "Sonic the Hedgehog (8-bit video game)", Reception, quoting Electronic Gaming Monthly.',
      },
      {
        outlet: 'Computer and Video Games',
        quote: 'The game still offered the player plenty, and was just as good as the Genesis version.',
        score: '90%',
        source: 'Wikipedia, "Sonic the Hedgehog (8-bit video game)", Reception, quoting Computer and Video Games.',
      },
    ],
  },

  'master-system:3': {
    description:
      'A nonlinear platformer through Monster Land: defeating a dragon transforms Wonder Boy into a new creature form, Lizard-Man, Mouse-Man, Piranha-Man, Lion-Man or Hawk-Man, each granting different abilities that open up previously unreachable areas and puzzles.',
    criticReception: [
      {
        outlet: 'Mean Machines',
        quote: 'Ranks as one of the greatest Sega Master System games ever!',
        score: '95%',
        source: 'Wikipedia, "Wonder Boy III: The Dragon\'s Trap", Reception, quoting Mean Machines.',
      },
      {
        outlet: 'IGN',
        quote: 'Not only the crowning achievement of the series, but perhaps one of the best games of the 8-bit era.',
        source: 'Wikipedia, "Wonder Boy III: The Dragon\'s Trap", Reception, quoting Travis Fahs at IGN.',
      },
    ],
  },

  'master-system:4': {
    description:
      'A Japanese role-playing game that alternates top-down exploration of towns and the overworld with first-person dungeon crawling and turn-based battles: the player controls Alis, recruiting a party and navigating maze-like dungeons against randomly encountered enemies.',
    criticReception: [
      {
        outlet: "Boys' Life",
        quote:
          'Phantasy Star may represent the future of home video games, combining the graphic quality of arcade games with the complexity of computer games.',
        source: 'Wikipedia, "Phantasy Star (video game)", Reception, quoting Boys\' Life (November 1988).',
      },
      {
        outlet: 'IGN',
        quote: "The game that defined an entire generation's early experiences with the RPG genre as a whole.",
        source: 'Wikipedia, "Phantasy Star (video game)", Reception, quoting IGN (August 2009).',
      },
    ],
  },

  'master-system:5': {
    description:
      "A top-down action-RPG built as the Master System's own answer to The Legend of Zelda: the player explores an overworld and labyrinth dungeons, collecting nine hidden magic crystals while upgrading weapons, armour and magic along the way.",
    criticReception: [
      {
        outlet: 'GamePro',
        quote: 'A great game.',
        score: '5/5',
        source: 'Wikipedia, "Golden Axe Warrior", Reception, quoting GamePro.',
      },
      {
        outlet: 'Computer and Video Games',
        quote: 'An incredibly dull RPG.',
        score: '42%',
        source: 'Wikipedia, "Golden Axe Warrior", Reception, quoting Computer and Video Games: reception was genuinely split, not uniformly positive.',
      },
    ],
  },

  'master-system:6': {
    description:
      'A horizontally scrolling shooter: the player pilots the R-9 against the alien Bydo empire, collecting a detachable "Force" pod that can be worn on the front or back of the ship for extra firepower and a temporary shield.',
    criticReception: [
      {
        outlet: 'Mean Machines',
        quote: 'The graphics and the high quality of the challenge offered by the game.',
        score: '92%',
        source: 'Wikipedia, "R-Type", Reception (Master System version), quoting Mean Machines.',
      },
      {
        outlet: 'ACE',
        score: 'Named a top-5 Master System game (1989)',
        source: 'Wikipedia, "R-Type", Reception (Master System version), citing ACE magazine\'s 1989 list.',
      },
    ],
  },

  'master-system:7': {
    description:
      'A horizontally scrolling shoot-em-up with a shop built into the action: the player flies Opa-Opa, a sentient ship, through eight candy-colored stages, spending money earned from destroying enemies on weapon upgrades, bombs and engine improvements between runs.',
    criticReception: [
      {
        outlet: 'Computer and Video Games',
        quote: 'A beaut of a game: an I-want-to-eat-this-cartridge scrolling backdrop, and aliens that float in.',
        score: '9/10',
        source: 'Wikipedia, "Fantasy Zone", Reception (1988), quoting Computer and Video Games.',
      },
      {
        outlet: 'Console XS',
        score: '91%',
        source: 'Wikipedia, "Fantasy Zone", Reception (1992), citing Console XS\'s review of the Master System version.',
      },
    ],
  },

  'master-system:8': {
    description:
      "An action-RPG built around 'bump' combat: the player steers Adol into enemies off-centre to land damage while avoiding head-on collisions, turning the series' level-grinding into an almost rhythmic, arcade-like loop rather than a menu-driven battle system.",
    criticReception: [
      {
        outlet: 'The Games Machine',
        quote: 'The better game visually: one of the top-rank RPGs around.',
        score: '90%',
        source: 'Wikipedia, "Ys (video game)", Reception (Master System version, May 1989), quoting The Games Machine.',
      },
      {
        outlet: 'ACE',
        quote: 'Praised the huge scrolling world and a good deal of role-playing depth.',
        score: '920/1000',
        source: 'Wikipedia, "Ys (video game)", Reception (Master System version, November 1989), quoting ACE Magazine.',
      },
    ],
  },

  'master-system:9': {
    description:
      "An action game built around the anime it was licensed from: the player guides J.J. through an underground base, using an upgradeable laser to break open capsules for access codes and power-ups, then keying four-digit codes into terminals to unlock doors and disable security systems.",
    criticReception: [
      {
        outlet: 'The Games Machine',
        quote:
          "Compared to Epyx's Impossible Mission, sharing a design philosophy where objects must be inspected to unlock codes.",
        score: '76%',
        source: 'Wikipedia, "Zillion (video game)", Reception, quoting The Games Machine.',
      },
    ],
  },

  'master-system:10': {
    description:
      'A pseudo-3D arcade racer: the player drives a Ferrari Testarossa against the clock, and near the end of each stage the road forks, letting the player choose between branching routes toward five different endings.',
    criticReception: [
      {
        outlet: 'Computer and Video Games',
        quote: 'All the thrill power of the arcade version.',
        source: 'Wikipedia, "Out Run", Reception (Master System version), quoting Computer and Video Games.',
      },
      {
        outlet: 'The Games Machine',
        quote: 'The Master System version came closest to the original coin-op.',
        score: '72%',
        source: 'Wikipedia, "Out Run", Reception (Master System version), quoting The Games Machine.',
      },
    ],
  },

  // --- Genesis ------------------------------------------------------------

  'genesis:1': {
    description:
      'A side-scrolling platformer: the player runs and spins Sonic through six zones, collecting rings for protection, chaining springs and loops for speed, and using the spin attack to jump and fight at once.',
    criticReception: [
      {
        outlet: 'Computer and Video Games',
        quote: 'Plays like a dream.',
        score: '94%',
        source: 'Wikipedia, "Sonic the Hedgehog (1991 video game)", Reception, quoting Paul Rand in Computer and Video Games.',
      },
      {
        outlet: 'Entertainment Weekly',
        quote: 'A very fast game, yet never felt chaotic or impossible.',
        score: 'A+',
        source: 'Wikipedia, "Sonic the Hedgehog (1991 video game)", Reception, quoting Bob Strauss in Entertainment Weekly.',
      },
    ],
  },

  'genesis:2': {
    description:
      "A side-scrolling platformer across eleven zones: the player runs Sonic, joined by his new sidekick Tails, and can now build speed from a standstill with the spin dash, in levels built larger and faster than the original game's.",
    criticReception: [
      {
        outlet: 'Mean Machines Sega',
        score: '96%',
        source: 'Wikipedia, "Sonic the Hedgehog 2", Reception, citing Mean Machines Sega.',
      },
      {
        outlet: 'Computer and Video Games',
        quote: "The difficulty was Sonic 2's only major problem.",
        score: '94%',
        source: 'Wikipedia, "Sonic the Hedgehog 2", Reception, quoting Computer and Video Games.',
      },
    ],
  },

  'genesis:3': {
    description:
      'Two cartridges combined through a lock-on adapter into one game: the Sonic & Knuckles cartridge physically clips onto Sonic 3, letting the player replay its stages as Knuckles and unlock the Super Emerald transformations neither cartridge offers alone.',
    criticReception: [
      {
        outlet: 'Computer and Video Games',
        quote: 'The best platform experience ever, what video games were invented for.',
        score: '97%',
        source: 'Wikipedia, "Sonic the Hedgehog 3", Reception, quoting Computer and Video Games.',
      },
      {
        outlet: 'Sega Magazine',
        quote: 'A serious contender for the Best Platform Game Ever award.',
        score: '95%',
        source: 'Wikipedia, "Sonic the Hedgehog 3", Reception, quoting Sega Magazine on Sonic 3.',
      },
    ],
  },

  'genesis:4': {
    description:
      "A one-on-one fighting game: the player drains an opponent's health across rounds using digitized-actor moves and blocks that open up counterattacks, finishing a beaten opponent with a Fatality. The Genesis version hid the arcade's blood and Fatalities behind the \"ABACABB\" cheat code, the reverse of the SNES version's permanent censorship.",
    criticReception: [
      {
        outlet: 'GamePro',
        quote: 'All the arcade version fatalities are included in Mode A, though noticeably cruder in appearance.',
        source: 'Wikipedia, "Mortal Kombat (1992 video game)", Reception (Genesis version), quoting GamePro.',
      },
      {
        outlet: 'Electronic Gaming Monthly',
        score: '9/10',
        source: 'Electronic Gaming Monthly #50, cited via Defunct Games, "Mortal Kombat on Genesis: What Did the Critics Say in 1993?" (review by Ed Semrad).',
      },
    ],
  },

  'genesis:5': {
    description:
      'A side-scrolling platformer built around the film: the player jumps and vaults as Aladdin, throwing apples at enemies and collecting golden scarabs and diamonds that unlock bonus stages.',
    criticReception: [
      {
        outlet: 'Diehard GameFan',
        quote: 'Brilliant.',
        source: 'Wikipedia, "Disney\'s Aladdin (Genesis video game)", Reception, quoting Diehard GameFan.',
      },
      {
        outlet: 'Edge',
        quote: "The Mega Drive's new platform king.",
        source: 'Wikipedia, "Disney\'s Aladdin (Genesis video game)", Reception, quoting Edge.',
      },
      {
        outlet: 'Game Informer',
        score: '9.25/10',
        source: 'Wikipedia, "Disney\'s Aladdin (Genesis video game)", Reception, citing Game Informer.',
      },
    ],
  },

  'genesis:6': {
    description:
      'A pinball game wearing Sonic\'s skin: the player launches Sonic like the ball itself through four flipper-driven tables, steering with directional input to collect Chaos Emeralds and reach each table\'s boss.',
    criticReception: [
      {
        outlet: 'Electronic Games',
        quote: '95% for playability and replayability.',
        source: 'Wikipedia, "Sonic Spinball", Reception, quoting Laurie Yates in Electronic Games.',
      },
      {
        outlet: 'GamePro',
        quote: 'A fun, fast, and frenetic pinball game.',
        source: 'Wikipedia, "Sonic Spinball", Reception, quoting Scary Larry in GamePro.',
      },
    ],
  },

  'genesis:7': {
    description:
      'A side-scrolling beat-em-up for one or two players: fighting through waves of enemies with standard attacks, a screen-clearing Blitz Attack, and a Special Attack that deals extra damage at the cost of the player\'s own health.',
    criticReception: [
      {
        outlet: 'Electronic Games',
        quote: 'Some of the best video game music soundtracks they ever heard.',
        source: 'Wikipedia, "Streets of Rage 2", Reception (1993), on Yuzo Koshiro\'s score.',
      },
      {
        outlet: 'GameFan',
        quote: "The best fighting sequel of '92.",
        source: 'Wikipedia, "Streets of Rage 2", Reception, quoting GameFan.',
      },
    ],
  },

  'genesis:8': {
    description:
      'An NFL simulation built on the previous year\'s engine: the player calls offensive and defensive plays against a noticeably smarter CPU opponent, with new additions like no-huddle offense, ball-spiking to stop the clock, and overturned officiating calls.',
    criticReception: [
      {
        outlet: 'Sega-16',
        quote:
          'It still provides good action on the field along with a few bells and whistles that continued to make it like you were playing the real game on TV.',
        score: '7/10',
        source: 'Sega-16, "John Madden Football \'93" (retrospective review).',
      },
    ],
  },

  'genesis:9': {
    description:
      'A 2-on-2 arcade basketball game built for spectacle: the player controls digitized, larger-than-life NBA players who dunk from absurd heights and shove opponents freely, with the crowd and announcer erupting the moment a player catches fire.',
    criticReception: [
      {
        outlet: 'Sports Video Game Reviews',
        quote:
          'Expertly engineered 2-on-2 arcade basketball, famous for hyper-realistic dunks and continuous no-rules action.',
        score: 'A',
        source: 'Sports Video Game Reviews, "NBA Jam" (Genesis review).',
      },
      {
        outlet: 'Next Generation',
        score: 'Ranked #99, Top 100 Games of All Time (1996)',
        source: 'Wikipedia, "NBA Jam", Reception, citing Next Generation (1996).',
      },
    ],
  },

  'genesis:10': {
    description:
      "A fantasy beat-em-up: the player fights through Death Adder's army with weapons and magic spells powered by collected potions, and can commandeer mountable creatures like a cockatrice or a fire-breathing dragon along the way.",
    criticReception: [
      {
        outlet: 'Mean Machines',
        score: '91%',
        source: 'Wikipedia, "Golden Axe (video game)", Reception, citing Mean Machines (Genesis version).',
      },
      {
        outlet: 'Game Informer',
        score: '8.75/10',
        source: 'Wikipedia, "Golden Axe (video game)", Reception, citing Game Informer (Genesis version).',
      },
    ],
  },

  // --- SNES -----------------------------------------------------------

  'snes:1': {
    description:
      'A side-scrolling platformer across seven worlds: the player guides Mario to rescue Princess Peach from Bowser, now able to ride Yoshi to eat enemies and spit them as projectiles, and to glide with the Cape Feather power-up, across an overworld map with hidden keys leading to secret routes.',
    criticReception: [
      {
        outlet: 'Computer and Video Games',
        quote: 'The graphics were an excellent example of what the then-new SNES was capable of, and the sound effects were mindblowing.',
        score: '96%',
        source: 'Wikipedia, "Super Mario World", Reception, quoting Computer and Video Games.',
      },
      {
        outlet: 'Nintendo Life',
        quote: 'The graphical holy grail that retro-styled games aspire to, with level design that is an unrivalled master class.',
        score: '10/10',
        source: 'Wikipedia, "Super Mario World", Reception, quoting Nintendo Life.',
      },
    ],
  },

  'snes:2': {
    description:
      'A compilation of four remade NES platformers: the same Mario adventures rebuilt with 16-bit graphics, updated music and parallax scrolling, plus a save feature that lets the player resume from any world or level they have already reached, rather than starting each game over from the beginning.',
    criticReception: [
      {
        outlet: 'Electronic Gaming Monthly',
        quote: 'A masterpiece from beginning to end.',
        source: 'Wikipedia, "Super Mario All-Stars", Reception (1993), quoting Electronic Gaming Monthly.',
      },
      {
        outlet: 'Computer and Video Games',
        quote: "The Mario director's cut, bringing fans updated graphics and audio.",
        score: '94%',
        source: 'Wikipedia, "Super Mario All-Stars", Reception (1993), quoting Computer and Video Games.',
      },
    ],
  },

  'snes:3': {
    description:
      'A side-scrolling platformer built on pre-rendered 3D models converted into sprites: the player guides Donkey Kong and his nephew Diddy Kong through 40 levels, riding animal companions and using barrels for both combat and traversal on the way to secret bonus stages.',
    criticReception: [
      {
        outlet: 'GameFan',
        quote: 'Set a new quality standard that many developers would attempt to imitate.',
        score: '100/100',
        source: 'Wikipedia, "Donkey Kong Country", Reception, quoting GameFan.',
      },
      {
        outlet: 'Entertainment Weekly',
        quote: "Is to most 16-bit games what most 16-bit games are to their Atari forebears. Once you've played it, everything else before it seems like a peewee.",
        score: 'A+',
        source: 'Wikipedia, "Donkey Kong Country", Reception, quoting Entertainment Weekly.',
      },
    ],
  },

  'snes:4': {
    description:
      "A kart racer built on Mode 7's pseudo-3D scaling and rotation: the player picks one of eight Mario characters and races themed tracks, throwing shells and dropping bananas to hinder opponents, with a split-screen mode for two players racing at once.",
    criticReception: [
      {
        outlet: 'Computer and Video Games',
        quote: 'Struck gold in presentation and design.',
        score: '96%',
        source: 'Wikipedia, "Super Mario Kart", Reception, quoting Computer and Video Games.',
      },
      {
        outlet: 'IGN',
        quote: 'The original karting masterpiece, whose gameplay mechanics defined the genre.',
        source: 'Wikipedia, "Super Mario Kart", Reception, quoting IGN.',
      },
    ],
  },

  'snes:5': {
    description:
      "A one-on-one fighting game: the player picks from all eight of the arcade original's characters and depletes an opponent's health across rounds using special-move button and joystick combinations, in a home conversion built to fit the cartridge's memory without losing the arcade's full roster.",
    criticReception: [
      {
        outlet: 'Electronic Gaming Monthly',
        quote: "The moves are perfect, the graphics outstanding and the audio exceptional. Get one of the new 6 button sticks and you'll swear you're playing the arcade version.",
        score: '38/40',
        source: 'Wikipedia, "Street Fighter II", Reception (SNES version), quoting Ed Semrad in Electronic Gaming Monthly.',
      },
      {
        outlet: 'GamePro',
        quote: "A nearly flawless conversion of the arcade original that's made even more enjoyable by new options and the convenience of home fighting.",
        score: '5/5',
        source: 'Wikipedia, "Street Fighter II", Reception (SNES version), quoting GamePro.',
      },
    ],
  },

  'snes:6': {
    description:
      "A side-scrolling platformer starring Diddy Kong and his girlfriend Dixie Kong: the pair sets out across 52 levels in eight worlds to rescue Donkey Kong from King K. Rool and the Kremlings, riding animal companions with their own abilities through jungle, mine and underwater stages.",
    criticReception: [
      {
        outlet: 'Game Informer',
        quote: 'Longer, more graphically impressive, and more fun than the original, with some of the most cleverly illustrated levels ever seen on a home system.',
        score: '9.75/10',
        source: "Wikipedia, \"Donkey Kong Country 2: Diddy's Kong Quest\", Reception, quoting Game Informer.",
      },
      {
        outlet: 'AllGame',
        quote: 'Graphics deemed superior to that of its predecessor.',
        score: '4.5/5',
        source: "Wikipedia, \"Donkey Kong Country 2: Diddy's Kong Quest\", Reception, quoting AllGame.",
      },
    ],
  },

  'snes:7': {
    description:
      "An action-adventure told across two parallel versions of Hyrule: the player explores the Light World and the Dark World from a top-down view, travelling between them through portals to solve puzzles, defeat bosses and gather the items needed to complete each dungeon.",
    criticReception: [
      {
        outlet: 'Famitsu',
        quote: 'A game that will remind players how much fun games can be.',
        score: '9/10, 10/10, 10/10, 10/10',
        source: 'Wikipedia, "The Legend of Zelda: A Link to the Past", Reception, quoting Giorgio Nakaji in Famitsu.',
      },
      {
        outlet: 'Dragon Magazine',
        score: '5/5',
        source: 'Wikipedia, "The Legend of Zelda: A Link to the Past", Reception, citing Sandy Petersen\'s 1993 review in Dragon Magazine.',
      },
    ],
  },

  'snes:8': {
    description:
      "A side-scrolling platformer with a hand-drawn, crayon-and-marker art style: the player rides Yoshi carrying baby Mario across 48 levels to reunite him with his brother Luigi, using Yoshi's flutter jump and egg-throwing to fight enemies and clear obstacles.",
    criticReception: [
      {
        outlet: 'Edge',
        quote: 'One of the last of a dying breed: a 16-bit game that shows real heart and creativity.',
        score: '9/10',
        source: 'Wikipedia, "Super Mario World 2: Yoshi\'s Island", Reception, quoting Edge.',
      },
      {
        outlet: 'Diehard GameFan',
        quote: 'One of the handful of truly perfect games ever produced.',
        source: 'Wikipedia, "Super Mario World 2: Yoshi\'s Island", Reception, quoting Diehard GameFan.',
      },
    ],
  },

  'snes:9': {
    description:
      "A faster, rebalanced revision of Street Fighter II: nearly every fighter gained new special moves, from Ryu and Ken's mid-air Hurricane Kick to Chun-Li's Kikoken projectile, and matches move at a noticeably higher speed that demands tighter timing on combos.",
    criticReception: [
      {
        outlet: 'GamePro',
        score: '20/20',
        source: 'Wikipedia, "Street Fighter II Turbo", Reception, citing GamePro\'s contemporary review.',
      },
      {
        outlet: 'Electronic Gaming Monthly',
        quote: "The last and best refinement of Street Fighter II before the basic formula of the series changed.",
        source: 'Wikipedia, "Street Fighter II Turbo", Reception (1997 retrospective), quoting Electronic Gaming Monthly, which also named the SNES version the fifth best console game of all time.',
      },
    ],
  },

  'snes:10': {
    description:
      "A rail shooter rendered in real 3D polygons via the cartridge's own Super FX chip: the player pilots Fox McCloud's Arwing through space and planetary stages, shifting between third- and first-person views to destroy enemies and bosses while managing shields and weapon upgrades.",
    criticReception: [
      {
        outlet: 'Computer and Video Games',
        score: '96/100',
        source: 'Wikipedia, "Star Fox (1993 video game)", Reception, citing Computer and Video Games.',
      },
      {
        outlet: 'Entertainment Weekly',
        score: 'A',
        source: 'Wikipedia, "Star Fox (1993 video game)", Reception, citing Entertainment Weekly.',
      },
    ],
  },

  // --- Saturn -----------------------------------------------------------

  'saturn:1': {
    description:
      'A 3D one-on-one fighting game: the player picks a character and wins by damage or ring-out, using an eight-way stick and three buttons, punch, kick and guard, in combinations that produce each character\'s own attacks and counters.',
    criticReception: [
      {
        outlet: 'Next Generation',
        quote: 'The ultimate arcade translation, and the best fighting game ever.',
        score: '5/5',
        source: 'Wikipedia, "Virtua Fighter 2", Reception (Saturn version), quoting Next Generation.',
      },
      {
        outlet: 'Sega Saturn Magazine',
        quote: 'A smooth frame rate, realistically varied reactions to blows, a huge variety of moves, and the addition of features such as Team Battle Mode.',
        score: '98%',
        source: 'Wikipedia, "Virtua Fighter 2", Reception (Saturn version), quoting Sega Saturn Magazine.',
      },
    ],
  },

  'saturn:2': {
    description:
      "A tactical RPG built around a dating-sim conversation system: the player commands the Flower Division's steam-powered Kobu armor in grid-based battles, while the LIPS system's timed dialogue choices during the adventure sections raise or lower each squadmate's trust, which then shapes how they perform in the next fight.",
    criticReception: [
      {
        outlet: 'RPGFan',
        quote: "Artwork and voice acting served as the main draw for players.",
        score: '97%',
        source: 'Wikipedia, "Sakura Wars (1996 video game)", Reception, quoting Nicole Kirk at RPGFan.',
      },
      {
        outlet: 'Famitsu',
        score: '8/10, 9/10, 8/10, 8/10',
        source: 'Wikipedia, "Sakura Wars (1996 video game)", Reception, citing Famitsu (Saturn version).',
      },
    ],
  },

  'saturn:3': {
    description:
      'A light-gun rail shooter: the player moves along a fixed path, occasionally picking between two routes, shooting armed criminals while sparing bystanders, and earning bonus points for "justice shots" that disarm rather than kill.',
    criticReception: [
      {
        outlet: 'GameSpot',
        quote: 'While the first Virtua Cop set a new standard for light gun shooters, Sega and the AM2 team have delivered an incredible sequel that takes the concept to a whole new level.',
        score: '7.1/10',
        source: 'Wikipedia, "Virtua Cop 2", Reception (Saturn version), quoting Tom Ham at GameSpot.',
      },
      {
        outlet: 'Sega Saturn Magazine',
        quote: 'A considerable improvement, with higher intensity, especially in the chase scenes.',
        score: '95%',
        source: 'Wikipedia, "Virtua Cop 2", Reception (Saturn version), quoting Sega Saturn Magazine.',
      },
    ],
  },

  'saturn:4': {
    description:
      'The 3D fighting genre\'s founding game, brought home nearly intact: the player fights one-on-one with an eight-way stick and three buttons, punch, kick and guard, winning rounds by depleting an opponent\'s stamina or knocking them out of the ring.',
    criticReception: [
      {
        outlet: 'Electronic Gaming Monthly',
        score: '7.9/10',
        source: 'Defunct Games, "Virtua Fighter Review for Sega Saturn (1995)", citing Electronic Gaming Monthly\'s average score.',
      },
      {
        outlet: 'Next Generation',
        quote: 'Fast, beautiful, and probably art.',
        source: 'Wikipedia, "Virtua Fighter (video game)", on the Saturn port, quoting Next Generation (1995).',
      },
    ],
  },

  'saturn:5': {
    description:
      "A rally racer built around surface-dependent handling: the player drives one of three cars across desert, forest and mountain stages, where the physics genuinely change with the terrain underneath, and has to progressively overtake the field to advance.",
    criticReception: [
      {
        outlet: 'Next Generation',
        quote: 'A down-and-dirty feel, truly phenomenal high-speed visuals, and quick, responsive control.',
        score: '5/5',
        source: 'Wikipedia, "Sega Rally Championship", Reception (Saturn version), quoting Next Generation.',
      },
      {
        outlet: 'Game Informer',
        quote: 'A far better racing feel, with superior graphics to competing titles.',
        score: '9.25/10',
        source: 'Wikipedia, "Sega Rally Championship", Reception (Saturn version), quoting Game Informer.',
      },
    ],
  },

  'saturn:6': {
    description:
      "A flight game set inside dreams: the player steers Nights along set routes through surreal levels, looping and diving to collect items and rack up points, working against a strict time limit before returning to human form.",
    criticReception: [
      {
        outlet: 'Computer and Video Games',
        quote: 'One of the most sensational video games ever made!',
        score: '5/5',
        source: 'Wikipedia, "Nights into Dreams", Reception, quoting Computer and Video Games.',
      },
      {
        outlet: 'Entertainment Weekly',
        quote: 'Graceful acrobatic stunts offer a more compelling sensation of soaring than most flight simulators.',
        score: 'A',
        source: 'Wikipedia, "Nights into Dreams", Reception, quoting Entertainment Weekly.',
      },
    ],
  },

  'saturn:7': {
    description:
      'An on-rails shooter: the player rides an armoured flying dragon through fixed stages, rotating the camera to face threats from any direction and choosing between rapid fire and homing lock-on attacks against waves of enemies.',
    criticReception: [
      {
        outlet: 'Entertainment Weekly',
        quote: 'A lyrical and exhilarating epic.',
        source: 'Wikipedia, "Panzer Dragoon", Reception (1995), quoting Entertainment Weekly.',
      },
      {
        outlet: 'Next Generation',
        quote: 'Incredible story animation with brilliant, 3D flight graphics.',
        source: 'Wikipedia, "Panzer Dragoon", Reception (1995), quoting Next Generation.',
      },
    ],
  },

  'saturn:8': {
    description:
      'A light-gun rail shooter played from a first-person view: the player reloads a six-bullet chamber to take down armed criminals, avoiding civilian targets and earning bonus points for disarming rather than killing an enemy.',
    criticReception: [
      {
        outlet: 'Computer and Video Games',
        quote: 'A classy title, with excellent animation and strong gameplay in both single and multiplayer modes.',
        score: '96%',
        source: 'Wikipedia, "Virtua Cop", Reception (Saturn version), quoting Computer and Video Games.',
      },
      {
        outlet: 'GamePro',
        quote: 'A near-perfect arcade port, but too short and completely lacking in replay value.',
        score: '19.5/20',
        source: 'Wikipedia, "Virtua Cop", Reception (Saturn version), quoting GamePro.',
      },
    ],
  },

  'saturn:9': {
    description:
      "An arcade racer built for pure speed: the player drives the Hornet stock car against up to 39 rivals across three courses, with a difficulty that adapts to how well the player is actually driving.",
    criticReception: [
      {
        outlet: 'Computer and Video Games',
        quote: 'It does play better, mainly because you can ram the other cars off the track.',
        score: '96%',
        source: 'Wikipedia, "Daytona USA", Reception (Saturn version), quoting Computer and Video Games, comparing it favourably to PlayStation\'s Ridge Racer.',
      },
      {
        outlet: 'Next Generation',
        quote: 'While Daytona USA suffers from an accumulation of weaknesses, if it\'s a fast, thrilling racing game you\'re after, the Saturn conversion has a great deal to recommend.',
        score: '4/5',
        source: 'Wikipedia, "Daytona USA", Reception (Saturn version), quoting Next Generation.',
      },
    ],
  },

  'saturn:10': {
    description:
      "A role-playing game built around a semi-turn-based battle system: three action gauges charge in real time as the player controls Edge and his shape-shifting dragon, positioning around enemies to expose weak points before unleashing lasers or magical \"berserk\" attacks.",
    criticReception: [
      {
        outlet: 'GameSpot',
        quote: "Saga, in its own way, is so much more than Square's ultimate RPG.",
        score: '9.2/10',
        source: 'Wikipedia, "Panzer Dragoon Saga", Reception, quoting GameSpot.',
      },
      {
        outlet: 'Edge',
        quote: "It's a tragedy that the Saturn's standing will ensure Team Andromeda's adventure will enjoy a fraction of its rival's success.",
        score: '9/10',
        source: 'Wikipedia, "Panzer Dragoon Saga", Reception, quoting Edge Magazine.',
      },
    ],
  },

  // --- PlayStation --------------------------------------------------------

  'playstation:1': {
    description:
      'A racing simulator built on real, licensed cars: the player earns credits by winning races, buys and tunes vehicles with them, and has to pass driving-license tests before unlocking each new tier of Simulation Mode events.',
    criticReception: [
      {
        outlet: 'Edge',
        quote: 'Everything about Gran Turismo is a class act, and it raises the bar for racing games on almost every possible level.',
        score: '10/10',
        source: 'Wikipedia, "Gran Turismo (1997 video game)", Reception, quoting Edge.',
      },
      {
        outlet: 'IGN',
        quote: 'The best racing game to date.',
        score: '9.5/10',
        source: 'Wikipedia, "Gran Turismo (1997 video game)", Reception, quoting IGN.',
      },
    ],
  },

  'playstation:2': {
    description:
      "A turn-based Japanese role-playing game built on the Active Time Battle system: the player fights on time gauges rather than strict turns, using the Materia system's orbs, slotted into equipment, to grant characters new magic, summons and stat boosts.",
    criticReception: [
      {
        outlet: 'GameSpot',
        quote: 'Never before have technology, playability, and narrative combined as well as in Final Fantasy VII.',
        score: '9.5/10',
        source: 'Wikipedia, "Final Fantasy VII", Reception, quoting GameSpot.',
      },
      {
        outlet: 'GamePro',
        quote: 'The storytelling is dramatic, sentimental, and touching in a way that draws you into the characters.',
        score: '20/20',
        source: 'Wikipedia, "Final Fantasy VII", Reception, quoting GamePro.',
      },
    ],
  },

  'playstation:3': {
    description:
      'A racing simulator nearly tripling the original\'s roster to almost 650 cars across 27 tracks, including rally courses: the player still picks between an unrestricted Arcade Mode and a licence-gated Simulation Mode that ties new courses to trophies actually won.',
    criticReception: [
      {
        outlet: 'IGN',
        quote: 'GT2 is still as close as you can get to the real thing and always worth the drive.',
        score: '9.8/10',
        source: 'Wikipedia, "Gran Turismo 2", Reception, quoting IGN.',
      },
      {
        outlet: 'Official U.S. PlayStation Magazine',
        score: '5/5',
        source: 'Wikipedia, "Gran Turismo 2", Reception, citing Official U.S. PlayStation Magazine.',
      },
    ],
  },

  'playstation:4': {
    description:
      'A turn-based role-playing game built around the Junction system: the player draws and stocks spells from enemies and the environment, then junctions them onto a character\'s stats or attaches Guardian Forces for special battle commands, instead of levelling up through experience alone.',
    criticReception: [
      {
        outlet: 'Electronic Gaming Monthly',
        quote: "The game's character development is the best of any RPGs; Final Fantasy VIII is the pinnacle of its genre.",
        score: '95/100',
        source: 'Wikipedia, "Final Fantasy VIII", Reception, quoting Electronic Gaming Monthly.',
      },
      {
        outlet: 'Edge',
        quote: 'A far more accomplished game than FFVII, aesthetically astonishing, rarely less than compelling.',
        score: '9/10',
        source: 'Wikipedia, "Final Fantasy VIII", Reception, quoting Edge.',
      },
    ],
  },

  'playstation:5': {
    description:
      'A 3D fighting game built around a sidestep: the player can dodge in and out of the background as well as side to side, with jump heights tuned down so sidestepping, not jumping, is the strongest way to avoid a ground attack.',
    criticReception: [
      {
        outlet: 'GameSpot',
        quote:
          'Not much stands between Tekken 3 and a perfect 10 score. If the PlayStation exclusive characters were better and Force mode a bit more enthralling, it could have come closer to a perfect score.',
        score: '9.9/10',
        source: 'Wikipedia, "Tekken 3", Reception, quoting GameSpot.',
      },
      {
        outlet: 'Next Generation',
        quote:
          "There is no better fighting game, on this system or any other. It's clearly superior to the previous games in the series and a stunning value for Tekken aficionados.",
        score: '5/5',
        source: 'Wikipedia, "Tekken 3", Reception (PS1 version), quoting Next Generation.',
      },
    ],
  },

  'playstation:6': {
    description:
      "An action-adventure game built loosely around the novel: the player explores Hogwarts as Harry, casting spells and solving puzzles between classes, collecting items scattered through the castle grounds, and playing occasional Quidditch minigames.",
    criticReception: [
      {
        outlet: 'IGN',
        quote: 'The responsive controls and Zelda-like adventure elements appealed, though the game\'s scope is far from epic.',
        score: '8/10',
        source: 'Wikipedia, "Harry Potter and the Philosopher\'s Stone (PlayStation video game)", Reception, quoting Jeremy Conrad at IGN.',
      },
      {
        outlet: 'GameSpot',
        quote: 'Bland, blocky visuals, jagged polygons, and framerate issues, especially during Quidditch.',
        score: '4/10',
        source: 'Wikipedia, "Harry Potter and the Philosopher\'s Stone (PlayStation video game)", Reception, quoting Gerald Villoria at GameSpot: reception here was genuinely split, not uniformly positive.',
      },
    ],
  },

  'playstation:7': {
    description:
      'A 3D platformer built around Warp Rooms: the player picks levels from a hub rather than a fixed line, spinning and body-slamming through obstacle courses that include jetpack and rocket-surfboard stages alongside the usual jumping and crate-breaking.',
    criticReception: [
      {
        outlet: 'GameSpot',
        quote: "The Warp Room system is a great innovation for its flexibility, allowing players to tackle levels at their own pace.",
        score: '8.6/10',
        source: 'Wikipedia, "Crash Bandicoot 2: Cortex Strikes Back", Reception, quoting GameSpot.',
      },
      {
        outlet: 'Game Informer',
        quote: "The jetpack and rocket surfboard levels introduce unpredictable challenges, elevating the gameplay beyond the original's simpler mechanics.",
        score: '9/10',
        source: 'Wikipedia, "Crash Bandicoot 2: Cortex Strikes Back", Reception, quoting Game Informer.',
      },
    ],
  },

  'playstation:8': {
    description:
      "A 3D platformer built around time travel: the player steers Crash, and occasionally Coco, through a Time-Twisting Machine into different historical eras, mixing traditional platforming with vehicle stages on a jet-ski, a motorcycle and a biplane.",
    criticReception: [
      {
        outlet: 'GameSpot',
        quote: 'Easily the best Crash yet, and the most fun I\'ve had with a 3D platform game.',
        score: '8.9/10',
        source: 'Wikipedia, "Crash Bandicoot: Warped", Reception, quoting GameSpot.',
      },
      {
        outlet: 'Official U.S. PlayStation Magazine',
        quote: 'The best 2.5D platformer ever released.',
        score: '5/5',
        source: 'Wikipedia, "Crash Bandicoot: Warped", Reception, quoting Official U.S. PlayStation Magazine.',
      },
    ],
  },

  'playstation:9': {
    description:
      'A third-person action-adventure built around exploration: the player guides archaeologist Lara Croft through multi-layered ancient ruins across Peru, Greece, Egypt and Atlantis, solving environmental puzzles, platforming between ledges and fighting enemies along the way.',
    criticReception: [
      {
        outlet: 'IGN',
        score: '9.3/10',
        source: 'Wikipedia, "Tomb Raider (1996 video game)", Reception, citing IGN (PS version).',
      },
      {
        outlet: 'Next Generation',
        quote: "A thought-provoking, riveting action-adventure easily on par in intensity with any of Hollywood's finest efforts.",
        score: '5/5',
        source: 'Wikipedia, "Tomb Raider (1996 video game)", Reception, quoting Next Generation.',
      },
    ],
  },

  'playstation:10': {
    description:
      'A stealth action game built around avoiding fights rather than winning them: the player sneaks Solid Snake through a nuclear facility using an on-screen radar of enemy sightlines, calling for support over the codec radio, and taking down bosses to collect the key cards needed to progress.',
    criticReception: [
      {
        outlet: 'IGN',
        quote: "Closer to perfection than any other game in PlayStation's action genre: beautiful, engrossing, and innovative in every conceivable category.",
        score: '9.8/10',
        source: 'Wikipedia, "Metal Gear Solid (video game)", Reception, quoting IGN.',
      },
      {
        outlet: 'PlayStation Official Magazine – UK',
        quote: 'The best game ever made. Unputdownable and unforgettable.',
        score: '10/10',
        source: 'Wikipedia, "Metal Gear Solid (video game)", Reception, quoting PlayStation Official Magazine (UK).',
      },
    ],
  },

  // --- Nintendo 64 --------------------------------------------------------

  'n64:1': {
    description:
      "A 3D platformer set inside Princess Peach's Castle: the player runs, jumps and swims Mario through open courses accessed from paintings on the castle walls, collecting Power Stars for a range of different objectives, from boss fights to races to simple puzzles.",
    criticReception: [
      {
        outlet: 'GamePro',
        quote: 'The most visually impressive game of all time, for the combination of unprecedented technical performance and art design.',
        score: '5/5',
        source: 'Wikipedia, "Super Mario 64", Reception, quoting GamePro.',
      },
      {
        outlet: 'IGN',
        quote: 'The graphics simple but magnificent; it transitioned the series to 3D perfectly.',
        score: '9.8/10',
        source: 'Wikipedia, "Super Mario 64", Reception, quoting Doug Perry at IGN.',
      },
    ],
  },

  'n64:2': {
    description:
      'A kart racer for up to four players at once on a single console: the player races Mario characters across themed tracks, throwing shells and dropping banana peels, in Grand Prix, Versus and Battle modes shown on a split screen.',
    criticReception: [
      {
        outlet: 'Game Informer',
        quote: 'One of the best multiplayer games ever made.',
        score: '9.25/10',
        source: 'Wikipedia, "Mario Kart 64", Reception, quoting Game Informer.',
      },
      {
        outlet: 'GameSpot',
        quote: 'Too easy: simple and monotonous.',
        score: '6.4/10',
        source: 'Wikipedia, "Mario Kart 64", Reception, quoting GameSpot: reception here was genuinely split, not uniformly positive.',
      },
    ],
  },

  'n64:3': {
    description:
      "A first-person shooter built around the film: the player completes objective-based missions as James Bond, choosing between stealth or open combat with over 20 weapons, with a four-player split-screen deathmatch mode that outlived the campaign in most households.",
    criticReception: [
      {
        outlet: 'GameSpot',
        score: '9.8/10',
        source: 'Wikipedia, "GoldenEye 007", Reception, citing GameSpot.',
      },
      {
        outlet: 'IGN',
        quote: 'An immersive game which blends smart strategy gameplay with fast-action gunmanship.',
        score: '9.7/10',
        source: 'Wikipedia, "GoldenEye 007", Reception, quoting IGN.',
      },
    ],
  },

  'n64:4': {
    description:
      'A 3D action-adventure built around the Z-targeting lock-on system: the player explores Hyrule as Link, moving between a child and adult timeline to solve puzzles across interconnected dungeons on the way to stopping Ganondorf.',
    criticReception: [
      {
        outlet: 'GameSpot',
        quote: "A game that can't be called anything other than flawless.",
        score: '10/10',
        source: 'Wikipedia, "The Legend of Zelda: Ocarina of Time", Reception, quoting GameSpot.',
      },
      {
        outlet: 'IGN',
        quote: 'The new benchmark for interactive entertainment, that could shape the action RPG genre for years to come.',
        score: '10/10',
        source: 'Wikipedia, "The Legend of Zelda: Ocarina of Time", Reception, quoting IGN.',
      },
    ],
  },

  'n64:5': {
    description:
      "A crossover fighting game built on percentage damage instead of health bars: the higher a character's damage climbs, the further they fly when hit, and the player wins by knocking an opponent clean off the stage's open edges rather than draining a life bar.",
    criticReception: [
      {
        outlet: 'GameSpot',
        quote: "The game's real charm comes out in four-player mode; it is extremely simple to learn and easy to master.",
        score: '7.5/10',
        source: 'Wikipedia, "Super Smash Bros. (video game)", Reception, quoting GameSpot.',
      },
      {
        outlet: 'Next Generation',
        score: '5/5',
        source: 'Wikipedia, "Super Smash Bros. (video game)", Reception, citing Next Generation.',
      },
    ],
  },

  'n64:6': {
    description:
      'A 3D turn-based Pokémon battler built around the Transfer Pak: the player plugs in a real Game Boy cartridge to bring their own Pokémon from Red, Blue or Yellow onto the television in 3D, battling with the same 151 Pokémon the handheld games used.',
    criticReception: [
      {
        outlet: 'IGN',
        quote: 'The main appeal was seeing Pokémon in 3D, with connectivity allowing players to play the Game Boy games on a television.',
        score: '8.2/10',
        source: 'Wikipedia, "Pokémon Stadium", Reception, quoting IGN.',
      },
      {
        outlet: 'Game Revolution',
        quote: 'Gameplay quickly became repetitive unless players engaged religiously.',
        score: '6/10',
        source: 'Wikipedia, "Pokémon Stadium", Reception, quoting Game Revolution.',
      },
    ],
  },

  'n64:7': {
    description:
      'A 3D collectathon starring five different Kongs, each with their own abilities: the player explores eight themed worlds hunting for colour-coded bananas and golden bananas across 200 total objectives, in whatever order they choose.',
    criticReception: [
      {
        outlet: 'IGN',
        quote: "Nintendo's biggest and most ambitious Nintendo 64 game.",
        score: '9/10',
        source: 'Wikipedia, "Donkey Kong 64", Reception, quoting IGN.',
      },
      {
        outlet: 'Electronic Gaming Monthly',
        quote: 'Super Mario 64 breathed life into the 3D platforming genre; Donkey Kong 64 sucked it all out.',
        source: 'Wikipedia, "Donkey Kong 64", Reception (retrospective), quoting Electronic Gaming Monthly: opinion on the game has soured considerably since its release.',
      },
    ],
  },

  'n64:8': {
    description:
      "A kart racer built around an adventure-game overworld: the player unlocks five interconnected worlds by racing one of ten characters in a car, a hovercraft or an aeroplane, whichever suits the terrain, collecting balloon power-ups along the way.",
    criticReception: [
      {
        outlet: 'Edge',
        quote: 'Everything Mario Kart 64 should have been.',
        score: '9/10',
        source: 'Wikipedia, "Diddy Kong Racing", Reception, quoting Edge.',
      },
      {
        outlet: 'Electronic Gaming Monthly',
        quote: 'Beats Mario Kart 64 in every department.',
        source: 'Wikipedia, "Diddy Kong Racing", Reception, quoting Dan Hsu at Electronic Gaming Monthly.',
      },
    ],
  },

  'n64:9': {
    description:
      "A rail shooter with branching paths: the player pilots Fox McCloud's Arwing, and occasionally a Landmaster tank or a Blue Marine submarine, unlocking alternate routes by clearing stage objectives, with full voice acting carrying every mission's dialogue.",
    criticReception: [
      {
        outlet: 'GameSpot',
        quote: 'An instant classic, with amazing visuals and a huge amount of voice acting.',
        score: '8.3/10',
        source: 'Wikipedia, "Star Fox 64", Reception, quoting GameSpot.',
      },
      {
        outlet: 'Edge',
        quote: 'An instant classic, and a pleasure to look at.',
        score: '9/10',
        source: 'Wikipedia, "Star Fox 64", Reception, quoting Edge.',
      },
    ],
  },

  'n64:10': {
    description:
      "A 3D collectathon platformer: the player controls the bear Banjo and the bird Kazooie together, exploring themed worlds for jigsaw puzzle pieces and musical notes needed to unlock the next area.",
    criticReception: [
      {
        outlet: 'IGN',
        quote: "Features the best graphics we've seen on the console, it one-ups Mario 64 in terms of gameplay, it sounds astounding, and it may just be the most clever title we've ever played.",
        source: 'GameFAQs, review excerpt citing IGN\'s 1998 review of Banjo-Kazooie.',
      },
      {
        outlet: 'Metacritic',
        score: '92/100',
        source: 'Wikipedia, "Banjo-Kazooie (video game)", Reception, citing Metacritic\'s aggregate score.',
      },
    ],
  },

  // --- Dreamcast ----------------------------------------------------------

  'dreamcast:1': {
    description:
      'A 3D platformer told across six playable characters: the player explores hub-world "Adventure Fields" to find character-specific action stages, and can separately hatch and raise a Chao pet, carried between games on the Dreamcast\'s own memory card screen.',
    criticReception: [
      {
        outlet: 'GameSpot',
        quote: 'Redefined the possibilities of the platform genre.',
        score: '9.2/10',
        source: 'Wikipedia, "Sonic Adventure", Reception, quoting GameSpot.',
      },
      {
        outlet: 'IGN',
        quote: 'The most graphically impressive platform game released up to that date: engrossing, demanding, and utterly awe-inspiring.',
        score: '8.6/10',
        source: 'Wikipedia, "Sonic Adventure", Reception, quoting IGN.',
      },
    ],
  },

  'dreamcast:2': {
    description:
      "An open-world life sim wrapped around a revenge story: the player walks Ryo Hazuki through a fully simulated 1980s Japanese town, questioning NPCs on their own daily schedules, training in martial arts, and fighting through quick-time events tied directly to the story.",
    criticReception: [
      {
        outlet: 'IGN',
        quote: 'A gaming experience that no one, casual to hardcore gamer, can miss.',
        score: '9.7/10',
        source: 'Wikipedia, "Shenmue (video game)", Reception, quoting IGN.',
      },
      {
        outlet: 'GameSpot',
        quote: 'Revolutionary, and worth experiencing, provided you have the time to invest.',
        score: '7.8/10',
        source: 'Wikipedia, "Shenmue (video game)", Reception (US version), quoting GameSpot.',
      },
    ],
  },

  'dreamcast:3': {
    description:
      "A taxi-driving arcade game against the clock: the player picks up fares and races them to a marker before time runs out, chaining jumps and near-misses for a cash bonus, all set to a licensed soundtrack that kept the pace exactly as frantic as the driving.",
    criticReception: [
      {
        outlet: 'IGN',
        quote: 'The game was praised for capturing the arcade flavor, and possibly exceeding it by making the controls and execution of the crazy stunts easier to perform.',
        source: 'Wikipedia, "Crazy Taxi", Reception (Dreamcast version), citing IGN staff.',
      },
      {
        outlet: 'GameRankings',
        score: '90%',
        source: 'Wikipedia, "Crazy Taxi", Reception (Dreamcast version), citing GameRankings\' aggregate of 41 reviews.',
      },
    ],
  },

  'dreamcast:4': {
    description:
      "A survival horror game split between two playable characters: Claire Redfield for the first half and her brother Chris for the second, exploring a prison island and an Antarctic base, solving item-based puzzles and fighting zombies rendered against real-time 3D backgrounds instead of the series' usual pre-rendered ones.",
    criticReception: [
      {
        outlet: 'GameSpot',
        quote: "The best game yet for Dreamcast, in fact, one of the best games we've seen in the past couple of years.",
        score: '9.5/10',
        source: 'Wikipedia, "Resident Evil – Code: Veronica", Reception, quoting GameSpot.',
      },
      {
        outlet: 'IGN',
        quote: 'Some of the very best [graphics] on the Dreamcast.',
        score: '9.2/10',
        source: 'Wikipedia, "Resident Evil – Code: Veronica", Reception, quoting IGN.',
      },
    ],
  },

  'dreamcast:5': {
    description:
      'A platformer split into two parallel campaigns, Hero and Dark: Sonic and Shadow run at speed, Tails and Eggman fight in mechs, and Knuckles and Rouge hunt for treasure, three distinct styles of play across one shared story.',
    criticReception: [
      {
        outlet: 'IGN',
        quote: "If this is the last Sonic game in these declining Dreamcast years, it's satisfying to know that the DC didn't go out with a bang, but with a sonic boom.",
        score: '9.4/10',
        source: 'Wikipedia, "Sonic Adventure 2", Reception, quoting IGN.',
      },
      {
        outlet: 'GamePro',
        quote: 'Simply jaw-dropping beautiful, with detailed backgrounds and scenery.',
        score: '4.5/5',
        source: 'Wikipedia, "Sonic Adventure 2", Reception, quoting GamePro.',
      },
    ],
  },

  'dreamcast:6': {
    description:
      'A weapons-based 3D fighting game: the player picks a fighter defined by their weapon, a sword, an axe, a whip, and uses the "8-Way Run" system to move freely around the arena rather than along a single line, dodging and repositioning as much as blocking.',
    criticReception: [
      {
        outlet: 'IGN',
        score: '10/10',
        source: 'WebSearch summary citing IGN\'s 1999 review of Soulcalibur on Dreamcast: a rare perfect score the outlet\'s own editors felt compelled to justify in prose.',
      },
      {
        outlet: 'GameSpot',
        score: '10/10',
        source: "WebSearch summary citing GameSpot's 1999 review of Soulcalibur on Dreamcast, calling it worthy of a perfect score.",
      },
    ],
  },

  'dreamcast:7': {
    description:
      "An online action-RPG: the player teams up with up to three others to fight through the planet Ragol in real time, using a word-select chat system that automatically translates a set list of phrases so players speaking different languages could still coordinate.",
    criticReception: [
      {
        outlet: 'Computer and Video Games',
        quote: "Marks a step in a new direction for console adventures, and there's so much right with the game.",
        score: '5/5',
        source: 'Wikipedia, "Phantasy Star Online", Reception, quoting Computer and Video Games.',
      },
      {
        outlet: 'GameSpy',
        quote: 'The chat system was praised for making communication easy, especially between players speaking different languages.',
        score: '9.5/10',
        source: 'Wikipedia, "Phantasy Star Online", Reception, quoting GameSpy.',
      },
    ],
  },

  'dreamcast:8': {
    description:
      "An NFL simulation built with online play in mind: the player calls plays and runs a franchise offline or online against another Dreamcast owner, at a moment when online console sports was still a novelty rather than the default.",
    criticReception: [
      {
        outlet: 'GameSpot',
        score: '9.9/10',
        source: 'Wikipedia, "NFL 2K1", Reception, citing GameSpot.',
      },
      {
        outlet: 'GamePro',
        quote: 'Football fans looking for a realistic videogame should look no further. NFL 2K1 stands helmet and shoulderpads above the rest.',
        source: 'Wikipedia, "NFL 2K1", Reception, quoting GamePro.',
      },
    ],
  },

  'dreamcast:9': {
    description:
      "A skating game about graffiti, not racing: the player tags rival gang territory with spray paint while grinding and jumping through a cel-shaded Tokyo, evading police as the tags escalate from small stickers to full wall-sized pieces.",
    criticReception: [
      {
        outlet: 'IGN',
        quote: 'Looks like a moving cartoon, and every character, right down to the police dogs, is practically overflowing with personality.',
        score: '9.6/10',
        source: 'Wikipedia, "Jet Set Radio", Reception, quoting IGN.',
      },
      {
        outlet: 'GameSpot',
        quote: 'The pacing is excellent, with the beginning of the game being simple and slowly becoming more challenging.',
        score: '9/10',
        source: 'Wikipedia, "Jet Set Radio", Reception, quoting GameSpot.',
      },
    ],
  },

  'dreamcast:10': {
    description:
      'A tag-team fighting game with 56 characters drawn from Marvel and Capcom: the player picks a three-fighter squad and calls teammates in mid-combo for a Variable Assist, in matches built around constant character switching rather than a single one-on-one duel.',
    criticReception: [
      {
        outlet: 'IGN',
        quote: 'One of the best fighting games out there.',
        score: '9.3/10',
        source: 'Wikipedia, "Marvel vs. Capcom 2", Reception (Dreamcast version), quoting IGN.',
      },
      {
        outlet: 'Next Generation',
        quote: "The best 2D fighting experience available on a console.",
        score: '4/5',
        source: 'Wikipedia, "Marvel vs. Capcom 2", Reception (Dreamcast version), quoting Next Generation.',
      },
    ],
  },

  // --- PlayStation 2 --------------------------------------------------------

  'ps2:1': {
    description:
      'An open-world action game across three fictional cities modelled on California and Nevada: the player controls Carl "CJ" Johnson through gang territory wars, RPG-style stat building, and a story spanning far more ground than any previous entry in the series.',
    criticReception: [
      {
        outlet: 'IGN',
        score: '9.9/10',
        source: 'Wikipedia, "Grand Theft Auto: San Andreas", Reception, citing IGN.',
      },
      {
        outlet: 'Game Informer',
        quote: 'Entertainment at its best.',
        score: '10/10',
        source: 'Wikipedia, "Grand Theft Auto: San Andreas", Reception, quoting Game Informer.',
      },
    ],
  },

  'ps2:2': {
    description:
      'A racing simulator built as a PS2 launch showcase: the roster shrank from the previous game\'s 650 cars to a tighter 180, in exchange for a visual and physics leap the series used to prove what the new hardware could actually do.',
    criticReception: [
      {
        outlet: 'NextGen Magazine',
        quote: 'The best, most complete, and most impressive driving game so far, lapping its predecessors handily.',
        source: 'Wikipedia, "Gran Turismo 3: A-Spec", Reception, quoting Frank O\'Connor in NextGen Magazine.',
      },
      {
        outlet: 'Famitsu',
        score: '39/40',
        source: 'Wikipedia, "Gran Turismo 3: A-Spec", Reception, citing Famitsu.',
      },
    ],
  },

  'ps2:3': {
    description:
      "An open-world action game set in a fictionalised 1986 Miami: the player controls Tommy Vercetti, building a criminal empire across two islands through missions, driving and combat, in a story built around the era's own crime-film aesthetic.",
    criticReception: [
      {
        outlet: 'IGN',
        quote: 'One of the most impressive games of 2002.',
        score: '9.7/10',
        source: 'Wikipedia, "Grand Theft Auto: Vice City", Reception, quoting IGN.',
      },
      {
        outlet: 'Eurogamer',
        score: '10/10',
        source: 'Wikipedia, "Grand Theft Auto: Vice City", Reception, citing Eurogamer, which noted the game felt more alive than its predecessor.',
      },
    ],
  },

  'ps2:4': {
    description:
      'A racing simulator expanded past 700 cars from 80 manufacturers, spanning more than a century of automotive history: the player can now also shoot and edit their own photography of any car on any track through a dedicated Photo Mode.',
    criticReception: [
      {
        outlet: 'IGN',
        quote: 'This game would only be more real if a big spike shot out of the screen and skewered your head every time you crashed.',
        score: '9.5/10',
        source: 'Wikipedia, "Gran Turismo 4", Reception, quoting IGN.',
      },
      {
        outlet: 'The Sydney Morning Herald',
        quote: 'A peerless driving simulation that will test even professional drivers.',
        score: '5/5',
        source: 'Wikipedia, "Gran Turismo 4", Reception, quoting The Sydney Morning Herald.',
      },
    ],
  },

  'ps2:5': {
    description:
      'The game that turned "open-world 3D city" into its own genre: the player explores Liberty City across three interconnected islands, taking on missions and side activities on foot or by any stolen vehicle, with the city itself as much the subject as any single story mission.',
    criticReception: [
      {
        outlet: 'GameSpot',
        quote: "An incredible experience that shouldn't be missed by anyone.",
        score: '9.6/10',
        source: 'Wikipedia, "Grand Theft Auto III", Reception, quoting GameSpot.',
      },
      {
        outlet: 'Eurogamer',
        quote: 'A luscious, sprawling epic.',
        score: '10/10',
        source: 'Wikipedia, "Grand Theft Auto III", Reception, quoting Eurogamer.',
      },
    ],
  },

  'ps2:6': {
    description:
      "A 3D fighting game that walked back the previous entry's uneven stage terrain: the player picks from 32 fighters in matches built around a faster, more classic Tekken feel, with new cosmetic customisation bought using in-game currency.",
    criticReception: [
      {
        outlet: 'GameSpy',
        quote: 'Its mechanics superior to its predecessor, Tekken 4, due to the return of classic mechanics and the importance of each stage as well as faster combat.',
        score: '5/5',
        source: 'Wikipedia, "Tekken 5", Reception, quoting GameSpy.',
      },
      {
        outlet: 'IGN',
        score: '9.3/10',
        source: 'Wikipedia, "Tekken 5", Reception, citing IGN, which named it Best PS2 Fighting Game.',
      },
    ],
  },

  'ps2:7': {
    description:
      'A turn-based Japanese role-playing game built on the Conditional Turn-Based system: the player queues actions without time pressure, growing characters along the interconnected Sphere Grid rather than through flat levels, in the series\' first mainline entry with full voice acting throughout.',
    criticReception: [
      {
        outlet: 'IGN',
        quote: 'The best-looking game of the series, and arguably the best-playing as well.',
        score: '9.5/10',
        source: 'Wikipedia, "Final Fantasy X", Reception, quoting IGN.',
      },
      {
        outlet: 'Famitsu',
        score: '39/40',
        source: 'Wikipedia, "Final Fantasy X", Reception, citing Famitsu, which responded especially favourably to the storyline, graphics and movies.',
      },
    ],
  },

  'ps2:8': {
    description:
      "A stealth action game that swaps its returning hero for a rookie partway through: after a Solid Snake prologue, the player spends most of the game as Raiden, infiltrating an offshore facility against enemies now coordinating in AI-driven squads rather than patrolling alone.",
    criticReception: [
      {
        outlet: 'GameSpot',
        quote: 'It boils down to this: you must play Metal Gear Solid 2.',
        score: '9.6/10',
        source: 'Wikipedia, "Metal Gear Solid 2: Sons of Liberty", Reception, quoting GameSpot.',
      },
      {
        outlet: 'Next Generation',
        quote: 'Everything we hoped it would be, and more. Great action, an enthralling story, and plenty of surprises makes this the PS2 game.',
        score: '5/5',
        source: 'Wikipedia, "Metal Gear Solid 2: Sons of Liberty", Reception, quoting Next Generation.',
      },
    ],
  },

  'ps2:9': {
    description:
      "A turn-based role-playing game built on the Active Dimension Battle system: enemies are visible directly in the world rather than triggering random encounters, and the player can program a Gambit system of conditional actions for each character to act on automatically between direct commands.",
    criticReception: [
      {
        outlet: 'Eurogamer',
        quote: 'Praised its seamless transitions between full motion video segments and the in-game engine.',
        score: '10/10',
        source: 'Wikipedia, "Final Fantasy XII", Reception, quoting Eurogamer.',
      },
      {
        outlet: 'Famitsu',
        score: '40/40',
        source: 'Wikipedia, "Final Fantasy XII", Reception, citing Famitsu, praising the graphics, scenarios and system.',
      },
    ],
  },

  'ps2:10': {
    description:
      'An action-RPG crossover: the player controls Sora, alongside Donald Duck and Goofy, fighting through worlds built from classic Disney films to seal each one\'s Keyhole and protect it from the Heartless.',
    criticReception: [
      {
        outlet: 'IGN',
        score: '9/10',
        source: 'Wikipedia, "Kingdom Hearts (video game)", Reception, citing IGN, which also named it Best Art Style/Direction of 2003.',
      },
      {
        outlet: 'GameSpot',
        quote: 'The concept seemed impossible, but was pulled off quite well.',
        score: '8.2/10',
        source: 'Wikipedia, "Kingdom Hearts (video game)", Reception, quoting GameSpot, which named it Best Crossover Since Capcom vs. SNK.',
      },
    ],
  },

  // --- Xbox -----------------------------------------------------------------

  'xbox:1': {
    description:
      'A first-person shooter continuing Master Chief\'s story, now split between his campaign and the Covenant Elite known as the Arbiter: the player can dual-wield two weapons at once, trading grenades and accuracy for raw firepower, across a campaign built to hand off directly into Xbox Live multiplayer.',
    criticReception: [
      {
        outlet: 'IGN',
        quote: 'The best on Xbox Live at the time.',
        score: '9.8/10',
        source: 'Wikipedia, "Halo 2", Reception, quoting IGN, on the multiplayer.',
      },
      {
        outlet: 'Game Informer',
        score: '10/10',
        source: 'Wikipedia, "Halo 2", Reception, citing Game Informer, which rated it higher than the original Halo for its enhanced multiplayer and less repetitive gameplay.',
      },
    ],
  },

  'xbox:2': {
    description:
      "A first-person shooter starring Master Chief against an alien Covenant: the player fights on foot or in drivable vehicles that shift the view to third-person while piloted, tracking allies and enemies with a HUD motion tracker across a campaign built to work equally well solo or in four-player split-screen.",
    criticReception: [
      {
        outlet: 'Edge',
        quote: "The most important launch game for any console, ever. GoldenEye was the standard for multiplayer console combat. It has been surpassed.",
        score: '10/10',
        source: 'Wikipedia, "Halo: Combat Evolved", Reception, quoting Edge.',
      },
      {
        outlet: 'GameSpot',
        quote: "Halo's single-player game is worth picking up an Xbox for alone: easily one of the best shooters ever, on any platform.",
        score: '9.7/10',
        source: 'Wikipedia, "Halo: Combat Evolved", Reception, quoting GameSpot.',
      },
    ],
  },

  'xbox:3': {
    description:
      "A stealth game built around a real light meter: the player sneaks Sam Fisher through dynamically lit environments, shooting out lamps and cameras, using night vision and thermal goggles to move safely through the dark that the game's own graphics chip was built to render convincingly.",
    criticReception: [
      {
        outlet: 'GameSpot',
        quote: 'Hands down the best lighting effects seen in any game to date.',
        score: '8.6/10',
        source: "Wikipedia, \"Tom Clancy's Splinter Cell (video game)\", Reception (Xbox version), quoting GameSpot.",
      },
      {
        outlet: 'IGN',
        score: '9.6/10',
        source: "Wikipedia, \"Tom Clancy's Splinter Cell (video game)\", Reception (Xbox version), citing IGN.",
      },
    ],
  },

  'xbox:4': {
    description:
      "A role-playing game where every choice leaves a visible mark: the player's hero physically ages and scars from combat, and townspeople react differently depending on whether their reputation has skewed toward heroism or villainy over the course of the story.",
    criticReception: [
      {
        outlet: 'IGN',
        quote: 'Combat becomes its own minigame, with the goal not solely to beat a foe, but to beat it with skill and get the most from every fight.',
        score: '9.3/10',
        source: 'Wikipedia, "Fable (2004 video game)", Reception, quoting IGN.',
      },
      {
        outlet: 'USA Today',
        quote: 'Should satisfy you with its incredible depth, open-ended game play, and a solid story that gets even better about half-way through.',
        source: 'Wikipedia, "Fable (2004 video game)", Reception, quoting USA Today.',
      },
    ],
  },

  'xbox:5': {
    description:
      'A role-playing game set thousands of years before the films: the player builds a Jedi or Sith character through d20-based combat, with light-side and dark-side choices that shape the story toward one of gaming\'s most cited plot twists.',
    criticReception: [
      {
        outlet: 'Game Informer',
        score: '95/100',
        source: 'Metacritic, aggregate critic score page for "Star Wars: Knights of the Old Republic" (Xbox, 2003), citing Game Informer.',
      },
      {
        outlet: 'GameSpot',
        score: '91/100',
        source: 'Metacritic, aggregate critic score page for "Star Wars: Knights of the Old Republic" (Xbox, 2003), citing GameSpot.',
      },
    ],
  },

  'xbox:6': {
    description:
      "A racer scored on style, not just speed: the player earns Kudos points for drifts, near-misses and clean overtakes rather than lap time alone, with online leaderboards built into the game from the start rather than added later.",
    criticReception: [
      {
        outlet: 'IGN',
        quote: 'One of the finest racing games ever created for any console.',
        score: '9.5/10',
        source: 'Wikipedia, "Project Gotham Racing 2", Reception, quoting IGN.',
      },
      {
        outlet: 'GameSpy',
        quote: 'Simply the best arcade racer available.',
        score: '5/5',
        source: 'Wikipedia, "Project Gotham Racing 2", Reception, quoting GameSpy.',
      },
    ],
  },

  'xbox:7': {
    description:
      "A racing simulator built around deep car customisation: the player tunes over 230 licensed cars' engines, aerodynamics and chassis settings, racing on real and fictional tracks against a Drivatar AI that learns and imitates the player's own driving habits.",
    criticReception: [
      {
        outlet: 'GameSpot',
        source: 'Wikipedia, "Forza Motorsport (2005 video game)", Reception, citing Brian Ekberg at GameSpot, on balancing accessibility with depth.',
        score: '9.2/10',
      },
      {
        outlet: 'The Times',
        quote: 'The really ingenious element is the Drivatar AI, in which the computer learns your driving technique.',
        score: '5/5',
        source: 'Wikipedia, "Forza Motorsport (2005 video game)", Reception, quoting The Times.',
      },
    ],
  },

  'xbox:8': {
    description:
      'An open-world action-RPG set on the island of Vvardenfell: the player can ignore the main quest entirely to join factions, explore, or simply wander, with skills that improve through use rather than through fixed experience-based levelling.',
    criticReception: [
      {
        outlet: 'IGN',
        score: '9.4/10',
        source: 'Wikipedia, "The Elder Scrolls III: Morrowind", Reception (Xbox version), citing IGN, which judged the port\'s detail and open-endedness outweighed its technical compromises.',
      },
      {
        outlet: 'GameSpot',
        score: 'Named Best Xbox RPG',
        source: 'Wikipedia, "The Elder Scrolls III: Morrowind", Reception (Xbox version), citing GameSpot.',
      },
    ],
  },

  'xbox:9': {
    description:
      'A hack-and-slash action game built for precision over memorization: the player controls ninja Ryu Hayabusa through acrobatic, upgradeable-weapon combat that punishes mistimed attacks far more harshly than most contemporary Xbox titles.',
    criticReception: [
      {
        outlet: 'GameSpot',
        quote: 'One of the best, most challenging action adventure games ever made.',
        score: '9.4/10',
        source: 'Wikipedia, "Ninja Gaiden (2004 video game)", Reception, quoting GameSpot.',
      },
      {
        outlet: 'IGN',
        quote: 'Sets a new standard for third-person action games in terms of length, depth, speed, and gore.',
        score: '9.4/10',
        source: 'Wikipedia, "Ninja Gaiden (2004 video game)", Reception, quoting IGN.',
      },
    ],
  },

  'xbox:10': {
    description:
      "A skating and graffiti game built for speed: the player boosts across a larger, more open Tokyo than the original Dreamcast game, tagging territory and outrunning police with a simplified graffiti system built around sustained momentum rather than the original's slower tagging.",
    criticReception: [
      {
        outlet: 'IGN',
        quote: 'One of the coolest titles around, though it fails to reach classic status because it was not enough of a challenge.',
        score: '9.1/10',
        source: 'Wikipedia, "Jet Set Radio Future", Reception, quoting IGN.',
      },
      {
        outlet: 'GameSpot',
        quote: 'One of the better Xbox games to date.',
        score: '8.7/10',
        source: 'Wikipedia, "Jet Set Radio Future", Reception, quoting GameSpot, which argued, against IGN, that the game offered a serious challenge.',
      },
    ],
  },

  // --- GameCube ---------------------------------------------------------

  'gamecube:1': {
    description:
      'A crossover fighting game built on percentage damage: the roster grew to 25 characters across Nintendo franchises, and higher damage means more knockback, so the goal is to send an opponent flying off the stage rather than drain a health bar.',
    criticReception: [
      {
        outlet: 'IGN',
        quote: 'In an entirely different league than the N64 version.',
        score: '9.6/10',
        source: 'Wikipedia, "Super Smash Bros. Melee", Reception, quoting IGN.',
      },
      {
        outlet: 'Eurogamer',
        score: '10/10',
        source: 'Wikipedia, "Super Smash Bros. Melee", Reception, citing Eurogamer, which praised the roster and its nostalgic pull.',
      },
    ],
  },

  'gamecube:2': {
    description:
      'A kart racer built around two riders sharing one kart: the front driver steers while the back rider throws items, and the pair can swap seats mid-race, with any character able to team up with any other rather than being locked to a fixed partner.',
    criticReception: [
      {
        outlet: 'Eurogamer',
        quote: 'One of the finest pieces of electronic entertainment ever developed.',
        score: '9/10',
        source: 'Wikipedia, "Mario Kart: Double Dash!!", Reception, quoting Eurogamer.',
      },
      {
        outlet: 'Nintendo Power',
        quote: '3-D perfection, with controls and game mechanics that rival those of any GameCube racing game.',
        score: '5/5',
        source: 'Wikipedia, "Mario Kart: Double Dash!!", Reception, quoting Nintendo Power.',
      },
    ],
  },

  'gamecube:3': {
    description:
      'A 3D platformer set on one tropical island: the player collects 120 Shine Sprites as Mario, using F.L.U.D.D., a water-jet backpack with separate nozzles for cleaning graffiti, hovering across gaps, launching upward and sprinting, each drawing down a water tank that has to be refilled.',
    criticReception: [
      {
        outlet: 'Game Informer',
        quote: 'The best Mario game to date.',
        score: '9.75/10',
        source: 'Wikipedia, "Super Mario Sunshine", Reception, quoting Game Informer.',
      },
      {
        outlet: 'GameSpot',
        quote: 'Mere gimmicks.',
        score: '8/10',
        source: "Wikipedia, \"Super Mario Sunshine\", Reception, quoting Jeff Gerstmann at GameSpot on FLUDD and Yoshi: GameSpot also named it 2002's most disappointing GameCube game, reception was genuinely split.",
      },
    ],
  },

  'gamecube:4': {
    description:
      "An action-adventure set on a wide, sail-able ocean: the player pilots the King of Red Lions between islands as Link, using the titular baton to conduct wind-changing melodies, rendered in a cel-shaded art style the series had never used before.",
    criticReception: [
      {
        outlet: 'IGN',
        quote: "Nintendo's execution of cel-shading represented the pinnacle of the GameCube's capabilities.",
        score: '9.6/10',
        source: 'Wikipedia, "The Legend of Zelda: The Wind Waker", Reception, quoting Matt Casamassina at IGN.',
      },
      {
        outlet: 'Game Informer',
        quote: "The gameplay expanded upon that in its predecessors to become far greater, deeper, and more complex.",
        score: '10/10',
        source: 'Wikipedia, "The Legend of Zelda: The Wind Waker", Reception, quoting Andrew Reiner at Game Informer.',
      },
    ],
  },

  'gamecube:5': {
    description:
      'A launch title built around a vacuum cleaner: the player stuns ghosts with a flashlight to expose their hearts, as Luigi, then sucks them up with the Poltergust 3000, working through a haunted mansion Professor E. Gadd sent him to investigate.',
    criticReception: [
      {
        outlet: 'Game Informer',
        quote: "Brilliant and up to par with Miyamoto's best.",
        score: '9/10',
        source: 'Wikipedia, "Luigi\'s Mansion", Reception, quoting Game Informer.',
      },
      {
        outlet: 'GameSpot',
        quote: 'Features some refreshing ideas and flashes of brilliance, though the short amount of time it takes to complete it makes it a hard recommendation.',
        score: '7.9/10',
        source: "Wikipedia, \"Luigi's Mansion\", Reception, quoting GameSpot.",
      },
    ],
  },

  'gamecube:6': {
    description:
      'A first-person adventure built without turning into a shooter: the player explores the planet Tallon IV as Samus Aran, switching between visors, including thermal and X-ray, to solve puzzles and find secrets, and dropping into a Morph Ball for tight spaces the armoured suit cannot fit through.',
    criticReception: [
      {
        outlet: 'IGN',
        quote: 'Innovative gameplay centered on exploration, in contrast with action games such as Halo, while staying faithful to the Metroid formula.',
        score: '9.8/10',
        source: 'Wikipedia, "Metroid Prime", Reception, quoting IGN.',
      },
      {
        outlet: 'GameSpot',
        quote: 'An immersive atmosphere, with detailed graphics, special effects, and varied environments.',
        score: '9.7/10',
        source: 'Wikipedia, "Metroid Prime", Reception, quoting GameSpot.',
      },
    ],
  },

  'gamecube:7': {
    description:
      "A Pokémon game built around theft, not capture: the player \"snags\" corrupted Shadow Pokémon from rival trainers rather than catching wild ones, then purifies each one's darkened heart over the course of the story.",
    criticReception: [
      {
        outlet: 'Computer and Video Games',
        score: '9/10',
        source: 'Wikipedia, "Pokémon Colosseum", Reception, citing Computer and Video Games, the most positive score among reviewers.',
      },
      {
        outlet: 'IGN',
        quote: 'Does a decent enough job, though it\'s a bit more linear and straightforward than expected.',
        score: '7.5/10',
        source: 'Wikipedia, "Pokémon Colosseum", Reception, quoting IGN.',
      },
    ],
  },

  'gamecube:8': {
    description:
      "An action-adventure that began life as a different game entirely: originally an original Rare IP called Dinosaur Planet, reworked mid-development into a Star Fox title, mixing melee combat with a magic staff in Zelda-like exploration segments with occasional Arwing rail-shooter stages.",
    criticReception: [
      {
        outlet: 'IGN',
        quote: 'A perfect companion to The Legend of Zelda series, though fans expecting a true Star Fox experience akin to the older games are in for a disappointment.',
        score: '9/10',
        source: 'Wikipedia, "Star Fox Adventures", Reception, quoting IGN.',
      },
      {
        outlet: 'GameSpot',
        quote: 'Simplistic, though good looking and not frustrating.',
        score: '8.3/10',
        source: 'Wikipedia, "Star Fox Adventures", Reception, quoting GameSpot, on the combat.',
      },
    ],
  },

  'gamecube:9': {
    description:
      "A third-person shooter that moved the camera over the shoulder: the player controls Leon S. Kennedy with precision targeting of specific enemy body parts, and can even shoot down incoming projectiles, in a redesign that pushed the whole series away from its original fixed-camera roots.",
    criticReception: [
      {
        outlet: 'IGN',
        quote: 'For once, the characters are believable because Capcom has hired competent actors to supply their voices. Leon in particular is very well produced.',
        score: '9.8/10',
        source: 'Wikipedia, "Resident Evil 4", Reception (GameCube version), quoting IGN.',
      },
      {
        outlet: 'Nintendo Power',
        score: '10/10',
        source: 'Wikipedia, "Resident Evil 4", Reception (GameCube version), citing Nintendo Power, the highest score among major outlets.',
      },
    ],
  },

  'gamecube:10': {
    description:
      "An action-adventure where Link turns into a wolf inside the Twilight Realm: losing his sword and shield in exchange for speed, digging and sharpened senses, in a version of Hyrule that shipped in its original, unmirrored orientation on GameCube (the simultaneous Wii release was flipped left-to-right for its right-handed sword controls).",
    criticReception: [
      {
        outlet: 'Computer and Video Games',
        quote: "The atmosphere was superior to that of any previous Zelda game.",
        score: '10/10',
        source: 'Wikipedia, "The Legend of Zelda: Twilight Princess", Reception (GameCube version), quoting Computer and Video Games.',
      },
      {
        outlet: 'IGN',
        score: '9.5/10',
        source: 'Wikipedia, "The Legend of Zelda: Twilight Princess", Reception (GameCube version), citing IGN, which noted blurry textures and low-resolution characters alongside its praise.',
      },
    ],
  },

  // --- Xbox 360 -----------------------------------------------------------

  'xbox-360:1': {
    description:
      'A collection of five Kinect minigames for full-body play: the player uses their entire body in front of the camera to plug underwater leaks, pop bubbles in zero gravity, and complete other short, physical challenges, alone or with a second player.',
    criticReception: [
      {
        outlet: 'IGN',
        quote: 'A good demonstration of what the Kinect is capable of.',
        score: '6.5/10',
        source: 'Wikipedia, "Kinect Adventures!", Reception, quoting IGN.',
      },
      {
        outlet: 'Giant Bomb',
        score: '3/5',
        source: 'Wikipedia, "Kinect Adventures!", Reception, citing Giant Bomb, which valued the launch experience despite reservations about depth and replayability.',
      },
    ],
  },

  'xbox-360:2': {
    description:
      'An open-world action game with three playable protagonists: the player switches between Michael, Franklin and Trevor mid-mission and mid-exploration, each with a different special ability, across one shared map and story.',
    criticReception: [
      {
        outlet: 'IGN',
        quote: 'One of the very best video games ever made.',
        score: '10/10',
        source: 'Wikipedia, "Grand Theft Auto V", Reception, quoting IGN.',
      },
      {
        outlet: 'Edge',
        quote: 'A remarkable achievement in open-world design and storytelling.',
        score: '10/10',
        source: 'Wikipedia, "Grand Theft Auto V", Reception, quoting Edge.',
      },
    ],
  },

  'xbox-360:3': {
    description:
      'A first-person shooter split into a three-act campaign and a heavily revised multiplayer suite: the player fights through set-piece missions solo, and online through a reworked Pointstreak system, a Survival mode against escalating waves, and new modes including Kill Confirmed.',
    criticReception: [
      {
        outlet: 'IGN',
        quote: 'Great multiplayer, fun campaign, tons of content, but also a forgettable story.',
        score: '9.0/10',
        source: 'Wikipedia, "Call of Duty: Modern Warfare 3", Reception, quoting IGN.',
      },
      {
        outlet: 'GameSpot',
        quote: "The series' signature thrills have lost some of their luster; fortunately, it's also utterly engrossing and immensely satisfying.",
        score: '8.5/10',
        source: 'Wikipedia, "Call of Duty: Modern Warfare 3", Reception, quoting GameSpot.',
      },
    ],
  },

  'xbox-360:4': {
    description:
      "A first-person shooter set during the Cold War: the player relives CIA operative Alex Mason's classified missions across Cuba, Vietnam and the Soviet Union, with a separate four-player Zombies mode that fights off waves of the undead for points rather than following the campaign at all.",
    criticReception: [
      {
        outlet: 'GameSpot',
        quote: "Bears the series' standard superbly, delivering an engrossing campaign and exciting competitive multiplayer.",
        score: '9/10',
        source: 'Wikipedia, "Call of Duty: Black Ops", Reception, quoting GameSpot.',
      },
      {
        outlet: 'The Guardian',
        quote: 'The meaty kick of the guns, the blistering pace of the action and the sterling soundtrack of explosions, gunshots and whistling bullets.',
        score: '5/5',
        source: 'Wikipedia, "Call of Duty: Black Ops", Reception, quoting The Guardian.',
      },
    ],
  },

  'xbox-360:5': {
    description:
      "A first-person shooter marketed as the trilogy's finale: the player fights on foot and in vehicles as Master Chief, now with a Forge editor that lets the community build and share their own multiplayer maps directly on the console.",
    criticReception: [
      {
        outlet: 'IGN',
        quote: 'The Forge and the replay functionality raise the bar for console shooters so high, it may never be surpassed.',
        score: '9.5/10',
        source: 'Wikipedia, "Halo 3", Reception, quoting IGN.',
      },
      {
        outlet: 'GameSpot',
        quote: 'Every type of Halo fan, from the hardcore to the casual to the brand new, will find something to satisfy them.',
        score: '9.5/10',
        source: 'Wikipedia, "Halo 3", Reception, quoting GameSpot.',
      },
    ],
  },

  'xbox-360:6': {
    description:
      'A first-person shooter with branching Strike Force missions: player choices carry permanent consequences across a story split between a 2025 near-future and 1980s flashbacks, with customisable loadouts chosen before each mission rather than fixed by the campaign.',
    criticReception: [
      {
        outlet: 'IGN',
        quote: 'A good example of how to evolve an annualized franchise.',
        score: '9.3/10',
        source: 'Wikipedia, "Call of Duty: Black Ops II", Reception, quoting Anthony Gallegos at IGN.',
      },
      {
        outlet: 'Game Informer',
        quote: 'Had me talking to others about their experiences in a way I had never done before.',
        score: '8.5/10',
        source: 'Wikipedia, "Call of Duty: Black Ops II", Reception, quoting Dan Ryckert at Game Informer, on the branching storylines.',
      },
    ],
  },

  'xbox-360:7': {
    description:
      "A console port of the PC sandbox: the player mines, crafts and builds in a block world redesigned with a controller-friendly crafting menu and in-game tutorials, adding split-screen local multiplayer the PC version never had, though its worlds are finite rather than infinite.",
    criticReception: [
      {
        outlet: 'Eurogamer',
        score: '9/10',
        source: 'Wikipedia, "Minecraft", Reception (Xbox 360 Edition), citing Eurogamer.',
      },
      {
        outlet: 'GameSpot',
        score: '7.0/10',
        source: 'Wikipedia, "Minecraft", Reception (Xbox 360 Edition), citing GameSpot.',
      },
    ],
  },

  'xbox-360:8': {
    description:
      'A first-person shooter prequel set before the original Halo: the player controls Noble Six, a member of an elite Spartan squad, defending the human colony of Reach against an invasion the story has already told players cannot be won.',
    criticReception: [
      {
        outlet: 'GamePro',
        quote: "A blistering, breathless crescendo to a decade's worth of work.",
        score: '5/5',
        source: 'Wikipedia, "Halo: Reach", Reception, quoting GamePro.',
      },
      {
        outlet: 'IGN US',
        quote: "Not another rehash, though franchise veterans would feel immediately at home.",
        score: '9.5/10',
        source: 'Wikipedia, "Halo: Reach", Reception, quoting IGN US.',
      },
    ],
  },

  'xbox-360:9': {
    description:
      "A first-person shooter marking a change of developer: the first Halo built by 343 Industries rather than series creator Bungie, sending Master Chief against Covenant splinter factions and a new mechanical enemy race, the Prometheans.",
    criticReception: [
      {
        outlet: 'IGN',
        quote: 'A bar-raising triumph for the entire first-person shooter genre.',
        score: '9.8/10',
        source: 'Wikipedia, "Halo 4", Reception, quoting IGN.',
      },
      {
        outlet: 'GameSpot',
        quote: 'A thrilling and emotional return of Master Chief and Cortana.',
        score: '9/10',
        source: 'Wikipedia, "Halo 4", Reception, quoting GameSpot.',
      },
    ],
  },

  'xbox-360:10': {
    description:
      'A third-person shooter built around cover: the player slides between waist-high walls and pillars, popping out to fire blind or aimed shots, in a war against the subterranean Locust Horde that set the visual and mechanical template most console shooters copied for the rest of the generation.',
    criticReception: [
      {
        outlet: 'GameSpot',
        quote: "An outstanding technical achievement, but in addition to looking and sounding amazing, it's a seriously awesome action game.",
        score: '9.6/10',
        source: 'Wikipedia, "Gears of War", Reception, quoting GameSpot.',
      },
      {
        outlet: 'IGN',
        score: '9.4/10',
        source: 'Wikipedia, "Gears of War", Reception, citing IGN.',
      },
    ],
  },

  // --- PlayStation 3 --------------------------------------------------------

  'ps3:1': {
    description:
      'An open-world action game with three playable protagonists: the player switches between Michael, Franklin and Trevor mid-mission and mid-exploration, each with a different special ability, across one shared map and story.',
    criticReception: [
      {
        outlet: 'Play',
        quote: 'Generation-defining, and exceptional.',
        score: '97/100',
        source: 'Wikipedia, "Grand Theft Auto V", Reception, quoting Play.',
      },
      {
        outlet: 'GameSpot',
        quote: 'Trevor was a terrific character: horrible, terrifying, psychotic.',
        score: '9/10',
        source: 'Wikipedia, "Grand Theft Auto V", Reception, quoting GameSpot.',
      },
    ],
  },

  'ps3:2': {
    description:
      "A racing simulator five years in the making: the roster grew past 1,000 cars across 31 locations, with the series' first real damage modelling, deformation and mechanical failure included, alongside 16-player online racing and dynamic weather and time of day.",
    criticReception: [
      {
        outlet: 'IGN',
        quote: 'Its handling model proudly restores Gran Turismo upon the driving throne.',
        score: '8.5/10',
        source: 'Wikipedia, "Gran Turismo 5", Reception, quoting IGN.',
      },
      {
        outlet: 'GamePro',
        quote: 'An amazingly deep racing game that offers an almost mind-boggling amount of racing challenges, cars, tracks and features.',
        score: '4.5/5',
        source: 'Wikipedia, "Gran Turismo 5", Reception, quoting GamePro.',
      },
    ],
  },

  'ps3:3': {
    description:
      'A third-person action-adventure closing out the original trilogy: the player controls Nathan Drake through platforming, gunfights and puzzles across the most elaborate set pieces the series had built yet, alongside a separate competitive and cooperative multiplayer suite.',
    criticReception: [
      {
        outlet: 'IGN',
        quote: "From start to finish, single player to multiplayer, this game sings. The characters, the graphics, the sound, the story, they're all top-notch.",
        score: '10/10',
        source: "Wikipedia, \"Uncharted 3: Drake's Deception\", Reception, quoting IGN.",
      },
      {
        outlet: 'PlayStation Official Magazine – UK',
        quote: 'A visual, technical and narrative tour de force that takes the sky-high expectations of an entire community and blows them out the back of a jumbo jet.',
        score: '10/10',
        source: "Wikipedia, \"Uncharted 3: Drake's Deception\", Reception, quoting PlayStation Official Magazine (UK).",
      },
    ],
  },

  'ps3:4': {
    description:
      "A third-person survival-action game: the player fights infected creatures and hostile humans as Joel, escorting Ellie across a ruined United States, crafting improvised weapons and supplies from scavenged parts rather than finding them ready-made.",
    criticReception: [
      {
        outlet: 'IGN',
        quote: 'One of the first game\'s standout features.',
        score: '10/10',
        source: 'Wikipedia, "The Last of Us", Reception, quoting Colin Moriarty at IGN, on the story.',
      },
      {
        outlet: 'GameSpot',
        score: '8/10',
        source: 'Wikipedia, "The Last of Us", Reception, citing GameSpot.',
      },
    ],
  },

  'ps3:5': {
    description:
      "A third-person action-adventure that pushed the Cell processor past what most studios had managed by that point: the player controls Nathan Drake through cover-based gunfights, ledge-climbing platforming and environmental puzzles across a story built around a series of increasingly elaborate set pieces.",
    criticReception: [
      {
        outlet: 'IGN',
        quote: 'Fantastic, with stunning visuals and one of the best multiplayer experiences.',
        score: '9.5/10',
        source: 'Wikipedia, "Uncharted 2: Among Thieves", Reception, quoting IGN.',
      },
      {
        outlet: 'Eurogamer',
        score: '10/10',
        source: 'Wikipedia, "Uncharted 2: Among Thieves", Reception, citing Eurogamer.',
      },
    ],
  },

  'ps3:6': {
    description:
      "A stealth action game closing out Solid Snake's own storyline: the player uses the OctoCamo suit to blend into nearby surfaces for near-total concealment, while managing a Psyche Meter that tracks the character's stress, across a single disc the PS3's own storage made possible without the swapping earlier entries needed.",
    criticReception: [
      {
        outlet: 'GameSpot',
        quote: 'The most technically stunning video game ever made.',
        score: '10/10',
        source: 'Wikipedia, "Metal Gear Solid 4: Guns of the Patriots", Reception, quoting GameSpot.',
      },
      {
        outlet: 'IGN USA',
        quote: 'One of the best games ever made.',
        score: '10/10',
        source: 'Wikipedia, "Metal Gear Solid 4: Guns of the Patriots", Reception, quoting IGN USA.',
      },
    ],
  },

  'ps3:7': {
    description:
      "An open-world action game expanding the Arkham formula: the player fights through Gotham's own walled-off prison district as Batman, using an improved Freeflow combat system that lets him counter several attackers at once, mixed with stealth and detective-vision puzzle solving.",
    criticReception: [
      {
        outlet: 'Game Informer',
        quote: 'The best licensed video game ever made.',
        score: '10/10',
        source: 'Wikipedia, "Batman: Arkham City", Reception, quoting Game Informer.',
      },
      {
        outlet: 'IGN',
        quote: 'The voice acting, the challenges, the amazing opening, the unbelievable ending and the feeling of the Dark Knight.',
        score: '9.5/10',
        source: 'Wikipedia, "Batman: Arkham City", Reception, quoting IGN.',
      },
    ],
  },

  'ps3:8': {
    description:
      "A paid preview build released years ahead of the full game: the player races a limited roster in the series' first 16-car online multiplayer, with a real cockpit view carrying working instruments, standing in for a full Gran Turismo 5 that was still years from release.",
    criticReception: [
      {
        outlet: 'Eurogamer',
        score: '8/10',
        source: 'Wikipedia, "Gran Turismo 5 Prologue", Reception, citing Tom Bramwell at Eurogamer.',
      },
      {
        outlet: 'Hyper Magazine',
        quote: 'Looking and feeling fantastic.',
        source: 'Wikipedia, "Gran Turismo 5 Prologue", Reception, quoting Eliot Fish at Hyper Magazine, who also noted the lack of a damage model.',
      },
    ],
  },

  'ps3:9': {
    description:
      "A racing simulator expanded to 1,200 cars and 30 tracks: the player races across realistic and fictional circuits with variable weather and time of day, including a track set on the Moon, released after the PS4 had already taken over as Sony's current console.",
    criticReception: [
      {
        outlet: 'Eurogamer',
        quote: 'A vast, sprawling compendium of cars, with a staggering tracklist.',
        score: '9/10',
        source: 'Wikipedia, "Gran Turismo 6", Reception, quoting Eurogamer.',
      },
      {
        outlet: 'Polygon',
        quote: 'The variety of gameplay on offer.',
        score: '9.0/10',
        source: 'Wikipedia, "Gran Turismo 6", Reception, quoting Polygon.',
      },
    ],
  },

  'ps3:10': {
    description:
      "A third-person hack-and-slash finale: the player fights as Kratos through combo-driven battles against Greek gods and Titans, mixing melee combat, quick-time events and magic across set pieces built to close out the trilogy on the hardware's own technical ceiling.",
    criticReception: [
      {
        outlet: 'Game Informer',
        quote: 'The undisputed king of the genre.',
        score: '10/10',
        source: 'Wikipedia, "God of War III", Reception, quoting Game Informer, on Kratos.',
      },
      {
        outlet: 'IGN',
        quote: "Practically redefines scale in video games, singling out the size of the Titans as being larger than entire levels in other games.",
        score: '9.3/10',
        source: 'Wikipedia, "God of War III", Reception, quoting IGN.',
      },
    ],
  },

  // --- Wii ---

  'wii:1': {
    description:
      "The pack-in title that introduced the Wii Remote to the world: the player swings, throws and swipes the motion controller to play five simplified sports, tennis, baseball, bowling, golf and boxing, built around accessible rules rather than realistic simulation.",
    criticReception: [
      {
        outlet: 'IGN',
        quote: 'The controls are revolutionary, but the game comes up short in depth and visuals, which are generic and archaic.',
        score: '7.5/10',
        source: 'Wikipedia, "Wii Sports", Reception, quoting IGN.',
      },
      {
        outlet: 'GameSpot',
        quote: 'Motion controls that are sometimes erratic, but a multiplayer fitness test that keeps people coming back.',
        score: '7.8/10',
        source: 'Wikipedia, "Wii Sports", Reception, quoting GameSpot.',
      },
      {
        outlet: 'Nintendo Power',
        quote: 'One of the two greatest multiplayer experiences in Nintendo\'s history.',
        score: '8.3/10',
        source: 'Wikipedia, "Wii Sports", Reception, quoting Nintendo Power.',
      },
    ],
  },

  'wii:2': {
    description:
      "A kart racer that carries 24 Mario characters across 32 courses, split between traditional karts and new motorbikes, controlled either with a GameCube-style pad or the bundled Wii Wheel, and playable online alongside local split-screen.",
    criticReception: [
      {
        outlet: 'GameSpot',
        quote: 'Easy to jump into for players of any skill level, with motorcycles providing a great alternative.',
        score: '8.5/10',
        source: 'Wikipedia, "Mario Kart Wii", Reception, quoting GameSpot.',
      },
      {
        outlet: 'Eurogamer',
        quote: 'Welcomed the additions of motorcycles and an online multiplayer mode.',
        score: '8/10',
        source: 'Wikipedia, "Mario Kart Wii", Reception, quoting Eurogamer.',
      },
      {
        outlet: 'Giant Bomb',
        quote: 'Unbalanced items and rubberband AI leave the racing chance-influenced.',
        score: '3/5',
        source: 'Wikipedia, "Mario Kart Wii", Reception, quoting Giant Bomb.',
      },
    ],
  },

  'wii:3': {
    description:
      "A sequel built around the Wii MotionPlus accessory, which reads the controller's rotation for near one to one motion tracking: the player takes on twelve activities across the resort island of Wuhu, including swordplay, archery, wakeboarding and skydiving alongside returning sports like bowling and golf.",
    criticReception: [
      {
        outlet: 'IGN',
        quote: 'The controls were impressive and the graphics were superb compared to most Wii games.',
        score: '7.7/10',
        source: 'Wikipedia, "Wii Sports Resort", Reception, quoting IGN.',
      },
      {
        outlet: 'Official Nintendo Magazine',
        score: '94%',
        source: 'Wikipedia, "Wii Sports Resort", Reception, citing Official Nintendo Magazine\'s score.',
      },
      {
        outlet: 'Nintendo Life',
        score: '9/10',
        source: 'Wikipedia, "Wii Sports Resort", Reception, citing Nintendo Life\'s score.',
      },
    ],
  },

  'wii:4': {
    description:
      "A 2D side-scrolling platformer that sends Mario, Luigi and two Toads through eight worlds, notable as the first Super Mario game to support four players moving and jumping simultaneously on screen rather than taking turns.",
    criticReception: [
      {
        outlet: 'Famitsu',
        quote: "A masterpiece of 2D action.",
        score: '40/40',
        source: 'Wikipedia, "New Super Mario Bros. Wii", Reception, quoting Famitsu.',
      },
      {
        outlet: 'Eurogamer',
        quote: 'The multiplayer is a simple stroke of genius.',
        score: '9/10',
        source: 'Wikipedia, "New Super Mario Bros. Wii", Reception, quoting Oli Welsh at Eurogamer.',
      },
      {
        outlet: 'GameSpot',
        quote: 'Initially great fun, but tedious at times due to the sheer chaos.',
        score: '8.5/10',
        source: 'Wikipedia, "New Super Mario Bros. Wii", Reception, quoting Randolph Ramsay at GameSpot, on the four-player mode.',
      },
    ],
  },

  'wii:5': {
    description:
      "A collection of nine minigames, from target shooting to fishing to billiards, built to demonstrate the Wii Remote's pointer and motion sensing, and sold bundled with a second Wii Remote, which drove most of its sales.",
    criticReception: [
      {
        outlet: 'Official Nintendo Magazine',
        quote: 'Surprisingly addictive.',
        score: '91%',
        source: 'Wikipedia, "Wii Play", Reception, quoting Official Nintendo Magazine.',
      },
      {
        outlet: 'IGN Australia',
        quote: 'As a training game, it succeeds completely.',
        score: '8.3/10',
        source: 'Wikipedia, "Wii Play", Reception, quoting IGN Australia.',
      },
      {
        outlet: 'GameSpot',
        quote: 'A step backwards from the control innovation shown elsewhere on the console.',
        score: '5.4/10',
        source: 'Wikipedia, "Wii Play", Reception, quoting GameSpot.',
      },
    ],
  },

  'wii:6': {
    description:
      "An exercise title built around the Wii Balance Board peripheral, offering over forty yoga, strength, aerobics and balance activities, tracking body mass index and a calculated Wii Fit Age, with support for up to eight user profiles.",
    criticReception: [
      {
        outlet: 'IGN',
        quote: 'An environment in which working out is less daunting and as a result enjoyable, fun, even.',
        score: '8.0/10',
        source: 'Wikipedia, "Wii Fit", Reception, quoting IGN.',
      },
      {
        outlet: 'Official Nintendo Magazine',
        quote: "An effective exercise program, its accessibility and its massive novelty value.",
        score: '91%',
        source: 'Wikipedia, "Wii Fit", Reception, quoting Official Nintendo Magazine.',
      },
      {
        outlet: 'GameRevolution',
        quote: 'Suffers greatly by the inability to assemble a full, unbroken workout.',
        score: 'C+',
        source: 'Wikipedia, "Wii Fit", Reception, quoting GameRevolution, on the menu interruptions between activities.',
      },
    ],
  },

  'wii:7': {
    description:
      "An expanded edition of Wii Fit that keeps the Balance Board and adds fifteen new balance and aerobics games plus six new strength and yoga activities, along with a calorie counter and the ability to build custom routines aimed at specific goals.",
    criticReception: [
      {
        outlet: 'IGN',
        quote: 'There\'s still some tightening up to be done, but Wii Fit Plus is a definite improvement in the format.',
        score: '8.2/10',
        source: 'Wikipedia, "Wii Fit Plus", Reception, quoting IGN.',
      },
      {
        outlet: '1UP.com',
        quote: 'Complete freedom to choose what you want to do, you might find yourself cheating despite your best intentions.',
        score: 'B+',
        source: 'Wikipedia, "Wii Fit Plus", Reception, quoting 1UP.com.',
      },
    ],
  },

  'wii:8': {
    description:
      "A crossover fighting game that pits characters from across Nintendo's franchises, plus guest fighters like Solid Snake and Sonic, against each other in matches focused on knocking opponents off the stage rather than depleting a health bar, alongside a story-driven single-player mode called The Subspace Emissary.",
    criticReception: [
      {
        outlet: 'Famitsu',
        quote: 'Praised the variety and depth of the single-player content and the unpredictability of Final Smashes.',
        score: '40/40',
        source: 'Wikipedia, "Super Smash Bros. Brawl", Reception, quoting Famitsu.',
      },
      {
        outlet: 'GameSpot',
        quote: 'Simple controls and gameplay make it remarkably accessible to beginners, yet still appealing to veterans.',
        score: '9.5/10',
        source: 'Wikipedia, "Super Smash Bros. Brawl", Reception, quoting GameSpot.',
      },
      {
        outlet: 'IGN',
        quote: 'Completely engrossing and wholly entertaining, though it suffers from long loading times.',
        score: '9.5/10',
        source: 'Wikipedia, "Super Smash Bros. Brawl", Reception, quoting IGN.',
      },
    ],
  },

  'wii:9': {
    description:
      "A 3D platformer that sends Mario across small spherical planetoids, each with its own localized gravity, using the Wii Remote's pointer to collect Star Bits and trigger environmental effects as he jumps between worlds strung across a galaxy.",
    criticReception: [
      {
        outlet: 'Eurogamer',
        quote: "An explosion of inventiveness, whose detail is only matched by its mission design.",
        score: '10/10',
        source: 'Wikipedia, "Super Mario Galaxy", Reception, quoting Eurogamer.',
      },
      {
        outlet: 'IGN',
        quote: 'Combines great art with great tech, resulting in stunning results.',
        score: '9.7/10',
        source: 'Wikipedia, "Super Mario Galaxy", Reception, quoting IGN.',
      },
      {
        outlet: 'GameSpot',
        quote: "There simply isn't a better-looking Wii game available.",
        score: '9.5/10',
        source: 'Wikipedia, "Super Mario Galaxy", Reception, quoting GameSpot.',
      },
    ],
  },

  'wii:10': {
    description:
      "A party collection of 80 minigames spread across nine modes, grouped into board game competitions where up to four players race across a board on dice rolls and minigame results, plus standalone House Party and two-player Pair Games.",
    criticReception: [
      {
        outlet: 'GameSpot',
        quote: 'The multiplayer mode is a blast, faster and better than Mario Party.',
        score: '8/10',
        source: 'Wikipedia, "Wii Party", Reception, quoting GameSpot.',
      },
      {
        outlet: 'GameTrailers',
        quote: "Aside from a few dud modes and some minor control issues, there isn't a whole lot to fault.",
        score: '7.9/10',
        source: 'Wikipedia, "Wii Party", Reception, quoting GameTrailers.',
      },
      {
        outlet: 'Game Informer',
        quote: "The metagames are even worse. Whereas Mario Party gave players multiple boards to play through, Wii Party features multiple game types, each less exciting than the last.",
        score: '4.5/10',
        source: 'Wikipedia, "Wii Party", Reception, quoting Game Informer.',
      },
    ],
  },

  // --- Wii U ---

  'wii-u:1': {
    description:
      "A kart racer built around anti-gravity sections that let drivers race up walls and across ceilings, run in HD across new and returning tracks with karts, motorbikes and ATVs, and support up to 12 players online, the console's best-selling game by a wide margin.",
    criticReception: [
      {
        outlet: 'Eurogamer',
        quote: 'The most vibrant home console racing game in years.',
        score: '10/10',
        source: 'Wikipedia, "Mario Kart 8", Reception, quoting Eurogamer.',
      },
      {
        outlet: 'IGN',
        quote: 'The great art direction is a major reason the game remains gorgeous.',
        score: '9.3/10',
        source: 'Wikipedia, "Mario Kart 8", Reception, quoting IGN.',
      },
    ],
  },

  'wii-u:2': {
    description:
      "A four-player 3D platformer that blends free-roaming levels with classic side-scrolling structure, timers and flagpoles included, letting players choose Mario, Luigi, Peach, Toad or the unlockable Rosalina as they rescue the Sprixie creatures from Bowser, with a cat suit that lets any of them climb walls and pounce.",
    criticReception: [
      {
        outlet: 'Eurogamer',
        quote: 'An endless freewheeling treat of a game.',
        score: '10/10',
        source: 'Wikipedia, "Super Mario 3D World", Reception, quoting Eurogamer.',
      },
      {
        outlet: 'Edge',
        quote: "Wii U's best game to date.",
        score: '9/10',
        source: 'Wikipedia, "Super Mario 3D World", Reception, quoting Edge.',
      },
      {
        outlet: 'IGN',
        quote: 'The camera becomes a slight obstacle in four-player multiplayer.',
        score: '9.6/10',
        source: 'Wikipedia, "Super Mario 3D World", Reception, quoting IGN.',
      },
    ],
  },

  'wii-u:3': {
    description:
      "The console's launch title: a 2D side-scrolling platformer through Mario's familiar obstacle courses, distinguished by a Boost Mode where a fifth player on the GamePad can place blocks and stun enemies to help or hinder the four players on the television.",
    criticReception: [
      {
        outlet: 'Game Informer',
        quote: 'The best game in the New Super Mario Bros. series, with some of the most creative levels Nintendo has created.',
        score: '9.25/10',
        source: 'Wikipedia, "New Super Mario Bros. U", Reception, quoting Game Informer.',
      },
      {
        outlet: 'GameSpot',
        quote: "A challenging platformer and an excellent recreation of Mario's best moments.",
        score: '8.5/10',
        source: 'Wikipedia, "New Super Mario Bros. U", Reception, quoting GameSpot.',
      },
      {
        outlet: 'Giant Bomb',
        quote: 'Everything about New Super Mario Bros. U is pretty exciting, except the game itself.',
        score: '3/5',
        source: 'Wikipedia, "New Super Mario Bros. U", Reception, quoting Giant Bomb, on the series\' by-the-numbers design.',
      },
    ],
  },

  'wii-u:4': {
    description:
      "A crossover fighting game built around knocking opponents off the stage, drawing its roster from Nintendo franchises and a handful of third-party guests, with the Wii U version's signature addition being 8-Player Smash, letting eight fighters battle at once on enlarged stages.",
    criticReception: [
      {
        outlet: 'IGN',
        quote: 'Appeals to the nostalgia of long-time Nintendo fans while remaining accessible to new players.',
        score: '9.8/10',
        source: 'Wikipedia, "Super Smash Bros. for Nintendo 3DS and Wii U", Reception, quoting IGN, on the Wii U version.',
      },
      {
        outlet: 'GameSpot',
        quote: 'With the Wii U release, Smash Bros. has fully realized its goals.',
        score: '9/10',
        source: 'Wikipedia, "Super Smash Bros. for Nintendo 3DS and Wii U", Reception, quoting GameSpot, which also flagged inconsistent online performance.',
      },
    ],
  },

  'wii-u:5': {
    description:
      "The pack-in title, staged as a theme park of twelve minigame attractions each built around a Nintendo franchise, most designed as asymmetric play where the player holding the GamePad has a different view and role than the players on regular controllers.",
    criticReception: [
      {
        outlet: 'IGN',
        quote: 'Wii Sports has met its match.',
        score: '8.7/10',
        source: 'Wikipedia, "Nintendo Land", Reception, quoting IGN.',
      },
      {
        outlet: 'Nintendo Life',
        score: '9/10',
        source: 'Wikipedia, "Nintendo Land", Reception, citing Nintendo Life\'s score.',
      },
      {
        outlet: 'Official Nintendo Magazine',
        score: '90%',
        source: 'Wikipedia, "Nintendo Land", Reception, citing Official Nintendo Magazine\'s score.',
      },
    ],
  },

  'wii-u:6': {
    description:
      "A brand-new Nintendo franchise built as a third-person shooter where Inklings, humanoid squid characters, compete to cover the map in their team's ink rather than rack up kills, swimming through their own color for speed and cover across Turf War and ranked modes.",
    criticReception: [
      {
        outlet: 'Digital Trends',
        quote: "A genius concept, with its simplicity allowing all players, regardless of skill level, to meaningfully contribute.",
        source: 'Wikipedia, "Splatoon", Reception, quoting Giovanni Colantonio at Digital Trends.',
      },
      {
        outlet: 'NPR',
        quote: 'Created a more welcoming community than other shooters, due to the flexibility of its gameplay.',
        source: 'Wikipedia, "Splatoon", Reception, quoting Josh Broadwell at NPR.',
      },
    ],
  },

  'wii-u:7': {
    description:
      "A 2D side-scrolling platformer sending Donkey Kong and his allies across a set of islands to defeat the invading Snowmads, built around demanding level design, character-switching abilities including Cranky Kong's pogo-cane bounce off hazards, and adjustable difficulty for solo or co-op play.",
    criticReception: [
      {
        outlet: 'Destructoid',
        score: '10/10',
        source: 'Wikipedia, "Donkey Kong Country: Tropical Freeze", Reception, citing Destructoid\'s perfect score.',
      },
      {
        outlet: 'IGN',
        quote: "Praised for the game's challenge, level design, and boss battles.",
        score: '9/10',
        source: 'Wikipedia, "Donkey Kong Country: Tropical Freeze", Reception, quoting IGN.',
      },
      {
        outlet: 'GameSpot',
        quote: 'Criticized clunky, repetitive level design on the original Wii U release.',
        score: '6/10',
        source: 'Wikipedia, "Donkey Kong Country: Tropical Freeze", Reception, quoting GameSpot\'s Wii U review; the outlet later scored the Switch port 9/10.',
      },
    ],
  },

  'wii-u:8': {
    description:
      "An open-world action-adventure that sends Link across a Hyrule with no fixed critical path, built on a physics and chemistry engine that lets fire, wind, electricity and momentum interact, so nearly every puzzle and fight can be solved several different ways using climbing, gliding and the Sheikah Slate's tools. It released the same day on Wii U and Switch, in the Wii U's final month on the market.",
    criticReception: [
      {
        outlet: 'IGN',
        quote: 'A masterclass in open-world design, a wonderful sandbox full of mystery.',
        score: '10/10',
        source: 'Wikipedia, "The Legend of Zelda: Breath of the Wild", Reception, quoting IGN.',
      },
      {
        outlet: 'GameSpot',
        quote: 'Takes designs and mechanics perfected in other games and reworks them for its own purposes to create something wholly new.',
        score: '10/10',
        source: 'Wikipedia, "The Legend of Zelda: Breath of the Wild", Reception, quoting GameSpot.',
      },
      {
        outlet: 'Edge',
        quote: 'The world was an absolute, and unremitting, pleasure to get lost in.',
        score: '10/10',
        source: 'Wikipedia, "The Legend of Zelda: Breath of the Wild", Reception, quoting Edge.',
      },
    ],
  },

  'wii-u:9': {
    description:
      "A real-time strategy game where the player commands up to 100 Pikmin, plant-like creatures split into types with different resistances (Red to fire, Yellow to electricity, Blue to water), directing them to clear obstacles, fight enemies and gather resources, with the GamePad's touchscreen doubling as an overhead map for coordinating up to three captains at once.",
    criticReception: [
      {
        outlet: 'Eurogamer',
        quote: 'A gem worth experiencing.',
        score: '9/10',
        source: 'Wikipedia, "Pikmin 3", Reception, quoting Eurogamer.',
      },
      {
        outlet: 'IGN',
        quote: 'Praised the design but noted the game felt too short.',
        score: '8.8/10',
        source: 'Wikipedia, "Pikmin 3", Reception, quoting IGN.',
      },
    ],
  },

  'wii-u:10': {
    description:
      "A hack-and-slash sequel starring the Umbra Witch Bayonetta, built around fast, combo-heavy melee and gunplay and a magic-fueled Umbran Climax that briefly strengthens her attacks and summons demons, funded and published by Nintendo after other publishers declined the project.",
    criticReception: [
      {
        outlet: 'Destructoid',
        quote: 'One of the finest action games of all time, alongside Devil May Cry 3.',
        score: '10/10',
        source: 'Wikipedia, "Bayonetta 2", Reception, quoting Destructoid.',
      },
      {
        outlet: 'GameSpot',
        quote: 'Will be remembered as an absolute classic.',
        score: '10/10',
        source: 'Wikipedia, "Bayonetta 2", Reception, quoting GameSpot.',
      },
      {
        outlet: 'IGN',
        quote: 'Its art direction and pacing make Bayonetta 1 look poor by comparison.',
        score: '9.5/10',
        source: 'Wikipedia, "Bayonetta 2", Reception, quoting IGN.',
      },
    ],
  },

  // --- PlayStation 4 ---

  'ps4:1': {
    description:
      "An open-world crime game following three protagonists, Michael, Franklin and Trevor, through heists and missions across the fictional city of Los Santos and the countryside around it, playable on foot or in any vehicle from third or first-person view; this was a cross-generation re-release of a game that had already set sales records on PS3 and Xbox 360.",
    criticReception: [
      {
        outlet: 'IGN',
        quote: 'One of the very best video games ever made.',
        score: '10/10',
        source: 'Wikipedia, "Grand Theft Auto V", Reception, quoting IGN.',
      },
      {
        outlet: 'Edge',
        quote: 'A remarkable achievement in open-world design and storytelling.',
        score: '10/10',
        source: 'Wikipedia, "Grand Theft Auto V", Reception, quoting Edge.',
      },
    ],
  },

  'ps4:2': {
    description:
      "An open-world superhero game that puts the player in Spider-Man's suit, swinging through a recreated Manhattan using physics-based web traversal and chaining acrobatic combat against street crime and supervillains, with side content and unlockable suits layered across the main story.",
    criticReception: [
      {
        outlet: 'Game Informer',
        quote: "Like Batman: Arkham Asylum before it, Spider-Man raises the bar for one of the world's most beloved heroes.",
        score: '9.5/10',
        source: 'Wikipedia, "Marvel\'s Spider-Man (video game)", Reception, quoting Game Informer.',
      },
      {
        outlet: 'VentureBeat',
        quote: 'The best Spider-Man game, and one of the best superhero games ever.',
        source: 'Wikipedia, "Marvel\'s Spider-Man (video game)", Reception, quoting VentureBeat.',
      },
    ],
  },

  'ps4:3': {
    description:
      "A full reinvention of the series that trades its arcade-style combat for a slower, weightier style built around the Leviathan Axe, staged as one continuous shot with no cuts, following Kratos and his son Atreus through Norse mythology rather than the Greek setting of the earlier games.",
    criticReception: [
      {
        outlet: 'Polygon',
        quote: 'Praised for its art direction, graphics, combat system, music and story.',
        score: '10/10',
        source: 'Wikipedia, "God of War (2018 video game)", Reception, quoting Polygon.',
      },
      {
        outlet: 'Destructoid',
        quote: 'One of the greatest video games ever made.',
        score: '10/10',
        source: 'Wikipedia, "God of War (2018 video game)", Reception, quoting Destructoid.',
      },
    ],
  },

  'ps4:4': {
    description:
      "An open-world action RPG from the studio previously known for the Killzone series, following the huntress Aloy through a post-apocalyptic world overrun by robotic creatures built to resemble animals, blending bow-based ranged combat, stealth and crafting as she uncovers what happened to civilization before her.",
    criticReception: [
      {
        outlet: 'Polygon',
        quote: 'Offered a remarkable sense of discovery through diverse biomes and settlements.',
        score: '9.5/10',
        source: 'Wikipedia, "Horizon Zero Dawn", Reception, quoting Polygon.',
      },
      {
        outlet: 'GameSpot',
        quote: 'Endurably exhilarating combat with creative machine design.',
        score: '9/10',
        source: 'Wikipedia, "Horizon Zero Dawn", Reception, quoting GameSpot.',
      },
    ],
  },

  'ps4:5': {
    description:
      "A third-person action-adventure that closes out Nathan Drake's story, sending him out of retirement to search for a legendary pirate's treasure alongside a brother he had believed dead, built around the series' heaviest platforming and traversal yet across a run of technically ambitious set pieces.",
    criticReception: [
      {
        outlet: 'GameSpot',
        quote: 'A breathtaking marvel of a game.',
        score: '10/10',
        source: 'Wikipedia, "Uncharted 4: A Thief\'s End", Reception, quoting GameSpot.',
      },
      {
        outlet: 'IGN',
        quote: 'A remarkable achievement in blockbuster storytelling and graphical beauty.',
        score: '9/10',
        source: 'Wikipedia, "Uncharted 4: A Thief\'s End", Reception, quoting IGN.',
      },
    ],
  },

  'ps4:6': {
    description:
      "A remaster of the PS3 original at higher fidelity: Joel, a smuggler, escorts Ellie, a teenager immune to a fungal infection, across a post-apocalyptic United States, combining stealth, crafting and desperate combat against both infected creatures and hostile survivors.",
    criticReception: [
      {
        outlet: 'Metacritic aggregate',
        quote: 'Ranked among the fourth-highest-rated PlayStation 4 games by review aggregate score.',
        score: '95/100',
        source: 'Wikipedia, "The Last of Us", Reception, citing the Remastered PS4 release\'s Metacritic score.',
      },
    ],
  },

  'ps4:7': {
    description:
      "The console port of the best-selling sandbox game of all time: players mine and place blocks in a procedurally generated world, switching between a survival mode with resource gathering and hostile creatures and a creative mode with unlimited building and no threats.",
    criticReception: [
      {
        outlet: 'IGN',
        score: '9.7/10',
        source: 'Wikipedia, "Minecraft", Reception, citing IGN\'s score for the PlayStation 4 edition.',
      },
    ],
  },

  'ps4:8': {
    description:
      "A first-person shooter built around fast vertical movement, wall-running, sliding and thruster-pack boosts, with a four-player cooperative campaign and open, non-corridor level design that leaned fully into the series' most futuristic period.",
    criticReception: [
      {
        outlet: 'IGN',
        quote: 'With fun 4-player co-op, new powers, and a fleshed out Zombies mode, Black Ops III is the biggest Call of Duty game yet.',
        score: '9.2/10',
        source: 'Wikipedia, "Call of Duty: Black Ops III", Reception, quoting IGN.',
      },
      {
        outlet: 'GameSpot',
        quote: "Doesn't offer anything remarkable to the series, but does just enough to maintain the Call of Duty status quo.",
        score: '7/10',
        source: 'Wikipedia, "Call of Duty: Black Ops III", Reception, quoting GameSpot.',
      },
    ],
  },

  'ps4:9': {
    description:
      "A return to the series' World War II roots after several near-future entries, following a squad from the 1st Infantry Division through the European theatre with traditional boots-on-the-ground combat and no advanced movement mechanics, alongside a Division-based multiplayer system.",
    criticReception: [
      {
        outlet: 'GameSpot',
        quote: 'The campaign was moving, and salutes the brotherhood that grows and strengthens on the battlefield.',
        score: '9/10',
        source: 'Wikipedia, "Call of Duty: WWII", Reception, quoting GameSpot.',
      },
      {
        outlet: 'Polygon',
        quote: "Just about every mission feels like déjà vu, as if I'd played it before in another game.",
        score: '7/10',
        source: 'Wikipedia, "Call of Duty: WWII", Reception, quoting Polygon.',
      },
    ],
  },

  'ps4:10': {
    description:
      "A racing simulator that leans harder into online and competitive play than any prior entry, built around Sport Mode's daily races, Driver and Sportsmanship ratings, and FIA-certified Nations Cup and Manufacturers Cup championships recognized as an official motorsport esport.",
    criticReception: [
      {
        outlet: 'Eurogamer',
        quote: 'Possibly the most focused, directly enjoyable game Polyphony Digital has put out since the heady days of Gran Turismo 3.',
        source: 'Wikipedia, "Gran Turismo Sport", Reception, quoting Eurogamer.',
      },
      {
        outlet: 'GamesRadar+',
        quote: 'Winning a slipstreaming race around an oval against real opponents is far more exciting than any offline mode.',
        score: '4/5',
        source: 'Wikipedia, "Gran Turismo Sport", Reception, quoting GamesRadar+.',
      },
    ],
  },

  // --- Xbox One ---

  'xbox-one:1': {
    description:
      "The same three-protagonist crime saga through Los Santos and San Andreas as the earlier PS3 and Xbox 360 release, rebuilt for the new generation; it was a re-release of an already record-setting game and still outsold nearly everything built new for the console.",
    criticReception: [
      {
        outlet: 'Edge',
        quote: 'A remarkable achievement in open-world design and storytelling.',
        score: '10/10',
        source: 'Wikipedia, "Grand Theft Auto V", Reception, quoting Edge.',
      },
      {
        outlet: 'IGN',
        quote: 'One of the very best video games ever made.',
        score: '10/10',
        source: 'Wikipedia, "Grand Theft Auto V", Reception, quoting IGN.',
      },
    ],
  },

  'xbox-one:2': {
    description:
      "A first-person shooter built around wall-running, sliding and thruster-pack boosts, with a four-player cooperative campaign, arriving at the point the series was pushing hardest away from ground-level combat toward vertical, futuristic movement.",
    criticReception: [
      {
        outlet: 'IGN',
        quote: 'With fun 4-player co-op, new powers, and a fleshed out Zombies mode, Black Ops III is the biggest Call of Duty game yet.',
        score: '9.2/10',
        source: 'Wikipedia, "Call of Duty: Black Ops III", Reception, quoting IGN.',
      },
      {
        outlet: 'Polygon',
        quote: "Treyarch doesn't meaningfully move the series forward here.",
        score: '7/10',
        source: 'Wikipedia, "Call of Duty: Black Ops III", Reception, quoting Polygon.',
      },
    ],
  },

  'xbox-one:3': {
    description:
      "The console version of the best-selling sandbox game of all time, released the same year Microsoft bought developer Mojang for 2.5 billion dollars: players mine and place blocks across a procedurally generated world in survival or unrestricted creative mode.",
    criticReception: [
      {
        outlet: 'IGN',
        score: '9.5/10',
        source: 'Wikipedia, "Minecraft", Reception, citing IGN\'s score for the PlayStation 3 edition, the same build the Xbox One version was based on.',
      },
    ],
  },

  'xbox-one:4': {
    description:
      "The series returning to World War II after a decade of near-future settings, following a squad from the 1st Infantry Division through the European theatre with grounded, traditional infantry combat and no advanced movement systems.",
    criticReception: [
      {
        outlet: 'GameSpot',
        quote: 'The campaign was moving, and salutes the brotherhood that grows and strengthens on the battlefield.',
        score: '9/10',
        source: 'Wikipedia, "Call of Duty: WWII", Reception, quoting GameSpot.',
      },
      {
        outlet: 'Giant Bomb',
        quote: "The setting change didn't bring any new and exciting inspiration with it.",
        score: '3/5',
        source: 'Wikipedia, "Call of Duty: WWII", Reception, quoting Giant Bomb.',
      },
    ],
  },

  'xbox-one:5': {
    description:
      "The console's biggest exclusive at the time: a first-person shooter that splits its campaign between Master Chief and Spartan Locke, built around new Spartan abilities like sprinting, thrusting and clambering, and notable as the first mainline Halo campaign with no split-screen support, a decision fans received poorly.",
    criticReception: [
      {
        outlet: 'IGN',
        quote: 'The strongest combat Halo has ever seen.',
        score: '9/10',
        source: 'Wikipedia, "Halo 5: Guardians", Reception, quoting IGN.',
      },
      {
        outlet: 'Time',
        quote: 'Feels disappointingly by the numbers.',
        source: 'Wikipedia, "Halo 5: Guardians", Reception, quoting Time magazine, on the campaign story.',
      },
    ],
  },

  'xbox-one:6': {
    description:
      "An open-world action RPG set in post-nuclear Boston and the surrounding Commonwealth, combining wasteland exploration and quests with a deep settlement-building and crafting system; it was the first console Fallout to support user mods, which Bethesda enabled on Xbox before PlayStation.",
    criticReception: [
      {
        outlet: 'IGN',
        quote: 'The world, exploration, crafting, atmosphere, and story of Fallout 4 are all key parts of this hugely successful sandbox role-playing game.',
        score: '9.5/10',
        source: 'Wikipedia, "Fallout 4", Reception, quoting IGN.',
      },
      {
        outlet: 'Destructoid',
        quote: "A lot of the franchise's signature problems have carried over directly into Fallout 4.",
        score: '7.5/10',
        source: 'Wikipedia, "Fallout 4", Reception, quoting Destructoid.',
      },
    ],
  },

  'xbox-one:7': {
    description:
      "An open-world Western following Arthur Morgan, an outlaw in the Van der Linde gang, across a fictionalized 1899 United States built for shootouts, robberies, hunting and horseback travel, with an honor system that tracks player choices; it spent eight years in development and became one of the most detailed worlds built for a console at the time.",
    criticReception: [
      {
        outlet: 'Game Informer',
        quote: 'The biggest and most cohesive adventure Rockstar Games has ever created.',
        score: '10/10',
        source: 'Wikipedia, "Red Dead Redemption 2", Reception, quoting Game Informer.',
      },
      {
        outlet: 'IGN',
        quote: 'One of the greatest games of the modern age.',
        score: '10/10',
        source: 'Wikipedia, "Red Dead Redemption 2", Reception, quoting IGN.',
      },
    ],
  },

  'xbox-one:8': {
    description:
      "The first entry in the football series built on the Frostbite engine, adding a story mode called The Journey that follows a fictional player named Alex Hunter through a Premier League career, alongside a reworked attacking system and physical player modeling.",
    criticReception: [
      {
        outlet: 'GameSpot',
        score: '9/10',
        source: 'Wikipedia, "FIFA 17", Reception, citing GameSpot\'s score.',
      },
      {
        outlet: 'The Guardian',
        quote: 'New story mode and on-pitch tweaks keep the series in the game.',
        score: '4/5',
        source: 'Wikipedia, "FIFA 17", Reception, quoting The Guardian.',
      },
    ],
  },

  'xbox-one:9': {
    description:
      "An open-world racing game set across a fictionalized Great Britain, introducing dynamic seasons that rotate weekly and are shared by every player in the world at once, changing routes and conditions, from frozen lakes in winter to muddy trails in autumn, for over 750 licensed cars.",
    criticReception: [
      {
        outlet: 'IGN',
        score: '9.6/10',
        source: 'Wikipedia, "Forza Horizon 4", Reception, citing IGN\'s score.',
      },
      {
        outlet: 'Game Informer',
        quote: 'The weather greatly impacts the way you race, and sometimes forces you to retreat to your garage to bring out rides that are more suitable for the conditions.',
        score: '9.25/10',
        source: 'Wikipedia, "Forza Horizon 4", Reception, quoting Game Informer.',
      },
    ],
  },

  'xbox-one:10': {
    description:
      "The first Gears made after Microsoft bought the series outright from Epic, a cover-based third-person shooter that follows JD Fenix, son of original protagonist Marcus Fenix, against a new enemy faction called the Swarm, with two-player campaign co-op and dynamic weather.",
    criticReception: [
      {
        outlet: 'IGN',
        score: '9.2/10',
        source: 'Wikipedia, "Gears of War 4", Reception, citing IGN\'s score.',
      },
      {
        outlet: 'GameSpot',
        quote: 'This is a shooter teetering on the edge of something greater, but despite the improvements it makes to the storied franchise, its missteps hold it back.',
        score: '7/10',
        source: 'Wikipedia, "Gears of War 4", Reception, quoting GameSpot.',
      },
    ],
  },

  // --- Switch ---

  'switch:1': {
    description:
      "An enhanced Switch release of the Wii U kart racer, bundling all of its downloadable tracks and characters from the start, restoring Battle Mode with five rulesets on dedicated arenas, and adding the option to hold two items at once; it has since become one of the best-selling games ever released on any platform.",
    criticReception: [
      {
        outlet: 'The Guardian',
        quote: 'The best, most versatile game in the series.',
        score: '5/5',
        source: 'Wikipedia, "Mario Kart 8 Deluxe", Reception, quoting The Guardian.',
      },
      {
        outlet: 'Nintendo Life',
        quote: 'Returned Battle Mode to its original arena-battling glory.',
        score: '10/10',
        source: 'Wikipedia, "Mario Kart 8 Deluxe", Reception, quoting Nintendo Life.',
      },
    ],
  },

  'switch:2': {
    description:
      "A life simulator where the player settles a deserted island and shapes it however they choose, running on a real-time clock synced to the actual date and season, with a crafting system for turning gathered resources into furniture and tools. It released three days before much of the world entered lockdown and became that year's defining social space.",
    criticReception: [
      {
        outlet: 'Nintendo Life',
        quote: 'Everything is sharp, smooth, colorful and a big improvement on previous releases.',
        score: '10/10',
        source: 'Wikipedia, "Animal Crossing: New Horizons", Reception, quoting Nintendo Life.',
      },
      {
        outlet: 'GameSpot',
        quote: 'The creative freedom and control offered by the game, such as being allowed to choose where buildings and bridges are placed.',
        score: '9/10',
        source: 'Wikipedia, "Animal Crossing: New Horizons", Reception, quoting GameSpot.',
      },
    ],
  },

  'switch:3': {
    description:
      "A crossover fighter that brings back every playable character from every previous game in the series, 74 fighters at launch, alongside a story-driven World of Light adventure mode where the player rescues captured fighters and collects spirits representing characters from outside franchises; more an act of preservation than a conventional sequel.",
    criticReception: [
      {
        outlet: 'IGN',
        quote: 'An ambitious and excellent decision to bring back every character.',
        score: '9.4/10',
        source: 'Wikipedia, "Super Smash Bros. Ultimate", Reception, quoting IGN.',
      },
      {
        outlet: 'Bleacher Report',
        quote: "The colorful art style, faster gameplay, and unique stages.",
        source: 'Wikipedia, "Super Smash Bros. Ultimate", Reception, quoting Bleacher Report.',
      },
    ],
  },

  'switch:4': {
    description:
      "The console's launch title, an open-world action-adventure built around letting the player walk toward anything visible on the horizon, including the final boss, using a physics and chemistry engine that lets fire, wind and momentum interact so most puzzles and fights can be solved several ways.",
    criticReception: [
      {
        outlet: 'IGN',
        quote: 'A masterclass in open-world design, a wonderful sandbox full of mystery.',
        score: '10/10',
        source: 'Wikipedia, "The Legend of Zelda: Breath of the Wild", Reception, quoting IGN.',
      },
      {
        outlet: 'Edge',
        quote: 'The world was an absolute, and unremitting, pleasure to get lost in.',
        score: '10/10',
        source: 'Wikipedia, "The Legend of Zelda: Breath of the Wild", Reception, quoting Edge.',
      },
    ],
  },

  'switch:5': {
    description:
      "A 3D platformer that sends Mario across 14 open, exploration-driven kingdoms collecting Power Moons, built around Cappy, his sentient hat, which lets him possess enemies and objects and briefly take on their abilities, turning most kingdoms into a toy box of ways to solve the same puzzle.",
    criticReception: [
      {
        outlet: 'Edge',
        quote: 'The most versatile ability in the Mario series to date.',
        score: '10/10',
        source: 'Wikipedia, "Super Mario Odyssey", Reception, quoting Edge, on the Cappy possession mechanic.',
      },
      {
        outlet: 'Famitsu',
        quote: 'The highest score for a 3D Mario game since the original Super Mario 64.',
        score: '39/40',
        source: 'Wikipedia, "Super Mario Odyssey", Reception, quoting Famitsu.',
      },
    ],
  },

  'switch:6': {
    description:
      "The first mainline Pokemon games built for a television as well as a handheld, set in the Galar region and introducing the Wild Area, a fully explorable open zone with dynamic weather, along with the Dynamax and Gigantamax mechanic that temporarily enlarges a Pokemon in battle.",
    criticReception: [
      {
        outlet: 'IGN',
        quote: 'Engaging gameplay, complemented by compelling battle and exploration experiences.',
        score: '9.3/10',
        source: 'Wikipedia, "Pokemon Sword and Shield", Reception, quoting IGN.',
      },
      {
        outlet: 'Eurogamer',
        quote: 'A lack of depth, and an absence of complex dungeons and intricate lore.',
        score: '3/5',
        source: 'Wikipedia, "Pokemon Sword and Shield", Reception, quoting Eurogamer.',
      },
    ],
  },

  'switch:7': {
    description:
      "The series' first fully open-world entry, set in the Paldea region and letting the player tackle three separate story routes in any order, adding a Terastallization battle mechanic and large-scale Tera Raid battles; the release shipped in a technically rough state that dominated its reception.",
    criticReception: [
      {
        outlet: 'GameSpot',
        quote: 'The non-linearity of the games was their real strength, even as technical issues undermined the experience.',
        score: '8/10',
        source: 'Wikipedia, "Pokemon Scarlet and Violet", Reception, quoting GameSpot.',
      },
      {
        outlet: 'Eurogamer',
        quote: 'Comprehensive technical failures compared to other Nintendo Switch titles.',
        source: 'Wikipedia, "Pokemon Scarlet and Violet", Reception, quoting Eurogamer, on the games\' performance.',
      },
    ],
  },

  'switch:8': {
    description:
      "A direct sequel to Breath of the Wild that keeps its open Hyrule while adding floating sky islands and an underground Depths region, built around the Ultrahand and Fuse abilities, which let the player build working devices and glue arbitrary objects onto weapons and gear; the resulting machines largely survived contact with what players actually built.",
    criticReception: [
      {
        outlet: 'IGN',
        quote: "Better than Breath of the Wild for its story and mechanics.",
        score: '10/10',
        source: 'Wikipedia, "The Legend of Zelda: Tears of the Kingdom", Reception, quoting IGN.',
      },
      {
        outlet: 'GameSpot',
        quote: 'Building upon its predecessor, creative and distinct.',
        score: '10/10',
        source: 'Wikipedia, "The Legend of Zelda: Tears of the Kingdom", Reception, quoting GameSpot.',
      },
    ],
  },

  'switch:9': {
    description:
      "A turn-based party collection of 80 minigames where up to four players move across a board using character-specific dice blocks, built around each player using a single detached Joy-Con, matching the two the console supplies by default rather than requiring extra controllers.",
    criticReception: [
      {
        outlet: 'IGN',
        quote: 'Super Mario Party is the best Party in two console generations, and it delivers the couch multiplayer experience the series is famous for.',
        score: '7.3/10',
        source: 'Wikipedia, "Super Mario Party", Reception, quoting IGN.',
      },
      {
        outlet: 'GameSpot',
        quote: 'Character-specific dice blocks added small moments of strategy into a series that has for too long solely relied on randomness.',
        score: '7/10',
        source: 'Wikipedia, "Super Mario Party", Reception, quoting GameSpot.',
      },
    ],
  },

  'switch:10': {
    description:
      "A Switch port of the Wii U's 2D platformer, upgraded to 1080p with HD Rumble and adding Toadette as a new playable character, whose Super Crown power-up transforms her into Peachette; another Wii U game rescued by the new hardware, and it outsold the original release several times over.",
    criticReception: [
      {
        outlet: 'Nintendo Life',
        quote: 'A solid package but disappointing that it did not add a lot of content.',
        score: '8/10',
        source: 'Wikipedia, "New Super Mario Bros. U Deluxe", Reception, quoting Nintendo Life, on the Switch release.',
      },
    ],
  },

  // --- PlayStation 5 ---

  'ps5:1': {
    description:
      "A sequel that puts the player in control of both Peter Parker and Miles Morales as they web-swing across an expanded New York, built to show off the PS5's fast SSD and haptic feedback, and centered on a symbiote suit that corrupts Peter and reshapes both his combat and the story.",
    criticReception: [
      {
        outlet: 'Game Informer',
        quote: 'The story derives real effectiveness from philosophical concepts associated with heroism against villainy, questions about returning from a dark place and having another chance.',
        score: '9.5/10',
        source: 'Wikipedia, "Marvel\'s Spider-Man 2", Reception, quoting Game Informer.',
      },
      {
        outlet: 'Shacknews',
        score: '10/10',
        source: 'Wikipedia, "Marvel\'s Spider-Man 2", Reception, citing Shacknews\' score, among the highest in the game\'s critical consensus.',
      },
    ],
  },

  'ps5:2': {
    description:
      "A return to the series' single-player campaign roots after Sport's online-first detour, rebuilding the GT Simulation Mode and GT Cafe structure across 570 cars and 41 track environments, with ray-traced replays and 3D spatial audio as PS5-specific showcase features.",
    criticReception: [
      {
        outlet: 'IGN',
        quote: "There's still nothing quite like Gran Turismo.",
        score: '9/10',
        source: 'Wikipedia, "Gran Turismo 7", Reception, quoting IGN.',
      },
      {
        outlet: 'The Guardian',
        quote: 'The ultimate racing game is fresh and comfortingly familiar.',
        score: '4/5',
        source: 'Wikipedia, "Gran Turismo 7", Reception, quoting The Guardian.',
      },
    ],
  },

  'ps5:3': {
    description:
      "The current entry in EA's annual football franchise, continuing under the EA Sports FC name after the split from FIFA, overhauling dribbling and AI positioning and offering separate Competitive and Authentic gameplay presets for Ultimate Team and Career Mode respectively.",
    criticReception: [
      {
        outlet: 'GamesRadar+',
        quote: "Ultimate Team's huge, divisive changes have me torn, FIFA's successor has moved away from serving football purists.",
        score: '4/5',
        source: 'Wikipedia, "EA Sports FC 26", Reception, quoting GamesRadar+.',
      },
      {
        outlet: 'IGN',
        score: '7/10',
        source: 'Wikipedia, "EA Sports FC 26", Reception, citing IGN\'s score.',
      },
    ],
  },

  'ps5:4': {
    description:
      "A ground-up remake of the 2005 original that keeps Leon Kennedy's mission into rural Spain to rescue the president's daughter from a mysterious cult, rebuilding the over-the-shoulder combat with a new parry system, an overhauled crafting system and improved AI for Ashley, while preserving the village's sense of dread.",
    criticReception: [
      {
        outlet: 'GameSpot',
        quote: 'Leon now acts like a human being.',
        score: '10/10',
        source: 'Wikipedia, "Resident Evil 4 (2023 video game)", Reception, quoting GameSpot.',
      },
      {
        outlet: 'The Guardian',
        quote: "Beautiful, tense, camp, gory: all that's best about the series.",
        score: '5/5',
        source: 'Wikipedia, "Resident Evil 4 (2023 video game)", Reception, quoting The Guardian.',
      },
    ],
  },

  'ps5:5': {
    description:
      "An action RPG built on the classical Chinese novel Journey to the West, casting the player as the staff-wielding Destined One and letting them shapeshift into other creatures with distinct movesets mid-fight; one of the biggest debuts ever for a first-time studio.",
    criticReception: [
      {
        outlet: 'IGN',
        quote: 'A great action game with fantastic combat, exciting bosses, tantalizing secrets, and a few too many bugs.',
        score: '8/10',
        source: 'Wikipedia (via GameSpot review roundup), "Black Myth: Wukong", quoting IGN.',
      },
      {
        outlet: 'GameSpot',
        quote: "It's not uncommon to go from one boss fight into another and then another, and it's in these elaborate battles where Black Myth: Wukong shines.",
        score: '8/10',
        source: 'GameSpot, "Black Myth: Wukong Review - Monkey Business".',
      },
    ],
  },

  'ps5:6': {
    description:
      "A cooperative third-person shooter that sends squads of up to four players against alien hordes in the name of spreading Super Earth's Managed Democracy, playing its militaristic propaganda dead straight for satire while leaving friendly fire permanently on; its tone and chaos turned it into a surprise cultural moment.",
    criticReception: [
      {
        outlet: 'Push Square',
        quote: 'A riotous affair, offering up best-in-class gunplay.',
        score: '9/10',
        source: 'Wikipedia, "Helldivers 2", Reception, quoting Push Square.',
      },
      {
        outlet: 'The Guardian',
        quote: 'The most fun I\'ve had with a co-op shooter since Left 4 Dead.',
        score: '4/5',
        source: 'Wikipedia, "Helldivers 2", Reception, quoting The Guardian.',
      },
    ],
  },

  'ps5:7': {
    description:
      "An open-world racer set across a fictionalized Mexico, the series' largest map yet, spanning eleven biomes with local dynamic weather; it arrived on PlayStation as part of Xbox's broader shift toward releasing its first-party games on multiple platforms.",
    criticReception: [
      {
        outlet: 'IGN',
        score: '10/10',
        source: 'Wikipedia, "Forza Horizon 5", Reception, citing IGN\'s score.',
      },
      {
        outlet: 'GamesRadar+',
        quote: 'The map is an absolute wonder, backed by a game engine which can deliver staggering views.',
        score: '5/5',
        source: 'Wikipedia, "Forza Horizon 5", Reception, quoting GamesRadar+.',
      },
    ],
  },

  'ps5:8': {
    description:
      "The closing chapter of the Norse saga begun in 2018, expanding the cast and the scale of the realms Kratos and Atreus travel through while adding new weapons like the Draupnir Spear and further building the combo-based, over-the-shoulder combat system.",
    criticReception: [
      {
        outlet: 'GameSpot',
        quote: 'Easily one of the most memorable takes on Norse mythology, as it deconstructs it, and rebuilds it as an epic story about families.',
        score: '9/10',
        source: 'Wikipedia, "God of War Ragnarok", Reception, quoting GameSpot.',
      },
      {
        outlet: 'Eurogamer',
        quote: 'The game can feel both bloated and crowded.',
        source: 'Wikipedia, "God of War Ragnarok", Reception, quoting Eurogamer, which otherwise recommended the game.',
      },
    ],
  },

  'ps5:9': {
    description:
      "A spiritual successor to Ghost of Tsushima that moves the setting north to 1603 Ezo, in what is now Hokkaido, and the lead role to Atsu, a mercenary hunting the six killers responsible for her family's death, carrying over the earlier game's stealth and swordplay into a new open world.",
    criticReception: [
      {
        outlet: 'GameSpot',
        quote: 'An improvement on Tsushima, with its gripping story, rewarding exploration, and fantastic combat.',
        score: '9/10',
        source: 'Wikipedia, "Ghost of Yotei", Reception, quoting GameSpot.',
      },
      {
        outlet: 'Eurogamer',
        quote: 'Great swordplay and heartfelt storytelling, held back by poor sidequests and a dated open world.',
        score: '3/5',
        source: 'Wikipedia, "Ghost of Yotei", Reception, quoting Eurogamer.',
      },
    ],
  },

  'ps5:10': {
    description:
      "A platform shooter built specifically to demonstrate the PS5's SSD, letting the player tear open near-instant portals between dimensions mid-level, and introducing Rivet, a second playable Lombax, alongside Ratchet across a run of visually varied planets.",
    criticReception: [
      {
        outlet: 'GameSpot',
        quote: 'Flashy and technically impressive without feeling self-important.',
        score: '9/10',
        source: 'Wikipedia, "Ratchet & Clank: Rift Apart", Reception, quoting GameSpot.',
      },
      {
        outlet: 'Destructoid',
        quote: "We're at the point of playable Pixar.",
        score: '9/10',
        source: 'Wikipedia, "Ratchet & Clank: Rift Apart", Reception, quoting Destructoid.',
      },
    ],
  },

  // --- Xbox Series X|S ---

  'xbox-series:1': {
    description:
      "A first-person shooter whose campaign follows Task Force 141 hunting down a terrorist leader, paired with a competitive multiplayer suite and the free-to-play Warzone 2.0, which added the extraction-focused DMZ mode alongside traditional battle royale; it took in a billion dollars across all platforms in ten days, the fastest the series has ever managed.",
    criticReception: [
      {
        outlet: 'GameSpot',
        quote: 'A greatest hits list for the series, with strong mission variety and diverse locations.',
        score: '8/10',
        source: 'Wikipedia, "Call of Duty: Modern Warfare II (2022 video game)", Reception, quoting GameSpot, on the campaign.',
      },
      {
        outlet: 'The Guardian',
        quote: 'A precisely tooled, intensely immersive combat simulator.',
        score: '4/5',
        source: 'Wikipedia, "Call of Duty: Modern Warfare II (2022 video game)", Reception, quoting The Guardian.',
      },
    ],
  },

  'xbox-series:2': {
    description:
      "Bethesda's first new universe in twenty-five years: a space exploration action RPG that lets the player travel among over a thousand explorable planets, building and customizing their own ship and crew, and the biggest test yet of Microsoft's day-one Game Pass strategy.",
    criticReception: [
      {
        outlet: 'GamesRadar+',
        quote: 'The best thing Bethesda has done since Oblivion, offering endless discovery and opportunities for players who love exploration and freedom.',
        score: '5/5',
        source: 'Wikipedia, "Starfield (video game)", Reception, quoting GamesRadar+.',
      },
      {
        outlet: 'PC Gamer',
        quote: 'Fails to feel like a grand adventure, and relies too heavily on loading screens and fast travel between planets.',
        score: '75/100',
        source: 'Wikipedia, "Starfield (video game)", Reception, quoting PC Gamer.',
      },
    ],
  },

  'xbox-series:3': {
    description:
      "A first-person shooter that returns Halo to a semi-open landscape on the ringworld Zeta Halo, built around a new grappleshot tool for traversal and combat, with its competitive multiplayer given away for free as a separate download from the campaign.",
    criticReception: [
      {
        outlet: 'GameSpot',
        quote: "Commended the game's new grappleshot feature and rewarding single-player progression system.",
        score: '9/10',
        source: 'Wikipedia, "Halo Infinite", Reception, quoting GameSpot.',
      },
      {
        outlet: 'IGN',
        quote: 'Praised the single-player campaign while noting Battle Pass rewards were lackluster.',
        score: '9/10',
        source: 'Wikipedia, "Halo Infinite", Reception, quoting IGN.',
      },
    ],
  },

  'xbox-series:4': {
    description:
      "An open-world racer set across a fictionalized Mexico, the series' largest map at the time, spanning eleven biomes with local dynamic weather; it drew ten million players in its first week, the biggest launch in Xbox Game Studios history up to that point.",
    criticReception: [
      {
        outlet: 'IGN',
        score: '10/10',
        source: 'Wikipedia, "Forza Horizon 5", Reception, citing IGN\'s score.',
      },
      {
        outlet: 'Eurogamer',
        quote: 'The environments are rich and saturated with colour and atmosphere, from humid swamps to arid dunes.',
        source: 'Wikipedia, "Forza Horizon 5", Reception, quoting Eurogamer.',
      },
    ],
  },

  'xbox-series:5': {
    description:
      "FromSoftware's punishing action RPG formula opened up into a full open world, the Lands Between, with lore and setting co-written by fantasy author George R. R. Martin; the player explores largely on horseback, collecting Great Runes to repair the shattered Elden Ring, and it became the runaway critical success of its console generation.",
    criticReception: [
      {
        outlet: 'GameSpot',
        quote: "The most expansive of FromSoftware's settings, with exploration and discovery as the game's main appeal.",
        score: '10/10',
        source: 'Wikipedia, "Elden Ring", Reception, quoting GameSpot.',
      },
      {
        outlet: 'The Guardian',
        quote: 'An unrivalled masterpiece of design and inventiveness.',
        score: '5/5',
        source: 'Wikipedia, "Elden Ring", Reception, quoting The Guardian.',
      },
    ],
  },

  'xbox-series:6': {
    description:
      "The last game to carry the FIFA name after a thirty-year licensing partnership ended, adding HyperMotion2 motion capture, cross-play between same-generation consoles, and the series' first inclusion of women's club football through England's WSL and France's Division 1 Feminine.",
    criticReception: [
      {
        outlet: 'IGN',
        quote: "Slick and dramatic virtual football, fitting for the series' last hurrah under its long-time name, but familiar frustrations abound.",
        score: '7/10',
        source: 'Wikipedia, "FIFA 23", Reception, quoting IGN.',
      },
      {
        outlet: 'GamesRadar+',
        quote: 'The series bowed out on a high, though the game had pay-to-win aspects.',
        score: '4/5',
        source: 'Wikipedia, "FIFA 23", Reception, quoting GamesRadar+.',
      },
    ],
  },

  'xbox-series:7': {
    description:
      "A dark, open-world action RPG set across seven regions of Sanctuary, offering eight playable classes, procedurally generated dungeons and a non-linear story, released weeks before Microsoft's acquisition of Blizzard's parent company finally closed.",
    criticReception: [
      {
        outlet: 'IGN',
        quote: 'A spectacular sequel.',
        score: '9/10',
        source: 'Wikipedia, "Diablo IV", Reception, quoting IGN.',
      },
      {
        outlet: 'GameSpot',
        quote: "The story was moving and engrossing, with particular praise for how it handled Lilith as the antagonist.",
        score: '8/10',
        source: 'Wikipedia, "Diablo IV", Reception, quoting GameSpot.',
      },
    ],
  },

  'xbox-series:8': {
    description:
      "A third generation of the same 2013 open-world crime game, still following Michael, Franklin and Trevor through heists across Los Santos, and still selling in real volume nearly a decade after its original release.",
    criticReception: [
      {
        outlet: 'IGN',
        quote: 'One of the very best video games ever made.',
        score: '10/10',
        source: 'Wikipedia, "Grand Theft Auto V", Reception, quoting IGN.',
      },
      {
        outlet: 'Edge',
        quote: 'A remarkable achievement in open-world design and storytelling.',
        score: '10/10',
        source: 'Wikipedia, "Grand Theft Auto V", Reception, quoting Edge.',
      },
    ],
  },

  'xbox-series:9': {
    description:
      "An open-world action RPG that lets the player attend Hogwarts School of Witchcraft and Wizardry as a student, learning spells and brewing potions while exploring the castle, Hogsmeade and the Forbidden Forest; it became one of the best-selling games of its year despite a widespread boycott campaign over the source author's public statements.",
    criticReception: [
      {
        outlet: 'PC Gamer',
        quote: 'Straightforward yet cohesive systems, such as the wizard duels and the personalized Room of Requirement.',
        score: '83/100',
        source: 'Wikipedia, "Hogwarts Legacy", Reception, quoting PC Gamer.',
      },
      {
        outlet: 'GameSpot',
        quote: 'Criticized the spell-selecting controls and the unremarkable enemy design.',
        score: '6/10',
        source: 'Wikipedia, "Hogwarts Legacy", Reception, quoting GameSpot.',
      },
    ],
  },

  'xbox-series:10': {
    description:
      "A shared-world pirate adventure where crews sail sloops, brigantines or galleons together to complete voyages for in-game trading companies, encountering other crews at sea for anything from an alliance to a cannon battle; a shaky, server-strained launch was rebuilt over years of free updates into one of the platform's most-played games, later released on PlayStation too.",
    criticReception: [
      {
        outlet: 'Polygon',
        quote: 'Misbehaving players may make the experience frustrating, because PvP could never be disabled.',
        score: '6.5/10',
        source: 'Wikipedia, "Sea of Thieves", Reception, quoting Polygon, on the 2018 launch.',
      },
      {
        outlet: 'IGN',
        quote: 'Should give the game a second chance; it was the perfect time to return following major content updates.',
        source: 'Wikipedia, "Sea of Thieves", Reception, quoting IGN\'s 2020 reassessment after the game\'s turnaround.',
      },
    ],
  },

  // --- Switch 2 ---

  'switch-2:1': {
    description:
      "The console's launch title and pack-in, opening the kart series into one continuous drivable world rather than separate tracks, and introducing Knockout Tour, a mode where 24 racers run one long elimination race across that world, cutting the field down at checkpoints as it goes.",
    criticReception: [
      {
        outlet: 'GameSpot',
        quote: 'A generational leap forward for the series, with Rainbow Road as an all-time great.',
        score: '9/10',
        source: 'Wikipedia, "Mario Kart World", Reception, quoting GameSpot.',
      },
      {
        outlet: 'IGN',
        quote: 'Polished gameplay and controls, and a celebratory soundtrack, though online multiplayer has real limitations.',
        score: '8/10',
        source: 'Wikipedia, "Mario Kart World", Reception, quoting IGN.',
      },
    ],
  },

  'switch-2:2': {
    description:
      "A 3D Donkey Kong platformer from the Super Mario Odyssey team, built around destructible terrain: the player digs, punches and blasts through underground sandbox levels to collect banana-shaped gems, using five animal-themed transformations for temporary new abilities.",
    criticReception: [
      {
        outlet: 'IGN',
        quote: "Nintendo's first Switch 2 masterpiece, a smashing return for a classic Nintendo character.",
        score: '10/10',
        source: 'Wikipedia, "Donkey Kong Bananza", Reception, quoting IGN.',
      },
      {
        outlet: 'GameSpot',
        quote: 'Engaging gameplay and destruction mechanics that encourage player exploration.',
        score: '9/10',
        source: 'Wikipedia, "Donkey Kong Bananza", Reception, quoting GameSpot.',
      },
    ],
  },

  'switch-2:3': {
    description:
      "An enhanced release of the four-player party collection, adding minigames built specifically around the console's mouse mode and its optional external camera, which reads full-body movement for a handful of new activities.",
    criticReception: [
      {
        outlet: 'Game Informer',
        quote: 'Solid base with tepid additions.',
        score: '7/10',
        source: 'Wikipedia, "Super Mario Party Jamboree", Reception, quoting Game Informer, on the Nintendo Switch 2 Edition.',
      },
      {
        outlet: 'IGN',
        quote: 'Mixed reactions to online functionality and feature removals in the Switch 2 upgrade.',
        score: '7/10',
        source: 'Wikipedia, "Super Mario Party Jamboree", Reception, quoting IGN, on the Nintendo Switch 2 Edition.',
      },
    ],
  },

  'switch-2:4': {
    description:
      "The original Switch game rebuilt at higher resolution with a substantial new chapter attached: Kirby's first full 3D outing, built around Mouthful Mode, which lets him swallow oversized objects like cars and vending machines to solve puzzles and fight with them.",
    criticReception: [
      {
        outlet: 'GameSpot',
        quote: 'The Best Kirby Yet.',
        score: '9/10',
        source: 'Wikipedia, "Kirby and the Forgotten Land", Reception, quoting GameSpot, on the original release the Switch 2 Edition builds on.',
      },
      {
        outlet: 'Destructoid',
        quote: 'One of the best Kirby games ever made.',
        score: '9.5/10',
        source: 'Wikipedia, "Kirby and the Forgotten Land", Reception, quoting Destructoid.',
      },
    ],
  },

  'switch-2:5': {
    description:
      "The 2017 open-world Zelda at a steady frame rate and higher resolution, its third console release in eight years, adding Zelda Notes: a full overworld map with real-time narration on collectibles and Hyrule's characteristics, voiced by Zelda herself.",
    criticReception: [
      {
        outlet: 'IGN',
        quote: 'A masterclass in open-world design, a wonderful sandbox full of mystery.',
        score: '10/10',
        source: 'Wikipedia, "The Legend of Zelda: Breath of the Wild", Reception, quoting IGN\'s review of the original release the Switch 2 Edition upgrades.',
      },
    ],
  },

  'switch-2:6': {
    description:
      "A launch-day port of the Night City-set open-world RPG, bundled with its Phantom Liberty expansion, that served as early evidence the new console could hold large third-party open worlds at meaningful fidelity.",
    criticReception: [
      {
        outlet: 'Metacritic aggregate',
        quote: 'Scored 85 out of 100 on the Nintendo Switch 2 version, in line with the game\'s post-launch PC and Xbox releases.',
        score: '85/100',
        source: 'Wikipedia, "Cyberpunk 2077", Reception, citing the Nintendo Switch 2 version\'s Metacritic score.',
      },
      {
        outlet: 'Polygon',
        quote: "Update 2.0 has given Cyberpunk 2077 a pulse that didn't exist before.",
        source: 'Wikipedia, "Cyberpunk 2077", Reception, quoting Polygon, on the game\'s post-launch overhaul that the Switch 2 release ships with.',
      },
    ],
  },

  'switch-2:7': {
    description:
      "A co-op only game from the studio behind It Takes Two: two writers, Mio and Zoe, get trapped inside interweaving science-fiction and fantasy stories and have to work through each one's platforming and combat together, sold with a free pass that lets a second player join without owning a copy.",
    criticReception: [
      {
        outlet: 'Eurogamer',
        quote: "A wildly imaginative mash-up that's best shared with a mate.",
        score: '5/5',
        source: 'Wikipedia, "Split Fiction", Reception, quoting Eurogamer.',
      },
      {
        outlet: 'IGN',
        quote: 'Cements Hazelight as the master of co-op games.',
        score: '9/10',
        source: 'Wikipedia, "Split Fiction", Reception, quoting IGN.',
      },
    ],
  },

  'switch-2:8': {
    description:
      "A fighting game built around the Drive Gauge, a shared resource spent on five different offensive and defensive techniques, and the World Tour mode, where a customizable avatar explores 3D city environments; it shipped with a mode using the Joy-Con's mouse sensor for direct control, which nobody expected to actually work.",
    criticReception: [
      {
        outlet: 'The Guardian',
        quote: 'The online component actually works, and works well, right out of the gate.',
        score: '5/5',
        source: 'Wikipedia, "Street Fighter 6", Reception, quoting The Guardian.',
      },
      {
        outlet: 'Game Informer',
        quote: 'The Drive System sets up a compelling risk and reward dynamic that tinges on every interaction.',
        score: '9.5/10',
        source: 'Wikipedia, "Street Fighter 6", Reception, quoting Game Informer.',
      },
    ],
  },

  'switch-2:9': {
    description:
      "A turn-based 4X strategy game spanning three historical ages, Antiquity, Exploration and Modern, with a distinctive system that lets the player switch civilizations at each age transition; the clearest argument yet for mouse mode, a strategy game built for a controller that finally controls the way a strategy game should.",
    criticReception: [
      {
        outlet: 'The Guardian',
        quote: 'Your empire strikes back in glorious new detail.',
        score: '5/5',
        source: 'Wikipedia, "Civilization VII", Reception, quoting The Guardian.',
      },
      {
        outlet: 'Eurogamer',
        quote: "The king isn't dead, but now's a good time to come at him.",
        score: '2/5',
        source: 'Wikipedia, "Civilization VII", Reception, quoting Eurogamer.',
      },
    ],
  },

  'switch-2:10': {
    description:
      "A native port of the open-world Hogwarts RPG, running natively on hardware where the original Switch could only manage the game via cloud streaming: the player attends Hogwarts School of Witchcraft and Wizardry, learning spells and exploring the castle, Hogsmeade and the Forbidden Forest.",
    criticReception: [
      {
        outlet: 'PC Gamer',
        quote: 'Straightforward yet cohesive systems, such as the wizard duels and the personalized Room of Requirement.',
        score: '83/100',
        source: 'Wikipedia, "Hogwarts Legacy", Reception, quoting PC Gamer\'s review of the original release the Switch 2 port runs natively.',
      },
    ],
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
