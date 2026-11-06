import { create } from 'zustand'
import type { PendingAction, PendingActionHandler, PendingActionType, User } from '@/types'

interface PendingActionState {
  action: PendingAction | null
  setAction: (action: PendingAction) => void
  clearAction: () => void
}

type AnyHandler = (action: PendingAction, user: User) => void

const handlers = new Map<PendingActionType, AnyHandler>()

export const usePendingActionStore = create<PendingActionState>()((set) => ({
  action: null,
  setAction: (action) => set({ action }),
  clearAction: () => set({ action: null }),
}))

export function registerPendingActionHandler<T extends PendingActionType>(
  type: T,
  handler: PendingActionHandler<T>
): () => void {
  const stored = handler as AnyHandler
  handlers.set(type, stored)
  return () => {
    if (handlers.get(type) === stored) handlers.delete(type)
  }
}

export function runPendingAction(user: User): void {
  const { action, clearAction } = usePendingActionStore.getState()
  if (!action) return
  clearAction()
  handlers.get(action.type)?.(action, user)
}
