import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/utils/cn'
import { ORDER_PAGE_LAYOUT } from './orderPageLayout'

export type OrderActionCount = 1 | 2

interface OrderPageSkeletonProps {
  hasIcon: boolean
  actionCount: OrderActionCount
}

export function OrderPageSkeleton({ hasIcon, actionCount }: OrderPageSkeletonProps): JSX.Element {
  return (
    <div className={ORDER_PAGE_LAYOUT.column}>
      <div className={ORDER_PAGE_LAYOUT.header}>
        {hasIcon && <Skeleton className={cn(ORDER_PAGE_LAYOUT.icon, 'rounded-full')} />}
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-6 w-48" />
      </div>
      <Skeleton className="h-[400px]" />
      <div className={ORDER_PAGE_LAYOUT.actions}>
        {Array.from({ length: actionCount }, (_, index) => (
          <Skeleton key={index} className={cn('h-12 md:w-[180px]', ORDER_PAGE_LAYOUT.action)} />
        ))}
      </div>
    </div>
  )
}
