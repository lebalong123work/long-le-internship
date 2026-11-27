import { cva } from 'class-variance-authority'
import { Link } from 'react-router-dom'
import { FOCUS_RING } from '@/components/ui/interactionClasses'
import { cn } from '@/utils/cn'
import type { ReactNode } from 'react'

export interface BreadcrumbItem {
  label: string
  to?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  variant?: 'dark' | 'light'
}

const breadcrumbVariants = cva(
  'flex flex-nowrap items-center gap-3 py-[9px] font-body text-sm leading-normal md:gap-6',
  {
    variants: {
      variant: {
        dark: 'text-dark',
        light: 'text-white',
      },
    },
    defaultVariants: {
      variant: 'dark',
    },
  }
)

const BREADCRUMB_ITEM = 'flex items-center gap-3 md:gap-6'

function renderItem(item: BreadcrumbItem, isCurrent: boolean): ReactNode {
  if (isCurrent) {
    return (
      <span aria-current="page" className="block truncate font-bold">
        {item.label}
      </span>
    )
  }
  if (item.to) {
    return (
      <Link to={item.to} className={FOCUS_RING}>
        {item.label}
      </Link>
    )
  }
  return <span>{item.label}</span>
}

export function Breadcrumb({ items, variant }: BreadcrumbProps): ReactNode {
  if (items.length === 0) return null

  const lastIndex = items.length - 1

  return (
    <nav aria-label="Breadcrumb">
      <ol className={breadcrumbVariants({ variant })}>
        {items.map((item, index) => (
          <li
            key={`${index}-${item.label}`}
            className={cn(BREADCRUMB_ITEM, index === lastIndex ? 'min-w-0' : 'shrink-0')}
          >
            {index > 0 && <span aria-hidden="true">/</span>}
            {renderItem(item, index === lastIndex)}
          </li>
        ))}
      </ol>
    </nav>
  )
}
