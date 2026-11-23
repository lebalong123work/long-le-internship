import { z } from 'zod'
import { parseOrderNumber } from '@/utils/orderNumber'
import { emailField, requiredText, VALIDATION_MESSAGES } from './common'

export const orderLookupSchema = z.object({
  email: emailField,
  orderNumber: requiredText(VALIDATION_MESSAGES.orderNumberRequired).refine(
    (value) => value === '' || parseOrderNumber(value) !== '',
    VALIDATION_MESSAGES.orderNumberInvalid
  ),
})

export type OrderLookupFormValues = z.infer<typeof orderLookupSchema>
