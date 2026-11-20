import { describe, expect, it } from 'vitest'
import { VALIDATION_MESSAGES } from './common'
import { orderLookupSchema } from './orderLookup'

function fieldErrors(values: Record<string, string>): Record<string, string[] | undefined> {
  const result = orderLookupSchema.safeParse(values)
  return result.success ? {} : result.error.flatten().fieldErrors
}

const valid = { email: 'guest@store.com', orderNumber: '#ORD-AbC_12' }

describe('orderLookupSchema', () => {
  it('V1 accepts a valid email and order number', () => {
    expect(orderLookupSchema.safeParse(valid).success).toBe(true)
  })

  it('V2 rejects an invalid email', () => {
    expect(fieldErrors({ ...valid, email: 'guest@' }).email).toEqual([
      VALIDATION_MESSAGES.emailInvalid,
    ])
  })

  it('V3 requires the order number', () => {
    expect(fieldErrors({ ...valid, orderNumber: '   ' }).orderNumber).toEqual([
      VALIDATION_MESSAGES.orderNumberRequired,
    ])
  })

  it('V4 rejects an order number that is only the prefix', () => {
    expect(fieldErrors({ ...valid, orderNumber: '#ORD-' }).orderNumber).toEqual([
      VALIDATION_MESSAGES.orderNumberInvalid,
    ])
  })
})
