import { forwardRef, useId } from 'react'
import {
  FIELD_CONTROL,
  FIELD_INVALID,
  FIELD_LABEL,
  FORM_ERROR_TEXT,
  joinIds,
} from '@/components/ui/formClasses'
import { DISABLED_CURSOR, FOCUS_RING } from '@/components/ui/interactionClasses'
import { cn } from '@/utils/cn'
import type { SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  placeholder: string
  options: readonly string[]
  error?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, placeholder, options, error, id, className, 'aria-describedby': describedBy, ...rest },
  ref
): JSX.Element {
  const generatedId = useId()
  const selectId = id ?? generatedId
  const errorId = `${selectId}-error`

  return (
    <div className="flex flex-col gap-4">
      <label htmlFor={selectId} className={FIELD_LABEL}>
        {label}
      </label>
      <div className="flex flex-col gap-2">
        <select
          {...rest}
          ref={ref}
          id={selectId}
          aria-invalid={Boolean(error)}
          aria-describedby={joinIds(describedBy, error ? errorId : undefined)}
          className={cn(
            FIELD_CONTROL,
            FOCUS_RING,
            DISABLED_CURSOR,
            error && FIELD_INVALID,
            className
          )}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {error && (
          <p id={errorId} className={FORM_ERROR_TEXT}>
            {error}
          </p>
        )}
      </div>
    </div>
  )
})
