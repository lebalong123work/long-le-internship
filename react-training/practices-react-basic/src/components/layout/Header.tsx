import { useId, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { FOCUS_RING, HOVER_OPACITY } from '@/components/ui/interactionClasses'
import { DESKTOP_MEDIA_QUERY } from '@/constants/breakpoints'
import { HEADER_TEXT } from '@/constants/header'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { cn } from '@/utils/cn'
import { HeaderBar } from './HeaderBar'
import { HEADER_ICON_BUTTON } from './headerClasses'
import { MenuPanel } from './MenuPanel'

const MENU_ICON = '/icons/menu.svg'

export function Header(): JSX.Element {
  const location = useLocation()
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY)
  const [menuKey, setMenuKey] = useState<string | null>(null)
  const menuId = useId()
  const isMenuOpen = !isDesktop && menuKey === location.key

  return (
    <header className="sticky top-0 z-40 bg-white pt-[env(safe-area-inset-top)] shadow-header">
      <HeaderBar
        menuControl={
          <button
            type="button"
            aria-label={HEADER_TEXT.openMenu}
            aria-expanded={isMenuOpen}
            aria-controls={menuId}
            onClick={() => setMenuKey(location.key)}
            className={cn(HEADER_ICON_BUTTON, FOCUS_RING, HOVER_OPACITY)}
          >
            <img src={MENU_ICON} alt="" className="size-6" />
          </button>
        }
      />
      <MenuPanel dialogId={menuId} isOpen={isMenuOpen} onClose={() => setMenuKey(null)} />
    </header>
  )
}
