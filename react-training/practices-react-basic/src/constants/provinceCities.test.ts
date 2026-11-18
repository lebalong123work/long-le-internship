import { describe, expect, it } from 'vitest'
import { PROVINCE_CITIES, PROVINCE_CITY_NAMES, wardsOf } from './provinceCities'

describe('PROVINCE_CITIES', () => {
  it('lists the four agreed mock cities in order', () => {
    expect(PROVINCE_CITY_NAMES).toEqual(['Hanoi', 'Ho Chi Minh City', 'Da Nang', 'Can Tho'])
  })

  it('gives every city at least two unique, non-blank wards', () => {
    for (const { wards } of PROVINCE_CITIES) {
      expect(wards.length).toBeGreaterThanOrEqual(2)
      expect(new Set(wards).size).toBe(wards.length)
      expect(wards.every((ward) => ward.trim() !== '')).toBe(true)
    }
  })
})

describe('wardsOf', () => {
  it('returns the wards of a known city', () => {
    expect(wardsOf('Da Nang')).toEqual(['Hai Chau', 'Hoa Cuong', 'Thanh Khe', 'An Hai'])
  })

  it.each(['', 'Hue', 'hanoi'])('returns no wards for %j', (province) => {
    expect(wardsOf(province)).toEqual([])
  })
})
