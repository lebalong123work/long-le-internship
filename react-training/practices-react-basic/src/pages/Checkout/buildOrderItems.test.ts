import { describe, expect, it } from 'vitest'
import { product } from '@/test/fixtures'
import { buildOrderItems } from './buildOrderItems'
import type { CartItem } from '@/types'

function cartItem(productId: string, quantity: number): CartItem {
  return { id: `${productId}__Black__S`, productId, color: 'Black', size: 'S', quantity }
}

describe('buildOrderItems', () => {
  it('copies the product name, price and image with the cart variant and quantity', () => {
    const tee = { ...product('p1'), name: 'Tee One', price: 55 }
    const blank = { ...product('p2'), images: [], thumbnail: '' }
    expect(
      buildOrderItems([
        { item: cartItem('p1', 2), product: tee },
        { item: cartItem('p2', 1), product: blank },
      ])
    ).toEqual([
      {
        productId: 'p1',
        name: 'Tee One',
        price: 55,
        image: '/images/products/p1.jpg',
        color: 'Black',
        size: 'S',
        quantity: 2,
      },
      {
        productId: 'p2',
        name: 'Smart T-Shirt',
        price: 40,
        image: '',
        color: 'Black',
        size: 'S',
        quantity: 1,
      },
    ])
  })

  it('keeps the cart order', () => {
    const items = buildOrderItems([
      { item: cartItem('p2', 1), product: product('p2') },
      { item: cartItem('p1', 1), product: product('p1') },
    ])
    expect(items.map((item) => item.productId)).toEqual(['p2', 'p1'])
  })

  it('returns no items for no lines', () => {
    expect(buildOrderItems([])).toEqual([])
  })

  it('leaves out a line without a product', () => {
    const items = buildOrderItems([
      { item: cartItem('p1', 1), product: product('p1') },
      { item: cartItem('p9', 1), product: null },
    ])
    expect(items.map((item) => item.productId)).toEqual(['p1'])
  })
})
