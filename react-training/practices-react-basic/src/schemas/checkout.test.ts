import { checkoutSchema } from './checkout'
import { VALIDATION_MESSAGES } from './common'

import type { PaymentMethod } from '@/types/order'

function fieldErrors(
  result: ReturnType<typeof checkoutSchema.safeParse>
): Record<string, string[] | undefined> {
  return result.success ? {} : result.error.flatten().fieldErrors
}

const valid = {
  fullName: 'Long Le',
  phone: '0901234567',
  email: 'user@store.com',
  address: '1 Le Loi',
  city: 'Hồ Chí Minh',
  district: 'Quận 1',
  paymentMethod: 'cod',
}

describe('checkoutSchema', () => {
  it('accepts valid values without a note', () => {
    const result = checkoutSchema.safeParse(valid)
    expect(result.success).toBe(true)
    if (result.success) {
      const method: PaymentMethod = result.data.paymentMethod
      expect(method).toBe('cod')
      expect(result.data.note).toBeUndefined()
    }
  })

  it('requires the full name', () => {
    const errors = fieldErrors(checkoutSchema.safeParse({ ...valid, fullName: ' ' }))
    expect(errors.fullName?.[0]).toBe(VALIDATION_MESSAGES.nameRequired)
  })

  it.each(['0901234567', '+84901234567'])('accepts the phone %s', (phone) => {
    expect(checkoutSchema.safeParse({ ...valid, phone }).success).toBe(true)
  })

  it.each(['090123456', '09012345678', '1901234567', '84901234567', '09012345ab', '090 123 4567'])(
    'rejects the phone %s',
    (phone) => {
      const errors = fieldErrors(checkoutSchema.safeParse({ ...valid, phone }))
      expect(errors.phone?.[0]).toBe(VALIDATION_MESSAGES.phoneInvalid)
    }
  )

  it('requires the phone', () => {
    const errors = fieldErrors(checkoutSchema.safeParse({ ...valid, phone: '  ' }))
    expect(errors.phone?.[0]).toBe(VALIDATION_MESSAGES.phoneRequired)
  })

  it('rejects an invalid email', () => {
    const errors = fieldErrors(checkoutSchema.safeParse({ ...valid, email: 'user@store' }))
    expect(errors.email?.[0]).toBe(VALIDATION_MESSAGES.emailInvalid)
  })

  it('requires the address', () => {
    const errors = fieldErrors(checkoutSchema.safeParse({ ...valid, address: '' }))
    expect(errors.address?.[0]).toBe(VALIDATION_MESSAGES.addressRequired)
  })

  it('requires the province / city', () => {
    const errors = fieldErrors(checkoutSchema.safeParse({ ...valid, city: '' }))
    expect(errors.city?.[0]).toBe(VALIDATION_MESSAGES.cityRequired)
  })

  it('requires the district', () => {
    const errors = fieldErrors(checkoutSchema.safeParse({ ...valid, district: '' }))
    expect(errors.district?.[0]).toBe(VALIDATION_MESSAGES.districtRequired)
  })

  it.each(['cod', 'bank-transfer', 'credit-card'])(
    'accepts the payment method %s',
    (paymentMethod) => {
      expect(checkoutSchema.safeParse({ ...valid, paymentMethod }).success).toBe(true)
    }
  )

  it('rejects a missing or unknown payment method', () => {
    expect(
      fieldErrors(checkoutSchema.safeParse({ ...valid, paymentMethod: '' })).paymentMethod?.[0]
    ).toBe(VALIDATION_MESSAGES.paymentMethodRequired)
    expect(
      fieldErrors(checkoutSchema.safeParse({ ...valid, paymentMethod: 'paypal' }))
        .paymentMethod?.[0]
    ).toBe(VALIDATION_MESSAGES.paymentMethodRequired)
  })
})
