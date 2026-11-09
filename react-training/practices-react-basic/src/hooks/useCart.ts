import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import { TOAST_MESSAGES } from '@/constants/toastMessages'
import { ApiError } from '@/services/apiClient'
import * as cartService from '@/services/cartService'
import { useAuth } from './useAuth'
import { useToast } from './useToast'
import type { QueryClient, UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import type { AddToCartDto, Cart } from '@/types'

interface CartSnapshot {
  previous: Cart | undefined
}

interface UpdateQuantityVariables {
  itemId: string
  quantity: number
}

export const CART_MUTATION_SCOPE = { id: 'cart' }
const LOGIN_REQUIRED = 'Login required'

function cartErrorMessage(error: unknown): string {
  return error instanceof ApiError && error.status === 0
    ? TOAST_MESSAGES.network.error
    : TOAST_MESSAGES.cart.updateFailed
}

function requireUserId(userId: string | undefined): string {
  if (!userId) throw new Error(LOGIN_REQUIRED)
  return userId
}

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

export function useCart(): UseQueryResult<Cart, Error> {
  const { user } = useAuth()
  const userId = user?.id

  return useQuery({
    queryKey: queryKeys.cart(userId ?? ''),
    queryFn: userId ? () => cartService.getCart(userId) : skipToken,
  })
}

export function useAddToCart(): UseMutationResult<Cart, Error, AddToCartDto> {
  const { user } = useAuth()
  const userId = user?.id
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    scope: CART_MUTATION_SCOPE,
    mutationFn: (item) => cartService.addItem(requireUserId(userId), item),
    onSuccess: (cart) => {
      queryClient.setQueryData(queryKeys.cart(cart.userId), cart)
      toast.success(TOAST_MESSAGES.cart.added)
    },
    onError: (error) => {
      toast.error(cartErrorMessage(error))
    },
    onSettled: () => {
      if (userId) return queryClient.invalidateQueries({ queryKey: queryKeys.cart(userId) })
    },
  })
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
      toast.error(cartErrorMessage(error))
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
      toast.error(cartErrorMessage(error))
    },
    onSettled: () => {
      if (userId) return queryClient.invalidateQueries({ queryKey: queryKeys.cart(userId) })
    },
  })
}
