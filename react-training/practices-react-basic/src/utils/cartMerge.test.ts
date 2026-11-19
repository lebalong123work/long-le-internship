import { describe, expect, it } from 'vitest'
import { mergeCartLines, subtractCartLines } from './cartMerge'
import type { CartItem } from '@/types'

function line(productId: string, quantity: number, color = 'Black', size = 'M'): CartItem {
  return { id: `${productId}__${color}__${size}`, productId, color, size, quantity }
}

describe('mergeCartLines', () => {
  it('L1 sums the quantity of the same line and keeps its place', () => {
    const merged = mergeCartLines([line('p1', 1), line('p2', 2)], [line('p2', 3)])
    expect(merged).toEqual([line('p1', 1), line('p2', 5)])
  })

  it('L2 puts new lines at the top in source order', () => {
    const merged = mergeCartLines([line('p1', 1)], [line('p3', 1), line('p4', 2)])
    expect(merged).toEqual([line('p3', 1), line('p4', 2), line('p1', 1)])
  })

  it('L3 treats another color or size as a new line', () => {
    const merged = mergeCartLines(
      [line('p1', 1)],
      [line('p1', 2, 'Blue'), line('p1', 3, 'Black', 'L')]
    )
    expect(merged).toEqual([line('p1', 2, 'Blue'), line('p1', 3, 'Black', 'L'), line('p1', 1)])
  })

  it('L5 handles empty inputs', () => {
    expect(mergeCartLines([], [])).toEqual([])
    expect(mergeCartLines([], [line('p1', 1)])).toEqual([line('p1', 1)])
    expect(mergeCartLines([line('p1', 1)], [])).toEqual([line('p1', 1)])
  })
})

describe('subtractCartLines', () => {
  it('L4 lowers a partly merged line', () => {
    expect(subtractCartLines([line('p1', 5)], [line('p1', 2)])).toEqual([line('p1', 3)])
  })

  it('L4 removes a fully merged line and keeps lines not in the snapshot', () => {
    expect(subtractCartLines([line('p1', 2), line('p2', 1)], [line('p1', 2)])).toEqual([
      line('p2', 1),
    ])
  })

  it('L5 returns an empty list for an empty cart', () => {
    expect(subtractCartLines([], [line('p1', 1)])).toEqual([])
  })
})
