import { DISABLED_CURSOR, FOCUS_RING, HOVER_OPACITY } from '@/components/ui/interactionClasses'
import { cn } from '@/utils/cn'

interface AuthSwitchPromptProps {
  prompt: string
  actionLabel: string
  onSwitch: () => void
  disabled: boolean
}

export function AuthSwitchPrompt({
  prompt,
  actionLabel,
  onSwitch,
  disabled,
}: AuthSwitchPromptProps): JSX.Element {
  return (
    <p className="flex flex-wrap items-center gap-2 font-heading text-lg leading-normal text-medium-dark">
      {prompt}
      <button
        type="button"
        disabled={disabled}
        onClick={onSwitch}
        className={cn(
          'font-bold text-primary disabled:opacity-50',
          FOCUS_RING,
          DISABLED_CURSOR,
          HOVER_OPACITY
        )}
      >
        {actionLabel}
      </button>
    </p>
  )
}
