import { OrderDetails } from '@/components/shared/OrderDetails'
import { OrderStatusBadge } from '@/components/shared/OrderStatusBadge'
import { OrderTimeline } from '@/components/shared/OrderTimeline'
import { ACCOUNT_SECTION_HEADING } from '@/components/shared/pageLayout'
import { SCRIPT_FOCUS_RING } from '@/components/ui/focusWithVisibleRing'
import { FOCUS_RING } from '@/components/ui/interactionClasses'
import { ORDER_TEXT } from '@/constants/order'
import { cn } from '@/utils/cn'
import type { RefObject } from 'react'
import type { Order } from '@/types'

interface OrderLookupResultProps {
  order: Order
  headingRef: RefObject<HTMLHeadingElement>
}

export function OrderLookupResult({ order, headingRef }: OrderLookupResultProps): JSX.Element {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-4">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className={cn('break-words', ACCOUNT_SECTION_HEADING, FOCUS_RING, SCRIPT_FOCUS_RING)}
        >
          {ORDER_TEXT.orderIdLine(order.id)}
        </h2>
        <OrderStatusBadge status={order.status} />
      </div>
      <OrderTimeline status={order.status} />
      <OrderDetails order={order} />
    </section>
  )
}
