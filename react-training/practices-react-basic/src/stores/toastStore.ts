import { create } from 'zustand'
import { MAX_TOASTS, TOAST_DURATION_MS, TOAST_ERRORS } from '@/constants/toast'
import type { Toast, ToastPauseReason, ToastType } from '@/types'

interface ToastState {
  toasts: Toast[]
  addToast: (type: ToastType, message: string) => string
  removeToast: (id: string) => void
  pauseToast: (id: string, reason: ToastPauseReason) => void
  resumeToast: (id: string, reason: ToastPauseReason) => void
}

interface ToastClock {
  timer: ReturnType<typeof setTimeout> | undefined
  deadline: number
  remaining: number
  reasons: Set<ToastPauseReason>
}

const clocks = new Map<string, ToastClock>()
let nextId = 0

function isValidMessage(message: unknown): boolean {
  return typeof message === 'string' && message.trim() !== ''
}

function startTimer(clock: ToastClock, ms: number, onExpire: () => void): void {
  clock.deadline = Date.now() + ms
  clock.remaining = ms
  clock.timer = setTimeout(onExpire, ms)
}

function stopClock(id: string): void {
  const clock = clocks.get(id)
  if (clock === undefined) return
  clearTimeout(clock.timer)
  clocks.delete(id)
}

function hasFocus(id: string): boolean {
  return clocks.get(id)?.reasons.has('focus') ?? false
}

function toastsToDrop(toasts: Toast[]): Toast[] {
  const overflow = toasts.length - MAX_TOASTS
  if (overflow <= 0) return []
  return toasts.filter((toast) => !hasFocus(toast.id)).slice(0, overflow)
}

export const useToastStore = create<ToastState>()((set, get) => ({
  toasts: [],
  addToast: (type, message) => {
    if (!isValidMessage(message)) throw new Error(TOAST_ERRORS.invalidMessage)
    nextId += 1
    const id = `t${nextId}`
    const next = [...get().toasts, { id, type, message }]
    const droppedIds = new Set(toastsToDrop(next).map((toast) => toast.id))
    droppedIds.forEach(stopClock)
    set({ toasts: next.filter((toast) => !droppedIds.has(toast.id)) })
    const clock: ToastClock = { timer: undefined, deadline: 0, remaining: 0, reasons: new Set() }
    clocks.set(id, clock)
    startTimer(clock, TOAST_DURATION_MS[type], () => get().removeToast(id))
    return id
  },
  removeToast: (id) => {
    stopClock(id)
    if (!get().toasts.some((toast) => toast.id === id)) return
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }))
  },
  pauseToast: (id, reason) => {
    const clock = clocks.get(id)
    if (clock === undefined || clock.reasons.has(reason)) return
    if (clock.reasons.size === 0) {
      clearTimeout(clock.timer)
      clock.timer = undefined
      clock.remaining = Math.max(0, clock.deadline - Date.now())
    }
    clock.reasons.add(reason)
  },
  resumeToast: (id, reason) => {
    const clock = clocks.get(id)
    if (clock === undefined || !clock.reasons.delete(reason) || clock.reasons.size > 0) return
    startTimer(clock, clock.remaining, () => get().removeToast(id))
  },
}))
