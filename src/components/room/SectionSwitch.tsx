import { useScene, type Section } from '@/store/scene'

/**
 * The top-level section switcher: Console | Games, in Sentient at real size.
 *
 * This is the room's one editorial switch. It is deliberately NOT a pill, a
 * segmented control, tracked-out caps, or a filled+outlined button pair: the
 * app already spends that treatment twice (the wordmark at tracking-[0.28em],
 * section headings at tracking-[0.18em]), and a third small string in caps
 * would read as one costume on everything. Sentient at 28px is the
 * differentiated choice and is already in-system (font-display is reserved
 * for titles and numbers).
 *
 * The active state is a tonal shift on the type itself — no underline, no
 * dot, no sliding indicator, no lift. DOM order is load-bearing: mounted in
 * RoomChrome after ConsoleNav, so it stacks under the 56px header strip with
 * no z-index class anywhere.
 */
export function SectionSwitch() {
  const section = useScene((s) => s.section)
  const setSection = useScene((s) => s.setSection)

  const SECTIONS: { id: Section; label: string }[] = [
    { id: 'console', label: 'Console' },
    { id: 'games', label: 'Games' },
  ]

  // Standard tablist arrow behaviour: left/right move between the two tabs,
  // but only while focus is inside this nav — the window-wide arrow keys in
  // ConsoleNav switch consoles, and this stopPropagation keeps that handler
  // from also firing when the user is tabbing through the switcher.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    const idx = SECTIONS.findIndex((s) => s.id === section)
    const dir = e.key === 'ArrowRight' ? 1 : -1
    const next = SECTIONS[(idx + dir + SECTIONS.length) % SECTIONS.length]
    e.preventDefault()
    e.stopPropagation()
    setSection(next.id)
  }

  return (
    <nav
      role="tablist"
      aria-label="Section"
      onKeyDown={onKeyDown}
      className="pointer-events-auto absolute left-8 top-14 flex items-baseline gap-6 pt-5"
    >
      {SECTIONS.map(({ id, label }) => {
        const active = id === section
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => setSection(id)}
            className={[
              'font-display text-[28px] leading-none transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/60 rounded-sm',
              active ? 'text-ink' : 'text-ink/25 hover:text-ink/50',
            ].join(' ')}
          >
            {label}
          </button>
        )
      })}
    </nav>
  )
}
