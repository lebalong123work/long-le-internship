export const ORDER_NUMBER_PREFIX = '#ORD-'

const HASH = '#'
const LEADING_ORD = /^ORD-/i

export function parseOrderNumber(input: string): string {
  const trimmed = input.trim()
  const withoutHash = trimmed.startsWith(HASH) ? trimmed.slice(HASH.length) : trimmed
  return withoutHash.replace(LEADING_ORD, '').trim()
}
