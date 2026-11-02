import type { PaginatedList, Product, ProductFilters } from '@/types'

export function getProducts(_filters: ProductFilters): Promise<PaginatedList<Product>> {
  throw new Error('not implemented')
}

export function getById(_id: string): Promise<Product> {
  throw new Error('not implemented')
}

export function getBestSellers(_category: string): Promise<Product[]> {
  throw new Error('not implemented')
}

export function getRelated(_product: Product): Promise<Product[]> {
  throw new Error('not implemented')
}
