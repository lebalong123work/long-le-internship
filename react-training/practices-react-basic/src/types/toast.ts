export type ToastType = 'success' | 'error' | 'info'

export type ToastPauseReason = 'focus' | 'hover'

export interface Toast {
  id: string
  type: ToastType
  message: string
}
