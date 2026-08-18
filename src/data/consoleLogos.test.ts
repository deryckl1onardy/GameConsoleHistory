import { describe, expect, it } from 'vitest'
import { CONSOLES } from './consoles'
import { CONSOLE_LOGO_PATHS } from './consoleLogos'

/**
 * The sidebar rows, top bar and title block now render each console's product
 * logo instead of its name; a roster entry without an asset silently falls
 * back to text. This keeps that fallback from ever being hit unknowingly.
 */

describe('console logos', () => {
  it('covers every console in the roster', () => {
    expect(CONSOLES.length).toBeGreaterThan(0)
    for (const c of CONSOLES) {
      expect(CONSOLE_LOGO_PATHS[c.id], `${c.id} logo`).toBeDefined()
    }
  })
})
