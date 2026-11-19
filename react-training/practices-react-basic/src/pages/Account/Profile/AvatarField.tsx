import { useId, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { FORM_ERROR_TEXT } from '@/components/ui/formClasses'
import { AVATAR_RULES, PROFILE_TEXT } from '@/constants/profile'
import type { ChangeEvent } from 'react'

const FALLBACK_ICON = '/icons/user.svg'
const ACCEPTED_TYPES = AVATAR_RULES.types.join(',')

interface AvatarFieldProps {
  src: string
  error?: string
  disabled?: boolean
  onFileSelect: (file: File) => void
}

export function AvatarField({
  src,
  error,
  disabled = false,
  onFileSelect,
}: AvatarFieldProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null)
  const errorId = useId()
  const describedBy = error ? errorId : undefined

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file) onFileSelect(file)
  }

  return (
    <div className="flex shrink-0 flex-col gap-2">
      <div className="flex flex-col items-start gap-6">
        <div className="flex size-20 shrink-0 items-center justify-center bg-light-medium">
          {src ? (
            <img src={src} alt={PROFILE_TEXT.avatarAlt} className="size-20 object-cover" />
          ) : (
            <img src={FALLBACK_ICON} alt="" width={24} height={24} />
          )}
        </div>
        <Button
          variant="light"
          disabled={disabled}
          aria-describedby={describedBy}
          onClick={() => inputRef.current?.click()}
        >
          {PROFILE_TEXT.changePhoto}
        </Button>
        <input
          ref={inputRef}
          type="file"
          hidden
          accept={ACCEPTED_TYPES}
          disabled={disabled}
          aria-label={PROFILE_TEXT.changePhoto}
          aria-describedby={describedBy}
          onChange={handleChange}
        />
      </div>
      {error && (
        <p id={errorId} role="alert" className={FORM_ERROR_TEXT}>
          {error}
        </p>
      )}
    </div>
  )
}
