import { useEffect } from 'react'
import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import { TOAST_MESSAGES } from '@/constants/toastMessages'
import * as wishlistService from '@/services/wishlistService'
import { registerPendingActionHandler } from '@/stores/pendingActionStore'
import { failureMessage } from './failureMessage'
import { useAuth } from './useAuth'
import { useRequestLogin } from './usePendingAction'
import { useToast } from './useToast'
import type { QueryClient, UseMutationResult } from '@tanstack/react-query'

interface WishlistChange {
  userId: string
  productId: string
  add: boolean
}

interface WishlistSnapshot {
  previous: string[] | undefined
}

interface WishlistState {
  productIds: string[]
  isInWishlist: (productId: string) => boolean
  toggle: (productId: string) => void
}

const WISHLIST_MUTATION_SCOPE = { id: 'wishlist' }
const EMPTY_IDS: string[] = []

async function applyOptimistic(
  queryClient: QueryClient,
  { userId, productId, add }: WishlistChange
): Promise<WishlistSnapshot> {
  const key = queryKeys.wishlist(userId)
  await queryClient.cancelQueries({ queryKey: key })
  const previous = queryClient.getQueryData<string[]>(key)
  if (previous) {
    const others = previous.filter((id) => id !== productId)
    queryClient.setQueryData<string[]>(key, add ? [productId, ...others] : others)
  }
  return { previous }
}

function useWishlistMutation(): UseMutationResult<void, Error, WishlistChange, WishlistSnapshot> {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    scope: WISHLIST_MUTATION_SCOPE,
    mutationFn: ({ userId, productId, add }) =>
      add ? wishlistService.add(userId, productId) : wishlistService.remove(userId, productId),
    onMutate: (change) => applyOptimistic(queryClient, change),
    onSuccess: (_data, { add }) => {
      if (add) toast.success(TOAST_MESSAGES.wishlist.saved)
      else toast.info(TOAST_MESSAGES.wishlist.removed)
    },
    onError: (error, { userId }, snapshot) => {
      if (snapshot?.previous) {
        queryClient.setQueryData(queryKeys.wishlist(userId), snapshot.previous)
      }
      toast.error(failureMessage(error, TOAST_MESSAGES.wishlist.updateFailed))
    },
    onSettled: (_data, _error, { userId }) =>
      queryClient.invalidateQueries({ queryKey: queryKeys.wishlist(userId) }),
  })
}

export function useWishlist(): WishlistState {
  const { user } = useAuth()
  const userId = user?.id
  const { data } = useQuery({
    queryKey: queryKeys.wishlist(userId ?? ''),
    queryFn: userId ? () => wishlistService.getWishlist(userId) : skipToken,
  })
  const productIds = data ?? EMPTY_IDS
  const isLoaded = data !== undefined
  const { mutate } = useWishlistMutation()
  const requestLogin = useRequestLogin()

  function isInWishlist(productId: string): boolean {
    return productIds.includes(productId)
  }

  function toggle(productId: string): void {
    if (!userId) {
      requestLogin({ type: 'toggleWishlist', productId })
      return
    }
    if (!isLoaded) return
    mutate({ userId, productId, add: !productIds.includes(productId) })
  }

  return { productIds, isInWishlist, toggle }
}

export function useWishlistPendingAction(): void {
  const { mutate } = useWishlistMutation()

  useEffect(
    () =>
      registerPendingActionHandler('toggleWishlist', (action, user) => {
        mutate({ userId: user.id, productId: action.productId, add: true })
      }),
    [mutate]
  )
}
