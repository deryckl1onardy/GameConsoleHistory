import { CONSOLES } from '@/data/consoles'
import { layoutMuseum } from './shelf-layout'

/**
 * The museum's floor plan, computed once.
 *
 * `shelf-layout.ts` stays pure and data-free so it can be unit tested against
 * arbitrary rosters; this is the one place that feeds it the real collection.
 * `CONSOLES` is a static module constant, so the layout is too — no hook, no
 * memo, no chance of two components disagreeing about where an artifact is.
 */
export const MUSEUM_LAYOUT = layoutMuseum(CONSOLES)
