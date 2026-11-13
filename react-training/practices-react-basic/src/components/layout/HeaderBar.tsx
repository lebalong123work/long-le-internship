import { HEADER_TEXT } from '@/constants/header'
import { ROUTES } from '@/constants/routes'
import { useCart } from '@/hooks/useCart'
import { countCartItems } from '@/utils/countCartItems'
import { GuardedIconLink } from './GuardedIconLink'
import { SiteLogo } from './SiteLogo'
import { HeaderSearch } from './HeaderSearch'
import { MainNav } from './MainNav'
import { UserMenu } from './UserMenu'
import type { ReactNode } from 'react'

const CART_ICON = '/icons/cart.svg'

const HEART_ICON = '/icons/heart.svg'

interface HeaderBarProps {
  menuControl: ReactNode
}

export function HeaderBar({ menuControl }: HeaderBarProps): JSX.Element {
  const { data: cart } = useCart()
  const cartCount = countCartItems(cart?.items)

  return (
    <div className="container flex h-16 items-center justify-between gap-4 px-4 md:px-6 xl:grid xl:h-20 xl:grid-cols-[1fr_auto_1fr] xl:px-0">
      <SiteLogo />
      <MainNav orientation="row" className="hidden xl:mt-[3px] xl:block" />
      <div className="flex items-center justify-end gap-4 xl:gap-6">
        <GuardedIconLink
          to={ROUTES.CART}
          iconSrc={CART_ICON}
          label={HEADER_TEXT.cartLabel(cartCount)}
          badgeCount={cartCount}
        />
        <GuardedIconLink
          to={ROUTES.ACCOUNT.WISHLIST}
          iconSrc={HEART_ICON}
          label={HEADER_TEXT.wishlist}
          className="hidden xl:inline-flex"
        />
        <UserMenu className="hidden xl:flex" />
        <HeaderSearch className="hidden xl:block" />
        <div className="flex xl:hidden">{menuControl}</div>
      </div>
    </div>
  )
}
