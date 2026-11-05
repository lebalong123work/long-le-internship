import { z } from 'zod'

export const VALIDATION_MESSAGES = {
  emailRequired: 'Email is required',
  emailInvalid: 'Enter a valid email',
  passwordRequired: 'Password is required',
  passwordMin: 'Password must be at least 6 characters',
  confirmPasswordMismatch: 'Passwords do not match',
  nameRequired: 'Full name is required',
  phoneRequired: 'Phone number is required',
  phoneInvalid: 'Enter a valid Vietnamese phone number',
  addressRequired: 'Address is required',
  cityRequired: 'Please select a province / city',
  districtRequired: 'Please select a district',
  paymentMethodRequired: 'Please select a payment method',
  currentPasswordRequired: 'Current password is required',
  birthDateInvalid: 'Enter a valid date of birth',
  birthDateFuture: 'Date of birth cannot be in the future',
}

export const VN_PHONE_REGEX = /^(0|\+84)\d{9}$/

export function requiredText(message: string): z.ZodString {
  return z.string().trim().min(1, message)
}

export const emailField = z
  .string()
  .trim()
  .min(1, VALIDATION_MESSAGES.emailRequired)
  .email(VALIDATION_MESSAGES.emailInvalid)

export const passwordField = z
  .string()
  .min(1, VALIDATION_MESSAGES.passwordRequired)
  .min(6, VALIDATION_MESSAGES.passwordMin)
