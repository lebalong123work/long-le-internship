import { FOCUS_RING_ON_PHOTO, HOVER_OPACITY } from '@/components/ui/interactionClasses'
import { cn } from '@/utils/cn'

type ArrowDirection = 'previous' | 'next'

interface CarouselArrowButtonProps {
  label: string
  direction: ArrowDirection
  controlsId: string
  onClick: () => void
  className?: string
}

const CHEVRON_SIZE = 18

const ARROW_ICONS: Record<ArrowDirection, string> = {
  previous: '/icons/chevron-left.svg',
  next: '/icons/chevron-right.svg',
}

const ARROW_CLASSES = {
  button:
    'absolute top-1/2 z-10 flex size-6 -translate-y-1/2 items-center justify-center bg-primary',
  chevron: 'size-[18px]',
}

export function CarouselArrowButton({
  label,
  direction,
  controlsId,
  onClick,
  className,
}: CarouselArrowButtonProps): JSX.Element {
  return (
    <button
      type="button"
      aria-label={label}
      aria-controls={controlsId}
      onClick={onClick}
      className={cn(ARROW_CLASSES.button, FOCUS_RING_ON_PHOTO, HOVER_OPACITY, className)}
    >
      <img
        src={ARROW_ICONS[direction]}
        alt=""
        width={CHEVRON_SIZE}
        height={CHEVRON_SIZE}
        className={ARROW_CLASSES.chevron}
      />
    </button>
  )
}
