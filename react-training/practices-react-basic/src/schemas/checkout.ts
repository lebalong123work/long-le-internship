import { z } from 'zod'

import { emailField, requiredText, VALIDATION_MESSAGES, VN_PHONE_REGEX } from './common'

export const checkoutSchema = z.object({
  fullName: requiredText(VALIDATION_MESSAGES.nameRequired),
  phone: requiredText(VALIDATION_MESSAGES.phoneRequired).regex(
    VN_PHONE_REGEX,
    VALIDATION_MESSAGES.phoneInvalid
  ),
  email: emailField,
  address: requiredText(VALIDATION_MESSAGES.addressRequired),
  city: requiredText(VALIDATION_MESSAGES.cityRequired),
  district: requiredText(VALIDATION_MESSAGES.districtRequired),
  note: z.string().trim().optional(),
  paymentMethod: z.enum(['cod', 'bank-transfer', 'credit-card'], {
    errorMap: () => ({ message: VALIDATION_MESSAGES.paymentMethodRequired }),
  }),
})

export type CheckoutFormValues = z.infer<typeof checkoutSchema>
