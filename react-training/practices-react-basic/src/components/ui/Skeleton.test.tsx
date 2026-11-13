import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Skeleton } from './Skeleton'

function renderSkeleton(className?: string): HTMLElement {
  const { container } = render(<Skeleton className={className} />)
  const skeleton = container.firstElementChild
  if (!(skeleton instanceof HTMLElement)) throw new Error('Skeleton not rendered')
  return skeleton
}

describe('Skeleton', () => {
  it('renders a pulsing light-medium block hidden from assistive tech', () => {
    const skeleton = renderSkeleton()

    expect(skeleton).toHaveAttribute('aria-hidden', 'true')
    expect(skeleton).toHaveClass('animate-pulse', 'bg-light-medium')
    expect(skeleton).toBeEmptyDOMElement()
  })

  it('stops pulsing for reduced motion', () => {
    expect(renderSkeleton()).toHaveClass('motion-reduce:animate-none')
  })

  it('takes its size from className', () => {
    expect(renderSkeleton('h-card w-card')).toHaveClass('h-card', 'w-card', 'animate-pulse')
  })

  it('replaces the background when the caller gives another one', () => {
    const skeleton = renderSkeleton('bg-white')

    expect(skeleton).toHaveClass('bg-white')
    expect(skeleton).not.toHaveClass('bg-light-medium')
  })
})
