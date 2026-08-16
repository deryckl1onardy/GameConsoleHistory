import type { PanelTab } from '@/store/scene'

/**
 * Every label the room chrome speaks, in one place. The tab list doubles as
 * the DetailPanel's navigation; the section headings are shared between the
 * tab bodies so two tabs can never disagree about what a section is called.
 */

export const ROOM_TABS: { id: PanelTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'games', label: 'Games' },
  { id: 'hardware', label: 'Hardware' },
  { id: 'history', label: 'History' },
]

export const COPY = {
  brand: 'Console Chronicles',
  brandBack: 'Back to the Shelf of History',
  brandEyebrow: 'Shelf of History',

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

  gamesIntro: 'The ten best-selling games, shown on the shelf at their real box size.',
  gamesNoGames: 'No games recorded for this console yet.',

  controllerNone: 'No controller recorded.',

  diagramHeading: 'Annotated hardware',

  funFact: 'Fun fact',

  footer:
    'Sales and dates from Wikipedia. Cover art shown is placeholder. Hardware callouts point at the 3D model itself, not a picture of it.',

  legendRotate: 'Drag to rotate',
  legendPan: 'Right-drag to pan',
  legendZoom: 'Scroll to zoom',
  resetView: 'Reset view',

  panelCollapse: 'Collapse details',
  panelExpand: 'Expand details',
  panelCollapsedHint: 'Details',
} as const
