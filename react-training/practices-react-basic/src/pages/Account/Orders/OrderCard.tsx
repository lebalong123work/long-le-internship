import { useState } from 'react'
import { OrderDetails } from '@/components/shared/OrderDetails'
import { ORDER_SUMMARY_CLASSES } from '@/components/shared/orderSummaryClasses'
import { OrderStatusBadge } from '@/components/shared/OrderStatusBadge'
import { ACCOUNT_SECTION_HEADING } from '@/components/shared/pageLayout'
import { Button } from '@/components/ui/Button'
import { ORDER_HISTORY_TEXT, ORDER_TEXT } from '@/constants/order'
import { cn } from '@/utils/cn'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'
import { ORDER_CARD_CLASSES } from './orderHistoryClasses'
import { OrderTimeline } from './OrderTimeline'
import type { Order } from '@/types'

interface OrderCardProps {
  order: Order
}

function itemCountOf(order: Order): number {
  return order.items.reduce((sum, item) => sum + item.quantity, 0)
}

export function OrderCard({ order }: OrderCardProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false)
  const headingId = `order-${order.id}-heading`
  const panelId = `order-${order.id}-detail`
  const date = formatDate(order.createdAt)

  return (
    <article aria-labelledby={headingId} className={ORDER_CARD_CLASSES}>
      <div className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center md:gap-x-6">
        <h2 id={headingId} className={cn('break-words', ACCOUNT_SECTION_HEADING)}>
          {ORDER_TEXT.orderNumber(order.id)}
        </h2>
        {date !== '' && (
          <time dateTime={order.createdAt} className={ORDER_SUMMARY_CLASSES.bodyText}>
            {date}
          </time>
        )}
        <p className={ORDER_SUMMARY_CLASSES.bodyText}>{formatCurrency(order.total, 'long')}</p>
        <p className={ORDER_SUMMARY_CLASSES.bodyText}>
          {ORDER_HISTORY_TEXT.itemCount(itemCountOf(order))}
        </p>
        <OrderStatusBadge status={order.status} />
      </div>
      <Button
        variant="light"
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-describedby={headingId}
        onClick={() => setIsOpen((open) => !open)}
        className="w-full md:w-fit"
      >
        {isOpen ? ORDER_HISTORY_TEXT.hideDetail : ORDER_HISTORY_TEXT.viewDetail}
      </Button>
      {isOpen && (
        <div id={panelId} className="flex flex-col gap-6">
          <hr className={ORDER_SUMMARY_CLASSES.divider} />
          <OrderTimeline status={order.status} />
          <OrderDetails order={order} headingLevel={3} className="p-0" />
        </div>
      )}
    </article>
  )
}
