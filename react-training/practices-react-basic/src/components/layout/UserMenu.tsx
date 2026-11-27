import { useEffect, useId, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { FOCUS_RING, HOVER_OPACITY } from '@/components/ui/interactionClasses'
import { FOCUS_FALLBACK_ATTR } from '@/components/ui/nativeDialog'
import { DESKTOP_MEDIA_QUERY } from '@/constants/breakpoints'
import { ACCOUNT_NAV_ITEMS, GUEST_NAV_ITEMS, HEADER_TEXT } from '@/constants/header'
import { useAuth, useLogout } from '@/hooks/useAuth'
import { useAuthModal } from '@/hooks/useAuthModal'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { cn } from '@/utils/cn'
import { HEADER_ICON_BUTTON, MENU_ROW_BUTTON, NAV_LINK_CLASSES } from './headerClasses'
import type { FocusEvent, KeyboardEvent } from 'react'
import type { HeaderNavItem } from '@/constants/header'

const USER_ICON = '/icons/user.svg'
const MENU_ITEM = 'px-6 py-3'

interface AccountNavItemsProps {
  itemClassName: string
  className?: string
  onBeforeLogout?: () => void
}

interface GuestNavItemsProps {
  itemClassName: string
}

interface NavItemLinksProps {
  items: readonly HeaderNavItem[]
  itemClassName: string
}

interface UserMenuProps {
  className?: string
}

function focusLeaves(event: FocusEvent<HTMLElement>): boolean {
  const next = event.relatedTarget
  return next instanceof Node && !event.currentTarget.contains(next)
}

function NavItemLinks({ items, itemClassName }: NavItemLinksProps): JSX.Element {
  return (
    <>
      {items.map((item) => (
        <li key={item.to}>
          <NavLink
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(NAV_LINK_CLASSES.idle, 'block', itemClassName, isActive && NAV_LINK_CLASSES.active)
            }
          >
            {item.label}
          </NavLink>
        </li>
      ))}
    </>
  )
}

export function GuestNavItems({ itemClassName }: GuestNavItemsProps): JSX.Element {
  const { open } = useAuthModal()

  return (
    <ul>
      <NavItemLinks items={GUEST_NAV_ITEMS} itemClassName={itemClassName} />
      <li>
        <button
          type="button"
          onClick={() => open('login')}
          className={cn(NAV_LINK_CLASSES.idle, MENU_ROW_BUTTON, itemClassName)}
        >
          {HEADER_TEXT.logIn}
        </button>
      </li>
    </ul>
  )
}

export function AccountNavItems({
  itemClassName,
  className,
  onBeforeLogout,
}: AccountNavItemsProps): JSX.Element {
  const logout = useLogout()

  function handleLogout(): void {
    onBeforeLogout?.()
    logout()
  }

  return (
    <ul className={className}>
      <NavItemLinks items={ACCOUNT_NAV_ITEMS} itemClassName={itemClassName} />
      <li>
        <button
          type="button"
          onClick={handleLogout}
          className={cn(NAV_LINK_CLASSES.idle, MENU_ROW_BUTTON, itemClassName)}
        >
          {HEADER_TEXT.logout}
        </button>
      </li>
    </ul>
  )
}

export function UserMenu({ className }: UserMenuProps): JSX.Element {
  const { user } = useAuth()
  const location = useLocation()
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY)
  const [openKey, setOpenKey] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuId = useId()
  const isOpen = isDesktop && openKey === location.key

  useEffect(() => {
    if (!isOpen) return
    function handlePointerDown(event: PointerEvent): void {
      const target = event.target
      if (target instanceof Node && containerRef.current?.contains(target)) return
      setOpenKey(null)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [isOpen])

  function close(): void {
    setOpenKey(null)
  }

  function handleButtonClick(): void {
    setOpenKey(isOpen ? null : location.key)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (event.key !== 'Escape' || !isOpen) return
    close()
    buttonRef.current?.focus()
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>): void {
    if (isOpen && focusLeaves(event)) close()
  }

  function focusButtonBeforeLogout(): void {
    close()
    buttonRef.current?.focus()
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative', className)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
    >
      <button
        ref={buttonRef}
        type="button"
        {...{ [FOCUS_FALLBACK_ATTR]: '' }}
        aria-label={HEADER_TEXT.accountMenuLabel(user?.name ?? '')}
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={handleButtonClick}
        className={cn(HEADER_ICON_BUTTON, FOCUS_RING, HOVER_OPACITY)}
      >
        <img src={USER_ICON} alt="" className="size-6" />
      </button>
      <div
        id={menuId}
        hidden={!isOpen}
        className="absolute right-0 top-full z-10 mt-2 whitespace-nowrap rounded-10 bg-white py-2 shadow-header"
      >
        {user === null ? (
          <GuestNavItems itemClassName={MENU_ITEM} />
        ) : (
          <AccountNavItems itemClassName={MENU_ITEM} onBeforeLogout={focusButtonBeforeLogout} />
        )}
      </div>
    </div>
  )
}
