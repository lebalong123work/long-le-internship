import { loginSchema, registerSchema } from './auth'
import { VALIDATION_MESSAGES } from './common'

function fieldErrors(
  result: ReturnType<typeof loginSchema.safeParse>
): Record<string, string[] | undefined> {
  return result.success ? {} : result.error.flatten().fieldErrors
}

function registerErrors(
  result: ReturnType<typeof registerSchema.safeParse>
): Record<string, string[] | undefined> {
  return result.success ? {} : result.error.flatten().fieldErrors
}

const validLogin = { email: 'user@store.com', password: 'user123' }
const validRegister = {
  name: 'Long Le',
  email: 'new@store.com',
  password: 'secret1',
  confirmPassword: 'secret1',
}

describe('loginSchema', () => {
  it('accepts a valid email and password', () => {
    expect(loginSchema.safeParse(validLogin).success).toBe(true)
  })

  it('trims the email', () => {
    const result = loginSchema.safeParse({ ...validLogin, email: '  user@store.com ' })
    expect(result.success && result.data.email).toBe('user@store.com')
  })

  it('requires the email', () => {
    const errors = fieldErrors(loginSchema.safeParse({ ...validLogin, email: '   ' }))
    expect(errors.email?.[0]).toBe(VALIDATION_MESSAGES.emailRequired)
  })

  it('rejects an invalid email', () => {
    const errors = fieldErrors(loginSchema.safeParse({ ...validLogin, email: 'user@' }))
    expect(errors.email?.[0]).toBe(VALIDATION_MESSAGES.emailInvalid)
  })

  it('requires the password', () => {
    const errors = fieldErrors(loginSchema.safeParse({ ...validLogin, password: '' }))
    expect(errors.password?.[0]).toBe(VALIDATION_MESSAGES.passwordRequired)
  })

  it('rejects a password shorter than 6 characters', () => {
    const errors = fieldErrors(loginSchema.safeParse({ ...validLogin, password: '12345' }))
    expect(errors.password?.[0]).toBe(VALIDATION_MESSAGES.passwordMin)
  })
})

describe('registerSchema', () => {
  it('accepts valid values', () => {
    expect(registerSchema.safeParse(validRegister).success).toBe(true)
  })

  it('requires the full name (whitespace only is empty)', () => {
    const errors = registerErrors(registerSchema.safeParse({ ...validRegister, name: '   ' }))
    expect(errors.name?.[0]).toBe(VALIDATION_MESSAGES.nameRequired)
  })

  it('rejects an invalid email', () => {
    const errors = registerErrors(
      registerSchema.safeParse({ ...validRegister, email: 'new.store.com' })
    )
    expect(errors.email?.[0]).toBe(VALIDATION_MESSAGES.emailInvalid)
  })

  it('rejects a password shorter than 6 characters', () => {
    const errors = registerErrors(
      registerSchema.safeParse({ ...validRegister, password: '123', confirmPassword: '123' })
    )
    expect(errors.password?.[0]).toBe(VALIDATION_MESSAGES.passwordMin)
  })

  it('puts the mismatch error on confirmPassword', () => {
    const errors = registerErrors(
      registerSchema.safeParse({ ...validRegister, confirmPassword: 'secret2' })
    )
    expect(errors.confirmPassword?.[0]).toBe(VALIDATION_MESSAGES.confirmPasswordMismatch)
    expect(errors.password).toBeUndefined()
  })
})
