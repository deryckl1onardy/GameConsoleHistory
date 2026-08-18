import { describe, expect, it } from 'vitest'
import { ARCHETYPE_SHELLS, CONSOLE_SHELL_OVERRIDES, shellFor } from './media-shells'
import { MEDIA_ARCHETYPES } from './media-archetypes'
import { CONSOLES, getConsole } from '@/data/consoles'
import type { MediaArchetypeId } from '@/types/console'

const HEX = /^#[0-9a-f]{6}$/i

describe('media shells', () => {
  it('has a shell for every archetype', () => {
    for (const id of Object.keys(MEDIA_ARCHETYPES) as MediaArchetypeId[]) {
      expect(ARCHETYPE_SHELLS[id], id).toBeDefined()
    }
  })

  it('every console override key resolves to a real console', () => {
    for (const id of Object.keys(CONSOLE_SHELL_OVERRIDES)) {
      expect(getConsole(id), `unknown console id in overrides: ${id}`).toBeDefined()
    }
  })

  it('uses valid hex colours everywhere', () => {
    for (const [id, shell] of Object.entries(ARCHETYPE_SHELLS)) {
      expect(shell.body, `${id} body`).toMatch(HEX)
      if (shell.recess) expect(shell.recess, `${id} recess`).toMatch(HEX)
      if (shell.tray) expect(shell.tray, `${id} tray`).toMatch(HEX)
    }
    for (const [id, override] of Object.entries(CONSOLE_SHELL_OVERRIDES)) {
      if (override?.body) expect(override.body, `${id} body`).toMatch(HEX)
      if (override?.recess) expect(override.recess, `${id} recess`).toMatch(HEX)
      if (override?.tray) expect(override.tray, `${id} tray`).toMatch(HEX)
    }
  })

  it('merges a console override onto its archetype default', () => {
    const ps2Shell = shellFor('dvd-keepcase', 'ps2')
    expect(ps2Shell.body).toBe('#1a3ea8')
    // Non-overridden fields still come from the archetype.
    expect(ps2Shell.clearSleeve).toBe(true)
  })

  it('falls back to the archetype default when a console has no override', () => {
    const shell = shellFor('cart-nes', 'nes')
    expect(shell).toEqual(ARCHETYPE_SHELLS['cart-nes'])
  })

  it('resolves every built console to a shell without throwing', () => {
    for (const entry of CONSOLES) {
      expect(() => shellFor(entry.mediaArchetype, entry.id)).not.toThrow()
    }
  })
})
