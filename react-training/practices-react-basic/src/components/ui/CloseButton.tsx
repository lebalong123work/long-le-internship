import { FOCUS_RING, HOVER_OPACITY } from '@/components/ui/interactionClasses'
import { cn } from '@/utils/cn'

const CLOSE_ICON = '/icons/close.svg'

interface CloseButtonProps {
  label: string
  onClick: () => void
}

export function CloseButton({ label, onClick }: CloseButtonProps): JSX.Element {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        'inline-flex size-10 shrink-0 items-center justify-center',
        FOCUS_RING,
        HOVER_OPACITY
      )}
    >
      <img src={CLOSE_ICON} alt="" className="size-6" />
    </button>
  )
}
