import { useLayoutEffect, useRef } from 'react'
import { CloseButton } from '@/components/ui/CloseButton'
import {
  DialogController,
  FULLSCREEN_DIALOG_CLASSES,
  useDialogCloseEvents,
} from '@/components/ui/nativeDialog'
import { HEADER_TEXT } from '@/constants/header'
import { useAuth } from '@/hooks/useAuth'
import { useAuthModal } from '@/hooks/useAuthModal'
import { cn } from '@/utils/cn'
import { HeaderBar } from './HeaderBar'
import { MENU_ROW_BUTTON, NAV_LINK_CLASSES, PANEL_ROW } from './headerClasses'
import { MainNav } from './MainNav'
import { SAFE_AREA_X } from './safeArea'
import { AccountNavItems } from './UserMenu'

const DIALOG_CLASSES = [
  FULLSCREEN_DIALOG_CLASSES,
  'p-0',
  SAFE_AREA_X,
  'overflow-y-auto overscroll-contain backdrop:bg-black/50',
]

const PANEL_CLASSES =
  'max-h-[calc(100dvh_-_4rem_-_env(safe-area-inset-top)_-_env(safe-area-inset-bottom))] overflow-y-auto overscroll-contain bg-white px-4 py-4 shadow-header md:px-6'

interface MenuPanelProps {
  dialogId: string
  isOpen: boolean
  onClose: () => void
}

function GuestItems(): JSX.Element {
  const { open } = useAuthModal()

  return (
    <ul>
      <li>
        <button
          type="button"
          onClick={() => open('login')}
          className={cn(NAV_LINK_CLASSES.idle, MENU_ROW_BUTTON, PANEL_ROW)}
        >
          {HEADER_TEXT.logIn}
        </button>
      </li>
    </ul>
  )
}

export function MenuPanel({ dialogId, isOpen, onClose }: MenuPanelProps): JSX.Element {
  const { isAuthenticated } = useAuth()
  const { isOpenRef, dialogEvents } = useDialogCloseEvents(onClose)
  const homeLinkRef = useRef<HTMLAnchorElement>(null)

  useLayoutEffect(() => {
    if (isOpen) homeLinkRef.current?.focus()
  }, [isOpen])

  return (
    <dialog
      id={dialogId}
      aria-label={HEADER_TEXT.menuDialog}
      className={cn(DIALOG_CLASSES)}
      {...dialogEvents}
    >
      <DialogController dialogId={dialogId} isOpen={isOpen} isOpenRef={isOpenRef} />
      {isOpen && (
        <>
          <div className="bg-white pt-[env(safe-area-inset-top)]">
            <HeaderBar
              menuControl={<CloseButton label={HEADER_TEXT.closeMenu} onClick={onClose} />}
            />
          </div>
          <div className={PANEL_CLASSES}>
            <MainNav orientation="column" firstLinkRef={homeLinkRef} />
            <hr className="my-2 border-light-medium" />
            {isAuthenticated ? <AccountNavItems itemClassName={PANEL_ROW} /> : <GuestItems />}
          </div>
        </>
      )}
    </dialog>
  )
}
