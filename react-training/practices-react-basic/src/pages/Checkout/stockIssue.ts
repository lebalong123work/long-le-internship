import { CHECKOUT_TEXT } from '@/constants/checkout'
import { PRODUCT_DETAIL_TEXT } from '@/constants/productDetail'
import type { CartLine } from '@/hooks/useCartLines'

export function stockIssue({ item, product }: CartLine): string | null {
  if (product === null) return null
  if (product.stock <= 0) return PRODUCT_DETAIL_TEXT.outOfStock
  if (item.quantity > product.stock) return CHECKOUT_TEXT.onlyLeft(product.stock)
  return null
}

export function hasStockIssue(lines: CartLine[]): boolean {
  return lines.some((line) => stockIssue(line) !== null)
}
