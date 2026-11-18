import { productImageSrc } from '@/utils/productImage'
import type { CartLine } from '@/hooks/useCartLines'
import type { OrderItem } from '@/types'

export function buildOrderItems(lines: CartLine[]): OrderItem[] {
  return lines.flatMap(({ item, product }) =>
    product
      ? [
          {
            productId: item.productId,
            name: product.name,
            price: product.price,
            image: productImageSrc(product) ?? '',
            color: item.color,
            size: item.size,
            quantity: item.quantity,
          },
        ]
      : []
  )
}
