import { z } from 'zod'

import { PROVINCE_CITY_NAMES, wardsOf } from '@/constants/provinceCities'
import { emailField, requiredText, VALIDATION_MESSAGES, VN_PHONE_REGEX } from './common'

import type { ShippingAddress } from '@/types/order'

export const checkoutSchema = z
  .object({
    fullName: requiredText(VALIDATION_MESSAGES.nameRequired),
    phone: requiredText(VALIDATION_MESSAGES.phoneRequired).regex(
      VN_PHONE_REGEX,
      VALIDATION_MESSAGES.phoneInvalid
    ),
    email: emailField,
    address: requiredText(VALIDATION_MESSAGES.addressRequired),
    province: requiredText(VALIDATION_MESSAGES.provinceRequired).refine(
      (province) => PROVINCE_CITY_NAMES.includes(province),
      VALIDATION_MESSAGES.provinceRequired
    ),
    ward: requiredText(VALIDATION_MESSAGES.wardRequired),
    note: z.string().trim().optional(),
    paymentMethod: z.enum(['cod', 'bank-transfer', 'credit-card'], {
      errorMap: () => ({ message: VALIDATION_MESSAGES.paymentMethodRequired }),
    }),
  })
  .superRefine(({ province, ward }, context) => {
    if (wardsOf(province).includes(ward)) return
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['ward'],
      message: VALIDATION_MESSAGES.wardRequired,
    })
  })

export type CheckoutFormValues = z.infer<typeof checkoutSchema>

export function toShippingAddress({
  fullName,
  phone,
  email,
  address,
  province,
  ward,
  note,
}: CheckoutFormValues): ShippingAddress {
  const shippingAddress: ShippingAddress = { fullName, phone, email, address, province, ward }
  return note ? { ...shippingAddress, note } : shippingAddress
}
