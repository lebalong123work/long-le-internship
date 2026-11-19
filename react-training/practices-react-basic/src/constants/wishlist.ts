export const WISHLIST_TEXT = {
  heading: 'My Wishlist',
  gridHeading: 'Saved products',
  loading: 'Loading saved items',
  addToCart: 'Add to Cart',
  addToCartName: (productName: string) => `: ${productName}`,
  remove: 'Remove',
  removeName: (productName: string) => ` ${productName} from wishlist`,
  startShopping: 'Start Shopping',
} as const
