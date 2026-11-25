import { afterEach, describe, expect, it, vi } from 'vitest'
import { AVATAR_RULES } from '@/constants/profile'
import { VALIDATION_MESSAGES } from '@/schemas/common'
import { avatarFileError, readFileAsDataUrl } from './avatarFile'

function fileOf(type: string, size: number, name = 'avatar'): File {
  return new File([new Uint8Array(size)], name, { type })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('avatarFileError', () => {
  it.each(['image/jpeg', 'image/png', 'image/webp'])('A1 accepts %s', (type) => {
    expect(avatarFileError(fileOf(type, 10))).toBeNull()
  })

  it.each(['image/svg+xml', 'image/gif', ''])('A1 rejects the type "%s"', (type) => {
    expect(avatarFileError(fileOf(type, 10))).toBe(VALIDATION_MESSAGES.avatarType)
  })

  it('A2 accepts a file of exactly the size limit', () => {
    expect(avatarFileError(fileOf('image/png', AVATAR_RULES.maxBytes))).toBeNull()
  })

  it('A2 rejects a file one byte over the size limit', () => {
    expect(avatarFileError(fileOf('image/png', AVATAR_RULES.maxBytes + 1))).toBe(
      VALIDATION_MESSAGES.avatarTooLarge
    )
  })

  it('A2 rejects an empty file', () => {
    expect(avatarFileError(fileOf('image/png', 0))).toBe(VALIDATION_MESSAGES.avatarReadFailed)
  })

  it('A1 checks the type before the size', () => {
    expect(avatarFileError(fileOf('image/gif', AVATAR_RULES.maxBytes + 1))).toBe(
      VALIDATION_MESSAGES.avatarType
    )
  })
})

describe('readFileAsDataUrl', () => {
  it('A3 resolves with a data URL', async () => {
    const file = new File(['abc'], 'a.png', { type: 'image/png' })
    await expect(readFileAsDataUrl(file)).resolves.toBe('data:image/png;base64,YWJj')
  })

  it('A3 rejects with the read error text when the reader fails', async () => {
    class FailingReader {
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      readAsDataURL(): void {
        queueMicrotask(() => this.onerror?.())
      }
    }
    vi.stubGlobal('FileReader', FailingReader)
    await expect(readFileAsDataUrl(fileOf('image/png', 1))).rejects.toThrow(
      VALIDATION_MESSAGES.avatarReadFailed
    )
  })

  it('R4 rejects with the read error text when the reader result is not a string', async () => {
    class EmptyResultReader {
      result: string | ArrayBuffer | null = null
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      readAsDataURL(): void {
        queueMicrotask(() => this.onload?.())
      }
    }
    vi.stubGlobal('FileReader', EmptyResultReader)
    await expect(readFileAsDataUrl(fileOf('image/png', 1))).rejects.toThrow(
      VALIDATION_MESSAGES.avatarReadFailed
    )
  })
})
