import { calcCartTotals } from './cartTotals'
import type { OrderItem } from '@/types'

describe('calcCartTotals', () => {
  it('matches the Figma cart: quantities 2, 1, 1 at $40', () => {
    const lines = [
      { price: 40, quantity: 2 },
      { price: 40, quantity: 1 },
      { price: 40, quantity: 1 },
    ]
    expect(calcCartTotals(lines)).toEqual({
      itemCount: 4,
      subtotal: 160,
      shippingFee: 0,
      total: 160,
    })
  })

  it('returns zeros for an empty cart', () => {
    expect(calcCartTotals([])).toEqual({ itemCount: 0, subtotal: 0, shippingFee: 0, total: 0 })
  })

  it('rounds money to cents', () => {
    const totals = calcCartTotals([{ price: 19.99, quantity: 3 }])
    expect(totals.subtotal).toBe(59.97)
    expect(totals.total).toBe(59.97)
  })

  it('adds the shipping fee to the total', () => {
    const totals = calcCartTotals([{ price: 10, quantity: 1 }])
    expect(totals.total).toBe(totals.subtotal + totals.shippingFee)
  })

  it('accepts order items directly (price snapshot)', () => {
    const items: OrderItem[] = [
      {
        productId: 'p1',
        name: 'Smart T-Shirt',
        price: 40,
        image: '/images/products/acn5ERAeSb4-main.jpg',
        color: 'Black',
        size: 'S',
        quantity: 2,
      },
    ]
    expect(calcCartTotals(items)).toMatchObject({ itemCount: 2, subtotal: 80 })
  })
})
