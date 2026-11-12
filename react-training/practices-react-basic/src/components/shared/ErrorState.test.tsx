import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { UI_STATE_MESSAGES } from '@/constants/uiStateMessages'
import { ErrorState } from './ErrorState'

const CUSTOM_MESSAGE = '  Could not load the products.'

function retryButton(): HTMLElement {
  return screen.getByRole('button', { name: UI_STATE_MESSAGES.retry })
}

describe('ErrorState message', () => {
  it('shows the default message when no message is given', () => {
    render(<ErrorState onRetry={vi.fn()} />)

    expect(screen.getByText(UI_STATE_MESSAGES.errorDefault)).toBeInTheDocument()
  })

  it.each(['', '   '])('shows the default message for a blank message (%j)', (message) => {
    render(<ErrorState onRetry={vi.fn()} message={message} />)

    expect(screen.getByRole('alert')).toHaveTextContent(UI_STATE_MESSAGES.errorDefault)
  })

  it('shows the given message as written', () => {
    render(<ErrorState onRetry={vi.fn()} message={CUSTOM_MESSAGE} />)

    expect(screen.getByRole('alert').textContent).toBe(CUSTOM_MESSAGE)
  })

  it('does not show the default message when a message is given', () => {
    render(<ErrorState onRetry={vi.fn()} message={CUSTOM_MESSAGE} />)

    expect(screen.queryByText(UI_STATE_MESSAGES.errorDefault)).toBeNull()
  })
})

describe('ErrorState retry', () => {
  it('calls onRetry once per click on Try again', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    render(<ErrorState onRetry={onRetry} />)

    await user.click(retryButton())
    expect(onRetry).toHaveBeenCalledTimes(1)
    expect(onRetry).toHaveBeenCalledWith()

    await user.click(retryButton())
    expect(onRetry).toHaveBeenCalledTimes(2)
  })

  it('does not call onRetry before Try again is clicked', () => {
    const onRetry = vi.fn()
    render(<ErrorState onRetry={onRetry} />)

    expect(onRetry).not.toHaveBeenCalled()
  })

  it('calls onRetry once when Try again is activated with Enter', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    render(<ErrorState onRetry={onRetry} />)

    retryButton().focus()
    await user.keyboard('{Enter}')

    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('does not call onRetry for other keys on Try again', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    render(<ErrorState onRetry={onRetry} />)

    retryButton().focus()
    await user.keyboard('a{Escape}{ArrowDown}')

    expect(onRetry).not.toHaveBeenCalled()
  })
})

describe('ErrorState retrying', () => {
  it('keeps Try again focusable with a spinner, aria-busy and aria-disabled while retrying', async () => {
    const user = userEvent.setup()
    render(<ErrorState onRetry={vi.fn()} isRetrying />)

    await user.tab()

    const button = retryButton()
    expect(button).toHaveFocus()
    expect(button).toBeEnabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(button).toHaveAttribute('aria-disabled', 'true')
    expect(button).toHaveClass('aria-disabled:opacity-50', 'aria-disabled:cursor-not-allowed')
    expect(button.querySelector('.animate-spin')).not.toBeNull()
  })

  it('ignores click, Enter and Space while retrying', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    render(<ErrorState onRetry={onRetry} isRetrying />)

    await user.click(retryButton())
    retryButton().focus()
    await user.keyboard('{Enter}')
    await user.keyboard(' ')

    expect(retryButton()).toHaveFocus()
    expect(onRetry).not.toHaveBeenCalled()
  })
})

describe('ErrorState announcement', () => {
  it('puts only the message in one alert region', () => {
    render(<ErrorState onRetry={vi.fn()} />)

    const alerts = screen.getAllByRole('alert')
    expect(alerts).toHaveLength(1)
    expect(alerts[0].textContent).toBe(UI_STATE_MESSAGES.errorDefault)
  })

  it('keeps the Try again button outside the alert region', () => {
    render(<ErrorState onRetry={vi.fn()} />)

    expect(screen.getByRole('alert')).not.toContainElement(retryButton())
  })
})

describe('ErrorState className', () => {
  it('adds the caller className to the wrapper', () => {
    const { container } = render(<ErrorState onRetry={vi.fn()} className="min-h-40" />)

    expect(container.firstElementChild).toHaveClass('min-h-40', 'flex', 'gap-6', 'py-10')
  })

  it('replaces a conflicting default class instead of keeping both', () => {
    const { container } = render(<ErrorState onRetry={vi.fn()} className="py-6" />)

    expect(container.firstElementChild).toHaveClass('py-6')
    expect(container.firstElementChild).not.toHaveClass('py-10')
  })
})
