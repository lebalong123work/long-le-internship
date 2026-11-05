import { useMemo } from 'react'
import { useToastStore } from '@/stores/toastStore'

interface ToastApi {
  success: (message: string) => string
  error: (message: string) => string
  info: (message: string) => string
}

export function useToast(): ToastApi {
  const addToast = useToastStore((state) => state.addToast)

  return useMemo(
    () => ({
      success: (message) => addToast('success', message),
      error: (message) => addToast('error', message),
      info: (message) => addToast('info', message),
    }),
    [addToast]
  )
}
