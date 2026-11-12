import { STATE_LAYOUT, STATE_MESSAGE } from '@/components/shared/stateClasses'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { UI_STATE_ERRORS } from '@/constants/uiStateMessages'
import { cn } from '@/utils/cn'

interface EmptyStateAction {
  label: string
  to: string
}

interface EmptyStateProps {
  iconSrc: string
  message: string
  action?: EmptyStateAction
  className?: string
}

function isBlank(text: string): boolean {
  return text.trim() === ''
}

function assertValidProps({ iconSrc, message, action }: EmptyStateProps): void {
  if (isBlank(message)) throw new Error(UI_STATE_ERRORS.emptyMessage)
  if (isBlank(iconSrc)) throw new Error(UI_STATE_ERRORS.emptyIconSrc)
  if (action && (isBlank(action.label) || isBlank(action.to))) {
    throw new Error(UI_STATE_ERRORS.emptyAction)
  }
}

export function EmptyState(props: EmptyStateProps): JSX.Element {
  assertValidProps(props)
  const { iconSrc, message, action, className } = props

  return (
    <div className={cn(STATE_LAYOUT, className)}>
      <img src={iconSrc} alt="" className="size-16" />
      <p className={STATE_MESSAGE}>{message}</p>
      {action && <ButtonLink to={action.to}>{action.label}</ButtonLink>}
    </div>
  )
}
