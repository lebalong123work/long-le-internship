import { describe, expect, it } from 'vitest'
import { countCartItems } from './countCartItems'

function lines(...quantities: number[]) {
  return quantities.map((quantity) => ({ quantity }))
}

describe('countCartItems', () => {
  it('sums the quantity of every line', () => {
    expect(countCartItems(lines(1, 2, 3))).toBe(6)
  })

  it('returns 0 for an empty list', () => {
    expect(countCartItems([])).toBe(0)
  })

  it('returns 0 when the items are undefined', () => {
    expect(countCartItems(undefined)).toBe(0)
  })

  it('returns 0 when every quantity is invalid', () => {
    expect(countCartItems(lines(Number.NaN, -1, 0))).toBe(0)
  })

  it('counts only finite positive quantities', () => {
    expect(countCartItems(lines(2, Number.NaN, 3))).toBe(5)
  })

  it('ignores NaN, Infinity, 0 and negative quantities', () => {
    expect(
      countCartItems(
        lines(1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, 0, -4)
      )
    ).toBe(1)
  })

  it('rounds 2.7 down to 2', () => {
    expect(countCartItems(lines(2.7))).toBe(2)
  })

  it('counts 0.5 as 0', () => {
    expect(countCartItems(lines(0.5))).toBe(0)
  })
})
