import { useEffect, useRef } from 'react'
import { usePendingActionStore } from '@/stores/pendingActionStore'
import { useAuthModal } from './useAuthModal'
import type { PendingAction } from '@/types'

export function useRequestLogin(): (action: PendingAction) => void {
  const setAction = usePendingActionStore((state) => state.setAction)
  const { open } = useAuthModal()

  return function requestLogin(action: PendingAction): void {
    setAction(action)
    open('login')
  }
}

export function useDropPendingActionOnClose(): void {
  const { mode } = useAuthModal()
  const clearAction = usePendingActionStore((state) => state.clearAction)
  const wasOpen = useRef(mode !== null)

  useEffect(() => {
    const isOpen = mode !== null
    if (wasOpen.current && !isOpen) clearAction()
    wasOpen.current = isOpen
  }, [mode, clearAction])
}
