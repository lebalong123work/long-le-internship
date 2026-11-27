import { HEADER_TEXT } from '@/constants/header'
import { ROUTES } from '@/constants/routes'
import { useCart } from '@/hooks/useCart'
import { countCartItems } from '@/utils/countCartItems'
import { GuardedIconLink } from './GuardedIconLink'
import { HeaderIconLink } from './HeaderIconLink'
import { SiteLogo } from './SiteLogo'
import { HeaderSearch } from './HeaderSearch'
import { MainNav } from './MainNav'
import { UserMenu } from './UserMenu'
import type { ReactNode } from 'react'

const CART_ICON = '/icons/cart.svg'

const HEART_ICON = '/icons/heart.svg'

interface HeaderBarProps {
  searchControl: ReactNode
  menuControl: ReactNode
}

export function HeaderBar({ searchControl, menuControl }: HeaderBarProps): JSX.Element {
  const { data: cart } = useCart()
  const cartCount = countCartItems(cart?.items)

  return (
    <div className="container flex h-[var(--header-height)] items-center justify-between gap-1 px-4 md:gap-4 md:px-6 lg:gap-6 xl:grid xl:grid-cols-[1fr_auto_1fr] xl:gap-4 xl:px-0">
      <SiteLogo />
      <MainNav orientation="row" className="hidden lg:mt-[3px] lg:block" />
      <div className="flex items-center justify-end gap-1 md:gap-4 lg:gap-6">
        <div className="flex lg:hidden">{searchControl}</div>
        <HeaderIconLink
          to={ROUTES.CART}
          iconSrc={CART_ICON}
          label={HEADER_TEXT.cartLabel(cartCount)}
          badgeCount={cartCount}
        />
        <GuardedIconLink
          to={ROUTES.ACCOUNT.WISHLIST}
          iconSrc={HEART_ICON}
          label={HEADER_TEXT.wishlist}
          className="hidden lg:inline-flex"
        />
        <UserMenu className="hidden lg:flex" />
        <HeaderSearch className="hidden lg:block" />
        <div className="flex lg:hidden">{menuControl}</div>
      </div>
    </div>
  )
}
