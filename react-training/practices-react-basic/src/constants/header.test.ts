import { describe, expect, it } from 'vitest'
import { HEADER_TEXT, MAIN_NAV_ITEMS } from './header'
import { ROUTES } from './routes'

describe('HEADER_TEXT.cartLabel', () => {
  it('cartLabel returns Cart for 0', () => {
    expect(HEADER_TEXT.cartLabel(0)).toBe('Cart')
  })

  it('cartLabel returns Cart for NaN, negative and Infinity', () => {
    expect(HEADER_TEXT.cartLabel(Number.NaN)).toBe('Cart')
    expect(HEADER_TEXT.cartLabel(-3)).toBe('Cart')
    expect(HEADER_TEXT.cartLabel(Number.POSITIVE_INFINITY)).toBe('Cart')
  })

  it('cartLabel returns Cart, 1 item for 1', () => {
    expect(HEADER_TEXT.cartLabel(1)).toBe('Cart, 1 item')
  })

  it('cartLabel does not use the singular for 2', () => {
    expect(HEADER_TEXT.cartLabel(2)).toBe('Cart, 2 items')
  })

  it('cartLabel returns Cart, 120 items for 120', () => {
    expect(HEADER_TEXT.cartLabel(120)).toBe('Cart, 120 items')
  })

  it('cartLabel rounds 2.5 down to Cart, 2 items', () => {
    expect(HEADER_TEXT.cartLabel(2.5)).toBe('Cart, 2 items')
  })
})

describe('HEADER_TEXT.accountMenuLabel', () => {
  it('accountMenuLabel adds the user name', () => {
    expect(HEADER_TEXT.accountMenuLabel('Test Customer')).toBe('Account menu for Test Customer')
  })

  it('accountMenuLabel returns Account menu for a blank name', () => {
    expect(HEADER_TEXT.accountMenuLabel('   ')).toBe('Account menu')
  })
})

describe('MAIN_NAV_ITEMS', () => {
  it('main nav items are Home, Shop, About Us, Contact with ROUTES paths', () => {
    expect(MAIN_NAV_ITEMS.map(({ label, to }) => [label, to])).toEqual([
      ['Home', ROUTES.HOME],
      ['Shop', ROUTES.SHOP],
      ['About Us', ROUTES.ABOUT],
      ['Contact', ROUTES.CONTACT],
    ])
  })

  it('main nav items contain no account route', () => {
    const accountRoutes: string[] = Object.values(ROUTES.ACCOUNT)
    expect(MAIN_NAV_ITEMS.some(({ to }) => accountRoutes.includes(to))).toBe(false)
  })
})
