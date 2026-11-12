import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { product } from '@/test/fixtures'
import seed from '../../server/db.seed.json'
import { ApiError } from './apiClient'
import { PRODUCT_ERRORS } from './productErrors'
import { parseProduct, parseProductList, productRecordSchema } from './productRecord'
import type { MockInstance } from 'vitest'

let warn: MockInstance<typeof console.warn>

function withField(field: string, value: unknown): Record<string, unknown> {
  return { ...product('p1'), [field]: value }
}

function accepts(field: string, value: unknown): boolean {
  return productRecordSchema.safeParse(withField(field, value)).success
}

function catchParseError(run: () => unknown): ApiError {
  try {
    run()
  } catch (error) {
    if (error instanceof ApiError) return error
    throw error
  }
  throw new Error('expected an ApiError')
}

beforeEach(() => {
  warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('productRecordSchema — whole record', () => {
  it('parses every seed product', () => {
    for (const record of seed.products) {
      expect(productRecordSchema.parse(record)).toEqual(record)
    }
  })

  it('rejects a record with a missing field', () => {
    const record: Record<string, unknown> = { ...product('p1') }
    delete record.reviewCount
    expect(productRecordSchema.safeParse(record).success).toBe(false)
  })
})

describe('productRecordSchema — text fields', () => {
  it('accepts a non-blank id', () => {
    expect(accepts('id', 'p1')).toBe(true)
  })

  it('rejects a blank id', () => {
    expect(accepts('id', '')).toBe(false)
  })

  it('accepts a name with spaces around it unchanged', () => {
    expect(productRecordSchema.parse(withField('name', ' Smart T-Shirt ')).name).toBe(
      ' Smart T-Shirt '
    )
  })

  it('rejects a spaces-only name', () => {
    expect(accepts('name', '   ')).toBe(false)
  })

  it('accepts a thumbnail path', () => {
    expect(accepts('thumbnail', '/images/products/p1.jpg')).toBe(true)
  })

  it('rejects a blank thumbnail', () => {
    expect(accepts('thumbnail', ' ')).toBe(false)
  })

  it('accepts a category slug', () => {
    expect(accepts('category', 't-shirt')).toBe(true)
  })

  it('rejects a blank category', () => {
    expect(accepts('category', '')).toBe(false)
  })

  it('accepts an empty description', () => {
    expect(accepts('description', '')).toBe(true)
  })

  it('rejects a non-string description', () => {
    expect(accepts('description', 42)).toBe(false)
  })
})

describe('productRecordSchema — numbers', () => {
  it('accepts a price of 0 and a decimal price', () => {
    expect(accepts('price', 0)).toBe(true)
    expect(accepts('price', 39.5)).toBe(true)
  })

  it('rejects a negative, NaN or infinite price', () => {
    expect(accepts('price', -1)).toBe(false)
    expect(accepts('price', Number.NaN)).toBe(false)
    expect(accepts('price', Number.POSITIVE_INFINITY)).toBe(false)
    expect(accepts('price', Number.NEGATIVE_INFINITY)).toBe(false)
  })

  it('accepts a stock of 0', () => {
    expect(accepts('stock', 0)).toBe(true)
  })

  it('rejects a negative or decimal stock', () => {
    expect(accepts('stock', -1)).toBe(false)
    expect(accepts('stock', 1.5)).toBe(false)
  })

  it('accepts ratings 0 and 5', () => {
    expect(accepts('rating', 0)).toBe(true)
    expect(accepts('rating', 5)).toBe(true)
  })

  it('rejects a rating below 0, above 5 or NaN', () => {
    expect(accepts('rating', -0.1)).toBe(false)
    expect(accepts('rating', 5.1)).toBe(false)
    expect(accepts('rating', Number.NaN)).toBe(false)
  })

  it('accepts a review count of 0', () => {
    expect(accepts('reviewCount', 0)).toBe(true)
  })

  it('rejects a negative or decimal review count', () => {
    expect(accepts('reviewCount', -1)).toBe(false)
    expect(accepts('reviewCount', 10.5)).toBe(false)
  })
})

describe('productRecordSchema — lists', () => {
  it('accepts one or more image paths', () => {
    expect(accepts('images', ['/a.jpg'])).toBe(true)
    expect(accepts('images', ['/a.jpg', '/b.jpg'])).toBe(true)
  })

  it('rejects an empty images list or a blank image', () => {
    expect(accepts('images', [])).toBe(false)
    expect(accepts('images', ['/a.jpg', ' '])).toBe(false)
  })

  it('accepts an empty or filled colors list', () => {
    expect(accepts('colors', [])).toBe(true)
    expect(accepts('colors', ['Black', 'Blue'])).toBe(true)
  })

  it('rejects a blank color', () => {
    expect(accepts('colors', ['Black', ''])).toBe(false)
  })

  it('accepts an empty or filled sizes list', () => {
    expect(accepts('sizes', [])).toBe(true)
    expect(accepts('sizes', ['S', 'M'])).toBe(true)
  })

  it('rejects a blank size', () => {
    expect(accepts('sizes', ['  '])).toBe(false)
  })
})

describe('productRecordSchema — flag and date', () => {
  it('accepts true and false', () => {
    expect(accepts('isBestSeller', true)).toBe(true)
    expect(accepts('isBestSeller', false)).toBe(true)
  })

  it('rejects a non-boolean best-seller flag', () => {
    expect(accepts('isBestSeller', 'true')).toBe(false)
  })

  it('accepts a UTC date-time with and without milliseconds', () => {
    expect(accepts('createdAt', '2026-11-03T00:00:00.000Z')).toBe(true)
    expect(accepts('createdAt', '2026-11-03T00:00:00Z')).toBe(true)
  })

  it('rejects an offset date-time or a non-date string', () => {
    expect(accepts('createdAt', '2026-11-03T07:00:00+07:00')).toBe(false)
    expect(accepts('createdAt', '2026-11-03')).toBe(false)
    expect(accepts('createdAt', 'yesterday')).toBe(false)
  })
})

describe('parseProduct', () => {
  it('returns a valid product', () => {
    expect(parseProduct(product('p1'))).toEqual(product('p1'))
  })

  it('throws Invalid product data with status 502 for an invalid product', () => {
    const error = catchParseError(() => parseProduct(withField('price', -1)))
    expect(error.status).toBe(502)
    expect(error.message).toBe(PRODUCT_ERRORS.invalidData)
  })
})

describe('parseProductList', () => {
  it('keeps valid products in their order', () => {
    expect(parseProductList([product('p3'), product('p1')])).toEqual([product('p3'), product('p1')])
  })

  it('leaves invalid products out', () => {
    const invalid = { ...product('p2'), name: '' }
    expect(parseProductList([product('p1'), invalid, product('p3')])).toEqual([
      product('p1'),
      product('p3'),
    ])
  })

  it('returns an empty list for no records', () => {
    expect(parseProductList([])).toEqual([])
    expect(warn).not.toHaveBeenCalled()
  })

  it('throws Invalid product data when every record is invalid', () => {
    const error = catchParseError(() =>
      parseProductList([
        { ...product('p1'), rating: 9 },
        { ...product('p2'), images: [] },
      ])
    )
    expect(error.status).toBe(502)
    expect(error.message).toBe(PRODUCT_ERRORS.invalidData)
  })

  it('warns once per invalid record with its id and issue paths', () => {
    parseProductList([product('p1'), { ...product('p2'), price: -1 }, { name: 'x', id: 7 }])
    expect(warn).toHaveBeenCalledTimes(2)
    expect(warn).toHaveBeenNthCalledWith(1, 'Invalid product record', {
      id: 'p2',
      issues: [{ path: 'price', message: expect.any(String) }],
    })
    expect(warn.mock.calls[1][1]).toMatchObject({ id: undefined })
  })

  it('does not warn for valid records', () => {
    parseProductList([product('p1'), product('p2')])
    expect(warn).not.toHaveBeenCalled()
  })
})
