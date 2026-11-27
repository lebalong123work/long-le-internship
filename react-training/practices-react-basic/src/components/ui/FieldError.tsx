import { FORM_ERROR_TEXT } from '@/components/ui/formClasses'
import { cn } from '@/utils/cn'

interface FieldErrorProps {
  id: string
  message?: string
  announce?: boolean
}

export function FieldError({ id, message, announce = false }: FieldErrorProps): JSX.Element {
  return (
    <p id={id} role={announce ? 'alert' : undefined} className={cn(FORM_ERROR_TEXT, 'min-h-[1lh]')}>
      {message ?? ''}
    </p>
  )
}
