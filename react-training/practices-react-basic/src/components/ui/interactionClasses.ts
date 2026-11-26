import { cn } from '@/utils/cn'

export const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'

export const HOVER_OPACITY = 'can-hover:enabled:hover:opacity-90'

export const LINK_HOVER_OPACITY = 'can-hover:hover:opacity-90'

export const DISABLED_CURSOR = 'disabled:cursor-not-allowed'

export const ARIA_DISABLED =
  'aria-disabled:cursor-not-allowed aria-disabled:opacity-50 can-hover:aria-disabled:hover:opacity-50'

export const TEXT_LINK = cn('w-fit font-bold underline', FOCUS_RING, LINK_HOVER_OPACITY)

export const FOCUS_RING_ON_DARK = 'focus-visible:ring-white'

export const FOCUS_RING_ON_BRAND = 'focus-visible:ring-dark focus-visible:ring-offset-2'

export const FOCUS_RING_ON_PHOTO =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark focus-visible:ring-2 focus-visible:ring-white'
