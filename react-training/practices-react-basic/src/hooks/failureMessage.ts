import { TOAST_MESSAGES } from '@/constants/toastMessages'
import { isNetworkError } from '@/services/apiClient'
import { isMergePendingError } from '@/services/cartService'

export function failureMessage(error: unknown, fallback: string): string {
  return isNetworkError(error) ? TOAST_MESSAGES.network.error : fallback
}

export function cartFailureMessage(error: unknown): string {
  if (isMergePendingError(error)) return TOAST_MESSAGES.cart.mergePending
  return failureMessage(error, TOAST_MESSAGES.cart.updateFailed)
}

export function orderFailureMessage(error: unknown): string {
  if (isMergePendingError(error)) return TOAST_MESSAGES.cart.mergePending
  return failureMessage(error, TOAST_MESSAGES.order.failed)
}
