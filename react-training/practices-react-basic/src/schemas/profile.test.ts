import { VALIDATION_MESSAGES } from './common'
import { changePasswordSchema, profileSchema } from './profile'

function profileErrors(
  result: ReturnType<typeof profileSchema.safeParse>
): Record<string, string[] | undefined> {
  return result.success ? {} : result.error.flatten().fieldErrors
}

function passwordErrors(
  result: ReturnType<typeof changePasswordSchema.safeParse>
): Record<string, string[] | undefined> {
  return result.success ? {} : result.error.flatten().fieldErrors
}

const fullProfile = {
  name: 'Long Le',
  phone: '+84901234567',
  address: '1 Le Loi, Quận 1',
  birthDate: '2000-01-31',
  avatar: 'data:image/png;base64,AAAA',
}

const validPassword = {
  currentPassword: 'user123',
  newPassword: 'newpass1',
  confirmNewPassword: 'newpass1',
}

describe('profileSchema', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 10, 5, 12))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('accepts a full profile', () => {
    expect(profileSchema.safeParse(fullProfile).success).toBe(true)
  })

  it('accepts only a name', () => {
    expect(profileSchema.safeParse({ name: 'Long Le' }).success).toBe(true)
  })

  it('requires the name', () => {
    const errors = profileErrors(profileSchema.safeParse({ ...fullProfile, name: '  ' }))
    expect(errors.name?.[0]).toBe(VALIDATION_MESSAGES.nameRequired)
  })

  it('accepts an empty phone', () => {
    expect(profileSchema.safeParse({ ...fullProfile, phone: '' }).success).toBe(true)
  })

  it('rejects a filled phone that is not a Vietnamese number', () => {
    const errors = profileErrors(profileSchema.safeParse({ ...fullProfile, phone: '12345' }))
    expect(errors.phone?.[0]).toBe(VALIDATION_MESSAGES.phoneInvalid)
  })

  it('accepts an empty date of birth and today', () => {
    expect(profileSchema.safeParse({ ...fullProfile, birthDate: '' }).success).toBe(true)
    expect(profileSchema.safeParse({ ...fullProfile, birthDate: '2026-11-05' }).success).toBe(true)
  })

  it('rejects a date of birth in the future', () => {
    const errors = profileErrors(
      profileSchema.safeParse({ ...fullProfile, birthDate: '2026-11-06' })
    )
    expect(errors.birthDate?.[0]).toBe(VALIDATION_MESSAGES.birthDateFuture)
  })

  it.each(['2000-02-30', '31/01/2000', '2000-1-5'])(
    'rejects the invalid date of birth %s',
    (birthDate) => {
      const errors = profileErrors(profileSchema.safeParse({ ...fullProfile, birthDate }))
      expect(errors.birthDate?.[0]).toBe(VALIDATION_MESSAGES.birthDateInvalid)
    }
  )
})

describe('changePasswordSchema', () => {
  it('accepts valid values', () => {
    expect(changePasswordSchema.safeParse(validPassword).success).toBe(true)
  })

  it('requires the current password', () => {
    const errors = passwordErrors(
      changePasswordSchema.safeParse({ ...validPassword, currentPassword: '' })
    )
    expect(errors.currentPassword?.[0]).toBe(VALIDATION_MESSAGES.currentPasswordRequired)
  })

  it('rejects a new password shorter than 6 characters', () => {
    const errors = passwordErrors(
      changePasswordSchema.safeParse({
        ...validPassword,
        newPassword: 'abc',
        confirmNewPassword: 'abc',
      })
    )
    expect(errors.newPassword?.[0]).toBe(VALIDATION_MESSAGES.passwordMin)
  })

  it('puts the mismatch error on confirmNewPassword', () => {
    const errors = passwordErrors(
      changePasswordSchema.safeParse({ ...validPassword, confirmNewPassword: 'other12' })
    )
    expect(errors.confirmNewPassword?.[0]).toBe(VALIDATION_MESSAGES.confirmPasswordMismatch)
  })
})
