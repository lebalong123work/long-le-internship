const THOUSAND = 1_000
const MILLION = 1_000_000

function withOneDecimalDown(value: number, unit: number, suffix: string): string {
  const tenths = Math.floor((value / unit) * 10) / 10
  return `${tenths}${suffix}`
}

export function formatReviewCount(count: number): string {
  if (!Number.isFinite(count) || count < 0) return '0'
  const whole = Math.floor(count)
  if (whole < THOUSAND) return String(whole)
  if (whole < MILLION) return withOneDecimalDown(whole, THOUSAND, 'k')
  return withOneDecimalDown(whole, MILLION, 'M')
}
