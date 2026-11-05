import { z } from 'zod'

import { emailField, passwordField, requiredText, VALIDATION_MESSAGES } from './common'

export const loginSchema = z.object({
  email: emailField,
  password: passwordField,
})

export const registerSchema = z
  .object({
    name: requiredText(VALIDATION_MESSAGES.nameRequired),
    email: emailField,
    password: passwordField,
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: VALIDATION_MESSAGES.confirmPasswordMismatch,
    path: ['confirmPassword'],
  })

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
