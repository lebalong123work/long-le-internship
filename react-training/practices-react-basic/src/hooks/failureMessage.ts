import { TOAST_MESSAGES } from '@/constants/toastMessages'
import { isNetworkError } from '@/services/apiClient'

export function failureMessage(error: unknown, fallback: string): string {
  return isNetworkError(error) ? TOAST_MESSAGES.network.error : fallback
}

export function cartFailureMessage(error: unknown): string {
  return failureMessage(error, TOAST_MESSAGES.cart.updateFailed)
}
