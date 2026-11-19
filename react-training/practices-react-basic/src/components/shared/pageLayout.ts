import { SCRIPT_FOCUS_RING } from '@/components/ui/focusWithVisibleRing'
import { FOCUS_RING } from '@/components/ui/interactionClasses'
import { cn } from '@/utils/cn'

export const SIDEBAR_LAYOUT = {
  columns: 'flex flex-col gap-10 xl:flex-row xl:items-start',
  main: 'flex min-w-0 flex-col xl:w-[782px] xl:shrink-0',
  aside: 'xl:w-[378px] xl:shrink-0',
}

export const PAGE_CONTAINER = 'container px-4 py-10 md:px-6 xl:px-0'

export const PAGE_HEADING = cn(
  'font-heading text-h3 font-bold text-dark',
  FOCUS_RING,
  SCRIPT_FOCUS_RING
)

export const ACCOUNT_HEADING = PAGE_HEADING

export const ACCOUNT_SECTION_HEADING = 'font-heading text-h4 font-bold text-dark'
