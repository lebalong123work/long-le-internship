import { useEffect, useRef } from 'react'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { ProductGrid, ProductGridSkeleton } from '@/components/shared/ProductGrid'
import {
  focusWithVisibleRing,
  isFocusFree,
  SCRIPT_FOCUS_RING,
} from '@/components/ui/focusWithVisibleRing'
import { FOCUS_RING } from '@/components/ui/interactionClasses'
import { ROUTES } from '@/constants/routes'
import { UI_STATE_MESSAGES } from '@/constants/uiStateMessages'
import { WISHLIST_TEXT } from '@/constants/wishlist'
import { useWishlist } from '@/hooks/useWishlist'
import { useWishlistProducts } from '@/hooks/useWishlistProducts'
import { cn } from '@/utils/cn'
import { WishlistCardActions } from './WishlistCardActions'
import type { ReactNode } from 'react'

const EMPTY_WISHLIST_ICON = '/icons/heart.svg'
const SKELETON_COUNT = 4

export default function Wishlist(): JSX.Element {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const retryRequested = useRef(false)
  const { status, products, retry, isRetrying } = useWishlistProducts()
  const { toggle } = useWishlist()
  const shownCount = products.length
  const previousCount = useRef(shownCount)

  function focusHeadingIfFree(): void {
    if (isFocusFree() && headingRef.current) focusWithVisibleRing(headingRef.current)
  }

  useEffect(() => {
    if (!retryRequested.current || isRetrying) return
    retryRequested.current = false
    if (status !== 'error') focusHeadingIfFree()
  }, [status, isRetrying])

  useEffect(() => {
    const shrank = shownCount < previousCount.current
    previousCount.current = shownCount
    if (shrank) focusHeadingIfFree()
  }, [shownCount])

  function retryLoading(): void {
    retryRequested.current = true
    retry()
  }

  function renderContent(): ReactNode {
    if (status === 'loading') {
      return (
        <div aria-busy="true">
          <ProductGridSkeleton count={SKELETON_COUNT} />
        </div>
      )
    }
    if (status === 'error') return <ErrorState onRetry={retryLoading} isRetrying={isRetrying} />
    if (status === 'empty') {
      return (
        <EmptyState
          iconSrc={EMPTY_WISHLIST_ICON}
          message={UI_STATE_MESSAGES.emptyWishlist}
          action={{ label: WISHLIST_TEXT.startShopping, to: ROUTES.HOME }}
        />
      )
    }
    return (
      <>
        <h2 className="sr-only">{WISHLIST_TEXT.gridHeading}</h2>
        <ProductGrid
          products={products}
          renderActions={(product) => (
            <WishlistCardActions product={product} onRemove={() => toggle(product.id)} />
          )}
        />
      </>
    )
  }

  return (
    <div>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className={cn('font-heading text-h3 font-bold text-dark', FOCUS_RING, SCRIPT_FOCUS_RING)}
      >
        {WISHLIST_TEXT.heading}
      </h1>
      <p role="status" className="sr-only">
        {status === 'loading' ? WISHLIST_TEXT.loading : ''}
      </p>
      <div className="mt-6">{renderContent()}</div>
    </div>
  )
}
