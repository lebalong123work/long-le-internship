import { useEffect, useId, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { FOCUS_RING, HOVER_OPACITY } from '@/components/ui/interactionClasses'
import { DESKTOP_MEDIA_QUERY } from '@/constants/breakpoints'
import { ACCOUNT_NAV_ITEMS, HEADER_TEXT } from '@/constants/header'
import { useAuth, useLogout } from '@/hooks/useAuth'
import { useAuthModal } from '@/hooks/useAuthModal'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { cn } from '@/utils/cn'
import { HEADER_ICON_BUTTON, MENU_ROW_BUTTON, NAV_LINK_CLASSES } from './headerClasses'
import type { FocusEvent, KeyboardEvent } from 'react'

const USER_ICON = '/icons/user.svg'

interface AccountNavItemsProps {
  itemClassName: string
  className?: string
  onBeforeLogout?: () => void
}

interface UserMenuProps {
  className?: string
}

function focusLeaves(event: FocusEvent<HTMLElement>): boolean {
  const next = event.relatedTarget
  return next instanceof Node && !event.currentTarget.contains(next)
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
      {ACCOUNT_NAV_ITEMS.map((item) => (
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
  const { open } = useAuthModal()
  const location = useLocation()
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY)
  const [openKey, setOpenKey] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuId = useId()
  const isOpen = user !== null && isDesktop && openKey === location.key

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
    if (user === null) {
      open('login')
      return
    }
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
        aria-label={user === null ? HEADER_TEXT.logIn : HEADER_TEXT.accountMenuLabel(user.name)}
        aria-expanded={user === null ? undefined : isOpen}
        aria-controls={user === null ? undefined : menuId}
        onClick={handleButtonClick}
        className={cn(HEADER_ICON_BUTTON, FOCUS_RING, HOVER_OPACITY)}
      >
        <img src={USER_ICON} alt="" className="size-6" />
      </button>
      {user !== null && (
        <div
          id={menuId}
          hidden={!isOpen}
          className="absolute right-0 top-full z-10 mt-2 whitespace-nowrap rounded-10 bg-white py-2 shadow-header"
        >
          <AccountNavItems itemClassName="px-6 py-3" onBeforeLogout={focusButtonBeforeLogout} />
        </div>
      )}
    </div>
  )
}
