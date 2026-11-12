import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { UI_STATE_ERRORS } from '@/constants/uiStateMessages'
import { EmptyState } from './EmptyState'
import type { ComponentProps } from 'react'

type EmptyStateProps = ComponentProps<typeof EmptyState>

const ICON = '/icons/cart.svg'
const MESSAGE = 'Your cart is empty'
const ACTION = { label: 'Shop Now', to: '/shop' }

function renderEmptyState(props: Partial<EmptyStateProps> = {}) {
  return render(
    <MemoryRouter initialEntries={['/cart']}>
      <Routes>
        <Route path="/cart" element={<EmptyState iconSrc={ICON} message={MESSAGE} {...props} />} />
        <Route path={ACTION.to} element={<p>Shop page</p>} />
      </Routes>
    </MemoryRouter>
  )
}

function silenceRenderErrors(): () => void {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  const silenceJsdomReport = (event: ErrorEvent): void => event.preventDefault()
  window.addEventListener('error', silenceJsdomReport)
  return () => {
    window.removeEventListener('error', silenceJsdomReport)
    consoleError.mockRestore()
  }
}

describe('EmptyState content', () => {
  it('shows the message', () => {
    renderEmptyState()

    expect(screen.getByText(MESSAGE)).toBeInTheDocument()
  })

  it('shows the icon as a decorative image with the given src', () => {
    const { container } = renderEmptyState()

    const icon = container.querySelector('img')
    expect(icon).toHaveAttribute('src', ICON)
    expect(icon).toHaveAttribute('alt', '')
    expect(screen.queryByRole('img')).toBeNull()
  })
})

describe('EmptyState checks', () => {
  let restore: () => void

  beforeEach(() => {
    restore = silenceRenderErrors()
  })

  afterEach(() => {
    restore()
  })

  it.each(['', '   '])(
    'throws UI_STATE_ERRORS.emptyMessage for a blank message (%j)',
    (message) => {
      expect(() => renderEmptyState({ message })).toThrow(UI_STATE_ERRORS.emptyMessage)
    }
  )

  it.each(['', '   '])(
    'throws UI_STATE_ERRORS.emptyIconSrc for a blank iconSrc (%j)',
    (iconSrc) => {
      expect(() => renderEmptyState({ iconSrc })).toThrow(UI_STATE_ERRORS.emptyIconSrc)
    }
  )

  it.each([
    { label: '', to: ACTION.to },
    { label: '   ', to: ACTION.to },
    { label: ACTION.label, to: '' },
    { label: ACTION.label, to: '   ' },
  ])('throws UI_STATE_ERRORS.emptyAction for a blank label or path (%j)', (action) => {
    expect(() => renderEmptyState({ action })).toThrow(UI_STATE_ERRORS.emptyAction)
  })
})

describe('EmptyState action', () => {
  it('renders the action as a link that opens its path', async () => {
    const user = userEvent.setup()
    renderEmptyState({ action: ACTION })

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', ACTION.to)

    await user.click(link)
    expect(screen.getByText('Shop page')).toBeInTheDocument()
  })

  it('renders no link or button without an action', () => {
    renderEmptyState()

    expect(screen.queryByRole('link')).toBeNull()
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('names the link with the action label', () => {
    renderEmptyState({ action: ACTION })

    expect(screen.getByRole('link', { name: ACTION.label })).toBeInTheDocument()
  })
})

describe('EmptyState announcement', () => {
  it('renders no alert or status region', () => {
    renderEmptyState({ action: ACTION })

    expect(screen.queryByRole('alert')).toBeNull()
    expect(screen.queryByRole('status')).toBeNull()
  })
})

describe('EmptyState className', () => {
  it('adds the caller className to the wrapper', () => {
    renderEmptyState({ className: 'min-h-40' })

    expect(screen.getByText(MESSAGE).parentElement).toHaveClass(
      'min-h-40',
      'flex',
      'gap-6',
      'py-10'
    )
  })

  it('replaces a conflicting default class instead of keeping both', () => {
    renderEmptyState({ className: 'py-6' })

    const wrapper = screen.getByText(MESSAGE).parentElement
    expect(wrapper).toHaveClass('py-6')
    expect(wrapper).not.toHaveClass('py-10')
  })
})
