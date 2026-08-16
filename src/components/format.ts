/**
 * The app's ONE number formatter. Previously ConsolePicker and InfoPanel each
 * shipped their own and disagreed ("160M sold" vs "160.00M"); the stat blocks
 * in the detail panel need a single consistent voice.
 */
export function formatUnits(n: number): string {
  if (!Number.isFinite(n)) return '—'
  if (n < 1_000_000) return `${n.toLocaleString('en-US')}`
  // Whole millions once we're past 100M — "160M", not "160.00M".
  const decimals = n >= 100_000_000 ? 0 : 2
  return `${(n / 1_000_000).toFixed(decimals)}M`
}
