import type { ToastType } from '@/types'
export const TOAST_DURATION_MS: Record<ToastType, number> = {
  success: 3000,
  info: 3000,
  error: 3000,
}

export const MAX_TOASTS = 3

export const TOAST_ERRORS = {
  invalidMessage: 'Toast message must be a non-empty string',
} as const
