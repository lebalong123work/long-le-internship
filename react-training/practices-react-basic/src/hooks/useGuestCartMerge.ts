import { useCallback, useEffect, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import { TOAST_MESSAGES } from '@/constants/toastMessages'
import * as cartService from '@/services/cartService'
import { getGuestId } from '@/services/guestSession'
import { failureMessage } from './failureMessage'
import { useAuth } from './useAuth'
import { CART_MUTATION_SCOPE, cartQueryOptions } from './useCart'
import { useToast } from './useToast'
import type { CartOwner, GuestMergeResult, User } from '@/types'

interface MergeVariables {
  guest: CartOwner
  account: CartOwner
}

const runningMerges = new Map<string, Promise<void>>()

export function useGuestCartMerge(): (user: User) => Promise<void> {
  const queryClient = useQueryClient()
  const toast = useToast()
  const { mutateAsync } = useMutation<GuestMergeResult, Error, MergeVariables>({
    scope: CART_MUTATION_SCOPE,
    mutationFn: async ({ guest, account }) => {
      await queryClient.ensureQueryData(cartQueryOptions(account)).catch(() => undefined)
      return cartService.mergeGuestCart(guest.id, account.id)
    },
    onSuccess: (result, { account }) => {
      if (result.status === 'merged') queryClient.setQueryData(queryKeys.cart(account), result.cart)
      if (result.status === 'otherAccount') {
        toast.info(TOAST_MESSAGES.cart.mergeNeedsOriginalAccount)
      }
    },
    onError: (error) => {
      toast.error(failureMessage(error, TOAST_MESSAGES.cart.updateFailed))
    },
    onSettled: (_result, _error, { guest, account }) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.cart(guest) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.cart(account) }),
      ]),
  })

  return useCallback(
    (user: User): Promise<void> => {
      const guestId = getGuestId()
      if (!guestId) return Promise.resolve()
      const mergeKey = `${guestId}:${user.id}`
      const running = runningMerges.get(mergeKey)
      if (running) return running

      const attempt = mutateAsync({
        guest: { kind: 'guest', id: guestId },
        account: { kind: 'user', id: user.id },
      })
        .then(
          () => undefined,
          () => undefined
        )
        .finally(() => runningMerges.delete(mergeKey))
      runningMerges.set(mergeKey, attempt)
      return attempt
    },
    [mutateAsync]
  )
}

export function useGuestCartMergeRecovery(): void {
  const { user } = useAuth()
  const restoredUser = useRef(user)
  const mergeGuestCart = useGuestCartMerge()

  useEffect(() => {
    if (restoredUser.current) void mergeGuestCart(restoredUser.current)
  }, [mergeGuestCart])
}
