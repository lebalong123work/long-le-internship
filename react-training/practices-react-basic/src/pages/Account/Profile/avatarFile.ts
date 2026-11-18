import { AVATAR_RULES } from '@/constants/profile'
import { VALIDATION_MESSAGES } from '@/schemas/common'

const ALLOWED_TYPES: readonly string[] = AVATAR_RULES.types

export function avatarFileError(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) return VALIDATION_MESSAGES.avatarType
  if (file.size > AVATAR_RULES.maxBytes) return VALIDATION_MESSAGES.avatarTooLarge
  if (file.size === 0) return VALIDATION_MESSAGES.avatarReadFailed
  return null
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result)
      else reject(new Error(VALIDATION_MESSAGES.avatarReadFailed))
    }
    reader.onerror = () => reject(new Error(VALIDATION_MESSAGES.avatarReadFailed))
    reader.readAsDataURL(file)
  })
}
