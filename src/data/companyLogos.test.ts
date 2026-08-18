import { describe, expect, it } from 'vitest'
import { CONSOLES } from './consoles'
import { COMPANY_LOGO_PATHS } from './companyLogos'

/**
 * The sidebar rows and title block now render the manufacturer's logo instead
 * of its text; a roster entry whose manufacturer has no asset silently falls
 * back to text. This keeps that fallback from ever being hit unknowingly.
 */

describe('company logos', () => {
  it('covers every manufacturer in the roster', () => {
    const manufacturers = new Set(CONSOLES.map((c) => c.manufacturer))
    expect(manufacturers.size).toBeGreaterThan(0)
    for (const m of manufacturers) {
      expect(COMPANY_LOGO_PATHS[m], `${m} logo`).toBeDefined()
    }
  })
})
