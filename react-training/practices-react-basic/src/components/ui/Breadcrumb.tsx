import { cva } from 'class-variance-authority'
import { Link } from 'react-router-dom'
import { FOCUS_RING } from '@/components/ui/interactionClasses'
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
  'flex flex-wrap items-center gap-6 py-[9px] font-body text-sm leading-normal',
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

function renderItem(item: BreadcrumbItem, isCurrent: boolean): ReactNode {
  if (isCurrent) {
    return (
      <span aria-current="page" className="font-bold">
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
          <li key={`${index}-${item.label}`} className="flex items-center gap-6">
            {index > 0 && <span aria-hidden="true">/</span>}
            {renderItem(item, index === lastIndex)}
          </li>
        ))}
      </ol>
    </nav>
  )
}
