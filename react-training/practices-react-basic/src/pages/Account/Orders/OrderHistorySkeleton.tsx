import { Skeleton } from '@/components/ui/Skeleton'
import { ORDER_CARD_CLASSES } from './orderHistoryClasses'

const SKELETON_CARD_COUNT = 3

export function OrderHistorySkeleton(): JSX.Element {
  return (
    <div className="flex flex-col gap-6">
      {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
        <div key={index} className={ORDER_CARD_CLASSES}>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-full max-w-md" />
          <Skeleton className="h-12 w-full md:w-48" />
        </div>
      ))}
    </div>
  )
}
