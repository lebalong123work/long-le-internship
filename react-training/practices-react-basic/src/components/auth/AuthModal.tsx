import { useAuthModal } from '@/hooks/useAuthModal'
import { useDropPendingActionOnClose } from '@/hooks/usePendingAction'

export function AuthModal(): JSX.Element | null {
  const { mode, close } = useAuthModal()
  useDropPendingActionOnClose()
  if (!mode) return null

  return (
    <div role="dialog" aria-modal="true" aria-label={mode === 'login' ? 'Log In' : 'Sign Up'}>
      <p>{mode === 'login' ? 'Log In' : 'Sign Up'} — placeholder</p>
      <button type="button" onClick={close}>
        Close
      </button>
    </div>
  )
}
