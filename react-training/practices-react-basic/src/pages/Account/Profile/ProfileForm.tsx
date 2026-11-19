import { useEffect, useId, useRef } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PROFILE_TEXT } from '@/constants/profile'
import { useUpdateProfile } from '@/hooks/useProfile'
import { useSubmitLock } from '@/hooks/useSubmitLock'
import { VALIDATION_MESSAGES } from '@/schemas/common'
import { profileSchema } from '@/schemas/profile'
import { AvatarField } from './AvatarField'
import { avatarFileError, readFileAsDataUrl } from './avatarFile'
import { PROFILE_FORM_LAYOUT } from './profileFormClasses'
import { toProfileFormValues, toUpdateProfileDto } from './profileFormValues'
import type { ProfileFormValues } from '@/schemas/profile'
import type { User } from '@/types'

interface ProfileFormProps {
  profile: User
}

export function ProfileForm({ profile }: ProfileFormProps): JSX.Element {
  const emailHintId = useId()
  const latestPick = useRef(0)
  const isMounted = useRef(true)
  const submitLock = useSubmitLock()
  const { mutate, isPending } = useUpdateProfile()
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    clearErrors,
    control,
    formState: { errors, dirtyFields },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: toProfileFormValues(profile),
  })
  const avatar = useWatch({ control, name: 'avatar' })

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  function isLatestPick(pick: number): boolean {
    return isMounted.current && pick === latestPick.current
  }

  async function selectAvatar(file: File): Promise<void> {
    latestPick.current += 1
    const pick = latestPick.current
    const fileError = avatarFileError(file)
    if (fileError) {
      setError('avatar', { message: fileError })
      return
    }
    try {
      const dataUrl = await readFileAsDataUrl(file)
      if (!isLatestPick(pick)) return
      setValue('avatar', dataUrl, { shouldDirty: true })
      clearErrors('avatar')
    } catch {
      if (isLatestPick(pick)) setError('avatar', { message: VALIDATION_MESSAGES.avatarReadFailed })
    }
  }

  function save(values: ProfileFormValues): void {
    if (!submitLock.acquire()) return
    mutate(toUpdateProfileDto(values, Boolean(dirtyFields.avatar)), {
      onSuccess: (saved) => reset(toProfileFormValues(saved)),
      onSettled: () => submitLock.release(),
    })
  }

  return (
    <form noValidate onSubmit={handleSubmit(save)}>
      <fieldset disabled={isPending} className={PROFILE_FORM_LAYOUT.columns}>
        <AvatarField
          src={avatar ?? ''}
          error={errors.avatar?.message}
          disabled={isPending}
          onFileSelect={(file) => void selectAvatar(file)}
        />
        <div className={PROFILE_FORM_LAYOUT.fields}>
          <Input
            label={PROFILE_TEXT.nameLabel}
            autoComplete="name"
            error={errors.name?.message}
            {...register('name')}
          />
          <div className="flex flex-col gap-2">
            <Input
              label={PROFILE_TEXT.emailLabel}
              type="email"
              value={profile.email}
              readOnly
              aria-describedby={emailHintId}
              className="bg-light"
            />
            <p id={emailHintId} className="font-body text-sm leading-normal text-medium-dark">
              {PROFILE_TEXT.emailHint}
            </p>
          </div>
          <Input
            label={PROFILE_TEXT.phoneLabel}
            type="tel"
            autoComplete="tel"
            error={errors.phone?.message}
            {...register('phone')}
          />
          <Input
            label={PROFILE_TEXT.addressLabel}
            autoComplete="street-address"
            error={errors.address?.message}
            {...register('address')}
          />
          <Input
            label={PROFILE_TEXT.birthDateLabel}
            type="date"
            autoComplete="bday"
            error={errors.birthDate?.message}
            {...register('birthDate')}
          />
          <Button type="submit" isLoading={isPending} className={PROFILE_FORM_LAYOUT.submit}>
            {PROFILE_TEXT.save}
          </Button>
        </div>
      </fieldset>
    </form>
  )
}
