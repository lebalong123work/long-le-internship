import { RATING_TEXT } from '@/constants/product'
import { cn } from '@/utils/cn'

const STAR_ICON = '/icons/star.svg'

interface RatingStarsProps {
  rating: number
  className?: string
}

function ratingLabelValue(rating: number): number {
  return Math.round(rating * 10) / 10
}

export function RatingStars({ rating, className }: RatingStarsProps): JSX.Element {
  const stars = Array.from({ length: Math.round(rating) }, (_, index) => index)

  return (
    <span
      role="img"
      aria-label={RATING_TEXT.rating(ratingLabelValue(rating))}
      className={cn('flex', className)}
    >
      {stars.map((star) => (
        <span key={star} className="flex size-[18px] items-center justify-center">
          <img src={STAR_ICON} alt="" width={16} height={15} />
        </span>
      ))}
    </span>
  )
}
