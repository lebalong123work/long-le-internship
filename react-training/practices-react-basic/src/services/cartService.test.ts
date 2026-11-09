import { afterEach, describe, expect, it, vi } from 'vitest'
import { callBody, callInit, callUrl, catchError, mockFetch } from '@/test/mockFetch'
import { addItem, CART_ERRORS, clearCart, getCart, removeItem, updateQuantity } from './cartService'
import type { Cart, CartItem } from '@/types'

const blackS: CartItem = {
  id: 'p1__Black__S',
  productId: 'p1',
  color: 'Black',
  size: 'S',
  quantity: 2,
}
const blueM: CartItem = {
  id: 'p2__Blue__M',
  productId: 'p2',
  color: 'Blue',
  size: 'M',
  quantity: 1,
}

function cartWith(items: CartItem[]): Cart {
  return { id: 'c1', userId: 'u1', items }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('getCart', () => {
  it('returns the existing cart of the user', async () => {
    const cart = cartWith([blackS])
    const fetchMock = mockFetch({ body: [cart] })

    await expect(getCart('u1')).resolves.toEqual(cart)

    const url = callUrl(fetchMock, 0)
    expect(url.pathname).toBe('/carts')
    expect(url.searchParams.get('userId:eq')).toBe('u1')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('creates an empty cart when the user has none', async () => {
    const created = cartWith([])
    const fetchMock = mockFetch({ body: [] }, { body: created, status: 201 })

    await expect(getCart('u1')).resolves.toEqual(created)

    expect(callInit(fetchMock, 1).method).toBe('POST')
    expect(callUrl(fetchMock, 1).pathname).toBe('/carts')
    expect(callBody(fetchMock, 1)).toEqual({ userId: 'u1', items: [] })
  })

  it('rethrows a network error unchanged', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new TypeError('Failed to fetch')))

    const error = await catchError(getCart('u1'))
    expect(error.status).toBe(0)
    expect(error.message).toBe('Network error')
  })
})

describe('addItem', () => {
  it('adds a new line at the top with a generated id', async () => {
    const saved = cartWith([blackS, blueM])
    const fetchMock = mockFetch({ body: [cartWith([blueM])] }, { body: saved })

    const result = await addItem('u1', { productId: 'p1', color: 'Black', size: 'S', quantity: 2 })

    expect(result).toEqual(saved)
    expect(callInit(fetchMock, 1).method).toBe('PATCH')
    expect(callUrl(fetchMock, 1).pathname).toBe('/carts/c1')
    expect(callBody(fetchMock, 1)).toEqual({ items: [blackS, blueM] })
  })

  it('merges the same product, color and size into one line', async () => {
    const fetchMock = mockFetch({ body: [cartWith([blueM, blackS])] }, { body: cartWith([]) })

    await addItem('u1', { productId: 'p1', color: 'Black', size: 'S', quantity: 3 })

    expect(callBody(fetchMock, 1)).toEqual({ items: [blueM, { ...blackS, quantity: 5 }] })
  })

  it('keeps a different size as a separate line', async () => {
    const fetchMock = mockFetch({ body: [cartWith([blackS])] }, { body: cartWith([]) })

    await addItem('u1', { productId: 'p1', color: 'Black', size: 'M', quantity: 1 })

    expect(callBody(fetchMock, 1)).toEqual({
      items: [
        { id: 'p1__Black__M', productId: 'p1', color: 'Black', size: 'M', quantity: 1 },
        blackS,
      ],
    })
  })

  it('creates the cart first when adding to a missing cart', async () => {
    const fetchMock = mockFetch(
      { body: [] },
      { body: cartWith([]), status: 201 },
      { body: cartWith([blackS]) }
    )

    const result = await addItem('u1', { productId: 'p1', color: 'Black', size: 'S', quantity: 2 })

    expect(result).toEqual(cartWith([blackS]))
    expect(callInit(fetchMock, 1).method).toBe('POST')
    expect(callInit(fetchMock, 2).method).toBe('PATCH')
    expect(callBody(fetchMock, 2)).toEqual({ items: [blackS] })
  })
})

describe('updateQuantity', () => {
  it('sets the quantity of the item', async () => {
    const fetchMock = mockFetch({ body: [cartWith([blackS, blueM])] }, { body: cartWith([]) })

    await updateQuantity('u1', 'p2__Blue__M', 4)

    expect(callUrl(fetchMock, 1).pathname).toBe('/carts/c1')
    expect(callBody(fetchMock, 1)).toEqual({ items: [blackS, { ...blueM, quantity: 4 }] })
  })

  it('throws 404 when the item is not in the cart', async () => {
    const fetchMock = mockFetch({ body: [cartWith([blackS])] })

    const error = await catchError(updateQuantity('u1', 'missing', 2))
    expect(error.status).toBe(404)
    expect(error.message).toBe(CART_ERRORS.itemNotFound)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('rethrows a server error from the update', async () => {
    mockFetch({ body: [cartWith([blackS])] }, { body: {}, status: 500 })

    const error = await catchError(updateQuantity('u1', 'p1__Black__S', 3))
    expect(error.status).toBe(500)
    expect(error.message).toBe('Internal Server Error')
  })
})

describe('removeItem', () => {
  it('removes the item from the cart', async () => {
    const saved = cartWith([blueM])
    const fetchMock = mockFetch({ body: [cartWith([blackS, blueM])] }, { body: saved })

    await expect(removeItem('u1', 'p1__Black__S')).resolves.toEqual(saved)

    expect(callInit(fetchMock, 1).method).toBe('PATCH')
    expect(callBody(fetchMock, 1)).toEqual({ items: [blueM] })
  })

  it('does nothing when the item is already gone', async () => {
    const cart = cartWith([blueM])
    const fetchMock = mockFetch({ body: [cart] })

    await expect(removeItem('u1', 'p1__Black__S')).resolves.toEqual(cart)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})

describe('clearCart', () => {
  it('empties the items of the cart', async () => {
    const fetchMock = mockFetch({ body: [cartWith([blackS, blueM])] }, { body: cartWith([]) })

    await expect(clearCart('u1')).resolves.toBeUndefined()

    expect(callInit(fetchMock, 1).method).toBe('PATCH')
    expect(callUrl(fetchMock, 1).pathname).toBe('/carts/c1')
    expect(callBody(fetchMock, 1)).toEqual({ items: [] })
  })

  it('rethrows a server error from clearing', async () => {
    mockFetch({ body: [cartWith([blackS])] }, { body: {}, status: 500 })

    const error = await catchError(clearCart('u1'))
    expect(error.status).toBe(500)
    expect(error.message).toBe('Internal Server Error')
  })
})
