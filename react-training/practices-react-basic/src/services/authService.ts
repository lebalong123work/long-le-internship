import { apiClient, ApiError } from './apiClient'
import type { AuthResponse, LoginCredentials, RegisterCredentials, User } from '@/types'

export const AUTH_ERRORS = {
  emailNotFound: 'No account with this email',
  wrongPassword: 'Incorrect password',
  emailExists: 'Email already exists',
} as const

interface UserRecord extends User {
  password: string
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function toUser(record: UserRecord): User {
  const user: Omit<UserRecord, 'password'> & { password?: string } = { ...record }
  delete user.password
  return user
}

function toAuthResponse(record: UserRecord): AuthResponse {
  return { user: toUser(record), token: `mock-token-${record.id}` }
}

async function findByEmail(email: string): Promise<UserRecord | undefined> {
  const users = await apiClient.get<UserRecord[]>('/users', { 'email:eq': email })
  return users[0]
}

export async function login({ email, password }: LoginCredentials): Promise<AuthResponse> {
  const record = await findByEmail(normalizeEmail(email))
  if (!record) throw new ApiError(404, AUTH_ERRORS.emailNotFound)
  if (record.password !== password) throw new ApiError(401, AUTH_ERRORS.wrongPassword)
  return toAuthResponse(record)
}

export async function register({
  name,
  email,
  password,
}: RegisterCredentials): Promise<AuthResponse> {
  const normalizedEmail = normalizeEmail(email)
  if (await findByEmail(normalizedEmail)) throw new ApiError(409, AUTH_ERRORS.emailExists)

  const created = await apiClient.post<UserRecord>('/users', {
    name,
    email: normalizedEmail,
    password,
    role: 'customer',
  })
  return toAuthResponse(created)
}
