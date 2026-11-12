import { Link } from 'react-router-dom'
import { buttonVariants, GRADIENT_TEXT } from '@/components/ui/buttonVariants'
import { FOCUS_RING, LINK_HOVER_OPACITY } from '@/components/ui/interactionClasses'
import { cn } from '@/utils/cn'
import type { ReactNode } from 'react'

interface ButtonLinkProps {
  to: string
  children: ReactNode
  variant?: 'primary' | 'light'
  className?: string
}

export function ButtonLink({
  to,
  children,
  variant = 'primary',
  className,
}: ButtonLinkProps): JSX.Element {
  return (
    <Link
      to={to}
      className={cn(buttonVariants({ variant }), FOCUS_RING, LINK_HOVER_OPACITY, className)}
    >
      {variant === 'light' ? <span className={GRADIENT_TEXT}>{children}</span> : children}
    </Link>
  )
}
