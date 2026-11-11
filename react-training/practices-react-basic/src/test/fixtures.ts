import type { Product } from '@/types'

export function product(id: string): Product {
  return {
    id,
    name: 'Smart T-Shirt',
    price: 40,
    thumbnail: `/images/products/${id}.jpg`,
    images: [`/images/products/${id}.jpg`],
    category: 't-shirt',
    description: 'Best quality',
    stock: 1234,
    colors: ['Black'],
    sizes: ['S'],
    rating: 5,
    reviewCount: 1000,
    isBestSeller: true,
    createdAt: '2026-11-03T00:00:00.000Z',
  }
}
