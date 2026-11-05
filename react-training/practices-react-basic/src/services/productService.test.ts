import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, isNotFoundError } from './apiClient'
import {
  BEST_SELLER_LIMIT,
  getBestSellers,
  getById,
  getProducts,
  getRelated,
  PRODUCTS_PER_PAGE,
  RELATED_LIMIT,
} from './productService'
import type { Product } from '@/types'

const product: Product = {
  id: 'p1',
  name: 'Smart T-Shirt',
  price: 40,
  thumbnail: '/images/products/p1.jpg',
  images: ['/images/products/p1.jpg'],
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

function mockFetch(body: unknown, status = 200) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 404 ? 'Not Found' : 'OK',
    text: () => Promise.resolve(body === undefined ? '' : JSON.stringify(body)),
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function requestedUrl(fetchMock: ReturnType<typeof vi.fn>): URL {
  return new URL(fetchMock.mock.calls[0][0] as string)
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('getProducts', () => {
  it('sends default page params and omits undefined filters', async () => {
    const fetchMock = mockFetch(page([product]))
    await getProducts({})
    const url = requestedUrl(fetchMock)
    expect(url.pathname).toBe('/products')
    expect(url.searchParams.get('_page')).toBe('1')
    expect(url.searchParams.get('_per_page')).toBe(String(PRODUCTS_PER_PAGE))
    expect(url.searchParams.has('category:eq')).toBe(false)
    expect(url.searchParams.has('name:contains')).toBe(false)
    expect(url.searchParams.has('_sort')).toBe(false)
  })

  it('maps category, search, page and perPage to json-server params', async () => {
    const fetchMock = mockFetch(page([product]))
    await getProducts({ category: 't-shirt', search: 'smart', page: 2, perPage: 8 })
    const params = requestedUrl(fetchMock).searchParams
    expect(params.get('category:eq')).toBe('t-shirt')
    expect(params.get('name:contains')).toBe('smart')
    expect(params.get('_page')).toBe('2')
    expect(params.get('_per_page')).toBe('8')
  })

  it.each([
    ['newest', '-createdAt'],
    ['price-asc', 'price'],
    ['price-desc', '-price'],
  ] as const)('maps sort "%s" to _sort=%s', async (sort, expected) => {
    const fetchMock = mockFetch(page([]))
    await getProducts({ sort })
    expect(requestedUrl(fetchMock).searchParams.get('_sort')).toBe(expected)
  })

  it('maps the json-server page to PaginatedList', async () => {
    mockFetch(page([product], { prev: 1, next: 3, last: 3, pages: 3, items: 20 }))
    await expect(getProducts({ page: 2, perPage: 8 })).resolves.toEqual({
      data: [product],
      total: 20,
      page: 2,
      perPage: 8,
      totalPages: 3,
    })
  })

  it('returns page 1 with empty data when nothing matches', async () => {
    mockFetch(page([]))
    await expect(getProducts({ category: 'jacket' })).resolves.toEqual({
      data: [],
      total: 0,
      page: 1,
      perPage: PRODUCTS_PER_PAGE,
      totalPages: 1,
    })
  })
})

describe('getById', () => {
  it('returns the product', async () => {
    const fetchMock = mockFetch(product)
    await expect(getById('p1')).resolves.toEqual(product)
    expect(requestedUrl(fetchMock).pathname).toBe('/products/p1')
  })

  it('throws a not-found ApiError for an unknown id', async () => {
    mockFetch(undefined, 404)
    const error = await getById('xyz').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).status).toBe(404)
    expect((error as ApiError).message).toBe('Product not found')
    expect(isNotFoundError(error)).toBe(true)
  })

  it('re-throws other errors unchanged', async () => {
    mockFetch(undefined, 500)
    const error = await getById('p1').catch((e: unknown) => e)
    expect((error as ApiError).status).toBe(500)
    expect(isNotFoundError(error)).toBe(false)
  })
})

describe('getBestSellers', () => {
  it('filters by category and best-seller flag, max 8', async () => {
    const fetchMock = mockFetch(page([product]))
    await expect(getBestSellers('t-shirt')).resolves.toEqual([product])
    const params = requestedUrl(fetchMock).searchParams
    expect(params.get('category:eq')).toBe('t-shirt')
    expect(params.get('isBestSeller:eq')).toBe('true')
    expect(params.get('_page')).toBe('1')
    expect(params.get('_per_page')).toBe(String(BEST_SELLER_LIMIT))
  })
})

describe('getRelated', () => {
  it('asks for the same category without the current product, max 8', async () => {
    const other = { ...product, id: 'p2' }
    const fetchMock = mockFetch(page([other]))
    await expect(getRelated(product)).resolves.toEqual([other])
    const params = requestedUrl(fetchMock).searchParams
    expect(params.get('category:eq')).toBe('t-shirt')
    expect(params.get('id:ne')).toBe('p1')
    expect(params.get('_per_page')).toBe(String(RELATED_LIMIT))
  })
})
