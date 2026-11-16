import { useLayoutEffect, useRef, useState } from 'react'
import { useIsMutating } from '@tanstack/react-query'
import { AuthTabs } from '@/components/auth/AuthTabs'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { Modal } from '@/components/ui/Modal'
import { AUTH_TEXT } from '@/constants/auth'
import { LOGIN_MUTATION_KEY, REGISTER_MUTATION_KEY, useAuth } from '@/hooks/useAuth'
import { useAuthModal } from '@/hooks/useAuthModal'
import { useDropPendingActionOnClose } from '@/hooks/usePendingAction'
import type { AuthMode } from '@/hooks/useAuthModal'

const FIRST_FIELD_SELECTOR = 'input:not(:disabled)'

function useIsAuthPending(): boolean {
  const loginCount = useIsMutating({ mutationKey: LOGIN_MUTATION_KEY, exact: true })
  const registerCount = useIsMutating({ mutationKey: REGISTER_MUTATION_KEY, exact: true })
  return loginCount + registerCount > 0
}

export function AuthModal(): JSX.Element {
  const { mode, close, switchMode } = useAuthModal()
  const { isAuthenticated } = useAuth()
  const isAuthPending = useIsAuthPending()
  useDropPendingActionOnClose()

  const activeMode = mode ?? 'login'
  const isOpen = mode !== null && (!isAuthenticated || isAuthPending)
  const [wasOpen, setWasOpen] = useState(isOpen)
  const [switchedByTab, setSwitchedByTab] = useState(false)
  const switchedByTabRef = useRef(false)
  const panelContentRef = useRef<HTMLDivElement>(null)

  if (wasOpen !== isOpen) {
    setWasOpen(isOpen)
    if (!isOpen) setSwitchedByTab(false)
  }

  useLayoutEffect(() => {
    const byTab = switchedByTabRef.current
    switchedByTabRef.current = false
    if (!isOpen || byTab) return
    panelContentRef.current?.querySelector<HTMLElement>(FIRST_FIELD_SELECTOR)?.focus()
  }, [activeMode, isOpen])

  function selectTab(nextMode: AuthMode): void {
    setSwitchedByTab(true)
    switchedByTabRef.current = true
    switchMode(nextMode)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title={activeMode === 'login' ? AUTH_TEXT.logIn : AUTH_TEXT.signUp}
    >
      <AuthTabs activeMode={activeMode} onSelect={selectTab} disabled={isAuthPending}>
        <div ref={panelContentRef}>
          {activeMode === 'login' ? (
            <LoginForm isAuthPending={isAuthPending} autoFocusEmail={!switchedByTab} />
          ) : (
            <RegisterForm isAuthPending={isAuthPending} autoFocusName={!switchedByTab} />
          )}
        </div>
      </AuthTabs>
    </Modal>
  )
}
