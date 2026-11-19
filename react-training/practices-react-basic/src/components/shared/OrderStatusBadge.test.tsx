import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  ORDER_STATUS,
  ORDER_STATUS_BADGE_CLASSES,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_NEUTRAL_BADGE_CLASS,
} from '@/constants/orderStatus'
import { OrderStatusBadge } from './OrderStatusBadge'

function classesOf(element: HTMLElement, classes: string): void {
  for (const name of classes.split(' ')) expect(element).toHaveClass(name)
}

describe('OrderStatusBadge', () => {
  it.each(Object.values(ORDER_STATUS))('S1 shows the label and colors of %s', (status) => {
    render(<OrderStatusBadge status={status} />)
    classesOf(screen.getByText(ORDER_STATUS_LABELS[status]), ORDER_STATUS_BADGE_CLASSES[status])
  })

  it('S2 shows an unknown status as raw text with the neutral badge', () => {
    render(<OrderStatusBadge status="returned" />)
    const badge = screen.getByText('returned')
    classesOf(badge, ORDER_STATUS_NEUTRAL_BADGE_CLASS)
    for (const status of Object.values(ORDER_STATUS)) {
      expect(badge).not.toHaveClass(ORDER_STATUS_BADGE_CLASSES[status].split(' ')[0])
    }
  })
})
