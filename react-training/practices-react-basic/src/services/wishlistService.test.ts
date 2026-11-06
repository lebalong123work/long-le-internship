import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from './apiClient'
import { add, getWishlist, remove } from './wishlistService'
import type { Wishlist } from '@/types'

function wishlistWith(productIds: string[]): Wishlist {
  return { id: 'w1', userId: 'u1', productIds }
}

interface MockResponse {
  body: unknown
  status?: number
}

function response({ body, status = 200 }: MockResponse) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 500 ? 'Internal Server Error' : 'OK',
    text: () => Promise.resolve(JSON.stringify(body)),
  }
}

function mockFetch(...responses: MockResponse[]) {
  const fetchMock = vi.fn()
  for (const r of responses) fetchMock.mockResolvedValueOnce(response(r))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function callUrl(fetchMock: ReturnType<typeof vi.fn>, index: number): URL {
  return new URL(fetchMock.mock.calls[index][0] as string)
}

function callInit(fetchMock: ReturnType<typeof vi.fn>, index: number): RequestInit {
  return fetchMock.mock.calls[index][1] as RequestInit
}

function callBody(fetchMock: ReturnType<typeof vi.fn>, index: number): unknown {
  return JSON.parse(callInit(fetchMock, index).body as string)
}

async function catchError(promise: Promise<unknown>): Promise<ApiError> {
  try {
    await promise
  } catch (error) {
    if (error instanceof ApiError) return error
    throw error
  }
  throw new Error('expected an ApiError')
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('getWishlist', () => {
  it("returns the product ids of the user's first wishlist", async () => {
    const fetchMock = mockFetch({
      body: [wishlistWith(['p2', 'p1']), { id: 'w2', userId: 'u1', productIds: ['p9'] }],
    })

    await expect(getWishlist('u1')).resolves.toEqual(['p2', 'p1'])
    const url = callUrl(fetchMock, 0)
    expect(url.pathname).toBe('/wishlists')
    expect(url.searchParams.get('userId:eq')).toBe('u1')
  })

  it('returns an empty list without creating a wishlist when the user has none', async () => {
    const fetchMock = mockFetch({ body: [] })

    await expect(getWishlist('u1')).resolves.toEqual([])
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})

describe('add', () => {
  it('add puts a new product at the top with a PATCH', async () => {
    const fetchMock = mockFetch(
      { body: [wishlistWith(['p1'])] },
      { body: wishlistWith(['p2', 'p1']) }
    )

    await add('u1', 'p2')

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(callInit(fetchMock, 1).method).toBe('PATCH')
    expect(callUrl(fetchMock, 1).pathname).toBe('/wishlists/w1')
    expect(callBody(fetchMock, 1)).toEqual({ productIds: ['p2', 'p1'] })
  })

  it('add sends no PATCH when the product is already saved', async () => {
    const fetchMock = mockFetch({ body: [wishlistWith(['p1'])] })

    await add('u1', 'p1')

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('add creates the wishlist with the product when the user has none', async () => {
    const fetchMock = mockFetch({ body: [] }, { body: wishlistWith(['p1']), status: 201 })

    await add('u1', 'p1')

    expect(callInit(fetchMock, 1).method).toBe('POST')
    expect(callUrl(fetchMock, 1).pathname).toBe('/wishlists')
    expect(callBody(fetchMock, 1)).toEqual({ userId: 'u1', productIds: ['p1'] })
  })

  it('add rethrows a server error and creates nothing', async () => {
    const fetchMock = mockFetch({ body: {}, status: 500 })

    const error = await catchError(add('u1', 'p1'))

    expect(error.status).toBe(500)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})

describe('remove', () => {
  it('remove drops the product with a PATCH', async () => {
    const fetchMock = mockFetch(
      { body: [wishlistWith(['p2', 'p1', 'p3'])] },
      { body: wishlistWith(['p2', 'p3']) }
    )

    await remove('u1', 'p1')

    expect(callInit(fetchMock, 1).method).toBe('PATCH')
    expect(callUrl(fetchMock, 1).pathname).toBe('/wishlists/w1')
    expect(callBody(fetchMock, 1)).toEqual({ productIds: ['p2', 'p3'] })
  })

  it('remove sends no request when the product is not saved', async () => {
    const fetchMock = mockFetch({ body: [wishlistWith(['p2'])] })

    await remove('u1', 'p1')

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('remove does nothing when the user has no wishlist', async () => {
    const fetchMock = mockFetch({ body: [] })

    await expect(remove('u1', 'p1')).resolves.toBeUndefined()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('remove rethrows a network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    const error = await catchError(remove('u1', 'p1'))

    expect(error.status).toBe(0)
  })
})
