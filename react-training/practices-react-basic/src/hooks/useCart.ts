import { useEffect } from 'react'
import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import { TOAST_MESSAGES } from '@/constants/toastMessages'
import * as cartService from '@/services/cartService'
import { registerPendingActionHandler } from '@/stores/pendingActionStore'
import { requireUserId } from '@/utils/requireUserId'
import { failureMessage } from './failureMessage'
import { useAuth } from './useAuth'
import { useToast } from './useToast'
import type { QueryClient, UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import type { AddToCartDto, Cart } from '@/types'

interface CartQueryOptions {
  queryKey: ReturnType<typeof queryKeys.cart>
  queryFn: () => Promise<Cart>
}

interface CartSnapshot {
  previous: Cart | undefined
}

interface AddForUserVariables {
  userId: string
  item: AddToCartDto
}

interface AddToCartCallbacks {
  addForUser: (userId: string, item: AddToCartDto) => Promise<Cart>
  onSuccess: (cart: Cart) => void
  onError: (error: Error) => void
  settle: (userId: string | undefined) => Promise<void> | undefined
}

interface UpdateQuantityVariables {
  itemId: string
  quantity: number
}

export const CART_MUTATION_SCOPE = { id: 'cart' }

async function applyOptimistic(
  queryClient: QueryClient,
  userId: string | undefined,
  change: (cart: Cart) => Cart
): Promise<CartSnapshot> {
  if (!userId) return { previous: undefined }
  const key = queryKeys.cart(userId)
  await queryClient.cancelQueries({ queryKey: key })
  const previous = queryClient.getQueryData<Cart>(key)
  if (previous) queryClient.setQueryData<Cart>(key, change(previous))
  return { previous }
}

function setQuantity(cart: Cart, { itemId, quantity }: UpdateQuantityVariables): Cart {
  return {
    ...cart,
    items: cart.items.map((line) => (line.id === itemId ? { ...line, quantity } : line)),
  }
}

function dropLine(cart: Cart, itemId: string): Cart {
  return { ...cart, items: cart.items.filter((line) => line.id !== itemId) }
}

function useAddToCartCallbacks(): AddToCartCallbacks {
  const queryClient = useQueryClient()
  const toast = useToast()

  return {
    addForUser: async (userId, item) => {
      await queryClient.ensureQueryData(cartQueryOptions(userId)).catch(() => undefined)
      return cartService.addItem(userId, item)
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(queryKeys.cart(cart.userId), cart)
      toast.success(TOAST_MESSAGES.cart.added)
    },
    onError: (error) => {
      toast.error(failureMessage(error, TOAST_MESSAGES.cart.updateFailed))
    },
    settle: (userId) => {
      if (userId) return queryClient.invalidateQueries({ queryKey: queryKeys.cart(userId) })
    },
  }
}

export function cartQueryOptions(userId: string): CartQueryOptions {
  return {
    queryKey: queryKeys.cart(userId),
    queryFn: () => cartService.getCart(userId),
  }
}

export function useCart(): UseQueryResult<Cart, Error> {
  const { user } = useAuth()
  const userId = user?.id
  const options = cartQueryOptions(userId ?? '')

  return useQuery({
    queryKey: options.queryKey,
    queryFn: userId ? options.queryFn : skipToken,
  })
}

export function useAddToCart(): UseMutationResult<Cart, Error, AddToCartDto> {
  const { user } = useAuth()
  const userId = user?.id
  const { addForUser, onSuccess, onError, settle } = useAddToCartCallbacks()

  return useMutation({
    scope: CART_MUTATION_SCOPE,
    mutationFn: (item) => addForUser(requireUserId(userId), item),
    onSuccess,
    onError,
    onSettled: () => settle(userId),
  })
}

export function useAddToCartPendingAction(): void {
  const { addForUser, onSuccess, onError, settle } = useAddToCartCallbacks()
  const { mutate } = useMutation<Cart, Error, AddForUserVariables>({
    scope: CART_MUTATION_SCOPE,
    mutationFn: ({ userId, item }) => addForUser(userId, item),
    onSuccess,
    onError,
    onSettled: (_cart, _error, { userId }) => settle(userId),
  })

  useEffect(
    () =>
      registerPendingActionHandler('addToCart', (action, user) => {
        mutate({ userId: user.id, item: action.payload })
      }),
    [mutate]
  )
}

export function useUpdateCartQuantity(): UseMutationResult<
  Cart,
  Error,
  UpdateQuantityVariables,
  CartSnapshot
> {
  const { user } = useAuth()
  const userId = user?.id
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    scope: CART_MUTATION_SCOPE,
    mutationFn: ({ itemId, quantity }) =>
      cartService.updateQuantity(requireUserId(userId), itemId, quantity),
    onMutate: (variables) =>
      applyOptimistic(queryClient, userId, (cart) => setQuantity(cart, variables)),
    onSuccess: (cart) => {
      queryClient.setQueryData(queryKeys.cart(cart.userId), cart)
    },
    onError: (error, _variables, snapshot) => {
      if (userId && snapshot?.previous) {
        queryClient.setQueryData(queryKeys.cart(userId), snapshot.previous)
      }
      toast.error(failureMessage(error, TOAST_MESSAGES.cart.updateFailed))
    },
    onSettled: () => {
      if (userId) return queryClient.invalidateQueries({ queryKey: queryKeys.cart(userId) })
    },
  })
}

export function useRemoveCartItem(): UseMutationResult<Cart, Error, string, CartSnapshot> {
  const { user } = useAuth()
  const userId = user?.id
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    scope: CART_MUTATION_SCOPE,
    mutationFn: (itemId) => cartService.removeItem(requireUserId(userId), itemId),
    onMutate: (itemId) => applyOptimistic(queryClient, userId, (cart) => dropLine(cart, itemId)),
    onSuccess: (cart) => {
      queryClient.setQueryData(queryKeys.cart(cart.userId), cart)
      toast.info(TOAST_MESSAGES.cart.removed)
    },
    onError: (error, _variables, snapshot) => {
      if (userId && snapshot?.previous) {
        queryClient.setQueryData(queryKeys.cart(userId), snapshot.previous)
      }
      toast.error(failureMessage(error, TOAST_MESSAGES.cart.updateFailed))
    },
    onSettled: () => {
      if (userId) return queryClient.invalidateQueries({ queryKey: queryKeys.cart(userId) })
    },
  })
}
