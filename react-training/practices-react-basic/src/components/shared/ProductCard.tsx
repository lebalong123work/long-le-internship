import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ARIA_DISABLED,
  FOCUS_RING,
  FOCUS_RING_ON_DARK,
  HOVER_OPACITY,
} from '@/components/ui/interactionClasses'
import { CARD_INFO_PADDING, PRICE_TEXT_CLASSES } from '@/components/shared/productCardClasses'
import { RatingStars } from '@/components/shared/RatingStars'
import { WishlistHeartIcon } from '@/components/shared/WishlistHeartIcon'
import { PRODUCT_CARD_TEXT } from '@/constants/productCard'
import { ROUTES } from '@/constants/routes'
import { useWishlist } from '@/hooks/useWishlist'
import { cn } from '@/utils/cn'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatReviewCount } from '@/utils/formatReviewCount'
import type { ReactNode } from 'react'
import type { Product } from '@/types'

const BOOKMARK_ICON = '/icons/card-bookmark.svg'
const CARD_ACTIONS = 'relative z-10 mt-auto flex flex-col gap-2 px-4 pb-6'

interface ProductCardProps {
  product: Product
  actions?: ReactNode
  className?: string
}

interface HeartButtonProps {
  product: Product
}

interface RatingProps {
  rating: number
  reviewCount: number
}

function HeartButton({ product }: HeartButtonProps): JSX.Element {
  const { isInWishlist, toggle, isLoaded } = useWishlist()
  const isSaved = isInWishlist(product.id)

  function handleClick(): void {
    if (!isLoaded) return
    toggle(product.id)
  }

  return (
    <button
      type="button"
      aria-label={PRODUCT_CARD_TEXT.saveToWishlist(product.name)}
      aria-pressed={isSaved}
      aria-disabled={isLoaded ? undefined : true}
      onClick={handleClick}
      className={cn(
        'pointer-events-auto size-8',
        FOCUS_RING,
        FOCUS_RING_ON_DARK,
        HOVER_OPACITY,
        ARIA_DISABLED
      )}
    >
      <WishlistHeartIcon isSaved={isSaved} withFrame />
    </button>
  )
}

function Rating({ rating, reviewCount }: RatingProps): JSX.Element {
  return (
    <div className="mt-[13px] flex flex-wrap items-center gap-x-2.5 gap-y-1">
      <RatingStars rating={rating} className="gap-1" />
      <p className="font-numeric text-sm leading-normal text-medium-dark">
        <span aria-hidden="true">
          {PRODUCT_CARD_TEXT.reviewCountShort(formatReviewCount(reviewCount))}
        </span>
        <span className="sr-only">{PRODUCT_CARD_TEXT.reviews(reviewCount)}</span>
      </p>
    </div>
  )
}

export function ProductCard({ product, actions, className }: ProductCardProps): JSX.Element {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const imageFailed = failedSrc === product.thumbnail

  return (
    <article
      className={cn(
        'group relative flex w-full max-w-card flex-col bg-white shadow-card can-hover:hover:shadow-card-hover',
        className
      )}
    >
      <div className="relative aspect-card w-full bg-[#ACACAC]">
        {!imageFailed && (
          <img
            src={product.thumbnail}
            alt=""
            loading="lazy"
            width={265}
            height={248}
            onError={() => setFailedSrc(product.thumbnail)}
            className="size-full object-cover"
          />
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex h-14 items-center justify-end gap-4 bg-black/50 pr-4 backdrop-blur-[2px] can-hover:opacity-0 can-hover:group-focus-within:opacity-100 can-hover:group-hover:opacity-100">
          <span aria-hidden="true" className="size-8">
            <img src={BOOKMARK_ICON} alt="" className="size-8" />
          </span>
          <HeartButton product={product} />
        </div>
      </div>
      <div className={CARD_INFO_PADDING}>
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 break-words font-body text-sm font-bold leading-normal text-dark">
            <Link
              to={ROUTES.PRODUCT(product.id)}
              className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-primary"
            >
              {product.name}
            </Link>
          </h3>
          <p className={PRICE_TEXT_CLASSES}>{formatCurrency(product.price, 'short')}</p>
        </div>
        <p className="mt-1 font-body text-sm leading-normal text-medium-dark">
          {PRODUCT_CARD_TEXT.bestQuality}
        </p>
        <Rating rating={product.rating} reviewCount={product.reviewCount} />
      </div>
      {actions && <div className={CARD_ACTIONS}>{actions}</div>}
    </article>
  )
}
