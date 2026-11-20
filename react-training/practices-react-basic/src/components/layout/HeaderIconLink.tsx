import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { FOCUS_RING, LINK_HOVER_OPACITY } from '@/components/ui/interactionClasses'
import { cn } from '@/utils/cn'
import { HEADER_ICON_BUTTON } from './headerClasses'
import type { MouseEvent } from 'react'

export interface HeaderIconLinkProps {
  to: string
  iconSrc: string
  label: string
  badgeCount?: number
  className?: string
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void
}

export function HeaderIconLink({
  to,
  iconSrc,
  label,
  badgeCount = 0,
  className,
  onClick,
}: HeaderIconLinkProps): JSX.Element {
  return (
    <Link
      to={to}
      aria-label={label}
      onClick={onClick}
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
