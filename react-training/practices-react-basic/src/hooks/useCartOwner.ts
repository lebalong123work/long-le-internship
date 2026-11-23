import { useSyncExternalStore } from 'react'
import { getGuestId, subscribeGuestId } from '@/services/guestSession'
import { useAuth } from './useAuth'
import type { CartOwner } from '@/types'

export function useCartOwner(): CartOwner | null {
  const { user } = useAuth()
  const guestId = useSyncExternalStore(subscribeGuestId, getGuestId)
  if (user) return { kind: 'user', id: user.id }
  return guestId ? { kind: 'guest', id: guestId } : null
}
