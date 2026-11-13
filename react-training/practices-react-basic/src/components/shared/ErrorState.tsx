import { STATE_LAYOUT, STATE_MESSAGE } from '@/components/shared/stateClasses'
import { Button } from '@/components/ui/Button'
import { ARIA_DISABLED } from '@/components/ui/interactionClasses'
import { Spinner } from '@/components/ui/Spinner'
import { UI_STATE_MESSAGES } from '@/constants/uiStateMessages'
import { cn } from '@/utils/cn'

interface ErrorStateProps {
  onRetry: () => void
  message?: string
  isRetrying?: boolean
  className?: string
}

function resolveMessage(message: string | undefined): string {
  return message?.trim() ? message : UI_STATE_MESSAGES.errorDefault
}

export function ErrorState({
  onRetry,
  message,
  isRetrying = false,
  className,
}: ErrorStateProps): JSX.Element {
  function handleRetry(): void {
    if (isRetrying) return
    onRetry()
  }

  return (
    <div className={cn(STATE_LAYOUT, className)}>
      <p role="alert" className={STATE_MESSAGE}>
        {resolveMessage(message)}
      </p>
      <Button
        onClick={handleRetry}
        aria-busy={isRetrying ? true : undefined}
        aria-disabled={isRetrying ? true : undefined}
        className={ARIA_DISABLED}
      >
        {isRetrying && <Spinner />}
        {UI_STATE_MESSAGES.retry}
      </Button>
    </div>
  )
}
