import { renderHook, waitFor } from '@testing-library/react'
import { MemoryRouter, useLocation, useNavigationType } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { usePageParamSync } from './usePageParamSync'
import type { ReactNode } from 'react'

interface ProbeProps {
  page: number
  shownPage: number | undefined
  scope: string
}

let heading: HTMLHeadingElement

function renderSync(path: string, initialProps: ProbeProps) {
  const headingRef = { current: heading }
  function wrapper({ children }: { children: ReactNode }): JSX.Element {
    return <MemoryRouter initialEntries={[path]}>{children}</MemoryRouter>
  }
  return renderHook(
    (props: ProbeProps) => {
      usePageParamSync({ ...props, headingRef })
      return { search: useLocation().search, action: useNavigationType() }
    },
    { initialProps, wrapper }
  )
}

beforeEach(() => {
  heading = document.createElement('h1')
  heading.tabIndex = -1
  document.body.append(heading)
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
})

afterEach(() => {
  heading.remove()
  vi.restoreAllMocks()
})

describe('usePageParamSync — URL', () => {
  it('H1 replaces the page parameter with the shown page and keeps the others', async () => {
    const { result } = renderSync('/list?q=a&page=9', { page: 9, shownPage: 3, scope: 'a' })
    await waitFor(() => expect(result.current.search).toBe('?q=a&page=3'))
    expect(result.current.action).toBe('REPLACE')
  })

  it.each<[string, number | undefined]>([
    ['the same page is shown', 2],
    ['no page is shown yet', undefined],
  ])('H1 leaves the URL alone when %s', (_, shownPage) => {
    const { result } = renderSync('/list?q=a&page=2', { page: 2, shownPage, scope: 'a' })
    expect(result.current.search).toBe('?q=a&page=2')
    expect(result.current.action).toBe('POP')
  })
})

describe('usePageParamSync — focus', () => {
  it('H2 focuses the heading after another page of the same scope shows', () => {
    const { rerender } = renderSync('/list', { page: 1, shownPage: 1, scope: 'a' })
    rerender({ page: 2, shownPage: 2, scope: 'a' })
    expect(heading).toHaveFocus()
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0 })
  })

  it('H2 leaves focus alone on the first shown page', () => {
    renderSync('/list', { page: 2, shownPage: 2, scope: 'a' })
    expect(heading).not.toHaveFocus()
    expect(window.scrollTo).not.toHaveBeenCalled()
  })

  it('H2 leaves focus alone when the scope changes', () => {
    const { rerender } = renderSync('/list', { page: 2, shownPage: 2, scope: 'a' })
    rerender({ page: 1, shownPage: undefined, scope: 'b' })
    rerender({ page: 1, shownPage: 1, scope: 'b' })
    expect(heading).not.toHaveFocus()
    expect(window.scrollTo).not.toHaveBeenCalled()
  })

  it('H2 leaves focus alone while no page is shown', () => {
    const { rerender } = renderSync('/list', { page: 1, shownPage: 1, scope: 'a' })
    rerender({ page: 2, shownPage: undefined, scope: 'a' })
    expect(heading).not.toHaveFocus()
    expect(window.scrollTo).not.toHaveBeenCalled()
  })
})
