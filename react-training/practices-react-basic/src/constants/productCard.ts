import { RATING_TEXT } from './product'

export const PRODUCT_CARD_TEXT = {
  ...RATING_TEXT,
  bestQuality: 'Best quality',
  saveToWishlist: (productName: string) => `Save ${productName} to wishlist`,
} as const
