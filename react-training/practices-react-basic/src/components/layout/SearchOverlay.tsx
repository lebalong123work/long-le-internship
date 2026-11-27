import { useLayoutEffect, useRef } from 'react'
import { CloseButton } from '@/components/ui/CloseButton'
import {
  DialogController,
  FULLSCREEN_DIALOG_CLASSES,
  useDialogCloseEvents,
} from '@/components/ui/nativeDialog'
import { HEADER_TEXT } from '@/constants/header'
import { cn } from '@/utils/cn'
import { SAFE_AREA_X } from './safeArea'
import { SearchCombobox } from './SearchCombobox'

const DIALOG_CLASSES = [
  FULLSCREEN_DIALOG_CLASSES,
  'bg-white p-0',
  SAFE_AREA_X,
  'pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]',
  'overflow-y-auto overscroll-contain',
]

interface SearchOverlayProps {
  dialogId: string
  isOpen: boolean
  onClose: () => void
  onNavigate: () => void
}

export function SearchOverlay({
  dialogId,
  isOpen,
  onClose,
  onNavigate,
}: SearchOverlayProps): JSX.Element {
  const { isOpenRef, dialogEvents } = useDialogCloseEvents(onClose)
  const inputRef = useRef<HTMLInputElement>(null)

  useLayoutEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  return (
    <dialog
      id={dialogId}
      aria-label={HEADER_TEXT.searchDialog}
      className={cn(DIALOG_CLASSES)}
      {...dialogEvents}
    >
      <DialogController
        dialogId={dialogId}
        isOpen={isOpen}
        isOpenRef={isOpenRef}
        returnFocus={false}
      />
      {isOpen && (
        <SearchCombobox
          variant="overlay"
          inputRef={inputRef}
          onNavigate={onNavigate}
          endSlot={<CloseButton label={HEADER_TEXT.closeSearch} onClick={onClose} />}
        />
      )}
    </dialog>
  )
}
