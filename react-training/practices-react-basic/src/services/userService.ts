import { apiClient, ApiError, isNotFoundError } from './apiClient'
import { toUser } from './userRecord'
import type { ChangePasswordDto, UpdateProfileDto, User } from '@/types'
import type { UserRecord } from './userRecord'

export const USER_ERRORS = {
  notFound: 'User not found',
  wrongCurrentPassword: 'Current password is incorrect',
  samePassword: 'New password must be different from the current password',
} as const

function userPath(userId: string): string {
  return `/users/${encodeURIComponent(userId)}`
}

function rethrowNotFound(error: unknown): never {
  if (isNotFoundError(error)) throw new ApiError(404, USER_ERRORS.notFound)
  throw error
}

function toProfileBody({
  name,
  phone,
  address,
  birthDate,
  avatar,
}: UpdateProfileDto): UpdateProfileDto {
  return { name, phone, address, birthDate, avatar }
}

function readRecord(userId: string): Promise<UserRecord> {
  return apiClient.get<UserRecord>(userPath(userId)).catch(rethrowNotFound)
}

function patchRecord(userId: string, body: Partial<UserRecord>): Promise<UserRecord> {
  return apiClient.patch<UserRecord>(userPath(userId), body).catch(rethrowNotFound)
}

export async function getProfile(userId: string): Promise<User> {
  return toUser(await readRecord(userId))
}

export async function updateProfile(userId: string, data: UpdateProfileDto): Promise<User> {
  return toUser(await patchRecord(userId, toProfileBody(data)))
}

export async function changePassword(
  userId: string,
  { currentPassword, newPassword }: ChangePasswordDto
): Promise<void> {
  const record = await readRecord(userId)
  if (record.password !== currentPassword) {
    throw new ApiError(400, USER_ERRORS.wrongCurrentPassword)
  }
  if (newPassword === currentPassword) throw new ApiError(400, USER_ERRORS.samePassword)
  await patchRecord(userId, { password: newPassword })
}
