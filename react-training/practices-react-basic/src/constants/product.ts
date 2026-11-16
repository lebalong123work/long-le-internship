const countFormat = new Intl.NumberFormat('en-US')

export const MAX_RATING = 5

export const RATING_TEXT = {
  rating: (rating: number) => `Rated ${rating} out of ${MAX_RATING}`,
  reviewCountShort: (shortCount: string) => `( ${shortCount} )`,
  reviews: (count: number) => (count === 1 ? '1 review' : `${countFormat.format(count)} reviews`),
} as const
