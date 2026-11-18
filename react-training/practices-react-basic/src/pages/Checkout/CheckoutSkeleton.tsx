import { SIDEBAR_LAYOUT } from '@/components/shared/pageLayout'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/utils/cn'

const SKELETON_FIELDS = [0, 1, 2, 3, 4]

export function CheckoutSkeleton(): JSX.Element {
  return (
    <div className={SIDEBAR_LAYOUT.columns}>
      <div className={cn(SIDEBAR_LAYOUT.main, 'gap-6')}>
        {SKELETON_FIELDS.map((field) => (
          <Skeleton key={field} className="h-20" />
        ))}
      </div>
      <Skeleton className={cn('h-[245px]', SIDEBAR_LAYOUT.aside)} />
    </div>
  )
}
