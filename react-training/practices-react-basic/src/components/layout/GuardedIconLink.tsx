import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { FOCUS_RING, LINK_HOVER_OPACITY } from '@/components/ui/interactionClasses'
import { useAuth } from '@/hooks/useAuth'
import { useAuthModal } from '@/hooks/useAuthModal'
import { cn } from '@/utils/cn'
import { HEADER_ICON_BUTTON } from './headerClasses'
import type { MouseEvent } from 'react'

interface GuardedIconLinkProps {
  to: string
  iconSrc: string
  label: string
  badgeCount?: number
  className?: string
}

export function GuardedIconLink({
  to,
  iconSrc,
  label,
  badgeCount = 0,
  className,
}: GuardedIconLinkProps): JSX.Element {
  const { isAuthenticated } = useAuth()
  const { open } = useAuthModal()

  function handleClick(event: MouseEvent<HTMLAnchorElement>): void {
    if (isAuthenticated) return
    event.preventDefault()
    open('login', to)
  }

  return (
    <Link
      to={to}
      aria-label={label}
      onClick={handleClick}
      className={cn(HEADER_ICON_BUTTON, FOCUS_RING, LINK_HOVER_OPACITY, className)}
    >
      <span className="relative size-6">
        <img src={iconSrc} alt="" className="size-6" />
        <span className="absolute -top-px left-3">
          <Badge count={badgeCount} />
        </span>
      </span>
    </Link>
  )
}
