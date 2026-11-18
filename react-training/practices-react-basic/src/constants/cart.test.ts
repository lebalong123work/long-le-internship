import { describe, expect, it } from 'vitest'
import { CART_TEXT } from './cart'

describe('CART_TEXT', () => {
  it('builds the variant text from the selected color and size', () => {
    expect(CART_TEXT.variant('Black', 'S')).toBe('Color : Black · Size : S')
  })

  it('leaves out a missing color or size', () => {
    expect(CART_TEXT.variant('', 'S')).toBe('Size : S')
    expect(CART_TEXT.variant('Black', '')).toBe('Color : Black')
    expect(CART_TEXT.variant('', '')).toBe('')
  })

  it('uses the plural product count', () => {
    expect(CART_TEXT.productCount(4)).toBe('4 Products')
    expect(CART_TEXT.productCount(0)).toBe('0 Products')
  })

  it('uses the singular product count for one item', () => {
    expect(CART_TEXT.productCount(1)).toBe('1 Product')
  })
})
