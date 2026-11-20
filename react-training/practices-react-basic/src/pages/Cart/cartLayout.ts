import { SIDEBAR_LAYOUT } from '@/components/shared/pageLayout'
import { cn } from '@/utils/cn'

export const CART_LAYOUT = {
  columns: SIDEBAR_LAYOUT.columns,
  detailText: 'font-heading text-lg leading-normal text-medium-dark',
  list: cn(SIDEBAR_LAYOUT.main, 'gap-6'),
  noticeText: 'mt-2 font-body text-sm leading-normal text-dark',
}
