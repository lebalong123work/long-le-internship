import { act, render } from '@testing-library/react'
import { createMemoryRouter, Outlet, RouterProvider } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useScrollToTopOnNavigate } from './useScrollToTopOnNavigate'

function Layout(): JSX.Element {
  useScrollToTopOnNavigate()
  return <Outlet />
}

function renderAt(path: string) {
  const router = createMemoryRouter(
    [
      {
        element: <Layout />,
        children: [
          { path: '/a', element: <p>Page A</p> },
          { path: '/b', element: <p>Page B</p> },
        ],
      },
    ],
    { initialEntries: [path] }
  )
  render(<RouterProvider router={router} />)
  return router
}

async function go(router: ReturnType<typeof renderAt>, to: string | number, replace = false) {
  await act(async () => {
    if (typeof to === 'number') await router.navigate(to)
    else await router.navigate(to, { replace })
  })
}

beforeEach(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useScrollToTopOnNavigate', () => {
  it('S1 scrolls to the top once after a link to another page', async () => {
    const router = renderAt('/a')
    await go(router, '/b')
    expect(window.scrollTo).toHaveBeenCalledTimes(1)
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0 })
  })

  it('S2 scrolls to the top after a redirect to another page', async () => {
    const router = renderAt('/a')
    await go(router, '/b', true)
    expect(router.state.historyAction).toBe('REPLACE')
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0 })
  })

  it('S3 keeps the position when only the search part changes', async () => {
    const router = renderAt('/a')
    await go(router, '/a?auth=login')
    expect(router.state.location.search).toBe('?auth=login')
    expect(window.scrollTo).not.toHaveBeenCalled()
  })

  it('S4 keeps the position on Back so the browser can restore it', async () => {
    const router = renderAt('/a')
    await go(router, '/b')
    vi.mocked(window.scrollTo).mockClear()
    await go(router, -1)
    expect(router.state.location.pathname).toBe('/a')
    expect(window.scrollTo).not.toHaveBeenCalled()
  })

  it('S5 does not scroll on the first render', () => {
    renderAt('/a')
    expect(window.scrollTo).not.toHaveBeenCalled()
  })
})
