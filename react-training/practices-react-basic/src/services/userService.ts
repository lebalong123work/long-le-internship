import type { ChangePasswordDto, UpdateProfileDto, User } from '@/types'

export function getProfile(_userId: string): Promise<User> {
  throw new Error('not implemented')
}

export function updateProfile(_userId: string, _data: UpdateProfileDto): Promise<User> {
  throw new Error('not implemented')
}

export function changePassword(_userId: string, _data: ChangePasswordDto): Promise<void> {
  throw new Error('not implemented')
}
