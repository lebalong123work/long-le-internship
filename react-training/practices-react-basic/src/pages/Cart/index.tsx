import { useEffect, useRef } from 'react'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { focusWithVisibleRing, SCRIPT_FOCUS_RING } from '@/components/ui/focusWithVisibleRing'
import { FOCUS_RING } from '@/components/ui/interactionClasses'
import { CART_TEXT } from '@/constants/cart'
import { ROUTES } from '@/constants/routes'
import { UI_STATE_MESSAGES } from '@/constants/uiStateMessages'
import { useRemoveCartItem, useUpdateCartQuantity } from '@/hooks/useCart'
import { useCartLines } from '@/hooks/useCartLines'
import { cn } from '@/utils/cn'
import { CartBanner } from './CartBanner'
import { CartItemRow } from './CartItemRow'
import { CART_LAYOUT } from './cartLayout'
import { CartSkeleton } from './CartSkeleton'
import { OrderSummary } from './OrderSummary'
import type { ReactNode } from 'react'

const EMPTY_CART_ICON = '/icons/cart.svg'

function isFocusFree(): boolean {
  const focused = document.activeElement
  return focused === null || focused === document.body
}

export default function Cart(): JSX.Element {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const retryRequested = useRef(false)
  const { status, lines, summary, hasUnavailableItems, retry, isRetrying } = useCartLines()
  const { mutate: updateQuantity } = useUpdateCartQuantity()
  const { mutate: removeItem } = useRemoveCartItem()

  useEffect(() => {
    if (!retryRequested.current || isRetrying) return
    retryRequested.current = false
    if (status !== 'error' && isFocusFree() && headingRef.current) {
      focusWithVisibleRing(headingRef.current)
    }
  }, [status, isRetrying])

  function retryLoading(): void {
    retryRequested.current = true
    retry()
  }

  function removeLine(itemId: string): void {
    removeItem(itemId)
    if (headingRef.current) focusWithVisibleRing(headingRef.current)
  }

  function renderContent(): ReactNode {
    if (status === 'loading') {
      return (
        <div aria-busy="true">
          <CartSkeleton />
        </div>
      )
    }
    if (status === 'error') return <ErrorState onRetry={retryLoading} isRetrying={isRetrying} />
    if (status === 'empty') {
      return (
        <EmptyState
          iconSrc={EMPTY_CART_ICON}
          message={UI_STATE_MESSAGES.emptyCart}
          action={{ label: CART_TEXT.shopNow, to: ROUTES.HOME }}
        />
      )
    }
    return (
      <div className={CART_LAYOUT.columns}>
        <ul className={CART_LAYOUT.list}>
          {lines.map((line) => (
            <CartItemRow
              key={line.item.id}
              line={line}
              onQuantityChange={(quantity) => updateQuantity({ itemId: line.item.id, quantity })}
              onRemove={() => removeLine(line.item.id)}
            />
          ))}
        </ul>
        <OrderSummary summary={summary} isCheckoutBlocked={hasUnavailableItems} />
      </div>
    )
  }

  return (
    <div className="pb-10 xl:pb-16">
      <CartBanner />
      <div className="container px-4 md:px-6 xl:px-0">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className={cn(
            'mt-10 font-heading text-h3 font-bold text-dark xl:mt-20',
            FOCUS_RING,
            SCRIPT_FOCUS_RING
          )}
        >
          {CART_TEXT.heading}
        </h2>
        <p role="status" className="sr-only">
          {status === 'loading' ? CART_TEXT.loading : ''}
        </p>
        <div className="mt-10 xl:mt-9">{renderContent()}</div>
      </div>
    </div>
  )
}
