import { Link } from 'react-router-dom'
import { buttonVariants, GRADIENT_TEXT } from '@/components/ui/buttonVariants'
import { FOCUS_RING, LINK_HOVER_OPACITY } from '@/components/ui/interactionClasses'
import { PAGINATION_TEXT } from '@/constants/pagination'
import { cn } from '@/utils/cn'

interface PaginationProps {
  page: number
  totalPages: number
  hrefFor: (page: number) => string
}

interface PageLinkProps {
  label: string
  to: string | null
}

const PAGE_LINK = buttonVariants({ variant: 'light' })

function PageLink({ label, to }: PageLinkProps): JSX.Element {
  const text = <span className={GRADIENT_TEXT}>{label}</span>

  if (to === null) {
    return (
      <span aria-disabled="true" className={cn(PAGE_LINK, 'cursor-not-allowed opacity-50')}>
        {text}
      </span>
    )
  }
  return (
    <Link to={to} className={cn(PAGE_LINK, FOCUS_RING, LINK_HOVER_OPACITY)}>
      {text}
    </Link>
  )
}

export function Pagination({ page, totalPages, hrefFor }: PaginationProps): JSX.Element | null {
  if (totalPages <= 1) return null

  return (
    <nav
      aria-label={PAGINATION_TEXT.navLabel}
      className="flex flex-wrap items-center justify-center gap-4"
    >
      <PageLink label={PAGINATION_TEXT.previous} to={page > 1 ? hrefFor(page - 1) : null} />
      <p className="font-body text-lg leading-normal text-dark">
        {PAGINATION_TEXT.pageOf(page, totalPages)}
      </p>
      <PageLink label={PAGINATION_TEXT.next} to={page < totalPages ? hrefFor(page + 1) : null} />
    </nav>
  )
}
