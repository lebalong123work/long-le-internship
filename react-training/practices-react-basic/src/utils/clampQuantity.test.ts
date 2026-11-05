import { clampQuantity } from './clampQuantity'

describe('clampQuantity', () => {
  it('keeps a quantity that is inside 1…stock', () => {
    expect(clampQuantity(5, 10)).toBe(5)
  })

  it('never goes below 1', () => {
    expect(clampQuantity(0, 10)).toBe(1)
    expect(clampQuantity(-3, 10)).toBe(1)
  })

  it('never goes above stock', () => {
    expect(clampQuantity(15, 10)).toBe(10)
  })

  it('rounds a decimal quantity down', () => {
    expect(clampQuantity(2.7, 10)).toBe(2)
  })

  it('turns an invalid quantity into 1', () => {
    expect(clampQuantity(Number.NaN, 10)).toBe(1)
  })

  it('returns 0 when the product is out of stock', () => {
    expect(clampQuantity(1, 0)).toBe(0)
    expect(clampQuantity(3, -1)).toBe(0)
  })
})
