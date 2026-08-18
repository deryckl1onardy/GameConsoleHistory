import type { ConsoleTab } from '@/store/scene'

/**
 * Every label the room chrome speaks, in one place. The tab list doubles as
 * the DetailPanel's navigation; the section headings are shared between the
 * tab bodies so two tabs can never disagree about what a section is called.
 *
 * 'games' is deliberately NOT in the tab list any more — Games left the
 * console's tabbed panel to become a top-level Section (see SectionSwitch),
 * so these three are the console section's tabs and nothing else.
 */

export const ROOM_TABS: { id: ConsoleTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'hardware', label: 'Hardware' },
  { id: 'history', label: 'History' },
]

export const COPY = {
  statUnits: 'Units Sold',
  statUnitsSub: 'Worldwide',
  statPrice: 'Launch Price',
  statCpu: 'CPU Clock',

  sectionNumbers: 'What the numbers mean',
  sectionSpecs: 'Specifications',
  sectionController: 'The controller',
  sectionInnovations: 'What it introduced',
  sectionButtons: 'Buttons',
  sectionFailure: 'How they failed',
  sectionVariants: 'Regional variants',

  gamesListHeading: 'Games',
  gamesIntro: 'The ten best-selling games, at their real box size.',
  gamesNoGames: 'No games recorded for this console yet.',
  gamesListHint: 'Pick a game from the list.',
  gamesDimensions: 'mm',
  gamesPrecisionExact: 'exact published dimensions',
  gamesPrecisionApprox: 'approximate — collector consensus',

  // Game Artifact view — the games section's detail panel.
  gameEditorial: 'Why it matters',
  gameStatAttachRate: 'Attach rate',
  gameStatAfterLaunch: 'After launch',
  gameStatDeveloper: 'Developer',
  gameStatPublisher: 'Publisher',

  controllerNone: 'No controller recorded.',

  diagramHeading: 'Annotated hardware',

  funFact: 'Fun fact',

  footer:
    'Sales and dates from Wikipedia. Cover art, where shown, is sourced from SteamGridDB community contributors; every other box carries a plain printed label in place of real art. Hardware callouts point at the 3D model itself, not a picture of it.',

  legendRotate: 'Drag to rotate',
  legendPan: 'Right-drag to pan',
  legendZoom: 'Scroll to zoom',
  resetView: 'Reset view',

  panelCollapse: 'Collapse details',
  panelExpand: 'Expand details',
  panelCollapsedHint: 'Details',
} as const
