import type { ReactNode } from 'react'

const BADGE_MAX = 99

interface BadgeProps {
  count: number
}

function formatBadgeCount(count: number): string {
  return count > BADGE_MAX ? `${BADGE_MAX}+` : String(count)
}

export function Badge({ count }: BadgeProps): ReactNode {
  if (!Number.isFinite(count) || count < 1) return null

  return (
    <span
      aria-hidden="true"
      className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-badge px-1 font-body text-xs leading-normal text-white"
    >
      {formatBadgeCount(count)}
    </span>
  )
}
