export function clampQuantity(quantity: number, stock: number): number {
  if (stock < 1) return 0
  const whole = Number.isFinite(quantity) ? Math.floor(quantity) : 1
  return Math.min(Math.max(whole, 1), Math.floor(stock))
}
