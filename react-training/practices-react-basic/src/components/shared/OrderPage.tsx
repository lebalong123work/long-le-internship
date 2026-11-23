import { useEffect, useRef } from 'react'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { OrderDetails } from '@/components/shared/OrderDetails'
import {
  focusWithVisibleRing,
  isFocusFree,
  SCRIPT_FOCUS_RING,
} from '@/components/ui/focusWithVisibleRing'
import { FOCUS_RING } from '@/components/ui/interactionClasses'
import { ORDER_TEXT } from '@/constants/order'
import { ROUTES } from '@/constants/routes'
import { UI_STATE_MESSAGES } from '@/constants/uiStateMessages'
import { useCartOwner } from '@/hooks/useCartOwner'
import { useFirstLoadRetry } from '@/hooks/useFirstLoadRetry'
import { useOrder } from '@/hooks/useOrders'
import { isNotFoundError } from '@/services/apiClient'
import { cn } from '@/utils/cn'
import { OrderPageSkeleton } from './OrderPageSkeleton'
import { ORDER_PAGE_LAYOUT } from './orderPageLayout'
import type { ReactNode } from 'react'
import type { Order } from '@/types'

const NOT_FOUND_ICON = '/icons/search.svg'

interface OrderPageProps {
  orderId: string | undefined
  title: string
  iconSrc: string
  renderActions: (order: Order) => ReactNode
  renderNote?: (order: Order) => ReactNode
}

interface OrderViewProps {
  order: Order
  title: string
  iconSrc: string
  actions: ReactNode
  note: ReactNode
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

function OrderView({ order, title, iconSrc, actions, note }: OrderViewProps): JSX.Element {
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (isFocusFree() && headingRef.current) focusWithVisibleRing(headingRef.current)
  }, [])

  return (
    <div className={ORDER_PAGE_LAYOUT.column}>
      <div className={ORDER_PAGE_LAYOUT.header}>
        <img src={iconSrc} alt="" width={80} height={80} className={ORDER_PAGE_LAYOUT.icon} />
        <h1
          ref={headingRef}
          tabIndex={-1}
          className={cn(ORDER_PAGE_LAYOUT.title, FOCUS_RING, SCRIPT_FOCUS_RING)}
        >
          {title}
        </h1>
        <p className={ORDER_PAGE_LAYOUT.subtitle}>{ORDER_TEXT.orderIdLine(order.id)}</p>
        {note}
      </div>
      <OrderDetails order={order} />
      <div className={ORDER_PAGE_LAYOUT.actions}>{actions}</div>
    </div>
  )
}

export function OrderPage({
  orderId,
  title,
  iconSrc,
  renderActions,
  renderNote,
}: OrderPageProps): JSX.Element {
  const owner = useCartOwner()
  const { data, isPending, isFetching, error, refetch } = useOrder(orderId)
  const { isRetrying, retry } = useFirstLoadRetry(orderId, refetch)
  const canLoad = owner !== null && orderId !== undefined
  const showSkeleton = data === undefined && canLoad && !isRetrying && isPending

  function renderContent(): ReactNode {
    if (data !== undefined) {
      return (
        <OrderView
          key={data.id}
          order={data}
          title={title}
          iconSrc={iconSrc}
          actions={renderActions(data)}
          note={renderNote?.(data)}
        />
      )
    }
    if (!canLoad) return <NotFoundState />
    if (showSkeleton) {
      return (
        <div aria-busy="true">
          <OrderPageSkeleton />
        </div>
      )
    }
    if (!isRetrying && isNotFoundError(error)) return <NotFoundState />
    return <ErrorState onRetry={retry} isRetrying={isRetrying || isFetching} />
  }

  return (
    <div className={ORDER_PAGE_LAYOUT.container}>
      <p role="status" className="sr-only">
        {showSkeleton ? ORDER_TEXT.loading : ''}
      </p>
      {renderContent()}
    </div>
  )
}
