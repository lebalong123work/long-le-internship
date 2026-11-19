import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { PAGINATION_TEXT } from '@/constants/pagination'
import { Pagination } from './Pagination'

const PATH = '/list'

function hrefFor(page: number): string {
  return page > 1 ? `${PATH}?page=${page}` : PATH
}

function renderPagination(page: number, totalPages: number): void {
  render(
    <MemoryRouter>
      <Pagination page={page} totalPages={totalPages} hrefFor={hrefFor} />
    </MemoryRouter>
  )
}

function nav() {
  return within(screen.getByRole('navigation', { name: PAGINATION_TEXT.navLabel }))
}

describe('Pagination', () => {
  it('N1 renders nothing for a single page', () => {
    renderPagination(1, 1)
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('N1 renders the navigation for two pages', () => {
    renderPagination(1, 2)
    expect(screen.getByRole('navigation', { name: PAGINATION_TEXT.navLabel })).toBeInTheDocument()
  })

  it('N2 on page 1 shows Previous as disabled text and links Next to page 2', () => {
    renderPagination(1, 3)
    expect(nav().queryByRole('link', { name: PAGINATION_TEXT.previous })).not.toBeInTheDocument()
    expect(
      nav().getByText(PAGINATION_TEXT.previous).closest('[aria-disabled="true"]')
    ).not.toBeNull()
    expect(nav().getByRole('link', { name: PAGINATION_TEXT.next })).toHaveAttribute(
      'href',
      `${PATH}?page=2`
    )
  })

  it('N3 on the last page shows Next as disabled text', () => {
    renderPagination(3, 3)
    expect(nav().queryByRole('link', { name: PAGINATION_TEXT.next })).not.toBeInTheDocument()
    expect(nav().getByText(PAGINATION_TEXT.next).closest('[aria-disabled="true"]')).not.toBeNull()
  })

  it('N4 shows the current page and the page count', () => {
    renderPagination(2, 3)
    expect(nav().getByText(PAGINATION_TEXT.pageOf(2, 3))).toBeInTheDocument()
  })

  it('N5 on page 2 links Previous to the path without a page parameter', () => {
    renderPagination(2, 3)
    expect(nav().getByRole('link', { name: PAGINATION_TEXT.previous })).toHaveAttribute(
      'href',
      PATH
    )
  })
})
