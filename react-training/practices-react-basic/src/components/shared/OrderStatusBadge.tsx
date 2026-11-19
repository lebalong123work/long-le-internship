import {
  isOrderStatus,
  ORDER_STATUS_BADGE_CLASSES,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_NEUTRAL_BADGE_CLASS,
} from '@/constants/orderStatus'
import { cn } from '@/utils/cn'

interface OrderStatusBadgeProps {
  status: string
}

interface BadgeLook {
  label: string
  className: string
}

function badgeLook(status: string): BadgeLook {
  if (isOrderStatus(status)) {
    return { label: ORDER_STATUS_LABELS[status], className: ORDER_STATUS_BADGE_CLASSES[status] }
  }
  return { label: status, className: ORDER_STATUS_NEUTRAL_BADGE_CLASS }
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps): JSX.Element {
  const { label, className } = badgeLook(status)

  return (
    <span
      className={cn(
        'inline-flex w-fit items-center rounded-full px-3 py-1 font-body text-sm font-bold leading-normal',
        className
      )}
    >
      {label}
    </span>
  )
}
