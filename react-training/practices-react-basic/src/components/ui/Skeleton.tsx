import { cn } from '@/utils/cn'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps): JSX.Element {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse bg-light-medium motion-reduce:animate-none', className)}
    />
  )
}
