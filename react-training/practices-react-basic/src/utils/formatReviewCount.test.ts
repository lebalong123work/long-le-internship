import { formatReviewCount } from './formatReviewCount'

describe('formatReviewCount — below 1000', () => {
  it('shows counts below 1000 as they are', () => {
    expect(formatReviewCount(0)).toBe('0')
    expect(formatReviewCount(999)).toBe('999')
  })

  it('rounds a decimal count down before formatting', () => {
    expect(formatReviewCount(999.9)).toBe('999')
  })
})

describe('formatReviewCount — thousands', () => {
  it('shows 1000 as 1k and 1500 as 1.5k', () => {
    expect(formatReviewCount(1000)).toBe('1k')
    expect(formatReviewCount(1500)).toBe('1.5k')
  })

  it('rounds thousands down, never up', () => {
    expect(formatReviewCount(1999)).toBe('1.9k')
    expect(formatReviewCount(1050)).toBe('1k')
  })
})

describe('formatReviewCount — millions', () => {
  it('shows 1000000 as 1M and 2500000 as 2.5M', () => {
    expect(formatReviewCount(1_000_000)).toBe('1M')
    expect(formatReviewCount(2_500_000)).toBe('2.5M')
  })

  it('shows 999999 as 999.9k, not 1M', () => {
    expect(formatReviewCount(999_999)).toBe('999.9k')
  })
})

describe('formatReviewCount — invalid input', () => {
  it('shows 0 for a negative count', () => {
    expect(formatReviewCount(-5)).toBe('0')
  })

  it('shows 0 for NaN, Infinity and -Infinity', () => {
    expect(formatReviewCount(Number.NaN)).toBe('0')
    expect(formatReviewCount(Number.POSITIVE_INFINITY)).toBe('0')
    expect(formatReviewCount(Number.NEGATIVE_INFINITY)).toBe('0')
  })
})
