import { z } from 'zod'

import { passwordField, requiredText, VALIDATION_MESSAGES, VN_PHONE_REGEX } from './common'

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

function toIsoDate(date: Date): string {
  const year = String(date.getFullYear())
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function isRealDate(value: string): boolean {
  if (!ISO_DATE_REGEX.test(value)) return false
  const year = Number(value.slice(0, 4))
  const month = Number(value.slice(5, 7))
  const day = Number(value.slice(8, 10))
  return toIsoDate(new Date(year, month - 1, day)) === value
}

export const profileSchema = z.object({
  name: requiredText(VALIDATION_MESSAGES.nameRequired),
  phone: z
    .string()
    .trim()
    .refine((value) => value === '' || VN_PHONE_REGEX.test(value), VALIDATION_MESSAGES.phoneInvalid)
    .optional(),
  address: z.string().trim().optional(),
  birthDate: z
    .string()
    .trim()
    .superRefine((value, ctx) => {
      if (value === '') return
      if (!isRealDate(value)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: VALIDATION_MESSAGES.birthDateInvalid })
        return
      }
      if (value > toIsoDate(new Date())) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: VALIDATION_MESSAGES.birthDateFuture })
      }
    })
    .optional(),
  avatar: z.string().optional(),
})

export const changePasswordSchema = z
  .object({
    currentPassword: requiredText(VALIDATION_MESSAGES.currentPasswordRequired),
    newPassword: passwordField,
    confirmNewPassword: z.string(),
  })
  .refine((values) => values.newPassword === values.confirmNewPassword, {
    message: VALIDATION_MESSAGES.confirmPasswordMismatch,
    path: ['confirmNewPassword'],
  })

export type ProfileFormValues = z.infer<typeof profileSchema>
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>
