import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CloseButton } from './CloseButton'
import { FOCUS_RING, HOVER_OPACITY } from './interactionClasses'
import type { FormEvent } from 'react'

const LABEL = 'Close notification'

describe('CloseButton', () => {
  it('names the button by its label', () => {
    render(<CloseButton label={LABEL} onClick={vi.fn()} />)

    expect(screen.getByRole('button', { name: LABEL })).toBeInTheDocument()
  })

  it('is type button so it never submits a form', async () => {
    const onSubmit = vi.fn((event: FormEvent) => event.preventDefault())
    render(
      <form onSubmit={onSubmit}>
        <CloseButton label={LABEL} onClick={vi.fn()} />
      </form>
    )

    await userEvent.click(screen.getByRole('button', { name: LABEL }))

    expect(screen.getByRole('button', { name: LABEL })).toHaveAttribute('type', 'button')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('calls onClick once per click', async () => {
    const onClick = vi.fn()
    render(<CloseButton label={LABEL} onClick={onClick} />)

    await userEvent.click(screen.getByRole('button', { name: LABEL }))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('shows only a decorative icon with empty alt', () => {
    render(<CloseButton label={LABEL} onClick={vi.fn()} />)
    const icon = screen.getByRole('button', { name: LABEL }).querySelector('img')

    expect(icon).toHaveAttribute('src', '/icons/close.svg')
    expect(icon).toHaveAttribute('alt', '')
    expect(icon).toHaveClass('size-6')
  })

  it('uses the shared focus ring and hover classes', () => {
    render(<CloseButton label={LABEL} onClick={vi.fn()} />)

    expect(screen.getByRole('button', { name: LABEL })).toHaveClass(
      'size-10',
      ...FOCUS_RING.split(' '),
      ...HOVER_OPACITY.split(' ')
    )
  })
})
