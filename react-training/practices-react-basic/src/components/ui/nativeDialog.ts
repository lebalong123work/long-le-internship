import { useLayoutEffect, useRef } from 'react'
import { clearTopLayerHost, setTopLayerHost } from '@/components/ui/topLayer'
import type { MouseEvent, MutableRefObject, SyntheticEvent } from 'react'

export const FULLSCREEN_DIALOG_CLASSES =
  'fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none border-0 bg-transparent'

interface DialogControllerProps {
  dialogId: string
  isOpen: boolean
  isOpenRef: MutableRefObject<boolean>
}

interface DialogCloseEvents {
  onCancel: (event: SyntheticEvent<HTMLDialogElement>) => void
  onClose: () => void
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

export function DialogController({ dialogId, isOpen, isOpenRef }: DialogControllerProps): null {
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
    setTopLayerHost(dialog)

    return () => {
      isOpenRef.current = false
      clearTopLayerHost(dialog)
      if (dialog.open) dialog.close()
      if (isUnmountingRef.current && opener?.isConnected) opener.focus()
    }
  }, [dialogId, isOpen, isOpenRef])

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
