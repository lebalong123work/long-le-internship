import { cn } from '@/utils/cn'

interface SpinnerProps {
  className?: string
}

export function Spinner({ className }: SpinnerProps): JSX.Element {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-block size-6 animate-spin rounded-full border-2 border-current border-t-transparent',
        className
      )}
    />
  )
}
