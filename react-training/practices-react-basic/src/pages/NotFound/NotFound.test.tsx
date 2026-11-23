import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { STATUS_PAGE_LAYOUT } from '@/components/shared/pageLayout'
import { ROUTES } from '@/constants/routes'
import { UI_STATE_MESSAGES } from '@/constants/uiStateMessages'
import NotFound from './index'

function renderPage() {
  render(
    <MemoryRouter>
      <NotFound />
    </MemoryRouter>
  )
}

describe('NotFound', () => {
  it('shows the not-found heading and message', () => {
    renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument()
    expect(screen.getByText('The page you are looking for does not exist.')).toBeInTheDocument()
  })

  it('links Back to Home to the home route as a button-styled link', () => {
    renderPage()

    const link = screen.getByRole('link', { name: UI_STATE_MESSAGES.backToHome })
    expect(link).toHaveAttribute('href', ROUTES.HOME)
    expect(link).toHaveClass(...STATUS_PAGE_LAYOUT.action.split(' '))
    expect(link.className).not.toMatch(/\bw-/)
  })

  it('uses the shared status page layout (page container, centred column)', () => {
    renderPage()

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading.closest('section')).toHaveClass(...STATUS_PAGE_LAYOUT.section.split(' '))
    expect(heading).toHaveClass(...STATUS_PAGE_LAYOUT.heading.split(' '))
  })
})
