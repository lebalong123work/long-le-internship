import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { addItem, CART_ERRORS, mergeGuestCart, removeItem } from './cartService'
import type { Cart, CartItem } from '@/types'

const GUEST_ID = 'g1'

interface FakeCarts {
  carts: Cart[]
  writes: { method: string; id: string; body: Partial<Cart> }[]
  failNext: (method: 'POST' | 'PATCH', matches: (body: Partial<Cart>) => boolean) => void
}

function line(productId: string, quantity: number): CartItem {
  return { id: `${productId}__Black__M`, productId, color: 'Black', size: 'M', quantity }
}

function json(body: unknown, status = 200) {
  return Promise.resolve({
    ok: status < 400,
    status,
    statusText: status >= 500 ? 'Internal Server Error' : 'OK',
    text: () => Promise.resolve(JSON.stringify(body)),
  })
}

function fakeCarts(initial: Cart[]): FakeCarts {
  const state: FakeCarts = {
    carts: structuredClone(initial),
    writes: [],
    failNext: (method, matches) => failures.push({ method, matches }),
  }
  const failures: { method: string; matches: (body: Partial<Cart>) => boolean }[] = []
  let nextId = 1

  vi.stubGlobal(
    'fetch',
    vi.fn((input: string, init?: RequestInit) => {
      const url = new URL(input)
      const method = init?.method ?? 'GET'
      const body = init?.body ? (JSON.parse(init.body as string) as Partial<Cart>) : {}
      const failure = failures.findIndex((f) => f.method === method && f.matches(body))
      if (failure >= 0) {
        failures.splice(failure, 1)
        return json({}, 500)
      }
      if (method === 'GET') {
        const [[filter, value]] = [...url.searchParams.entries()]
        const field = filter.replace(':eq', '') as 'userId' | 'guestId'
        return json(state.carts.filter((cart) => cart[field] === value))
      }
      if (method === 'POST') {
        const created = { id: `new${nextId++}`, ...body } as Cart
        state.carts.push(created)
        state.writes.push({ method, id: created.id, body })
        return json(created, 201)
      }
      const id = decodeURIComponent(url.pathname.split('/').pop() ?? '')
      const cart = state.carts.find((c) => c.id === id)
      if (!cart) return json({}, 404)
      Object.assign(cart, body)
      state.writes.push({ method, id, body })
      return json(cart)
    })
  )
  return state
}

function cartOf(fake: FakeCarts, id: string): Cart | undefined {
  return fake.carts.find((cart) => cart.id === id)
}

const isStamp = (body: Partial<Cart>): boolean => Boolean(body.pendingMerge)
const isApply = (body: Partial<Cart>): boolean => body.appliedMergeIds !== undefined
const isFinish = (body: Partial<Cart>): boolean => body.pendingMerge === null

beforeEach(() => {
  vi.stubGlobal('crypto', { randomUUID: vi.fn(() => 'merge-1') })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('mergeGuestCart', () => {
  it('M-a returns nothing and writes nothing when the guest has no cart', async () => {
    const fake = fakeCarts([{ id: 'a', userId: 'u1', items: [] }])
    await expect(mergeGuestCart(GUEST_ID, 'u1')).resolves.toEqual({ status: 'nothing' })
    expect(fake.writes).toEqual([])
  })

  it('M-b does not stamp an empty guest cart', async () => {
    const fake = fakeCarts([{ id: 'g', guestId: GUEST_ID, items: [] }])
    await expect(mergeGuestCart(GUEST_ID, 'u1')).resolves.toEqual({ status: 'nothing' })
    expect(fake.writes).toEqual([])
  })

  it('M-c stamps, applies items + marker in one account write, then clears the guest cart', async () => {
    const fake = fakeCarts([
      { id: 'g', guestId: GUEST_ID, items: [line('p1', 2), line('p2', 1)] },
      { id: 'a', userId: 'u1', items: [line('p1', 1)] },
    ])

    const result = await mergeGuestCart(GUEST_ID, 'u1')

    expect(fake.writes.map((w) => [w.id, Object.keys(w.body).sort()])).toEqual([
      ['g', ['pendingMerge']],
      ['a', ['appliedMergeIds', 'items']],
      ['g', ['items', 'pendingMerge']],
    ])
    expect(cartOf(fake, 'a')).toMatchObject({
      items: [line('p2', 1), line('p1', 3)],
      appliedMergeIds: ['merge-1'],
    })
    expect(cartOf(fake, 'g')).toMatchObject({ items: [], pendingMerge: null })
    expect(result).toEqual({ status: 'merged', cart: cartOf(fake, 'a') })
  })

  it('M-d a failed stamp changes nothing and a retry merges once', async () => {
    const fake = fakeCarts([
      { id: 'g', guestId: GUEST_ID, items: [line('p1', 2)] },
      { id: 'a', userId: 'u1', items: [] },
    ])
    fake.failNext('PATCH', isStamp)

    await expect(mergeGuestCart(GUEST_ID, 'u1')).rejects.toMatchObject({ status: 500 })
    expect(cartOf(fake, 'g')).toEqual({ id: 'g', guestId: GUEST_ID, items: [line('p1', 2)] })

    await mergeGuestCart(GUEST_ID, 'u1')
    expect(cartOf(fake, 'a')?.items).toEqual([line('p1', 2)])
  })

  it('M-e a failed apply keeps the guest cart and the retry applies the same merge once', async () => {
    const fake = fakeCarts([
      { id: 'g', guestId: GUEST_ID, items: [line('p1', 2)] },
      { id: 'a', userId: 'u1', items: [line('p1', 1)] },
    ])
    fake.failNext('PATCH', isApply)

    await expect(mergeGuestCart(GUEST_ID, 'u1')).rejects.toMatchObject({ status: 500 })
    expect(cartOf(fake, 'g')?.items).toEqual([line('p1', 2)])
    expect(cartOf(fake, 'g')?.pendingMerge?.id).toBe('merge-1')
    expect(cartOf(fake, 'a')?.items).toEqual([line('p1', 1)])

    await mergeGuestCart(GUEST_ID, 'u1')
    expect(cartOf(fake, 'a')).toMatchObject({
      items: [line('p1', 3)],
      appliedMergeIds: ['merge-1'],
    })
    expect(cartOf(fake, 'g')).toMatchObject({ items: [], pendingMerge: null })
  })

  it('M-f a failed finish is completed by the retry without adding quantities again', async () => {
    const fake = fakeCarts([
      { id: 'g', guestId: GUEST_ID, items: [line('p1', 2)] },
      { id: 'a', userId: 'u1', items: [line('p1', 1)] },
    ])
    fake.failNext('PATCH', isFinish)

    await expect(mergeGuestCart(GUEST_ID, 'u1')).rejects.toMatchObject({ status: 500 })
    expect(cartOf(fake, 'a')?.items).toEqual([line('p1', 3)])
    expect(cartOf(fake, 'g')?.items).toEqual([line('p1', 2)])

    const writesBefore = fake.writes.length
    await mergeGuestCart(GUEST_ID, 'u1')
    expect(cartOf(fake, 'a')?.items).toEqual([line('p1', 3)])
    expect(cartOf(fake, 'g')).toMatchObject({ items: [], pendingMerge: null })
    expect(fake.writes.slice(writesBefore).map((w) => w.id)).toEqual(['g'])
  })

  it('M-g a merge pending for another account writes nothing and keeps the guest cart', async () => {
    const pending = { id: 'merge-0', userId: 'u1', items: [line('p1', 2)] }
    const fake = fakeCarts([
      { id: 'g', guestId: GUEST_ID, items: [line('p1', 2)], pendingMerge: pending },
      { id: 'a', userId: 'u1', items: [] },
      { id: 'b', userId: 'u2', items: [line('p9', 1)] },
    ])

    await expect(mergeGuestCart(GUEST_ID, 'u2')).resolves.toEqual({ status: 'otherAccount' })
    expect(fake.writes).toEqual([])
    expect(cartOf(fake, 'g')).toMatchObject({ items: [line('p1', 2)], pendingMerge: pending })
    expect(cartOf(fake, 'b')?.items).toEqual([line('p9', 1)])
  })

  it('M-h the original account completes a pending merge once', async () => {
    const pending = { id: 'merge-0', userId: 'u1', items: [line('p1', 2)] }
    const fake = fakeCarts([
      { id: 'g', guestId: GUEST_ID, items: [line('p1', 2)], pendingMerge: pending },
      { id: 'a', userId: 'u1', items: [] },
    ])

    await mergeGuestCart(GUEST_ID, 'u1')
    await mergeGuestCart(GUEST_ID, 'u1')

    expect(cartOf(fake, 'a')).toMatchObject({
      items: [line('p1', 2)],
      appliedMergeIds: ['merge-0'],
    })
    expect(cartOf(fake, 'g')).toMatchObject({ items: [], pendingMerge: null })
  })

  it('M-i creates the account cart once when the user has none', async () => {
    const fake = fakeCarts([{ id: 'g', guestId: GUEST_ID, items: [line('p1', 1)] }])

    await mergeGuestCart(GUEST_ID, 'u1')

    const posts = fake.writes.filter((w) => w.method === 'POST')
    expect(posts).toEqual([{ method: 'POST', id: 'new1', body: { userId: 'u1', items: [] } }])
    expect(cartOf(fake, 'new1')?.items).toEqual([line('p1', 1)])
  })

  it('M-j guest writes are refused while the merge is pending and allowed after the retry', async () => {
    const fake = fakeCarts([
      { id: 'g', guestId: GUEST_ID, items: [line('p1', 2)] },
      { id: 'a', userId: 'u1', items: [] },
    ])
    const guest = { kind: 'guest', id: GUEST_ID } as const
    fake.failNext('PATCH', isFinish)
    await expect(mergeGuestCart(GUEST_ID, 'u1')).rejects.toMatchObject({ status: 500 })

    await expect(removeItem(guest, line('p1', 2).id)).rejects.toMatchObject({
      status: 409,
      message: CART_ERRORS.mergePending,
    })
    expect(cartOf(fake, 'g')?.pendingMerge?.items).toEqual([line('p1', 2)])

    await mergeGuestCart(GUEST_ID, 'u1')
    await expect(
      addItem(guest, { productId: 'p3', color: 'Black', size: 'M', quantity: 1 })
    ).resolves.toMatchObject({
      items: [expect.objectContaining({ productId: 'p3' })],
    })
  })
})
