import { useEffect, useRef } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CHANGE_PASSWORD_TEXT } from '@/constants/profile'
import { getPasswordFieldError, useChangePassword } from '@/hooks/useProfile'
import { useSubmitLock } from '@/hooks/useSubmitLock'
import { changePasswordSchema } from '@/schemas/profile'
import { CHANGE_PASSWORD_LAYOUT, PROFILE_FORM_LAYOUT } from './profileFormClasses'
import type { PasswordFieldError } from '@/hooks/useProfile'
import type { ChangePasswordFormValues } from '@/schemas/profile'

const EMPTY_VALUES: ChangePasswordFormValues = {
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: '',
}

export function ChangePasswordForm(): JSX.Element {
  const submitLock = useSubmitLock()
  const fieldToFocus = useRef<PasswordFieldError['field'] | null>(null)
  const { mutate, isPending } = useChangePassword()
  const {
    register,
    handleSubmit,
    reset,
    setError,
    setFocus,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: EMPTY_VALUES,
  })

  useEffect(() => {
    if (isPending || !fieldToFocus.current) return
    setFocus(fieldToFocus.current)
    fieldToFocus.current = null
  }, [isPending, setFocus])

  function showFieldError(error: Error): void {
    const fieldError = getPasswordFieldError(error)
    if (fieldError) {
      setError(fieldError.field, { message: fieldError.message })
      fieldToFocus.current = fieldError.field
    }
  }

  function submit({ currentPassword, newPassword }: ChangePasswordFormValues): void {
    if (!submitLock.acquire()) return
    mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => reset(EMPTY_VALUES),
        onError: showFieldError,
        onSettled: () => submitLock.release(),
      }
    )
  }

  return (
    <form
      noValidate
      onSubmit={(event) => void handleSubmit(submit)(event)}
      className={CHANGE_PASSWORD_LAYOUT.form}
    >
      <fieldset disabled={isPending} className={PROFILE_FORM_LAYOUT.fields}>
        <Input
          label={CHANGE_PASSWORD_TEXT.currentLabel}
          type="password"
          autoComplete="current-password"
          error={errors.currentPassword?.message}
          {...register('currentPassword')}
        />
        <Input
          label={CHANGE_PASSWORD_TEXT.newLabel}
          type="password"
          autoComplete="new-password"
          error={errors.newPassword?.message}
          {...register('newPassword')}
        />
        <Input
          label={CHANGE_PASSWORD_TEXT.confirmLabel}
          type="password"
          autoComplete="new-password"
          error={errors.confirmNewPassword?.message}
          {...register('confirmNewPassword')}
        />
        <Button type="submit" isLoading={isPending} className={PROFILE_FORM_LAYOUT.submit}>
          {CHANGE_PASSWORD_TEXT.submit}
        </Button>
      </fieldset>
    </form>
  )
}
