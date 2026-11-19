import { FOCUS_RING } from '@/components/ui/interactionClasses'

export const TAB_LOOK = {
  base: [
    'relative font-heading text-lg leading-normal',
    'after:absolute after:-inset-x-[3px] after:-bottom-[3px] after:h-0.5 after:rounded-sm',
    FOCUS_RING,
  ],
  active: 'font-bold text-primary after:bg-primary',
  idle: 'font-normal text-medium-dark',
} as const
