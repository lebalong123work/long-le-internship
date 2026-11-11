import { forwardRef, useId } from 'react'
import { DISABLED_CURSOR, FOCUS_RING } from '@/components/ui/interactionClasses'
import { cn } from '@/utils/cn'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

function joinIds(...ids: (string | undefined)[]): string | undefined {
  const joined = ids.filter(Boolean).join(' ')
  return joined || undefined
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
      <label htmlFor={inputId} className="font-body text-lg font-bold leading-normal text-dark">
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
            'h-12 w-full rounded-none border border-medium bg-white px-4 font-heading text-lg leading-normal text-dark placeholder:text-medium-dark disabled:opacity-50',
            FOCUS_RING,
            DISABLED_CURSOR,
            error && 'border-error',
            className
          )}
        />
        {error && (
          <p id={errorId} className="font-body text-sm leading-normal text-error">
            {error}
          </p>
        )}
      </div>
    </div>
  )
})
