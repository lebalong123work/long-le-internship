import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import { TOAST_MESSAGES } from '@/constants/toastMessages'
import * as cartService from '@/services/cartService'
import { ensureGuestId } from '@/services/guestSession'
import { requireCartOwner } from '@/utils/cartOwner'
import { cartFailureMessage } from './failureMessage'
import { useAuth } from './useAuth'
import { useCartOwner } from './useCartOwner'
import { useToast } from './useToast'
import type { QueryClient, UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import type { AddToCartDto, Cart, CartOwner } from '@/types'

interface CartQueryOptions {
  queryKey: ReturnType<typeof queryKeys.cart>
  queryFn: () => Promise<Cart>
}

interface CartSnapshot {
  previous: Cart | undefined
}

interface UpdateQuantityVariables {
  itemId: string
  quantity: number
}

export const CART_MUTATION_SCOPE = { id: 'cart' }

const EMPTY_CART: Cart = { id: '', items: [] }

function writeOwner(userId: string | undefined): CartOwner {
  return userId ? { kind: 'user', id: userId } : { kind: 'guest', id: ensureGuestId() }
}

async function applyOptimistic(
  queryClient: QueryClient,
  owner: CartOwner | null,
  change: (cart: Cart) => Cart
): Promise<CartSnapshot> {
  if (!owner) return { previous: undefined }
  const key = queryKeys.cart(owner)
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

export function cartQueryOptions(owner: CartOwner): CartQueryOptions {
  return {
    queryKey: queryKeys.cart(owner),
    queryFn: () => cartService.getCart(owner),
  }
}

export function useCart(): UseQueryResult<Cart, Error> {
  const owner = useCartOwner()

  return useQuery(
    owner
      ? cartQueryOptions(owner)
      : { queryKey: queryKeys.cart(null), queryFn: () => EMPTY_CART, staleTime: Infinity }
  )
}

export function useAddToCart(): UseMutationResult<Cart, Error, AddToCartDto> {
  const { user } = useAuth()
  const userId = user?.id
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    scope: CART_MUTATION_SCOPE,
    mutationFn: async (item) => {
      const owner = writeOwner(userId)
      await queryClient.ensureQueryData(cartQueryOptions(owner)).catch(() => undefined)
      return cartService.addItem(owner, item)
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(queryKeys.cart(writeOwner(userId)), cart)
      toast.success(TOAST_MESSAGES.cart.added)
    },
    onError: (error) => {
      toast.error(cartFailureMessage(error))
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.cart(writeOwner(userId)) }),
  })
}

export function useUpdateCartQuantity(): UseMutationResult<
  Cart,
  Error,
  UpdateQuantityVariables,
  CartSnapshot
> {
  const owner = useCartOwner()
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    scope: CART_MUTATION_SCOPE,
    mutationFn: ({ itemId, quantity }) =>
      cartService.updateQuantity(requireCartOwner(owner), itemId, quantity),
    onMutate: (variables) =>
      applyOptimistic(queryClient, owner, (cart) => setQuantity(cart, variables)),
    onSuccess: (cart) => {
      queryClient.setQueryData(queryKeys.cart(owner), cart)
    },
    onError: (error, _variables, snapshot) => {
      if (owner && snapshot?.previous) {
        queryClient.setQueryData(queryKeys.cart(owner), snapshot.previous)
      }
      toast.error(cartFailureMessage(error))
    },
    onSettled: () => {
      if (owner) return queryClient.invalidateQueries({ queryKey: queryKeys.cart(owner) })
    },
  })
}

export function useRemoveCartItem(): UseMutationResult<Cart, Error, string, CartSnapshot> {
  const owner = useCartOwner()
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    scope: CART_MUTATION_SCOPE,
    mutationFn: (itemId) => cartService.removeItem(requireCartOwner(owner), itemId),
    onMutate: (itemId) => applyOptimistic(queryClient, owner, (cart) => dropLine(cart, itemId)),
    onSuccess: (cart) => {
      queryClient.setQueryData(queryKeys.cart(owner), cart)
      toast.info(TOAST_MESSAGES.cart.removed)
    },
    onError: (error, _variables, snapshot) => {
      if (owner && snapshot?.previous) {
        queryClient.setQueryData(queryKeys.cart(owner), snapshot.previous)
      }
      toast.error(cartFailureMessage(error))
    },
    onSettled: () => {
      if (owner) return queryClient.invalidateQueries({ queryKey: queryKeys.cart(owner) })
    },
  })
}
