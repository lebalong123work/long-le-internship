import { describe, expect, it } from 'vitest'
import { ORDER_NUMBER_PREFIX, parseOrderNumber } from './orderNumber'

describe('parseOrderNumber', () => {
  it('N1 removes the shown "#ORD-" prefix', () => {
    expect(parseOrderNumber(`${ORDER_NUMBER_PREFIX}abc`)).toBe('abc')
  })

  it.each(['ORD-abc', 'ord-abc', '#ord-abc', 'Ord-abc'])(
    'N2 removes the "ORD-" prefix in any letter case: %s',
    (input) => {
      expect(parseOrderNumber(input)).toBe('abc')
    }
  )

  it('N3 accepts the bare id and trims spaces', () => {
    expect(parseOrderNumber('  abc  ')).toBe('abc')
    expect(parseOrderNumber(' #ORD- abc ')).toBe('abc')
  })

  it('N4 keeps the letter case of the id', () => {
    expect(parseOrderNumber('#ORD-AbC_12')).toBe('AbC_12')
    expect(parseOrderNumber('MHY_ZdStguw')).toBe('MHY_ZdStguw')
  })

  it.each(['', '   ', '#ORD-', 'ORD-', '#'])('N5 returns an empty id for "%s"', (input) => {
    expect(parseOrderNumber(input)).toBe('')
  })
})
