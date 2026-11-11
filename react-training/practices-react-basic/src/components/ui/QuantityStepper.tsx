import { DISABLED_CURSOR, FOCUS_RING, HOVER_OPACITY } from '@/components/ui/interactionClasses'
import { cn } from '@/utils/cn'

const MIN_QUANTITY = 1

const MINUS_ICON = '/icons/minus.svg'
const MINUS_DISABLED_ICON = '/icons/minus-disabled.svg'
const PLUS_ICON = '/icons/plus.svg'

const STEP_BUTTON_CLASS = cn(
  'flex size-12 shrink-0 items-center justify-center',
  FOCUS_RING,
  HOVER_OPACITY,
  DISABLED_CURSOR
)

interface QuantityStepperProps {
  value: number
  onChange: (next: number) => void
  productName: string
  max?: number
  bordered?: boolean
}

function isOutOfStock(max: number | undefined): boolean {
  return max !== undefined && max <= 0
}

function hasReachedMax(value: number, max: number | undefined): boolean {
  return max !== undefined && value >= max
}

export function QuantityStepper({
  value,
  onChange,
  productName,
  max,
  bordered = false,
}: QuantityStepperProps): JSX.Element {
  const isMinusDisabled = value <= MIN_QUANTITY || isOutOfStock(max)
  const isPlusDisabled = hasReachedMax(value, max)

  return (
    <div
      role="group"
      aria-label={`Quantity of ${productName}`}
      className={cn(
        'inline-flex h-12 w-[142px] items-center bg-white',
        bordered && 'border border-medium'
      )}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={isMinusDisabled}
        onClick={() => onChange(value - 1)}
        className={STEP_BUTTON_CLASS}
      >
        <img src={isMinusDisabled ? MINUS_DISABLED_ICON : MINUS_ICON} alt="" className="size-6" />
      </button>
      <span
        aria-live="polite"
        aria-atomic="true"
        className="flex-1 text-center font-heading text-lg font-bold leading-normal text-dark"
      >
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={isPlusDisabled}
        onClick={() => onChange(value + 1)}
        className={cn(STEP_BUTTON_CLASS, 'disabled:opacity-50')}
      >
        <img src={PLUS_ICON} alt="" className="size-6" />
      </button>
    </div>
  )
}
