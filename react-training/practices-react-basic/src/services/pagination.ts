import type { PaginatedList } from '@/types'

export interface JsonServerPage<T> {
  data: T[]
  first: number
  prev: number | null
  next: number | null
  last: number
  pages: number
  items: number
}

export function toPaginatedList<T>(response: JsonServerPage<T>, perPage: number): PaginatedList<T> {
  return {
    data: response.data,
    total: response.items,
    page: response.prev === null ? 1 : response.prev + 1,
    perPage,
    totalPages: response.pages,
  }
}
