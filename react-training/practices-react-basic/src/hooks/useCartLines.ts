import { useState } from 'react'
import { calcCartTotals } from '@/utils/cartTotals'
import { countCartItems } from '@/utils/countCartItems'
import { useCart } from './useCart'
import { usableProducts, useProductsByIds } from './useProducts'
import type { PricedLine } from '@/utils/cartTotals'
import type { CartItem, Product } from '@/types'

type CartLinesStatus = 'loading' | 'error' | 'empty' | 'ready'
type RetryTarget = 'cart' | 'products'

export interface CartLine {
  item: CartItem
  product: Product | null
}

export interface CartSummary {
  itemCount: number
  subtotal: number
  shippingFee: number
  total: number
}

export interface CartLinesState {
  status: CartLinesStatus
  lines: CartLine[]
  summary: CartSummary
  hasUnavailableItems: boolean
  isMergePending: boolean
  retry: () => void
  isRetrying: boolean
}

const NO_ITEMS: CartItem[] = []

function uniqueProductIds(items: CartItem[]): string[] {
  return [...new Set(items.map((item) => item.productId))]
}

function joinLines(items: CartItem[], products: Product[]): CartLine[] {
  return items.map((item) => ({
    item,
    product: products.find((product) => product.id === item.productId) ?? null,
  }))
}

function pricedLines(lines: CartLine[]): PricedLine[] {
  return lines.flatMap(({ item, product }) =>
    product ? [{ price: product.price, quantity: item.quantity }] : []
  )
}

export function useCartLines(): CartLinesState {
  const [retryingQuery, setRetryingQuery] = useState<RetryTarget | null>(null)
  const cartQuery = useCart()
  const items = cartQuery.data?.items ?? NO_ITEMS
  const ids = uniqueProductIds(items)
  const productsQuery = useProductsByIds(ids)
  const products = usableProducts(productsQuery, ids)

  function resolveStatus(): CartLinesStatus {
    if (retryingQuery !== null) return 'error'
    if (cartQuery.data === undefined) return cartQuery.isError ? 'error' : 'loading'
    if (items.length === 0) return 'empty'
    if (products !== undefined) return 'ready'
    return productsQuery.isError ? 'error' : 'loading'
  }

  function retry(): void {
    const target: RetryTarget = cartQuery.data === undefined ? 'cart' : 'products'
    const request = target === 'cart' ? cartQuery.refetch() : productsQuery.refetch()
    setRetryingQuery(target)
    void request.finally(() => setRetryingQuery(null))
  }

  const status = resolveStatus()
  const lines = status === 'ready' && products !== undefined ? joinLines(items, products) : []
  const { subtotal, shippingFee, total } = calcCartTotals(pricedLines(lines))

  return {
    status,
    lines,
    summary: { itemCount: countCartItems(items), subtotal, shippingFee, total },
    hasUnavailableItems: lines.some((line) => line.product === null),
    isMergePending: Boolean(cartQuery.data?.pendingMerge),
    retry,
    isRetrying: retryingQuery !== null,
  }
}
