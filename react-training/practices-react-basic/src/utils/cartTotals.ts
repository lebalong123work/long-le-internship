import { SHIPPING_FEE } from '@/constants/shipping'

export interface PricedLine {
  price: number
  quantity: number
}

export interface CartTotals {
  itemCount: number
  subtotal: number
  shippingFee: number
  total: number
}

function roundToCents(value: number): number {
  return Math.round(value * 100) / 100
}

export function calcCartTotals(lines: readonly PricedLine[]): CartTotals {
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0)
  const subtotal = roundToCents(lines.reduce((sum, line) => sum + line.price * line.quantity, 0))
  const shippingFee = SHIPPING_FEE
  return { itemCount, subtotal, shippingFee, total: roundToCents(subtotal + shippingFee) }
}
