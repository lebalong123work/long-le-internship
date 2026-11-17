function photoPosition(position: number, total: number): string {
  return `${position} of ${total}`
}

export const DEFAULT_SIZE = 'S'

export const SWATCH_COLORS: Readonly<Record<string, string>> = {
  Black: '#19181D',
  Blue: '#5463FF',
  Green: '#7DAC5F',
}

export const PRODUCT_DETAIL_TEXT = {
  breadcrumbHome: 'Home',
  breadcrumbShop: 'Shop',
  color: 'Color',
  size: 'Size',
  quantity: 'Quantity',
  inStock: 'In Stock',
  outOfStock: 'Out of Stock',
  stockCount: (stock: number): string => `( ${stock} )`,
  stockCountLabel: (stock: number): string => `${stock} in stock`,
  loading: 'Loading product',
  choosePhoto: 'Choose photo',
  showPhoto: (position: number, total: number): string =>
    `Show photo ${photoPosition(position, total)}`,
  photoStatus: (position: number, total: number): string =>
    `Photo ${photoPosition(position, total)}`,
  mainPhotoAlt: (productName: string, position: number, total: number): string =>
    `${productName}, photo ${photoPosition(position, total)}`,
  addToCart: 'Add To Cart',
  colorRequired: 'Please select a color',
  sameProduct: 'Same Product',
  seeMore: 'See More',
} as const
