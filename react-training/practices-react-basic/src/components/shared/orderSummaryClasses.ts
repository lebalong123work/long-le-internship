import { cn } from '@/utils/cn'

const BODY_TEXT = 'font-body text-lg leading-normal text-dark'

export const ORDER_SUMMARY_CLASSES = {
  bodyText: BODY_TEXT,
  section: 'flex flex-col gap-6 bg-light p-6',
  heading: 'font-heading text-h4 font-bold text-dark',
  group: 'flex flex-col gap-4',
  list: 'flex flex-col gap-4',
  row: 'flex gap-4',
  info: 'flex min-w-0 flex-col gap-1',
  name: 'break-words font-heading text-lg font-bold leading-normal text-dark',
  detail: 'font-body text-sm leading-normal text-medium-dark',
  divider: 'border-t-2 border-dashed border-light-medium',
  amounts: 'flex flex-col gap-2',
  amount: cn('flex justify-between gap-4', BODY_TEXT),
  total: 'font-bold',
}
