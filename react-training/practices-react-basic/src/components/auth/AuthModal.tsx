import { useState } from 'react'
import { useIsMutating } from '@tanstack/react-query'
import { AuthTabs } from '@/components/auth/AuthTabs'
import { LoginForm } from '@/components/auth/LoginForm'
import { Modal } from '@/components/ui/Modal'
import { AUTH_TEXT } from '@/constants/auth'
import { LOGIN_MUTATION_KEY, useAuth } from '@/hooks/useAuth'
import { useAuthModal } from '@/hooks/useAuthModal'
import { useDropPendingActionOnClose } from '@/hooks/usePendingAction'
import type { AuthMode } from '@/hooks/useAuthModal'

function RegisterPanelPlaceholder(): JSX.Element {
  return <p>{AUTH_TEXT.signUpPlaceholder}</p>
}

export function AuthModal(): JSX.Element {
  const { mode, close, switchMode } = useAuthModal()
  const { isAuthenticated } = useAuth()
  const isLoggingIn = useIsMutating({ mutationKey: LOGIN_MUTATION_KEY, exact: true }) > 0
  useDropPendingActionOnClose()

  const activeMode = mode ?? 'login'
  const isOpen = mode !== null && (!isAuthenticated || isLoggingIn)
  const [wasOpen, setWasOpen] = useState(isOpen)
  const [switchedByTab, setSwitchedByTab] = useState(false)

  if (wasOpen !== isOpen) {
    setWasOpen(isOpen)
    if (!isOpen) setSwitchedByTab(false)
  }

  function selectTab(nextMode: AuthMode): void {
    setSwitchedByTab(true)
    switchMode(nextMode)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title={activeMode === 'login' ? AUTH_TEXT.logIn : AUTH_TEXT.signUp}
    >
      <AuthTabs activeMode={activeMode} onSelect={selectTab} disabled={isLoggingIn}>
        {activeMode === 'login' ? (
          <LoginForm isLoginPending={isLoggingIn} autoFocusEmail={!switchedByTab} />
        ) : (
          <RegisterPanelPlaceholder />
        )}
      </AuthTabs>
    </Modal>
  )
}
