interface WishlistHeartIconProps {
  isSaved: boolean
  withFrame?: boolean
}

const HEART_FRAME = '/icons/card-heart.svg#card-heart-frame'
const HEART_SHAPE = '/icons/card-heart.svg#card-heart-shape'

export function WishlistHeartIcon({
  isSaved,
  withFrame = false,
}: WishlistHeartIconProps): JSX.Element {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className="size-8">
      {withFrame && <use href={HEART_FRAME} />}
      <use href={HEART_SHAPE} className={isSaved ? 'fill-badge' : 'fill-none'} />
    </svg>
  )
}
