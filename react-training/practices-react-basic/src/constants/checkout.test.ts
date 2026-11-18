import { describe, expect, it } from 'vitest'
import { BANK_TRANSFER_DETAILS, CHECKOUT_TEXT, PAYMENT_OPTIONS } from './checkout'
import type { PaymentMethod } from '@/types/order'

const PAYMENT_METHODS: PaymentMethod[] = ['cod', 'bank-transfer', 'credit-card']

describe('checkout constants', () => {
  it('offers each payment method once, in order', () => {
    expect(PAYMENT_OPTIONS.map(({ value }) => value)).toEqual(PAYMENT_METHODS)
  })

  it('has no blank text', () => {
    const texts = [
      ...PAYMENT_OPTIONS.map(({ label }) => label),
      ...BANK_TRANSFER_DETAILS,
      ...Object.values(CHECKOUT_TEXT).filter((value) => typeof value === 'string'),
      CHECKOUT_TEXT.quantity(2),
      CHECKOUT_TEXT.onlyLeft(3),
    ]
    expect(texts.every((text) => text.trim() !== '')).toBe(true)
    expect(CHECKOUT_TEXT.quantity(2)).toBe('Qty 2')
    expect(CHECKOUT_TEXT.onlyLeft(3)).toBe('Only 3 left')
  })
})
