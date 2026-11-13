import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { Modal } from '@/components/ui/Modal'
import { useToastStore } from '@/stores/toastStore'
import { installDialogStub } from '@/test/dialogStub'
import { Toaster } from './Toaster'
import type { ToastType } from '@/types'

const CLOSE_LABEL = 'Close notification'

beforeAll(() => {
  installDialogStub()
})

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  const { toasts, removeToast } = useToastStore.getState()
  act(() => toasts.forEach((toast) => removeToast(toast.id)))
  vi.clearAllTimers()
  vi.useRealTimers()
})

function addToast(type: ToastType, message: string): string {
  let id = ''
  act(() => {
    id = useToastStore.getState().addToast(type, message)
  })
  flushAnnouncements()
  return id
}

function flushAnnouncements(): void {
  act(() => {
    vi.advanceTimersByTime(0)
  })
}

function firePointer(
  target: HTMLElement,
  type: 'pointerover' | 'pointerout',
  pointerType: string
): void {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true })
  Object.defineProperty(event, 'pointerType', { value: pointerType })
  fireEvent(target, event)
}

function advance(ms: number): void {
  act(() => {
    vi.advanceTimersByTime(ms)
  })
}

function stack(): HTMLElement | null {
  return screen.queryByRole('region', { name: 'Notifications' })
}

function visibleMessages(): string[] {
  const element = stack()
  if (!element) return []
  return Array.from(element.querySelectorAll('p')).map((p) => p.textContent ?? '')
}

function regionTexts(region: HTMLElement): string[] {
  return Array.from(region.querySelectorAll('p')).map((p) => p.textContent ?? '')
}

function toastText(message: string): HTMLElement {
  const element = stack()
  if (!element) throw new Error('stack not rendered')
  return within(element).getByText(message)
}

function closeButtons(): HTMLElement[] {
  return screen.queryAllByRole('button', { name: CLOSE_LABEL })
}

function renderWithModal(isOpen: boolean, onClose = vi.fn()) {
  const view = render(
    <>
      <Toaster />
      <Modal isOpen={isOpen} onClose={onClose} title="Preview dialog">
        <p>Body</p>
      </Modal>
    </>
  )
  function setOpen(next: boolean): void {
    view.rerender(
      <>
        <Toaster />
        <Modal isOpen={next} onClose={onClose} title="Preview dialog">
          <p>Body</p>
        </Modal>
      </>
    )
  }
  return { ...view, setOpen, onClose }
}

function dialog(): HTMLDialogElement {
  const element = document.querySelector('dialog')
  if (!(element instanceof HTMLDialogElement)) throw new Error('dialog not rendered')
  return element
}

describe('Toaster visual list', () => {
  it('shows every toast message from the store in store order', () => {
    render(<Toaster />)
    addToast('success', 'Added to cart')
    addToast('error', 'Order failed, please try again')
    addToast('info', 'You have been logged out')

    expect(visibleMessages()).toEqual([
      'Added to cart',
      'Order failed, please try again',
      'You have been logged out',
    ])
  })

  it('renders no visual stack when there are no toasts', () => {
    render(<Toaster />)

    expect(stack()).toBeNull()
    expect(closeButtons()).toHaveLength(0)
  })
})

describe('Toaster announcer', () => {
  it('keeps the status and alert regions mounted when there are no toasts', () => {
    render(<Toaster />)

    expect(screen.getByRole('status')).toBeEmptyDOMElement()
    expect(screen.getByRole('alert')).toBeEmptyDOMElement()
    expect(screen.getByRole('status')).toHaveClass('sr-only')
    expect(screen.getByRole('alert')).toHaveClass('sr-only')
  })

  it('puts no live role on the visible toasts', () => {
    render(<Toaster />)
    addToast('success', 'Added to cart')
    addToast('error', 'Order failed, please try again')

    const visible = stack()
    expect(visible).not.toBeNull()
    expect(visible?.querySelectorAll('[role], [aria-live]')).toHaveLength(0)
  })

  it('announces success and info messages in the status region', () => {
    render(<Toaster />)
    addToast('success', 'Added to cart')
    addToast('info', 'You have been logged out')

    expect(regionTexts(screen.getByRole('status'))).toEqual([
      'Added to cart',
      'You have been logged out',
    ])
  })

  it('announces error messages only in the alert region', () => {
    render(<Toaster />)
    addToast('error', 'Order failed, please try again')

    expect(regionTexts(screen.getByRole('alert'))).toEqual(['Order failed, please try again'])
    expect(regionTexts(screen.getByRole('status'))).toEqual([])
  })

  it('adds the message to a region that was already in the page', () => {
    render(<Toaster />)
    const statusBefore = screen.getByRole('status')

    addToast('success', 'Added to cart')

    expect(screen.getByRole('status')).toBe(statusBefore)
    expect(regionTexts(statusBefore)).toEqual(['Added to cart'])
  })

  it('never puts the close button name in a live region', () => {
    render(<Toaster />)
    addToast('success', 'Added to cart')
    addToast('error', 'Order failed, please try again')

    expect(screen.getByRole('status')).not.toHaveTextContent(CLOSE_LABEL)
    expect(screen.getByRole('alert')).not.toHaveTextContent(CLOSE_LABEL)
    expect(within(screen.getByRole('status')).queryByRole('button')).toBeNull()
  })

  it('announces the same message again for a new toast', () => {
    render(<Toaster />)
    addToast('success', 'Added to cart')
    addToast('success', 'Added to cart')

    expect(regionTexts(screen.getByRole('status'))).toEqual(['Added to cart', 'Added to cart'])
  })

  it('removes the entry from the region when the toast closes', () => {
    render(<Toaster />)
    const id = addToast('success', 'Added to cart')

    act(() => useToastStore.getState().removeToast(id))

    expect(regionTexts(screen.getByRole('status'))).toEqual([])
  })
})

describe('Toaster close and timing', () => {
  it('removes the toast when its close button is clicked', () => {
    render(<Toaster />)
    addToast('success', 'Added to cart')

    fireEvent.click(screen.getByRole('button', { name: CLOSE_LABEL }))

    expect(visibleMessages()).toEqual([])
    expect(useToastStore.getState().toasts).toEqual([])
  })

  it('keeps the other toasts and their auto-close timers when one is closed', () => {
    render(<Toaster />)
    addToast('success', 'one')
    addToast('success', 'two')

    fireEvent.click(closeButtons()[0])
    expect(visibleMessages()).toEqual(['two'])

    advance(5000)
    expect(visibleMessages()).toEqual([])
  })

  it('removes a success toast from the screen after 5 seconds', () => {
    render(<Toaster />)
    addToast('success', 'Added to cart')

    advance(4999)
    expect(visibleMessages()).toEqual(['Added to cart'])
    advance(1)
    expect(visibleMessages()).toEqual([])
  })

  it('still shows an error toast at 5 seconds', () => {
    render(<Toaster />)
    addToast('error', 'Order failed, please try again')

    advance(5000)

    expect(visibleMessages()).toEqual(['Order failed, please try again'])
  })
})

describe('Toaster focus and hover', () => {
  function renderWithOutsideButton() {
    return render(
      <>
        <button type="button">Outside</button>
        <Toaster />
      </>
    )
  }

  it('does not move focus when a toast appears', () => {
    renderWithOutsideButton()
    const outside = screen.getByRole('button', { name: 'Outside' })
    act(() => outside.focus())

    addToast('success', 'Added to cart')

    expect(outside).toHaveFocus()
  })

  it('does not move focus when a toast closes by its timer', () => {
    renderWithOutsideButton()
    const outside = screen.getByRole('button', { name: 'Outside' })
    act(() => outside.focus())
    addToast('success', 'Added to cart')

    advance(5000)

    expect(outside).toHaveFocus()
  })

  it('pauses a toast while its close button has focus', () => {
    renderWithOutsideButton()
    addToast('success', 'Added to cart')

    act(() => screen.getByRole('button', { name: CLOSE_LABEL }).focus())
    advance(60000)

    expect(visibleMessages()).toEqual(['Added to cart'])
  })

  it('closes it after the remaining time once focus leaves', () => {
    renderWithOutsideButton()
    addToast('success', 'Added to cart')
    advance(2000)
    act(() => screen.getByRole('button', { name: CLOSE_LABEL }).focus())
    advance(10000)

    act(() => screen.getByRole('button', { name: 'Outside' }).focus())

    advance(2999)
    expect(visibleMessages()).toEqual(['Added to cart'])
    advance(1)
    expect(visibleMessages()).toEqual([])
  })

  it('pauses a toast while a mouse pointer is over it', () => {
    render(<Toaster />)
    addToast('success', 'Added to cart')
    const toast = toastText('Added to cart')

    firePointer(toast, 'pointerover', 'mouse')
    advance(60000)
    expect(visibleMessages()).toEqual(['Added to cart'])

    firePointer(toast, 'pointerout', 'mouse')
    advance(5000)
    expect(visibleMessages()).toEqual([])
  })

  it('does not pause for a touch pointer', () => {
    render(<Toaster />)
    addToast('success', 'Added to cart')

    const toast = toastText('Added to cart')

    firePointer(toast, 'pointerover', 'touch')
    advance(4999)
    expect(useToastStore.getState().toasts).toHaveLength(1)
    advance(1)

    expect(visibleMessages()).toEqual([])
  })
})

describe('Toaster position', () => {
  it('uses the top-center stack classes with the safe-area top below md', () => {
    render(<Toaster />)
    addToast('success', 'Added to cart')

    expect(stack()).toHaveClass(
      'fixed',
      'z-50',
      'inset-x-4',
      'top-[calc(16px_+_env(safe-area-inset-top))]',
      'gap-2',
      'md:left-auto',
      'md:right-6',
      'md:w-[360px]'
    )
  })

  it('lets clicks pass through the empty stack area but not the toasts', () => {
    render(<Toaster />)
    addToast('success', 'Added to cart')

    expect(stack()).toHaveClass('pointer-events-none')
    expect(toastText('Added to cart').parentElement).toHaveClass('pointer-events-auto')
  })
})

describe('Toaster above an open modal', () => {
  it('renders the stack and regions inside the open modal dialog', () => {
    renderWithModal(true)
    addToast('success', 'Added to cart')

    expect(dialog()).toContainElement(stack())
    expect(dialog()).toContainElement(screen.getByRole('status'))
    expect(dialog()).toContainElement(screen.getByRole('alert'))
  })

  it('renders them in document.body again after the modal closes', () => {
    const { setOpen } = renderWithModal(true)
    addToast('success', 'Added to cart')

    setOpen(false)

    expect(dialog()).not.toContainElement(stack())
    expect(stack()?.parentElement).toBe(document.body)
    expect(screen.getByRole('status').parentElement).toBe(document.body)
  })

  it('announces a toast added while the modal is open', () => {
    renderWithModal(true)

    addToast('success', 'Added to cart')

    expect(regionTexts(within(dialog()).getByRole('status'))).toEqual(['Added to cart'])
  })

  it('does not announce again the toasts shown before the host move', () => {
    const { setOpen } = renderWithModal(false)
    addToast('error', 'Order failed, please try again')

    setOpen(true)

    expect(within(dialog()).getByText('Order failed, please try again')).toBeInTheDocument()
    expect(regionTexts(within(dialog()).getByRole('alert'))).toEqual([])
  })

  it('announces a toast added in the same update that closes the modal', () => {
    const { setOpen } = renderWithModal(true)

    act(() => {
      useToastStore.getState().addToast('success', 'Welcome back, Long')
      setOpen(false)
    })
    flushAnnouncements()

    const status = screen.getByRole('status')
    expect(status.parentElement).toBe(document.body)
    expect(regionTexts(status)).toEqual(['Welcome back, Long'])
  })

  it('resumes a paused toast when the stack moves to another host', () => {
    const { setOpen } = renderWithModal(false)
    addToast('success', 'Added to cart')
    advance(2000)
    act(() => screen.getByRole('button', { name: CLOSE_LABEL }).focus())

    setOpen(true)

    advance(3000)
    expect(visibleMessages()).toEqual([])
  })

  it('keeps a focused toast paused while the host stays the same', () => {
    const { setOpen } = renderWithModal(false)
    addToast('success', 'Added to cart')
    act(() => screen.getByRole('button', { name: CLOSE_LABEL }).focus())

    setOpen(false)
    advance(60000)

    expect(visibleMessages()).toEqual(['Added to cart'])
  })

  it('closing a toast inside an open modal does not call the modal onClose', () => {
    const { onClose } = renderWithModal(true)
    addToast('success', 'Added to cart')

    const button = within(dialog()).getByRole('button', { name: CLOSE_LABEL })
    fireEvent.mouseDown(button)
    fireEvent.click(button)

    expect(onClose).not.toHaveBeenCalled()
    expect(visibleMessages()).toEqual([])
  })
})
