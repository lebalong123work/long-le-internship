import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import { TOAST_MESSAGES } from '@/constants/toastMessages'
import * as cartService from '@/services/cartService'
import { ensureGuestId } from '@/services/guestSession'
import { registerPendingActionHandler } from '@/stores/pendingActionStore'
import { requireCartOwner } from '@/utils/cartOwner'
import { failureMessage } from './failureMessage'
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

interface AddForOwnerVariables {
  owner: CartOwner
  item: AddToCartDto
}

interface AddToCartCallbacks {
  addForOwner: (owner: CartOwner, item: AddToCartDto) => Promise<Cart>
  onSuccess: (cart: Cart, owner: CartOwner) => void
  onError: (error: Error) => void
  settle: (owner: CartOwner) => Promise<void>
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

function useAddToCartCallbacks(): AddToCartCallbacks {
  const queryClient = useQueryClient()
  const toast = useToast()

  return {
    addForOwner: async (owner, item) => {
      await queryClient.ensureQueryData(cartQueryOptions(owner)).catch(() => undefined)
      return cartService.addItem(owner, item)
    },
    onSuccess: (cart, owner) => {
      queryClient.setQueryData(queryKeys.cart(owner), cart)
      toast.success(TOAST_MESSAGES.cart.added)
    },
    onError: (error) => {
      toast.error(failureMessage(error, TOAST_MESSAGES.cart.updateFailed))
    },
    settle: (owner) => queryClient.invalidateQueries({ queryKey: queryKeys.cart(owner) }),
  }
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
  const { addForOwner, onSuccess, onError, settle } = useAddToCartCallbacks()

  return useMutation({
    scope: CART_MUTATION_SCOPE,
    mutationFn: (item) => addForOwner(writeOwner(userId), item),
    onSuccess: (cart) => onSuccess(cart, writeOwner(userId)),
    onError,
    onSettled: () => settle(writeOwner(userId)),
  })
}

export function useAddToCartPendingAction(): void {
  const { addForOwner, onSuccess, onError, settle } = useAddToCartCallbacks()
  const { mutate } = useMutation<Cart, Error, AddForOwnerVariables>({
    scope: CART_MUTATION_SCOPE,
    mutationFn: ({ owner, item }) => addForOwner(owner, item),
    onSuccess: (cart, { owner }) => onSuccess(cart, owner),
    onError,
    onSettled: (_cart, _error, { owner }) => settle(owner),
  })

  useEffect(
    () =>
      registerPendingActionHandler('addToCart', (action, user) => {
        mutate({ owner: { kind: 'user', id: user.id }, item: action.payload })
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
      toast.error(failureMessage(error, TOAST_MESSAGES.cart.updateFailed))
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
      toast.error(failureMessage(error, TOAST_MESSAGES.cart.updateFailed))
    },
    onSettled: () => {
      if (owner) return queryClient.invalidateQueries({ queryKey: queryKeys.cart(owner) })
    },
  })
}
