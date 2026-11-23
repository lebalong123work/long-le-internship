import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/utils/cn'
import { ORDER_PAGE_LAYOUT } from './orderPageLayout'

export function OrderPageSkeleton(): JSX.Element {
  return (
    <div className={ORDER_PAGE_LAYOUT.column}>
      <div className={ORDER_PAGE_LAYOUT.header}>
        <Skeleton className={cn(ORDER_PAGE_LAYOUT.icon, 'rounded-full')} />
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-6 w-48" />
      </div>
      <Skeleton className="h-[400px]" />
      <div className={ORDER_PAGE_LAYOUT.actions}>
        <Skeleton className={cn('h-12 md:w-[180px]', ORDER_PAGE_LAYOUT.action)} />
        <Skeleton className={cn('h-12 md:w-[180px]', ORDER_PAGE_LAYOUT.action)} />
      </div>
    </div>
  )
}
