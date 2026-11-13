import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Spinner } from './Spinner'

function renderSpinner(className?: string): HTMLElement {
  const { container } = render(<Spinner className={className} />)
  const spinner = container.firstElementChild
  if (!(spinner instanceof HTMLElement)) throw new Error('Spinner not rendered')
  return spinner
}

describe('Spinner', () => {
  it('renders a 24px spinning ring hidden from assistive tech', () => {
    const spinner = renderSpinner()

    expect(spinner).toHaveAttribute('aria-hidden', 'true')
    expect(spinner).toHaveClass(
      'size-6',
      'animate-spin',
      'rounded-full',
      'border-2',
      'border-current',
      'border-t-transparent'
    )
  })

  it('is not announced (no status role, no name)', () => {
    const spinner = renderSpinner()

    expect(spinner).not.toHaveAttribute('role')
    expect(spinner).not.toHaveAttribute('aria-label')
    expect(spinner).toBeEmptyDOMElement()
  })

  it('accepts a caller color class', () => {
    expect(renderSpinner('text-primary')).toHaveClass('text-primary', 'animate-spin')
  })

  it('replaces the size when the caller gives another size', () => {
    const spinner = renderSpinner('size-8')

    expect(spinner).toHaveClass('size-8')
    expect(spinner).not.toHaveClass('size-6')
  })
})
