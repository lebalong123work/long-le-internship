import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { installDialogStub } from '@/test/dialogStub'
import { Modal } from './Modal'
import { MODAL_ERRORS } from './modalErrors'
import type { ReactNode } from 'react'

const TITLE = 'Preview dialog'

beforeAll(() => {
  installDialogStub()
})

function renderModal(
  props: { isOpen?: boolean; onClose?: () => void; title?: string; children?: ReactNode } = {}
) {
  const onClose = props.onClose ?? vi.fn()
  const view = render(
    <Modal isOpen={props.isOpen ?? true} onClose={onClose} title={props.title ?? TITLE}>
      {props.children ?? <input aria-label="Email" />}
    </Modal>
  )
  return { ...view, onClose }
}

function getDialog(): HTMLDialogElement {
  const dialog = document.querySelector('dialog')
  if (!(dialog instanceof HTMLDialogElement)) throw new Error('dialog not rendered')
  return dialog
}

function getPanel(): HTMLElement {
  const panel = getDialog().firstElementChild
  if (!(panel instanceof HTMLElement)) throw new Error('panel not rendered')
  return panel
}

describe('Modal open / closed', () => {
  it('opens the dialog as a modal in document.body when open', () => {
    renderModal()

    const dialog = getDialog()
    expect(dialog.parentElement).toBe(document.body)
    expect(dialog.open).toBe(true)
  })

  it('keeps the dialog closed and empty when closed', () => {
    renderModal({ isOpen: false })

    const dialog = getDialog()
    expect(dialog.open).toBe(false)
    expect(dialog).toBeEmptyDOMElement()
  })
})

describe('Modal semantics', () => {
  it('is a modal dialog named by its title', () => {
    renderModal()

    const dialog = screen.getByRole('dialog', { name: TITLE })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog.getAttribute('aria-labelledby')).toBe(
      screen.getByRole('heading', { name: TITLE }).id
    )
  })

  it('gives each modal its own title id', () => {
    render(
      <>
        <Modal isOpen onClose={vi.fn()} title="First">
          <p>One</p>
        </Modal>
        <Modal isOpen onClose={vi.fn()} title="Second">
          <p>Two</p>
        </Modal>
      </>
    )

    const ids = screen.getAllByRole('heading').map((heading) => heading.id)
    expect(new Set(ids).size).toBe(2)
  })
})

describe('Modal title check', () => {
  it('shows the title text as the dialog heading', () => {
    renderModal()

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(TITLE)
  })

  it('throws when the title is empty or only spaces', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const silenceJsdomReport = (event: ErrorEvent): void => event.preventDefault()
    window.addEventListener('error', silenceJsdomReport)

    expect(() => renderModal({ title: '' })).toThrow(MODAL_ERRORS.emptyTitle)
    expect(() => renderModal({ title: '   ' })).toThrow(MODAL_ERRORS.emptyTitle)

    window.removeEventListener('error', silenceJsdomReport)
    consoleError.mockRestore()
  })
})

describe('Modal close button', () => {
  it('calls onClose once when the close button is clicked', async () => {
    const { onClose } = renderModal()

    await userEvent.click(screen.getByRole('button', { name: 'Close dialog' }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose on a click inside the panel', async () => {
    const { onClose } = renderModal()

    await userEvent.click(screen.getByRole('heading', { name: TITLE }))

    expect(onClose).not.toHaveBeenCalled()
  })

  it('names the close button Close dialog', () => {
    renderModal()

    expect(screen.getByRole('button', { name: 'Close dialog' })).toBeInTheDocument()
  })

  it('close button inside a form does not submit it', async () => {
    const onSubmit = vi.fn((event: { preventDefault: () => void }) => event.preventDefault())
    render(
      <form onSubmit={onSubmit}>
        <Modal isOpen onClose={vi.fn()} title={TITLE}>
          <p>Body</p>
        </Modal>
      </form>
    )

    const closeButton = screen.getByRole('button', { name: 'Close dialog' })
    await userEvent.click(closeButton)

    expect(closeButton).toHaveAttribute('type', 'button')
    expect(onSubmit).not.toHaveBeenCalled()
  })
})

describe('Modal Escape (cancel)', () => {
  it('calls onClose once on the dialog cancel event', () => {
    const { onClose } = renderModal()

    fireEvent(getDialog(), new Event('cancel', { cancelable: true }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('keeps the dialog open after cancel until isOpen is false', () => {
    renderModal()
    const dialog = getDialog()
    const cancel = new Event('cancel', { cancelable: true })

    fireEvent(dialog, cancel)

    expect(cancel.defaultPrevented).toBe(true)
    expect(dialog.open).toBe(true)
  })

  it('calls onClose once when the browser sends a non-cancelable cancel', () => {
    const { onClose } = renderModal()
    const dialog = getDialog()

    fireEvent(dialog, new Event('cancel', { cancelable: false }))
    dialog.close()

    expect(onClose).toHaveBeenCalledTimes(1)
  })
})

describe('Modal native close', () => {
  it('calls onClose when the browser closes the dialog while open', () => {
    const { onClose } = renderModal()

    getDialog().close()

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose when closing because isOpen became false', () => {
    const onClose = vi.fn()
    const { rerender } = renderModal({ onClose })

    rerender(
      <Modal isOpen={false} onClose={onClose} title={TITLE}>
        <input aria-label="Email" />
      </Modal>
    )

    expect(getDialog().open).toBe(false)
    expect(onClose).not.toHaveBeenCalled()
  })
})

describe('Modal backdrop click', () => {
  it('calls onClose once on a backdrop click', () => {
    const { onClose } = renderModal()
    const dialog = getDialog()

    fireEvent.mouseDown(dialog)
    fireEvent.click(dialog)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose when a press starts in the panel and ends on the backdrop', () => {
    const { onClose } = renderModal()

    fireEvent.mouseDown(getPanel())
    fireEvent.click(getDialog())

    expect(onClose).not.toHaveBeenCalled()
  })
})

describe('Modal focus on open', () => {
  it('moves focus to the first focusable element when it opens', () => {
    renderModal()

    expect(screen.getByRole('button', { name: 'Close dialog' })).toHaveFocus()
  })

  it('moves focus to the autofocus element when one is given', () => {
    renderModal({ children: <input aria-label="Email" autoFocus /> })

    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveFocus()
  })
})

describe('Modal unmount fallback', () => {
  it('returns focus to the opener when unmounted while open', () => {
    render(<button type="button">Open</button>)
    const opener = screen.getByRole('button', { name: 'Open' })
    opener.focus()
    const { unmount } = renderModal()

    unmount()

    expect(opener).toHaveFocus()
  })

  it('does not throw when the opener was removed before unmount', () => {
    const { container } = render(<button type="button">Open</button>)
    const opener = screen.getByRole('button', { name: 'Open' })
    opener.focus()
    const { unmount } = renderModal()
    container.remove()

    expect(() => unmount()).not.toThrow()
    expect(opener).not.toHaveFocus()
  })
})

describe('Modal layout classes', () => {
  it('panel max height uses 100dvh and the safe-area insets', () => {
    renderModal()

    expect(getPanel()).toHaveClass(
      'max-h-[calc(100dvh_-_32px_-_env(safe-area-inset-top)_-_env(safe-area-inset-bottom))]'
    )
  })

  it('dialog and panel content use overscroll containment', () => {
    renderModal()

    expect(getDialog()).toHaveClass('overflow-y-auto', 'overscroll-contain')
    expect(getPanel().lastElementChild).toHaveClass(
      'overflow-y-auto',
      'overscroll-contain',
      '-m-1',
      'p-1'
    )
  })
})
