import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { FORM_ERROR_TEXT } from '@/components/ui/formClasses'
import { DISABLED_CURSOR, FOCUS_RING, HOVER_OPACITY } from '@/components/ui/interactionClasses'
import { Input } from '@/components/ui/Input'
import { AUTH_TEXT } from '@/constants/auth'
import { authFormError } from '@/hooks/authFormError'
import { useLogin } from '@/hooks/useAuth'
import { useAuthModal } from '@/hooks/useAuthModal'
import { loginSchema } from '@/schemas/auth'
import { runPendingAction } from '@/stores/pendingActionStore'
import { cn } from '@/utils/cn'
import type { LoginFormValues } from '@/schemas/auth'

const EMPTY_LOGIN: LoginFormValues = { email: '', password: '' }

interface LoginFormProps {
  isLoginPending: boolean
  autoFocusEmail: boolean
}

export function LoginForm({ isLoginPending, autoFocusEmail }: LoginFormProps): JSX.Element {
  const login = useLogin()
  const { switchMode, closeAndRedirect } = useAuthModal()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: EMPTY_LOGIN,
  })
  const isBusy = login.isPending || isLoginPending
  const formError = login.isError ? authFormError(login.error) : null

  function submitLogin(values: LoginFormValues): void {
    if (isLoginPending || login.isPending) return
    login.mutate(values, {
      onSuccess: ({ user }) => {
        runPendingAction(user)
        closeAndRedirect()
      },
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
      <p className="flex flex-wrap items-center gap-2 font-heading text-lg leading-normal text-medium-dark">
        {AUTH_TEXT.noAccountPrompt}
        <button
          type="button"
          disabled={isBusy}
          onClick={() => switchMode('register')}
          className={cn(
            'font-bold text-primary disabled:opacity-50',
            FOCUS_RING,
            DISABLED_CURSOR,
            HOVER_OPACITY
          )}
        >
          {AUTH_TEXT.switchToSignUp}
        </button>
      </p>
    </div>
  )
}
