import type { Product } from '@/types'

export function productImageSrc(product: Product | null): string | undefined {
  const candidates = [product?.images[0]?.src, product?.thumbnail]
  return candidates.find((src) => src !== undefined && src.trim() !== '')
}
