import type { MouseEvent, ReactNode } from 'react'

interface OverlayProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
}

export function Overlay({ isOpen, onClose, children }: OverlayProps) {
  if (!isOpen) {
    return null
  }

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="overlay" onClick={handleBackdropClick}>
      {children}
    </div>
  )
}
