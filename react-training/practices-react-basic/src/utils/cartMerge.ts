import type { CartItem } from '@/types'

function isSameLine(a: CartItem, b: CartItem): boolean {
  return a.productId === b.productId && a.color === b.color && a.size === b.size
}

function quantityOf(lines: CartItem[], line: CartItem): number {
  return lines.find((other) => isSameLine(other, line))?.quantity ?? 0
}

export function mergeCartLines(target: CartItem[], source: CartItem[]): CartItem[] {
  const summed = target.map((line) => ({
    ...line,
    quantity: line.quantity + quantityOf(source, line),
  }))
  const added = source.filter((line) => !target.some((other) => isSameLine(other, line)))
  return [...added, ...summed]
}

export function subtractCartLines(target: CartItem[], source: CartItem[]): CartItem[] {
  return target
    .map((line) => ({ ...line, quantity: line.quantity - quantityOf(source, line) }))
    .filter((line) => line.quantity > 0)
}
