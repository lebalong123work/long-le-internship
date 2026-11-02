import { useAuthModal } from '@/hooks/useAuthModal'

// Placeholder — the real modal (tabs, forms, pending action) is built in the Auth task.
export function AuthModal(): JSX.Element | null {
  const { mode, close } = useAuthModal()
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
