export interface Product {
  id: string
  name: string
  price: number
  thumbnail: string
  images: string[]
  category: string
  description: string
  stock: number
  colors: string[]
  sizes: string[]
  rating: number
  reviewCount: number
  isBestSeller: boolean
  createdAt: string
}

export interface Category {
  id: string
  name: string
  slug: string
}

export interface ProductFilters {
  category?: string
  search?: string
  page?: number
  perPage?: number
  sort?: 'newest' | 'price-asc' | 'price-desc'
}

export interface PaginatedList<T> {
  data: T[]
  total: number
  page: number
  perPage: number
  totalPages: number
}
