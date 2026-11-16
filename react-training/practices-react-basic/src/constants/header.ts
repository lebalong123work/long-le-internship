import { ROUTES } from './routes'

interface HeaderNavItem {
  label: string
  to: string
  end: boolean
}

function wholeCount(count: number): number {
  return Number.isFinite(count) && count >= 1 ? Math.floor(count) : 0
}

function cartLabel(count: number): string {
  const items = wholeCount(count)
  if (items === 0) return 'Cart'
  return items === 1 ? 'Cart, 1 item' : `Cart, ${items} items`
}

function accountMenuLabel(name: string): string {
  const trimmed = name.trim()
  return trimmed === '' ? 'Account menu' : `Account menu for ${trimmed}`
}

export const HEADER_TEXT = {
  logo: 'mangcoding Store',
  mainNav: 'Main',
  menuDialog: 'Main menu',
  openMenu: 'Open menu',
  closeMenu: 'Close menu',
  logIn: 'Log In',
  logout: 'Logout',
  profile: 'Profile',
  orders: 'Orders',
  wishlist: 'Wishlist',
  searchLabel: 'Search products',
  searchPlaceholder: 'Search',
  searchSubmit: 'Search',
  cartLabel,
  accountMenuLabel,
} as const

export const MAIN_NAV_ITEMS: readonly HeaderNavItem[] = [
  { label: 'Home', to: ROUTES.HOME, end: true },
  { label: 'Shop', to: ROUTES.SHOP, end: false },
  { label: 'About Us', to: ROUTES.ABOUT, end: true },
  { label: 'Contact', to: ROUTES.CONTACT, end: true },
]

export const ACCOUNT_NAV_ITEMS: readonly HeaderNavItem[] = [
  { label: HEADER_TEXT.profile, to: ROUTES.ACCOUNT.PROFILE, end: true },
  { label: HEADER_TEXT.orders, to: ROUTES.ACCOUNT.ORDERS, end: true },
  { label: HEADER_TEXT.wishlist, to: ROUTES.ACCOUNT.WISHLIST, end: true },
]
