import type { CartItem } from '@/types'

type QuantityLine = Pick<CartItem, 'quantity'>

function wholeQuantity(quantity: number): number {
  return Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 0
}

export function countCartItems(items: readonly QuantityLine[] = []): number {
  return items.reduce((total, line) => total + wholeQuantity(line.quantity), 0)
}
