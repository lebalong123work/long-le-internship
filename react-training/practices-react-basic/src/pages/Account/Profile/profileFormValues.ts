import type { ProfileFormValues } from '@/schemas/profile'
import type { UpdateProfileDto, User } from '@/types'

export function toProfileFormValues(user: User): ProfileFormValues {
  return {
    name: user.name,
    phone: user.phone ?? '',
    address: user.address ?? '',
    birthDate: user.birthDate ?? '',
    avatar: user.avatar ?? '',
  }
}

export function toUpdateProfileDto(
  { name, phone, address, birthDate, avatar }: ProfileFormValues,
  avatarChanged: boolean
): UpdateProfileDto {
  const dto: UpdateProfileDto = { name, phone, address, birthDate }
  return avatarChanged ? { ...dto, avatar } : dto
}
