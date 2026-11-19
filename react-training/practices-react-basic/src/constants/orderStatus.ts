// Order statuses from docs/requirements/features/order.md
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS]

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [ORDER_STATUS.PENDING]: 'Pending',
  [ORDER_STATUS.PROCESSING]: 'Processing',
  [ORDER_STATUS.SHIPPED]: 'Shipped',
  [ORDER_STATUS.DELIVERED]: 'Delivered',
  [ORDER_STATUS.CANCELLED]: 'Cancelled',
}

export const ORDER_STATUS_BADGE_CLASSES: Record<OrderStatus, string> = {
  [ORDER_STATUS.PENDING]: 'bg-[#FEF3C7] text-[#92400E]',
  [ORDER_STATUS.PROCESSING]: 'bg-[#DBEAFE] text-[#1E40AF]',
  [ORDER_STATUS.SHIPPED]: 'bg-[#FFEDD5] text-[#9A3412]',
  [ORDER_STATUS.DELIVERED]: 'bg-[#DCFCE7] text-[#166534]',
  [ORDER_STATUS.CANCELLED]: 'bg-[#FEE2E2] text-[#991B1B]',
}

export const ORDER_STATUS_NEUTRAL_BADGE_CLASS = 'bg-light-medium text-dark'

export interface OrderTimelineStep {
  status: OrderStatus
  label: string
}

export const ORDER_TIMELINE_STEPS: readonly OrderTimelineStep[] = [
  { status: ORDER_STATUS.PENDING, label: 'Ordered' },
  { status: ORDER_STATUS.PROCESSING, label: ORDER_STATUS_LABELS[ORDER_STATUS.PROCESSING] },
  { status: ORDER_STATUS.SHIPPED, label: ORDER_STATUS_LABELS[ORDER_STATUS.SHIPPED] },
  { status: ORDER_STATUS.DELIVERED, label: ORDER_STATUS_LABELS[ORDER_STATUS.DELIVERED] },
]

export function isOrderStatus(value: string): value is OrderStatus {
  return Object.prototype.hasOwnProperty.call(ORDER_STATUS_LABELS, value)
}
