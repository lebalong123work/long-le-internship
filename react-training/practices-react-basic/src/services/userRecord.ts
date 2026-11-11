import type { User } from '@/types'

export interface UserRecord extends User {
  password: string
}

export function toUser(record: UserRecord): User {
  const user: Omit<UserRecord, 'password'> & { password?: string } = { ...record }
  delete user.password
  return user
}
