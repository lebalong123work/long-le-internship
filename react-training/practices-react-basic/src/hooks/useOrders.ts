import { useNavigate } from 'react-router-dom'
import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import { ROUTES } from '@/constants/routes'
import { TOAST_MESSAGES } from '@/constants/toastMessages'
import { isNetworkError, isNotFoundError } from '@/services/apiClient'
import * as cartService from '@/services/cartService'
import * as orderService from '@/services/orderService'
import { requireUserId } from '@/utils/requireUserId'
import { useAuth } from './useAuth'
import { CART_MUTATION_SCOPE } from './useCart'
import { useToast } from './useToast'
import type { QueryClient, UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import type { CreateOrderDto, Order, PaginatedList } from '@/types'

const MAX_RETRIES = 3

function retryUnlessNotFound(failureCount: number, error: Error): boolean {
  return !isNotFoundError(error) && failureCount < MAX_RETRIES
}

function orderErrorMessage(error: unknown): string {
  return isNetworkError(error) ? TOAST_MESSAGES.network.error : TOAST_MESSAGES.order.failed
}

async function clearCartAfterOrder(userId: string): Promise<boolean> {
  try {
    await cartService.clearCart(userId)
    return true
  } catch {
    return false
  }
}

function invalidateOrderData(queryClient: QueryClient, userId: string): void {
  void queryClient.invalidateQueries({ queryKey: queryKeys.cart(userId) })
  void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all(userId) })
}

export function useOrders(page: number): UseQueryResult<PaginatedList<Order>, Error> {
  const { user } = useAuth()
  const userId = user?.id

  return useQuery({
    queryKey: queryKeys.orders.list(userId ?? '', page),
    queryFn: userId ? () => orderService.getOrdersByUser(userId, page) : skipToken,
  })
}

export function useOrder(orderId: string | undefined): UseQueryResult<Order, Error> {
  const { user } = useAuth()
  const userId = user?.id

  return useQuery({
    queryKey: queryKeys.orders.detail(userId ?? '', orderId ?? ''),
    queryFn: userId && orderId ? () => orderService.getOrderById(userId, orderId) : skipToken,
    retry: retryUnlessNotFound,
  })
}

export function useCreateOrder(): UseMutationResult<Order, Error, CreateOrderDto> {
  const { user } = useAuth()
  const userId = user?.id
  const queryClient = useQueryClient()
  const toast = useToast()
  const navigate = useNavigate()

  return useMutation({
    scope: CART_MUTATION_SCOPE,
    mutationFn: (payload) => orderService.createOrder(requireUserId(userId), payload),
    onSuccess: async (order) => {
      const cartCleared = await clearCartAfterOrder(order.userId)
      if (!cartCleared) toast.error(TOAST_MESSAGES.cart.updateFailed)
      invalidateOrderData(queryClient, order.userId)
      queryClient.setQueryData(queryKeys.orders.detail(order.userId, order.id), order)
      navigate(ROUTES.ORDER_SUCCESS(order.id), { replace: true })
    },
    onError: (error) => {
      toast.error(orderErrorMessage(error))
      if (userId) invalidateOrderData(queryClient, userId)
    },
  })
}
