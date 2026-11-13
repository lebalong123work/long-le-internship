import { buttonVariants, GRADIENT_TEXT } from '@/components/ui/buttonVariants'
import { DISABLED_CURSOR, FOCUS_RING, HOVER_OPACITY } from '@/components/ui/interactionClasses'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/utils/cn'
import type { ButtonVariant } from '@/components/ui/buttonVariants'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

const BUTTON_INTERACTION = ['disabled:opacity-50', FOCUS_RING, HOVER_OPACITY, DISABLED_CURSOR]

interface ButtonBaseProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> {
  isLoading?: boolean
  children: ReactNode
}

interface TextButtonProps extends ButtonBaseProps {
  variant?: 'primary' | 'light'
  'aria-label'?: string
}

interface IconButtonProps extends ButtonBaseProps {
  variant: 'icon-gradient'
  'aria-label': string
}

type ButtonProps = TextButtonProps | IconButtonProps

function renderContent(
  variant: ButtonVariant | undefined,
  isLoading: boolean,
  children: ReactNode
): ReactNode {
  if (variant === 'icon-gradient') return isLoading ? null : children
  if (variant === 'light') {
    return <span className={GRADIENT_TEXT}>{children}</span>
  }
  return children
}

export function Button({
  variant,
  isLoading = false,
  disabled,
  type = 'button',
  className,
  children,
  'aria-busy': ariaBusy,
  ...rest
}: ButtonProps): JSX.Element {
  return (
    <button
      {...rest}
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading ? true : ariaBusy}
      className={cn(buttonVariants({ variant }), BUTTON_INTERACTION, className)}
    >
      {isLoading && <Spinner />}
      {renderContent(variant, isLoading, children)}
    </button>
  )
}
