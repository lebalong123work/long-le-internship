export function orderNumberFromState(state: unknown): string {
  if (typeof state !== 'object' || state === null || !('orderNumber' in state)) return ''
  const { orderNumber } = state
  return typeof orderNumber === 'string' ? orderNumber.trim() : ''
}
