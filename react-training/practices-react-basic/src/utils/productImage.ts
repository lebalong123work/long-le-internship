import type { Product } from '@/types'

export function usableImageSrc(src: string | undefined): string | undefined {
  return src !== undefined && src.trim() !== '' ? src : undefined
}

export function productImageSrc(product: Product | null): string | undefined {
  return usableImageSrc(product?.images[0]?.src) ?? usableImageSrc(product?.thumbnail)
}
