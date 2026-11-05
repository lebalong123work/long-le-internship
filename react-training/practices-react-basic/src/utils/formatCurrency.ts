export type CurrencyFormat = 'short' | 'long'

const wholeNumber = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })
const twoDecimals = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatCurrency(amount: number, format: CurrencyFormat = 'long'): string {
  const value = Number.isInteger(amount) ? wholeNumber.format(amount) : twoDecimals.format(amount)
  return format === 'short' ? `${value}$` : `$${value} USD`
}
