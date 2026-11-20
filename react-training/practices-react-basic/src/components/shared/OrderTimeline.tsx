import { ORDER_TIMELINE_STEPS } from '@/constants/orderStatus'
import { ORDER_HISTORY_TEXT } from '@/constants/order'
import { cn } from '@/utils/cn'

interface OrderTimelineProps {
  status: string
}

export function OrderTimeline({ status }: OrderTimelineProps): JSX.Element | null {
  const currentIndex = ORDER_TIMELINE_STEPS.findIndex((step) => step.status === status)
  if (currentIndex === -1) return null

  return (
    <ol
      aria-label={ORDER_HISTORY_TEXT.timelineLabel}
      className="flex flex-col gap-2 md:flex-row md:flex-wrap md:gap-6"
    >
      {ORDER_TIMELINE_STEPS.map((step, index) => {
        const isReached = index <= currentIndex
        const isCurrent = index === currentIndex

        return (
          <li
            key={step.status}
            aria-current={isCurrent ? 'step' : undefined}
            className={cn(
              'flex items-center gap-2 font-body text-sm leading-normal',
              isReached ? 'text-dark' : 'text-medium-dark',
              isCurrent && 'font-bold'
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                'size-3 shrink-0 rounded-full',
                isReached ? 'bg-primary' : 'bg-light-medium'
              )}
            />
            {step.label}
          </li>
        )
      })}
    </ol>
  )
}
