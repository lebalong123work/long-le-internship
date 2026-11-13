import { z } from 'zod'
import { MAX_RATING } from '@/constants/product'
import { ApiError } from './apiClient'
import { PRODUCT_ERRORS } from './productErrors'
import type { Product } from '@/types'

const INVALID_DATA_STATUS = 502

const nonBlankText = z.string().regex(/\S/)
const countField = z.number().int().nonnegative()

export const productRecordSchema: z.ZodType<Product> = z.object({
  id: nonBlankText,
  name: nonBlankText,
  price: z.number().finite().nonnegative(),
  thumbnail: nonBlankText,
  images: z.array(nonBlankText).min(1),
  category: nonBlankText,
  description: z.string(),
  stock: countField,
  colors: z.array(nonBlankText),
  sizes: z.array(nonBlankText),
  rating: z.number().finite().min(0).max(MAX_RATING),
  reviewCount: countField,
  isBestSeller: z.boolean(),
  createdAt: z.string().datetime(),
})

interface InvalidProductIssue {
  path: string
  message: string
}

function recordId(record: unknown): string | undefined {
  if (typeof record !== 'object' || record === null || !('id' in record)) return undefined
  return typeof record.id === 'string' ? record.id : undefined
}

function logInvalidProduct(record: unknown, error: z.ZodError): void {
  const issues: InvalidProductIssue[] = error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }))
  console.warn('Invalid product record', { id: recordId(record), issues })
}

function invalidDataError(): ApiError {
  return new ApiError(INVALID_DATA_STATUS, PRODUCT_ERRORS.invalidData)
}

function tryParse(record: unknown): Product | undefined {
  const result = productRecordSchema.safeParse(record)
  if (result.success) return result.data
  logInvalidProduct(record, result.error)
  return undefined
}

export function parseProduct(record: unknown): Product {
  const product = tryParse(record)
  if (!product) throw invalidDataError()
  return product
}

export function parseProductList(records: unknown[]): Product[] {
  const products = records.flatMap((record) => {
    const product = tryParse(record)
    return product ? [product] : []
  })
  if (records.length > 0 && products.length === 0) throw invalidDataError()
  return products
}
