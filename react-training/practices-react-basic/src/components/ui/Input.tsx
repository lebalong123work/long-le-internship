import { forwardRef, useId } from 'react'
import { FieldError } from '@/components/ui/FieldError'
import { FIELD_CONTROL, FIELD_INVALID, FIELD_LABEL, joinIds } from '@/components/ui/formClasses'
import { DISABLED_CURSOR, FOCUS_RING } from '@/components/ui/interactionClasses'
import { cn } from '@/utils/cn'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, id, className, 'aria-describedby': describedBy, ...rest },
  ref
): JSX.Element {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const errorId = `${inputId}-error`

  return (
    <div className="flex flex-col gap-4">
      <label htmlFor={inputId} className={FIELD_LABEL}>
        {label}
      </label>
      <div className="flex flex-col gap-2">
        <input
          {...rest}
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={joinIds(describedBy, error ? errorId : undefined)}
          className={cn(
            FIELD_CONTROL,
            'placeholder:text-medium-dark',
            FOCUS_RING,
            DISABLED_CURSOR,
            error && FIELD_INVALID,
            className
          )}
        />
        <FieldError id={errorId} message={error} />
      </div>
    </div>
  )
})
