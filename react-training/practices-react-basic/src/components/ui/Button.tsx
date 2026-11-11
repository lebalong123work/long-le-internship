import { cva } from 'class-variance-authority'
import { DISABLED_CURSOR, FOCUS_RING, HOVER_OPACITY } from '@/components/ui/interactionClasses'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/utils/cn'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

const buttonVariants = cva(
  [
    'inline-flex h-12 items-center justify-center gap-2.5 rounded-none font-body text-lg font-bold leading-normal disabled:opacity-50',
    FOCUS_RING,
    HOVER_OPACITY,
    DISABLED_CURSOR,
  ],
  {
    variants: {
      variant: {
        primary: 'bg-brand px-[34px] py-2.5 text-white shadow-button',
        light: 'bg-white px-[34px] py-2.5 text-primary shadow-button-light',
        'icon-gradient': 'size-12 bg-brand text-white shadow-button',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  }
)

type ButtonVariant = 'primary' | 'light' | 'icon-gradient'

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
    return <span className="bg-brand bg-clip-text text-transparent">{children}</span>
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
  ...rest
}: ButtonProps): JSX.Element {
  return (
    <button
      {...rest}
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading ? true : undefined}
      className={cn(buttonVariants({ variant }), className)}
    >
      {isLoading && <Spinner />}
      {renderContent(variant, isLoading, children)}
    </button>
  )
}
