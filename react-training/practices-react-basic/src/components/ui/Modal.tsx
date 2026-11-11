import { useId, useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { FOCUS_RING, HOVER_OPACITY } from '@/components/ui/interactionClasses'
import { MODAL_ERRORS } from '@/components/ui/modalErrors'
import { cn } from '@/utils/cn'
import type { MouseEvent, MutableRefObject, ReactNode, SyntheticEvent } from 'react'

const CLOSE_LABEL = 'Close dialog'

const CLOSE_ICON = '/icons/close.svg'

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
  'fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none border-0 bg-transparent',
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

interface DialogControllerProps {
  dialogId: string
  isOpen: boolean
  isOpenRef: MutableRefObject<boolean>
}

function activeHtmlElement(): HTMLElement | null {
  const active = document.activeElement
  return active instanceof HTMLElement ? active : null
}

function DialogController({ dialogId, isOpen, isOpenRef }: DialogControllerProps): null {
  const isUnmountingRef = useRef(false)

  useLayoutEffect(() => {
    isUnmountingRef.current = false
    return () => {
      isUnmountingRef.current = true
    }
  }, [])

  useLayoutEffect(() => {
    const dialog = document.getElementById(dialogId)
    if (!(dialog instanceof HTMLDialogElement) || !isOpen) return
    const opener = activeHtmlElement()
    isOpenRef.current = true
    if (!dialog.open) dialog.showModal()

    return () => {
      isOpenRef.current = false
      if (dialog.open) dialog.close()
      if (isUnmountingRef.current && opener?.isConnected) opener.focus()
    }
  }, [dialogId, isOpen, isOpenRef])

  return null
}

function focusFirstControl(panel: HTMLElement | null): void {
  if (!panel || panel.contains(document.activeElement)) return
  panel.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus()
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps): JSX.Element {
  const dialogId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const isOpenRef = useRef(false)
  const pressStartedOnBackdropRef = useRef(false)
  const titleId = useId()

  useLayoutEffect(() => {
    if (isOpen) focusFirstControl(panelRef.current)
  }, [isOpen])

  if (title.trim() === '') throw new Error(MODAL_ERRORS.emptyTitle)

  function handleCancel(event: SyntheticEvent<HTMLDialogElement>): void {
    if (!event.cancelable) return
    event.preventDefault()
    onClose()
  }

  function handleNativeClose(): void {
    if (isOpenRef.current) onClose()
  }

  function handleMouseDown(event: MouseEvent<HTMLDialogElement>): void {
    pressStartedOnBackdropRef.current = event.target === event.currentTarget
  }

  function handleClick(event: MouseEvent<HTMLDialogElement>): void {
    const isBackdropClick =
      pressStartedOnBackdropRef.current && event.target === event.currentTarget
    pressStartedOnBackdropRef.current = false
    if (isBackdropClick) onClose()
  }

  return createPortal(
    <dialog
      id={dialogId}
      aria-modal="true"
      aria-labelledby={titleId}
      className={cn(DIALOG_CLASSES)}
      onCancel={handleCancel}
      onClose={handleNativeClose}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      <DialogController dialogId={dialogId} isOpen={isOpen} isOpenRef={isOpenRef} />
      {isOpen && (
        <div ref={panelRef} className={cn(PANEL_CLASSES, className)}>
          <div className="flex items-center justify-between gap-4">
            <h2 id={titleId} className="font-heading text-h4 font-bold text-dark">
              {title}
            </h2>
            <button
              type="button"
              aria-label={CLOSE_LABEL}
              onClick={onClose}
              className={cn(
                'inline-flex size-10 shrink-0 items-center justify-center',
                FOCUS_RING,
                HOVER_OPACITY
              )}
            >
              <img src={CLOSE_ICON} alt="" className="size-6" />
            </button>
          </div>
          <div className="-m-1 min-h-0 overflow-y-auto overscroll-contain p-1">{children}</div>
        </div>
      )}
    </dialog>,
    document.body
  )
}
