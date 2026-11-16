import { useId, useRef } from 'react'
import { DISABLED_CURSOR, FOCUS_RING } from '@/components/ui/interactionClasses'
import { AUTH_TEXT } from '@/constants/auth'
import { cn } from '@/utils/cn'
import type { AuthMode } from '@/hooks/useAuthModal'
import type { KeyboardEvent, ReactNode } from 'react'

const TAB_ORDER: readonly AuthMode[] = ['login', 'register']

const TAB_LABELS: Record<AuthMode, string> = {
  login: AUTH_TEXT.logIn,
  register: AUTH_TEXT.signUp,
}

const TAB_CLASSES = {
  base: [
    'relative font-heading text-lg leading-normal disabled:opacity-50',
    'after:absolute after:-inset-x-[3px] after:-bottom-1.5 after:h-0.5 after:rounded-sm',
    FOCUS_RING,
    DISABLED_CURSOR,
  ],
  active: 'font-bold text-primary after:bg-primary',
  idle: 'font-normal text-medium-dark can-hover:enabled:hover:text-primary',
} as const

interface AuthTabsProps {
  activeMode: AuthMode
  onSelect: (mode: AuthMode) => void
  disabled?: boolean
  children: ReactNode
}

function tabForKey(current: AuthMode, key: string): AuthMode | null {
  const index = TAB_ORDER.indexOf(current)
  const last = TAB_ORDER.length - 1
  switch (key) {
    case 'ArrowRight':
      return TAB_ORDER[index === last ? 0 : index + 1] ?? null
    case 'ArrowLeft':
      return TAB_ORDER[index === 0 ? last : index - 1] ?? null
    case 'Home':
      return TAB_ORDER[0] ?? null
    case 'End':
      return TAB_ORDER[last] ?? null
    default:
      return null
  }
}

export function AuthTabs({
  activeMode,
  onSelect,
  disabled = false,
  children,
}: AuthTabsProps): JSX.Element {
  const baseId = useId()
  const panelId = `${baseId}-panel`
  const tabId = (mode: AuthMode): string => `${baseId}-tab-${mode}`
  const tabRefs = useRef(new Map<AuthMode, HTMLButtonElement>())

  function select(mode: AuthMode): void {
    if (mode !== activeMode) onSelect(mode)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    const target = tabForKey(activeMode, event.key)
    if (!target) return
    event.preventDefault()
    select(target)
    tabRefs.current.get(target)?.focus()
  }

  return (
    <div className="flex flex-col gap-6">
      <div
        role="tablist"
        aria-label={AUTH_TEXT.tabsLabel}
        onKeyDown={handleKeyDown}
        className="flex gap-10"
      >
        {TAB_ORDER.map((mode) => {
          const isActive = mode === activeMode
          return (
            <button
              key={mode}
              ref={(element) => {
                if (element) tabRefs.current.set(mode, element)
                else tabRefs.current.delete(mode)
              }}
              type="button"
              role="tab"
              id={tabId(mode)}
              aria-selected={isActive}
              aria-controls={panelId}
              tabIndex={isActive ? 0 : -1}
              disabled={disabled}
              onClick={() => select(mode)}
              className={cn(TAB_CLASSES.base, isActive ? TAB_CLASSES.active : TAB_CLASSES.idle)}
            >
              {TAB_LABELS[mode]}
            </button>
          )
        })}
      </div>
      <div role="tabpanel" id={panelId} aria-labelledby={tabId(activeMode)}>
        {children}
      </div>
    </div>
  )
}
