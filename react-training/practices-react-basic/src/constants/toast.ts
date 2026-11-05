import type { ToastType } from '@/types'
export const TOAST_DURATION_MS: Record<ToastType, number> = {
  success: 3000,
  info: 3000,
  error: 5000,
}

export const MAX_TOASTS = 3
