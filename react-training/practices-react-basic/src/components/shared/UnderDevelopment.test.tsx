import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ROUTES } from '@/constants/routes'
import { UI_STATE_MESSAGES } from '@/constants/uiStateMessages'
import { STATUS_PAGE_LAYOUT } from './pageLayout'
import { UnderDevelopment } from './UnderDevelopment'

function renderPage(title = 'About Us') {
  render(
    <MemoryRouter>
      <UnderDevelopment title={title} />
    </MemoryRouter>
  )
}

describe('UnderDevelopment', () => {
  it('shows the page title as the only h1 and the under-development message', () => {
    renderPage('Contact')

    expect(screen.getByRole('heading', { level: 1, name: 'Contact' })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByText('This page is under development')).toBeInTheDocument()
  })

  it('links Back to Home to the home route as a content-width button-styled link', () => {
    renderPage()

    const link = screen.getByRole('link', { name: UI_STATE_MESSAGES.backToHome })
    expect(link).toHaveAttribute('href', ROUTES.HOME)
    expect(link).toHaveClass('mt-6')
    expect(link.className).not.toMatch(/\bw-/)
  })

  it('uses the shared status page layout (page container, centred column)', () => {
    renderPage()

    const heading = screen.getByRole('heading', { level: 1 })
    const section = heading.closest('section')
    expect(section).toHaveClass(...STATUS_PAGE_LAYOUT.section.split(' '))
    expect(section).toHaveClass('container', 'px-4', 'md:px-6', 'items-center', 'text-center')
    expect(heading).toHaveClass('text-h3', 'break-words')
    expect(screen.getByText('This page is under development')).toHaveClass(
      ...STATUS_PAGE_LAYOUT.message.split(' ')
    )
  })
})
