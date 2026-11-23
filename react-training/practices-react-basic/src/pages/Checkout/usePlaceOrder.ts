import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { TOAST_MESSAGES } from '@/constants/toastMessages'
import { failureMessage } from '@/hooks/failureMessage'
import { cartQueryOptions } from '@/hooks/useCart'
import { useCartOwner } from '@/hooks/useCartOwner'
import { useCreateOrder } from '@/hooks/useOrders'
import { productsByIdsQueryOptions } from '@/hooks/useProducts'
import { useSubmitLock } from '@/hooks/useSubmitLock'
import { useToast } from '@/hooks/useToast'
import { toShippingAddress } from '@/schemas/checkout'
import { requireCartOwner } from '@/utils/cartOwner'
import { buildOrderItems } from './buildOrderItems'
import { stockIssue } from './stockIssue'
import type { CartLine } from '@/hooks/useCartLines'
import type { CheckoutFormValues } from '@/schemas/checkout'
import type { CartItem, Product } from '@/types'

export interface PlaceOrder {
  placeOrder: (values: CheckoutFormValues, lines: CartLine[]) => Promise<void>
  isPlacing: boolean
  isOrderStarted: boolean
}

function isSameItem(fresh: CartItem, shown: CartItem | undefined): boolean {
  return (
    shown !== undefined &&
    fresh.id === shown.id &&
    fresh.productId === shown.productId &&
    fresh.color === shown.color &&
    fresh.size === shown.size &&
    fresh.quantity === shown.quantity
  )
}

function isSameCart(freshItems: CartItem[], lines: CartLine[]): boolean {
  return (
    freshItems.length === lines.length &&
    freshItems.every((item, index) => isSameItem(item, lines[index]?.item))
  )
}

function productIdsOf(lines: CartLine[]): string[] {
  return [...new Set(lines.map(({ item }) => item.productId))]
}

function freshLineOf({ item }: CartLine, products: Product[]): CartLine {
  return { item, product: products.find((product) => product.id === item.productId) ?? null }
}

function hasLineChanged(shown: CartLine, fresh: CartLine): boolean {
  if (fresh.product === null) return true
  if (stockIssue(fresh) !== null) return true
  return fresh.product.price !== shown.product?.price
}

export function usePlaceOrder(): PlaceOrder {
  const owner = useCartOwner()
  const queryClient = useQueryClient()
  const toast = useToast()
  const createOrder = useCreateOrder()
  const lock = useSubmitLock()
  const isMountedRef = useRef(false)
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  async function verifiedLines(lines: CartLine[]): Promise<CartLine[] | null> {
    try {
      const cart = await queryClient.fetchQuery({
        ...cartQueryOptions(requireCartOwner(owner)),
        staleTime: 0,
      })
      if (!isMountedRef.current) return null
      if (!isSameCart(cart.items, lines)) {
        toast.error(TOAST_MESSAGES.order.cartChanged)
        return null
      }
      const products = await queryClient.fetchQuery({
        ...productsByIdsQueryOptions(productIdsOf(lines)),
        staleTime: 0,
      })
      if (!isMountedRef.current) return null
      if (lines.some((line) => hasLineChanged(line, freshLineOf(line, products)))) {
        toast.error(TOAST_MESSAGES.order.cartChanged)
        return null
      }
      return lines.map((line) => freshLineOf(line, products))
    } catch (error) {
      toast.error(failureMessage(error, TOAST_MESSAGES.order.failed))
      return null
    }
  }

  async function placeOrder(values: CheckoutFormValues, lines: CartLine[]): Promise<void> {
    if (!lock.acquire()) return
    let isOrderPlaced = false
    setIsChecking(true)
    try {
      const freshLines = await verifiedLines(lines)
      if (freshLines === null || !isMountedRef.current) return
      isOrderPlaced = await createOrder
        .mutateAsync({
          items: buildOrderItems(freshLines),
          shippingAddress: toShippingAddress(values),
          paymentMethod: values.paymentMethod,
        })
        .then(
          () => true,
          () => false
        )
    } finally {
      if (!isOrderPlaced) lock.release()
      if (isMountedRef.current) setIsChecking(false)
    }
  }

  const isOrderStarted = createOrder.isPending || createOrder.isSuccess

  return { placeOrder, isPlacing: isChecking || isOrderStarted, isOrderStarted }
}
