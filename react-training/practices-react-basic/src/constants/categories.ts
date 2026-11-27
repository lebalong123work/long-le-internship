// Category tabs from Figma (Home frame 1:118). Same values as server/db.seed.json.
export const CATEGORIES = [
  { name: 'T-Shirt', slug: 't-shirt' },
  { name: 'Jacket', slug: 'jacket' },
  { name: 'Shirt', slug: 'shirt' },
  { name: 'Jeans', slug: 'jeans' },
] as const

export type CategorySlug = (typeof CATEGORIES)[number]['slug']

export function categoryName(slug: CategorySlug): string {
  return CATEGORIES.find((category) => category.slug === slug)?.name ?? slug
}

export function seeMoreSuffix(slug: CategorySlug | undefined): string {
  return slug === undefined ? ' all products' : ` ${categoryName(slug)} products`
}

export const CATEGORY_LIST_LABEL = 'Product categories'
