import { useNavigate } from 'react-router-dom'
import {
  keepPreviousData,
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import { ROUTES } from '@/constants/routes'
import { TOAST_MESSAGES } from '@/constants/toastMessages'
import * as cartService from '@/services/cartService'
import * as orderService from '@/services/orderService'
import { requireCartOwner } from '@/utils/cartOwner'
import { orderFailureMessage } from './failureMessage'
import { retryUnlessNotFound } from './queryRetry'
import { useAuth } from './useAuth'
import { CART_MUTATION_SCOPE } from './useCart'
import { useCartOwner } from './useCartOwner'
import { useToast } from './useToast'
import type { QueryClient, UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import type { CartOwner, CreateOrderDto, Order, PaginatedList } from '@/types'

async function clearCartAfterOrder(owner: CartOwner): Promise<boolean> {
  try {
    await cartService.clearCart(owner)
    return true
  } catch {
    return false
  }
}

function invalidateOrderData(queryClient: QueryClient, owner: CartOwner): void {
  void queryClient.invalidateQueries({ queryKey: queryKeys.cart(owner) })
  void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all(owner) })
}

export function useOrders(page: number): UseQueryResult<PaginatedList<Order>, Error> {
  const { user } = useAuth()
  const userId = user?.id
  const owner: CartOwner | null = userId ? { kind: 'user', id: userId } : null

  return useQuery({
    queryKey: queryKeys.orders.list(owner, page),
    queryFn: userId ? () => orderService.getOrdersByUser(userId, page) : skipToken,
    placeholderData: keepPreviousData,
  })
}

export function useOrder(orderId: string | undefined): UseQueryResult<Order, Error> {
  const owner = useCartOwner()

  return useQuery({
    queryKey: queryKeys.orders.detail(owner, orderId ?? ''),
    queryFn: owner && orderId ? () => orderService.getOrderById(owner, orderId) : skipToken,
    retry: retryUnlessNotFound,
  })
}

export function useCreateOrder(): UseMutationResult<Order, Error, CreateOrderDto> {
  const owner = useCartOwner()
  const queryClient = useQueryClient()
  const toast = useToast()
  const navigate = useNavigate()

  return useMutation({
    scope: CART_MUTATION_SCOPE,
    mutationFn: (payload) => orderService.createOrder(requireCartOwner(owner), payload),
    onSuccess: async (order) => {
      const orderOwner = requireCartOwner(owner)
      const cartCleared = await clearCartAfterOrder(orderOwner)
      if (!cartCleared) toast.error(TOAST_MESSAGES.cart.updateFailed)
      invalidateOrderData(queryClient, orderOwner)
      queryClient.setQueryData(queryKeys.orders.detail(orderOwner, order.id), order)
      navigate(ROUTES.ORDER_SUCCESS(order.id), { replace: true })
    },
    onError: (error) => {
      toast.error(orderFailureMessage(error))
      if (owner) invalidateOrderData(queryClient, owner)
    },
  })
}
