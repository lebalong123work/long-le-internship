import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { product } from '@/test/fixtures'
import { catchError, mockFetch } from '@/test/mockFetch'
import { PRODUCT_ERRORS } from './productErrors'
import { getBestSellers, getById, getByIds, getProducts, getRelated } from './productService'

const INVALID_STATUS = 502

function invalid(id: string): Record<string, unknown> {
  return { ...product(id), price: -1 }
}

function page(data: unknown[]) {
  return { data, first: 1, prev: null, next: null, last: 1, pages: 1, items: data.length }
}

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => undefined)
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('getProducts validation', () => {
  it('keeps the valid products of a page in order', async () => {
    mockFetch({ body: page([product('p2'), product('p1')]) })
    const result = await getProducts({})
    expect(result.data).toEqual([product('p2'), product('p1')])
  })

  it('leaves an invalid product out of a page', async () => {
    mockFetch({ body: page([product('p1'), invalid('p2'), product('p3')]) })
    const result = await getProducts({})
    expect(result.data.map((item) => item.id)).toEqual(['p1', 'p3'])
    expect(result.total).toBe(3)
  })

  it('returns an empty page when the server page is empty', async () => {
    mockFetch({ body: page([]) })
    const result = await getProducts({ category: 'jacket' })
    expect(result.data).toEqual([])
    expect(console.warn).not.toHaveBeenCalled()
  })

  it('throws Invalid product data when every product of a page is invalid', async () => {
    mockFetch({ body: page([invalid('p1'), invalid('p2')]) })
    const error = await catchError(getProducts({}))
    expect(error.status).toBe(INVALID_STATUS)
    expect(error.message).toBe(PRODUCT_ERRORS.invalidData)
  })
})

describe('getBestSellers validation', () => {
  it('returns valid best sellers', async () => {
    mockFetch({ body: page([product('p1'), product('p2')]) })
    await expect(getBestSellers('t-shirt')).resolves.toEqual([product('p1'), product('p2')])
  })

  it('leaves an invalid best seller out', async () => {
    mockFetch({ body: page([invalid('p1'), product('p2')]) })
    await expect(getBestSellers('t-shirt')).resolves.toEqual([product('p2')])
  })
})

describe('getRelated validation', () => {
  it('returns valid related products', async () => {
    mockFetch({ body: page([product('p2'), product('p3')]) })
    await expect(getRelated(product('p1'))).resolves.toEqual([product('p2'), product('p3')])
  })

  it('leaves an invalid related product out', async () => {
    mockFetch({ body: page([product('p2'), invalid('p3')]) })
    await expect(getRelated(product('p1'))).resolves.toEqual([product('p2')])
  })
})

describe('getByIds validation', () => {
  it('returns valid products in the order of the ids', async () => {
    mockFetch({ body: [product('p1'), product('p2')] })
    await expect(getByIds(['p2', 'p1'])).resolves.toEqual([product('p2'), product('p1')])
  })

  it('leaves an invalid product out of getByIds', async () => {
    mockFetch({ body: [product('p1'), invalid('p2')] })
    await expect(getByIds(['p2', 'p1'])).resolves.toEqual([product('p1')])
  })
})

describe('getById validation', () => {
  it('returns a valid product by id', async () => {
    mockFetch({ body: product('p1') })
    await expect(getById('p1')).resolves.toEqual(product('p1'))
  })

  it('throws Invalid product data for an invalid product by id', async () => {
    mockFetch({ body: invalid('p1') })
    const error = await catchError(getById('p1'))
    expect(error.status).toBe(INVALID_STATUS)
    expect(error.message).toBe(PRODUCT_ERRORS.invalidData)
  })
})
