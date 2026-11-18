import { useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { OrderDetails } from '@/components/shared/OrderDetails'
import { ButtonLink } from '@/components/ui/ButtonLink'
import {
  focusWithVisibleRing,
  isFocusFree,
  SCRIPT_FOCUS_RING,
} from '@/components/ui/focusWithVisibleRing'
import { FOCUS_RING } from '@/components/ui/interactionClasses'
import { ORDER_TEXT } from '@/constants/order'
import { ROUTES } from '@/constants/routes'
import { UI_STATE_MESSAGES } from '@/constants/uiStateMessages'
import { useFirstLoadRetry } from '@/hooks/useFirstLoadRetry'
import { useOrder } from '@/hooks/useOrders'
import { isNotFoundError } from '@/services/apiClient'
import { cn } from '@/utils/cn'
import { OrderSuccessSkeleton } from './OrderSuccessSkeleton'
import { ORDER_SUCCESS_LAYOUT } from './orderSuccessLayout'
import type { ReactNode } from 'react'
import type { Order } from '@/types'

const NOT_FOUND_ICON = '/icons/search.svg'
const SUCCESS_ICON = '/icons/check-circle.svg'

interface OrderConfirmationProps {
  order: Order
}

function NotFoundState(): JSX.Element {
  return (
    <EmptyState
      iconSrc={NOT_FOUND_ICON}
      message={UI_STATE_MESSAGES.orderNotFound}
      action={{ label: UI_STATE_MESSAGES.backToHome, to: ROUTES.HOME }}
    />
  )
}

function OrderConfirmation({ order }: OrderConfirmationProps): JSX.Element {
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (isFocusFree() && headingRef.current) focusWithVisibleRing(headingRef.current)
  }, [])

  return (
    <div className={ORDER_SUCCESS_LAYOUT.column}>
      <div className={ORDER_SUCCESS_LAYOUT.header}>
        <img
          src={SUCCESS_ICON}
          alt=""
          width={80}
          height={80}
          className={ORDER_SUCCESS_LAYOUT.icon}
        />
        <h1
          ref={headingRef}
          tabIndex={-1}
          className={cn('font-heading text-h2 font-bold text-dark', FOCUS_RING, SCRIPT_FOCUS_RING)}
        >
          {ORDER_TEXT.successTitle}
        </h1>
        <p className="font-body text-lg leading-normal text-medium-dark">
          {`${ORDER_TEXT.orderIdLabel}: ${ORDER_TEXT.orderNumber(order.id)}`}
        </p>
      </div>
      <OrderDetails order={order} />
      <div className={ORDER_SUCCESS_LAYOUT.actions}>
        <ButtonLink to={ROUTES.SHOP} className={ORDER_SUCCESS_LAYOUT.action}>
          {ORDER_TEXT.continueShopping}
        </ButtonLink>
        <ButtonLink
          to={ROUTES.ACCOUNT.ORDERS}
          variant="light"
          className={ORDER_SUCCESS_LAYOUT.action}
        >
          {ORDER_TEXT.viewOrder}
        </ButtonLink>
      </div>
    </div>
  )
}

export default function OrderSuccess(): JSX.Element {
  const { orderId } = useParams()
  const { data, isPending, isFetching, error, refetch } = useOrder(orderId)
  const { isRetrying, retry } = useFirstLoadRetry(orderId, refetch)
  const showSkeleton = data === undefined && orderId !== undefined && !isRetrying && isPending

  function renderContent(): ReactNode {
    if (data !== undefined) return <OrderConfirmation key={data.id} order={data} />
    if (orderId === undefined) return <NotFoundState />
    if (showSkeleton) {
      return (
        <div aria-busy="true">
          <OrderSuccessSkeleton />
        </div>
      )
    }
    if (!isRetrying && isNotFoundError(error)) return <NotFoundState />
    return <ErrorState onRetry={retry} isRetrying={isRetrying || isFetching} />
  }

  return (
    <div className="container px-4 pb-10 pt-10 md:px-6 xl:px-0 xl:pb-16 xl:pt-20">
      <p role="status" className="sr-only">
        {showSkeleton ? ORDER_TEXT.loading : ''}
      </p>
      {renderContent()}
    </div>
  )
}
