export type UserRole = 'customer'

/** User as the app sees it — never contains the password. */
export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  phone?: string
  address?: string
  birthDate?: string
  avatar?: string
}

export type UpdateProfileDto = Partial<
  Pick<User, 'name' | 'phone' | 'address' | 'birthDate' | 'avatar'>
>

export interface ChangePasswordDto {
  currentPassword: string
  newPassword: string
}
