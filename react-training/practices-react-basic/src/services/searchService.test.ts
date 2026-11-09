import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from './apiClient'
import {
  SEARCH_RESULTS_PER_PAGE,
  searchProducts,
  searchSuggestions,
  SUGGESTION_LIMIT,
} from './searchService'
import type { Category, Product } from '@/types'

function product(id: string): Product {
  return {
    id,
    name: 'Smart T-Shirt',
    price: 40,
    thumbnail: `/images/products/${id}.jpg`,
    images: [`/images/products/${id}.jpg`],
    category: 't-shirt',
    description: 'Best quality',
    stock: 1234,
    colors: ['Black'],
    sizes: ['S'],
    rating: 5,
    reviewCount: 1000,
    isBestSeller: true,
    createdAt: '2026-11-03T00:00:00.000Z',
  }
}

const tShirt: Category = { id: 'c1', name: 'T-Shirt', slug: 't-shirt' }
const shirt: Category = { id: 'c3', name: 'Shirt', slug: 'shirt' }

function page(data: Product[], overrides: Record<string, unknown> = {}) {
  return {
    data,
    first: 1,
    prev: null,
    next: null,
    last: 1,
    pages: 1,
    items: data.length,
    ...overrides,
  }
}

interface MockResponse {
  body?: unknown
  status?: number
}

function fakeResponse({ body, status = 200 }: MockResponse) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status >= 500 ? 'Internal Server Error' : 'OK',
    text: () => Promise.resolve(body === undefined ? '' : JSON.stringify(body)),
  }
}

function mockRoutes(routes: Record<string, MockResponse>) {
  const fetchMock = vi.fn((input: string) => {
    const route = routes[new URL(input).pathname]
    return Promise.resolve(fakeResponse(route ?? { status: 404 }))
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function mockNetworkFailure() {
  const fetchMock = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function requestedUrls(fetchMock: ReturnType<typeof vi.fn>): URL[] {
  return fetchMock.mock.calls.map(([input]) => new URL(input as string))
}

function urlFor(fetchMock: ReturnType<typeof vi.fn>, pathname: string): URL | undefined {
  return requestedUrls(fetchMock).find((url) => url.pathname === pathname)
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('searchProducts', () => {
  it('sends the trimmed query as a product name filter', async () => {
    const fetchMock = mockRoutes({ '/products': { body: page([product('p1')]) } })
    await searchProducts('  smart  ')
    const url = urlFor(fetchMock, '/products')
    expect(url?.searchParams.get('name:contains')).toBe('smart')
  })

  it('returns an empty result without a request for a blank query', async () => {
    const fetchMock = mockRoutes({})
    await expect(searchProducts('   ')).resolves.toEqual({
      data: [],
      total: 0,
      page: 1,
      perPage: SEARCH_RESULTS_PER_PAGE,
      totalPages: 0,
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('maps the server page to a paginated list of 8 per page', async () => {
    const data = [product('p1'), product('p2')]
    const fetchMock = mockRoutes({
      '/products': { body: page(data, { prev: 1, next: 3, last: 3, pages: 3, items: 18 }) },
    })
    await expect(searchProducts('smart', 2)).resolves.toEqual({
      data,
      total: 18,
      page: 2,
      perPage: SEARCH_RESULTS_PER_PAGE,
      totalPages: 3,
    })
    expect(urlFor(fetchMock, '/products')?.searchParams.get('_per_page')).toBe('8')
  })

  it('returns an empty list when no product matches', async () => {
    mockRoutes({ '/products': { body: page([], { items: 0 }) } })
    const result = await searchProducts('jacket')
    expect(result.data).toEqual([])
    expect(result.total).toBe(0)
  })

  it('requests the given page', async () => {
    const fetchMock = mockRoutes({ '/products': { body: page([product('p1')], { prev: 2 }) } })
    await searchProducts('smart', 3)
    expect(urlFor(fetchMock, '/products')?.searchParams.get('_page')).toBe('3')
  })

  it('requests page 1 when no page is given', async () => {
    const fetchMock = mockRoutes({ '/products': { body: page([product('p1')]) } })
    await searchProducts('smart')
    expect(urlFor(fetchMock, '/products')?.searchParams.get('_page')).toBe('1')
  })

  it('rethrows a network error from product search', async () => {
    mockNetworkFailure()
    const error = await searchProducts('smart').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 0, message: 'Network error' })
  })

  it('rethrows a server error from product search', async () => {
    mockRoutes({ '/products': { status: 500 } })
    const error = await searchProducts('smart').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 500, message: 'Internal Server Error' })
  })
})

describe('searchSuggestions', () => {
  it('requests categories and products by the trimmed query', async () => {
    const fetchMock = mockRoutes({
      '/categories': { body: [shirt] },
      '/products': { body: page([product('p1')]) },
    })
    await searchSuggestions('  shirt ')
    const categoriesUrl = urlFor(fetchMock, '/categories')
    const productsUrl = urlFor(fetchMock, '/products')
    expect(categoriesUrl?.searchParams.get('name:contains')).toBe('shirt')
    expect(productsUrl?.searchParams.get('name:contains')).toBe('shirt')
    expect(productsUrl?.searchParams.get('_page')).toBe('1')
    expect(productsUrl?.searchParams.get('_per_page')).toBe(String(SUGGESTION_LIMIT))
  })

  it('returns no suggestions without a request for a blank query', async () => {
    const fetchMock = mockRoutes({})
    await expect(searchSuggestions('  ')).resolves.toEqual([])
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns matching categories before matching products', async () => {
    mockRoutes({
      '/categories': { body: [tShirt, shirt] },
      '/products': { body: page([product('p1')]) },
    })
    await expect(searchSuggestions('shirt')).resolves.toEqual([
      { type: 'category', category: tShirt },
      { type: 'category', category: shirt },
      { type: 'product', product: product('p1') },
    ])
  })

  it('returns an empty list when nothing matches', async () => {
    mockRoutes({ '/categories': { body: [] }, '/products': { body: page([]) } })
    await expect(searchSuggestions('hat')).resolves.toEqual([])
  })

  it('returns at most 8 suggestions in total', async () => {
    const products = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'].map(product)
    mockRoutes({
      '/categories': { body: [tShirt, shirt] },
      '/products': { body: page(products) },
    })
    const suggestions = await searchSuggestions('shirt')
    expect(suggestions).toHaveLength(SUGGESTION_LIMIT)
    expect(suggestions.slice(0, 2).map((s) => s.type)).toEqual(['category', 'category'])
    expect(suggestions[SUGGESTION_LIMIT - 1]).toEqual({ type: 'product', product: product('p6') })
  })

  it('keeps every suggestion when fewer than 8 match', async () => {
    mockRoutes({
      '/categories': { body: [shirt] },
      '/products': { body: page([product('p1'), product('p2')]) },
    })
    await expect(searchSuggestions('shirt')).resolves.toHaveLength(3)
  })

  it('rejects when the category request fails', async () => {
    mockRoutes({ '/categories': { status: 500 }, '/products': { body: page([product('p1')]) } })
    const error = await searchSuggestions('shirt').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 500 })
  })

  it('rejects when the product request fails', async () => {
    mockRoutes({ '/categories': { body: [shirt] }, '/products': { status: 500 } })
    const error = await searchSuggestions('shirt').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 500 })
  })
})
