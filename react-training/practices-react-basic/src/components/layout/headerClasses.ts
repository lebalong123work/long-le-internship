import { FOCUS_RING } from '@/components/ui/interactionClasses'

export const NAV_LINK_CLASSES = {
  idle: [
    'font-heading text-lg font-normal leading-normal text-dark can-hover:hover:text-primary',
    FOCUS_RING,
  ],
  active: 'font-bold text-primary',
} as const

export const MENU_ROW_BUTTON = 'block w-full text-left'

export const PANEL_ROW = 'py-3'

export const HEADER_ICON_BUTTON =
  'relative inline-flex size-10 shrink-0 items-center justify-center xl:size-6'
