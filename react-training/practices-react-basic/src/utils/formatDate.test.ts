import { describe, expect, it } from 'vitest'
import { formatDate } from './formatDate'

describe('formatDate', () => {
  it('F1 formats a date as dd/mm/yyyy in local time', () => {
    expect(formatDate(new Date(2026, 10, 7, 12).toISOString())).toBe('07/11/2026')
  })

  it('F1 returns an empty string for an invalid date', () => {
    expect(formatDate('not a date')).toBe('')
  })
})
