import { useLayoutEffect, useRef } from 'react'
import { clearTopLayerHost, setTopLayerHost } from '@/components/ui/topLayer'
import type { MouseEvent, MutableRefObject, SyntheticEvent } from 'react'

export const FULLSCREEN_DIALOG_CLASSES =
  'fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none border-0 bg-transparent'

export const FOCUS_FALLBACK_ATTR = 'data-focus-fallback'

interface DialogControllerProps {
  dialogId: string
  isOpen: boolean
  isOpenRef: MutableRefObject<boolean>
  returnFocus?: boolean
}

interface DialogCloseEvents {
  onCancel: (event: SyntheticEvent<HTMLDialogElement>) => void
  onClose: (event: SyntheticEvent<HTMLDialogElement>) => void
  onMouseDown: (event: MouseEvent<HTMLDialogElement>) => void
  onClick: (event: MouseEvent<HTMLDialogElement>) => void
}

interface DialogCloseState {
  isOpenRef: MutableRefObject<boolean>
  dialogEvents: DialogCloseEvents
}

function activeHtmlElement(): HTMLElement | null {
  const active = document.activeElement
  return active instanceof HTMLElement ? active : null
}

function isUsable(element: HTMLElement | null): element is HTMLElement {
  if (element === null || element === document.body) return false
  if (!element.isConnected || element.closest('[hidden]') !== null) return false
  return typeof element.checkVisibility === 'function' ? element.checkVisibility() : true
}

function isFocusLost(dialog: HTMLDialogElement): boolean {
  const active = activeHtmlElement()
  if (active === null || active === document.body) return true
  return dialog.contains(active) || !isUsable(active)
}

function restoreFocus(dialog: HTMLDialogElement, opener: HTMLElement | null): void {
  if (!isFocusLost(dialog)) return
  if (isUsable(opener)) {
    opener.focus()
    return
  }
  const fallbacks = document.querySelectorAll<HTMLElement>(`[${FOCUS_FALLBACK_ATTR}]`)
  Array.from(fallbacks).find(isUsable)?.focus()
}

export function DialogController({
  dialogId,
  isOpen,
  isOpenRef,
  returnFocus = true,
}: DialogControllerProps): null {
  useLayoutEffect(() => {
    const dialog = document.getElementById(dialogId)
    if (!(dialog instanceof HTMLDialogElement) || !isOpen) return
    const opener = activeHtmlElement()
    isOpenRef.current = true
    if (!dialog.open) dialog.showModal()
    setTopLayerHost(dialog)

    return () => {
      isOpenRef.current = false
      clearTopLayerHost(dialog)
      if (dialog.open) dialog.close()
      if (returnFocus) restoreFocus(dialog, opener)
    }
  }, [dialogId, isOpen, isOpenRef, returnFocus])

  return null
}

export function useDialogCloseEvents(onClose: () => void): DialogCloseState {
  const isOpenRef = useRef(false)
  const pressStartedOnBackdropRef = useRef(false)

  function handleCancel(event: SyntheticEvent<HTMLDialogElement>): void {
    if (!event.cancelable) return
    event.preventDefault()
    onClose()
  }

  function handleNativeClose(event: SyntheticEvent<HTMLDialogElement>): void {
    if (isOpenRef.current && !event.currentTarget.open) onClose()
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

  return {
    isOpenRef,
    dialogEvents: {
      onCancel: handleCancel,
      onClose: handleNativeClose,
      onMouseDown: handleMouseDown,
      onClick: handleClick,
    },
  }
}
