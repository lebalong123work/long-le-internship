const DIGITS_ONLY = /^\d+$/
const FIRST_PAGE = 1

export function parsePageParam(value: string | null): number {
  if (value === null || !DIGITS_ONLY.test(value)) return FIRST_PAGE
  const page = Number(value)
  return Number.isSafeInteger(page) && page > 0 ? page : FIRST_PAGE
}
