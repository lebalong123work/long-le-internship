import { describe, expect, it } from 'vitest'
import { PRODUCT_DETAIL_TEXT, SWATCH_COLORS } from './productDetail'

function staticTexts(): string[] {
  return Object.values(PRODUCT_DETAIL_TEXT).flatMap((value) =>
    typeof value === 'string' ? [value] : []
  )
}

describe('productDetail constants', () => {
  it('maps Black, Blue and Green to the Figma swatch colors', () => {
    expect(SWATCH_COLORS).toEqual({ Black: '#19181D', Blue: '#5463FF', Green: '#7DAC5F' })
  })

  it('has no blank text', () => {
    for (const text of staticTexts()) expect(text.trim()).not.toBe('')
  })

  it('stockCount(1234) is ( 1234 )', () => {
    expect(PRODUCT_DETAIL_TEXT.stockCount(1234)).toBe('( 1234 )')
  })

  it('showPhoto(2, 3) names the position', () => {
    expect(PRODUCT_DETAIL_TEXT.showPhoto(2, 3)).toBe('Show photo 2 of 3')
    expect(PRODUCT_DETAIL_TEXT.photoStatus(2, 3)).toBe('Photo 2 of 3')
    expect(PRODUCT_DETAIL_TEXT.mainPhotoAlt('Smart T-Shirt', 2, 3)).toBe(
      'Smart T-Shirt, photo 2 of 3'
    )
  })

  it('stockCountLabel(0) reads 0 in stock', () => {
    expect(PRODUCT_DETAIL_TEXT.stockCountLabel(0)).toBe('0 in stock')
  })
})
