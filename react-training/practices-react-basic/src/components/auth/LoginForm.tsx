import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { AuthSwitchPrompt } from '@/components/auth/AuthSwitchPrompt'
import { Button } from '@/components/ui/Button'
import { FORM_ERROR_TEXT } from '@/components/ui/formClasses'
import { Input } from '@/components/ui/Input'
import { AUTH_TEXT } from '@/constants/auth'
import { authFormError } from '@/hooks/authFormError'
import { useLogin } from '@/hooks/useAuth'
import { useAuthModal } from '@/hooks/useAuthModal'
import { useSubmitLock } from '@/hooks/useSubmitLock'
import { loginSchema } from '@/schemas/auth'
import { runPendingAction } from '@/stores/pendingActionStore'
import type { LoginFormValues } from '@/schemas/auth'

const EMPTY_LOGIN: LoginFormValues = { email: '', password: '' }

interface LoginFormProps {
  isAuthPending: boolean
  autoFocusEmail: boolean
}

export function LoginForm({ isAuthPending, autoFocusEmail }: LoginFormProps): JSX.Element {
  const login = useLogin()
  const submitLock = useSubmitLock()
  const { switchMode, closeAndRedirect } = useAuthModal()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: EMPTY_LOGIN,
  })
  const isBusy = login.isPending || isAuthPending
  const formError = login.isError ? authFormError(login.error) : null

  function submitLogin(values: LoginFormValues): void {
    if (isAuthPending || !submitLock.acquire()) return
    login.mutate(values, {
      onSuccess: ({ user }) => {
        runPendingAction(user)
        closeAndRedirect()
      },
      onSettled: submitLock.release,
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <form noValidate onSubmit={handleSubmit(submitLogin)} className="flex flex-col gap-6">
        {formError && (
          <p role="alert" className={FORM_ERROR_TEXT}>
            {formError.message}
          </p>
        )}
        <Input
          {...register('email')}
          label={AUTH_TEXT.emailLabel}
          type="email"
          autoComplete="email"
          data-autofocus={autoFocusEmail || undefined}
          error={errors.email?.message}
        />
        <Input
          {...register('password')}
          label={AUTH_TEXT.passwordLabel}
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
        />
        <Button type="submit" isLoading={isBusy} className="w-full">
          {formError?.canRetry ? AUTH_TEXT.retry : AUTH_TEXT.logIn}
        </Button>
      </form>
      <AuthSwitchPrompt
        prompt={AUTH_TEXT.noAccountPrompt}
        actionLabel={AUTH_TEXT.switchToSignUp}
        onSwitch={() => switchMode('register')}
        disabled={isBusy}
      />
    </div>
  )
}
