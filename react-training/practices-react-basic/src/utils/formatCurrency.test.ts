import { formatCurrency } from './formatCurrency'

describe('formatCurrency', () => {
  it('formats the short card price like Figma ("40$")', () => {
    expect(formatCurrency(40, 'short')).toBe('40$')
  })

  it('formats the long price like Figma ("$40 USD")', () => {
    expect(formatCurrency(40, 'long')).toBe('$40 USD')
  })

  it('uses the long format by default', () => {
    expect(formatCurrency(160)).toBe('$160 USD')
  })

  it('adds thousands separators', () => {
    expect(formatCurrency(1200, 'short')).toBe('1,200$')
    expect(formatCurrency(1200, 'long')).toBe('$1,200 USD')
  })

  it('shows 2 decimals for non-whole amounts', () => {
    expect(formatCurrency(39.5, 'short')).toBe('39.50$')
    expect(formatCurrency(39.5, 'long')).toBe('$39.50 USD')
    expect(formatCurrency(19.999, 'long')).toBe('$20.00 USD')
  })

  it('formats zero', () => {
    expect(formatCurrency(0, 'short')).toBe('0$')
    expect(formatCurrency(0)).toBe('$0 USD')
  })
})
