import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { buttonVariants, GRADIENT_TEXT } from '@/components/ui/buttonVariants'
import { FOCUS_RING, LINK_HOVER_OPACITY } from '@/components/ui/interactionClasses'
import { PAGINATION_TEXT } from '@/constants/pagination'
import { cn } from '@/utils/cn'

type PageDirection = 'previous' | 'next'

interface PaginationProps {
  page: number
  totalPages: number
  hrefFor: (page: number) => string
}

interface PageLinkProps {
  direction: PageDirection
  to: string | null
}

interface TooltipHandlers {
  onMouseEnter: () => void
  onMouseLeave: () => void
  onFocus: () => void
  onBlur: () => void
}

interface PageTooltipState {
  isShown: boolean
  handlers: TooltipHandlers
}

const PAGE_LABELS: Record<PageDirection, string> = {
  previous: PAGINATION_TEXT.previous,
  next: PAGINATION_TEXT.next,
}

const PAGE_LINK = cn(
  buttonVariants({ variant: 'light' }),
  'relative w-12 shrink-0 px-0 sm:w-auto sm:px-[34px]'
)

const CHEVRON_MASKS: Record<PageDirection, string> = {
  previous: '[mask-image:url(/icons/chevron-left.svg)]',
  next: '[mask-image:url(/icons/chevron-right.svg)]',
}

const PAGE_ICON =
  'size-[18px] bg-dark [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] sm:hidden'

const PAGE_LABEL = cn(GRADIENT_TEXT, 'sr-only sm:not-sr-only')

const TOOLTIP_SIDES: Record<PageDirection, string> = {
  previous: 'left-0',
  next: 'right-0',
}

const PAGE_TOOLTIP =
  'absolute bottom-full z-10 mb-2 whitespace-nowrap bg-dark px-2 py-1 font-body text-sm font-normal leading-normal text-white sm:hidden'

function usePageTooltip(): PageTooltipState {
  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const isShown = (isHovered || isFocused) && !isDismissed

  useEffect(() => {
    if (!isShown) return
    function dismissOnEscape(event: KeyboardEvent): void {
      if (event.key === 'Escape') setIsDismissed(true)
    }
    window.addEventListener('keydown', dismissOnEscape)
    return () => window.removeEventListener('keydown', dismissOnEscape)
  }, [isShown])

  return {
    isShown,
    handlers: {
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => {
        setIsHovered(false)
        setIsDismissed(false)
      },
      onFocus: () => setIsFocused(true),
      onBlur: () => {
        setIsFocused(false)
        setIsDismissed(false)
      },
    },
  }
}

function PageLink({ direction, to }: PageLinkProps): JSX.Element {
  const tooltip = usePageTooltip()
  const label = PAGE_LABELS[direction]
  const content = (
    <>
      <span aria-hidden="true" className={cn(PAGE_ICON, CHEVRON_MASKS[direction])} />
      <span className={PAGE_LABEL}>{label}</span>
      {tooltip.isShown && (
        <span aria-hidden="true" className={cn(PAGE_TOOLTIP, TOOLTIP_SIDES[direction])}>
          {label}
        </span>
      )}
    </>
  )

  if (to === null) {
    return (
      <span
        aria-disabled="true"
        className={cn(PAGE_LINK, 'cursor-not-allowed opacity-50')}
        {...tooltip.handlers}
      >
        {content}
      </span>
    )
  }
  return (
    <Link to={to} className={cn(PAGE_LINK, FOCUS_RING, LINK_HOVER_OPACITY)} {...tooltip.handlers}>
      {content}
    </Link>
  )
}

export function Pagination({ page, totalPages, hrefFor }: PaginationProps): JSX.Element | null {
  if (totalPages <= 1) return null

  return (
    <nav
      aria-label={PAGINATION_TEXT.navLabel}
      className="flex flex-nowrap items-center justify-center gap-2 sm:gap-4"
    >
      <PageLink direction="previous" to={page > 1 ? hrefFor(page - 1) : null} />
      <p className="min-w-0 text-center font-body text-lg leading-normal text-dark">
        {PAGINATION_TEXT.pageOf(page, totalPages)}
      </p>
      <PageLink direction="next" to={page < totalPages ? hrefFor(page + 1) : null} />
    </nav>
  )
}
