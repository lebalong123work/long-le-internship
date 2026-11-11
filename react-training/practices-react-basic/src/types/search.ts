import type { Category, Product } from './product'

export type Suggestion =
  { type: 'category'; category: Category } | { type: 'product'; product: Product }
