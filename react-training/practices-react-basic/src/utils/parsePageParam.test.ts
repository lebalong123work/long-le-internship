import { describe, expect, it } from 'vitest'
import { parsePageParam } from './parsePageParam'

describe('parsePageParam', () => {
  it.each([
    ['1', 1],
    ['3', 3],
    ['007', 7],
  ])('G1 keeps the positive digit string %s as %d', (value, expected) => {
    expect(parsePageParam(value)).toBe(expected)
  })

  it('G1 turns 0 into page 1', () => {
    expect(parsePageParam('0')).toBe(1)
  })

  it.each([null, '', '-1', '+2', ' 2', '2 ', '2.5', '1e3', 'Infinity', 'abc'])(
    'G2 turns the malformed value %j into page 1',
    (value) => {
      expect(parsePageParam(value)).toBe(1)
    }
  )

  it('G3 keeps the largest safe integer', () => {
    expect(parsePageParam('9007199254740991')).toBe(Number.MAX_SAFE_INTEGER)
  })

  it('G3 turns an unsafe integer into page 1', () => {
    expect(parsePageParam('9007199254740993')).toBe(1)
  })
})
