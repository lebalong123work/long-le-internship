import type { ToastType } from '@/types'
export const TOAST_DURATION_MS: Record<ToastType, number> = {
  success: 5000,
  info: 5000,
  error: 7000,
}

export const MAX_TOASTS = 3

export const TOAST_ERRORS = {
  invalidMessage: 'Toast message must be a non-empty string',
} as const
