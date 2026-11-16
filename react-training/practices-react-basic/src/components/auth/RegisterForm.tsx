import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { AuthSwitchPrompt } from '@/components/auth/AuthSwitchPrompt'
import { Button } from '@/components/ui/Button'
import { FORM_ERROR_TEXT } from '@/components/ui/formClasses'
import { Input } from '@/components/ui/Input'
import { AUTH_TEXT } from '@/constants/auth'
import { registerFormError } from '@/hooks/authFormError'
import { useRegister } from '@/hooks/useAuth'
import { useAuthModal } from '@/hooks/useAuthModal'
import { useSubmitLock } from '@/hooks/useSubmitLock'
import { registerSchema } from '@/schemas/auth'
import { runPendingAction } from '@/stores/pendingActionStore'
import type { RegisterFormValues } from '@/schemas/auth'
import type { RegisterCredentials } from '@/types'

const EMPTY_REGISTER: RegisterFormValues = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
}

interface RegisterFormProps {
  isAuthPending: boolean
  autoFocusName: boolean
}

function toRegisterCredentials({ name, email, password }: RegisterFormValues): RegisterCredentials {
  return { name, email, password }
}

export function RegisterForm({ isAuthPending, autoFocusName }: RegisterFormProps): JSX.Element {
  const signUp = useRegister()
  const submitLock = useSubmitLock()
  const { switchMode, closeAndRedirect } = useAuthModal()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: EMPTY_REGISTER,
  })
  const isBusy = signUp.isPending || isAuthPending
  const formError = signUp.isError ? registerFormError(signUp.error) : null

  function submitRegister(values: RegisterFormValues): void {
    if (isAuthPending || !submitLock.acquire()) return
    signUp.mutate(toRegisterCredentials(values), {
      onSuccess: ({ user }) => {
        runPendingAction(user)
        closeAndRedirect()
      },
      onSettled: submitLock.release,
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <form noValidate onSubmit={handleSubmit(submitRegister)} className="flex flex-col gap-6">
        {formError && (
          <p role="alert" className={FORM_ERROR_TEXT}>
            {formError.message}
          </p>
        )}
        <Input
          {...register('name')}
          label={AUTH_TEXT.nameLabel}
          autoComplete="name"
          data-autofocus={autoFocusName || undefined}
          error={errors.name?.message}
        />
        <Input
          {...register('email')}
          label={AUTH_TEXT.emailLabel}
          type="email"
          autoComplete="email"
          error={errors.email?.message}
        />
        <Input
          {...register('password', { deps: 'confirmPassword' })}
          label={AUTH_TEXT.passwordLabel}
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
        />
        <Input
          {...register('confirmPassword')}
          label={AUTH_TEXT.confirmPasswordLabel}
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
        />
        <Button type="submit" isLoading={isBusy} className="w-full">
          {formError?.canRetry ? AUTH_TEXT.retry : AUTH_TEXT.signUp}
        </Button>
      </form>
      <AuthSwitchPrompt
        prompt={AUTH_TEXT.haveAccountPrompt}
        actionLabel={AUTH_TEXT.switchToLogIn}
        onSwitch={() => switchMode('login')}
        disabled={isBusy}
      />
    </div>
  )
}
