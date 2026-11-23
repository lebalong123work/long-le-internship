import { describe, expect, it } from 'vitest'
import { orderNumberFromState } from './orderLookupState'

describe('orderNumberFromState', () => {
  it('S1 reads the order number from navigation state', () => {
    expect(orderNumberFromState({ orderNumber: '#ORD-AbC' })).toBe('#ORD-AbC')
  })

  it.each([null, undefined, 'text', 42, {}, { orderNumber: 7 }, { email: 'a@b.co' }])(
    'S2 returns an empty value for %j',
    (state) => {
      expect(orderNumberFromState(state)).toBe('')
    }
  )

  it('S3 trims the order number', () => {
    expect(orderNumberFromState({ orderNumber: '  #ORD-AbC  ' })).toBe('#ORD-AbC')
  })
})
