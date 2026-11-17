import { Tabs } from '@/components/ui/Tabs'
import { AUTH_TEXT } from '@/constants/auth'
import type { TabItem } from '@/components/ui/Tabs'
import type { AuthMode } from '@/hooks/useAuthModal'
import type { ReactNode } from 'react'

const AUTH_TAB_ITEMS: readonly TabItem<AuthMode>[] = [
  { id: 'login', label: AUTH_TEXT.logIn },
  { id: 'register', label: AUTH_TEXT.signUp },
]

interface AuthTabsProps {
  activeMode: AuthMode
  onSelect: (mode: AuthMode) => void
  disabled?: boolean
  children: ReactNode
}

export function AuthTabs({
  activeMode,
  onSelect,
  disabled = false,
  children,
}: AuthTabsProps): JSX.Element {
  return (
    <Tabs
      items={AUTH_TAB_ITEMS}
      activeId={activeMode}
      onSelect={onSelect}
      label={AUTH_TEXT.tabsLabel}
      disabled={disabled}
      className="flex flex-col gap-6"
      listClassName="gap-10"
    >
      {children}
    </Tabs>
  )
}
