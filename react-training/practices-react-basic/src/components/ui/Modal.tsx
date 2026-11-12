import { useId, useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { CloseButton } from '@/components/ui/CloseButton'
import { MODAL_ERRORS } from '@/components/ui/modalErrors'
import {
  DialogController,
  FULLSCREEN_DIALOG_CLASSES,
  useDialogCloseEvents,
} from '@/components/ui/nativeDialog'
import { cn } from '@/utils/cn'
import type { ReactNode } from 'react'

const CLOSE_LABEL = 'Close dialog'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not(:disabled)',
  'input:not(:disabled)',
  'select:not(:disabled)',
  'textarea:not(:disabled)',
  '[tabindex]',
]
  .map((selector) => `${selector}:not([tabindex="-1"])`)
  .join(', ')

const DIALOG_CLASSES = [
  FULLSCREEN_DIALOG_CLASSES,
  'items-center justify-center overflow-y-auto overscroll-contain open:flex',
  'pt-[calc(16px_+_env(safe-area-inset-top))] pr-[calc(16px_+_env(safe-area-inset-right))]',
  'pb-[calc(16px_+_env(safe-area-inset-bottom))] pl-[calc(16px_+_env(safe-area-inset-left))]',
  'backdrop:bg-black/50',
]

const PANEL_CLASSES =
  'flex max-h-[calc(100dvh_-_32px_-_env(safe-area-inset-top)_-_env(safe-area-inset-bottom))] w-full flex-col gap-4 bg-white p-6 shadow-header md:max-w-[480px]'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  className?: string
}

function focusFirstControl(panel: HTMLElement | null): void {
  if (!panel || panel.contains(document.activeElement)) return
  panel.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus()
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps): JSX.Element {
  const dialogId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const { isOpenRef, dialogEvents } = useDialogCloseEvents(onClose)

  useLayoutEffect(() => {
    if (isOpen) focusFirstControl(panelRef.current)
  }, [isOpen])

  if (title.trim() === '') throw new Error(MODAL_ERRORS.emptyTitle)

  return createPortal(
    <dialog
      id={dialogId}
      aria-modal="true"
      aria-labelledby={titleId}
      className={cn(DIALOG_CLASSES)}
      {...dialogEvents}
    >
      <DialogController dialogId={dialogId} isOpen={isOpen} isOpenRef={isOpenRef} />
      {isOpen && (
        <div ref={panelRef} className={cn(PANEL_CLASSES, className)}>
          <div className="flex items-center justify-between gap-4">
            <h2 id={titleId} className="font-heading text-h4 font-bold text-dark">
              {title}
            </h2>
            <CloseButton label={CLOSE_LABEL} onClick={onClose} />
          </div>
          <div className="-m-1 min-h-0 overflow-y-auto overscroll-contain p-1">{children}</div>
        </div>
      )}
    </dialog>,
    document.body
  )
}
