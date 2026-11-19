import { useEffect, useId, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { FOCUS_RING, HOVER_OPACITY } from '@/components/ui/interactionClasses'
import { DESKTOP_MEDIA_QUERY } from '@/constants/breakpoints'
import { HEADER_TEXT } from '@/constants/header'
import { SEARCH_ICON_SRC } from '@/constants/search'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { cn } from '@/utils/cn'
import { HeaderBar } from './HeaderBar'
import { HEADER_ICON_BUTTON } from './headerClasses'
import { MenuPanel } from './MenuPanel'
import { SearchOverlay } from './SearchOverlay'
import type { Ref } from 'react'

const MENU_ICON = '/icons/menu.svg'

type OverlayKind = 'menu' | 'search'

interface OpenOverlay {
  kind: OverlayKind
  key: string
}

interface SearchButtonProps {
  dialogId: string
  isOpen: boolean
  onOpen: () => void
  buttonRef?: Ref<HTMLButtonElement>
}

function SearchButton({ dialogId, isOpen, onOpen, buttonRef }: SearchButtonProps): JSX.Element {
  return (
    <button
      ref={buttonRef}
      type="button"
      aria-label={HEADER_TEXT.openSearch}
      aria-expanded={isOpen}
      aria-controls={dialogId}
      onClick={onOpen}
      className={cn(HEADER_ICON_BUTTON, FOCUS_RING, HOVER_OPACITY)}
    >
      <img src={SEARCH_ICON_SRC} alt="" className="size-6" />
    </button>
  )
}

export function Header(): JSX.Element {
  const location = useLocation()
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY)
  const [overlay, setOverlay] = useState<OpenOverlay | null>(null)
  const menuId = useId()
  const searchId = useId()
  const searchButtonRef = useRef<HTMLButtonElement>(null)
  const restoreSearchFocusRef = useRef(false)

  function isOverlayOpen(kind: OverlayKind): boolean {
    return !isDesktop && overlay?.kind === kind && overlay.key === location.key
  }

  const isMenuOpen = isOverlayOpen('menu')
  const isSearchOpen = isOverlayOpen('search')

  useEffect(() => {
    if (isSearchOpen || !restoreSearchFocusRef.current) return
    restoreSearchFocusRef.current = false
    searchButtonRef.current?.focus()
  }, [isSearchOpen])

  function openOverlay(kind: OverlayKind): void {
    setOverlay({ kind, key: location.key })
  }

  function closeOverlay(): void {
    setOverlay(null)
  }

  function closeSearchByUser(): void {
    restoreSearchFocusRef.current = true
    closeOverlay()
  }

  const searchButtonProps = {
    dialogId: searchId,
    isOpen: isSearchOpen,
    onOpen: () => openOverlay('search'),
  }

  return (
    <header className="sticky top-0 z-40 bg-white pt-[env(safe-area-inset-top)] shadow-header">
      <HeaderBar
        searchControl={<SearchButton {...searchButtonProps} buttonRef={searchButtonRef} />}
        menuControl={
          <button
            type="button"
            aria-label={HEADER_TEXT.openMenu}
            aria-expanded={isMenuOpen}
            aria-controls={menuId}
            onClick={() => openOverlay('menu')}
            className={cn(HEADER_ICON_BUTTON, FOCUS_RING, HOVER_OPACITY)}
          >
            <img src={MENU_ICON} alt="" className="size-6" />
          </button>
        }
      />
      <MenuPanel
        dialogId={menuId}
        isOpen={isMenuOpen}
        onClose={closeOverlay}
        searchControl={<SearchButton {...searchButtonProps} />}
      />
      <SearchOverlay
        dialogId={searchId}
        isOpen={isSearchOpen}
        onClose={closeSearchByUser}
        onNavigate={closeOverlay}
      />
    </header>
  )
}
