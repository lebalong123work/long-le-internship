import { create } from 'zustand'
import { MAX_TOASTS, TOAST_DURATION_MS } from '@/constants/toast'
import type { Toast, ToastType } from '@/types'

interface ToastState {
  toasts: Toast[]
  addToast: (type: ToastType, message: string) => string
  removeToast: (id: string) => void
}
const timers = new Map<string, ReturnType<typeof setTimeout>>()
let nextId = 0

function stopTimer(id: string): void {
  const timer = timers.get(id)
  if (timer !== undefined) {
    clearTimeout(timer)
    timers.delete(id)
  }
}
export const useToastStore = create<ToastState>()((set, get) => ({
  toasts: [],
  addToast: (type, message) => {
    nextId += 1
    const id = `t${nextId}`
    const next = [...get().toasts, { id, type, message }]
    const dropped = next.slice(0, Math.max(0, next.length - MAX_TOASTS))
    dropped.forEach((toast) => stopTimer(toast.id))
    set({ toasts: next.slice(dropped.length) })
    timers.set(
      id,
      setTimeout(() => get().removeToast(id), TOAST_DURATION_MS[type])
    )
    return id
  },
  removeToast: (id) => {
    stopTimer(id)
    if (!get().toasts.some((toast) => toast.id === id)) return
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }))
  },
}))
