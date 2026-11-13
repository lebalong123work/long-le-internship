import { act, renderHook } from '@testing-library/react'
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { useAuthModal } from './useAuthModal'
import type { ReactNode } from 'react'

function wrapperAt(entries: string[]) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={entries} initialIndex={entries.length - 1}>
        {children}
      </MemoryRouter>
    )
  }
}

function useHarness() {
  return { modal: useAuthModal(), location: useLocation(), navigate: useNavigate() }
}

function renderAt(...entries: string[]) {
  return renderHook(() => useHarness(), { wrapper: wrapperAt(entries) })
}

function redirectFor(value: string): string | null {
  const query = new URLSearchParams({ auth: 'login', redirect: value }).toString()
  return renderAt(`/?${query}`).result.current.modal.redirect
}

describe('useAuthModal redirect', () => {
  it('returns an in-app redirect with its query', () => {
    expect(redirectFor('/account/orders?page=2#top')).toBe('/account/orders?page=2#top')
  })

  it('ignores an absolute URL redirect', () => {
    expect(redirectFor('https://evil.example/cart')).toBeNull()
  })

  it('accepts the root path as redirect', () => {
    expect(redirectFor('/')).toBe('/')
  })

  it('ignores a protocol-relative redirect', () => {
    expect(redirectFor('//evil.example/cart')).toBeNull()
  })

  it('ignores a backslash redirect', () => {
    expect(redirectFor('/\\evil.example/cart')).toBeNull()
  })

  it('ignores a redirect where a tab hides a second slash', () => {
    expect(redirectFor('/\t/evil.example/cart')).toBeNull()
  })

  it('returns null when redirect is missing', () => {
    expect(renderAt('/?auth=login').result.current.modal.redirect).toBeNull()
  })

  it('returns null for an empty redirect', () => {
    expect(redirectFor('')).toBeNull()
  })
})

describe('useAuthModal closeAndRedirect', () => {
  it('closeAndRedirect goes to the redirect and replaces the history entry', () => {
    const { result } = renderAt('/shop', '/shop?auth=login&redirect=%2Fcart')

    act(() => result.current.modal.closeAndRedirect())
    expect(result.current.location.pathname + result.current.location.search).toBe('/cart')

    act(() => result.current.navigate(-1))
    expect(result.current.location.pathname + result.current.location.search).toBe('/shop')
  })

  it('closeAndRedirect with an unsafe redirect stays on the page without auth params', () => {
    const { result } = renderAt('/shop?auth=login&redirect=%2F%2Fevil.example')

    act(() => result.current.modal.closeAndRedirect())

    expect(result.current.location.pathname).toBe('/shop')
    expect(result.current.location.search).toBe('')
  })

  it('closeAndRedirect without redirect removes auth and keeps other params', () => {
    const { result } = renderAt('/search?q=shirt&auth=login')

    act(() => result.current.modal.closeAndRedirect())

    expect(result.current.location.pathname).toBe('/search')
    expect(result.current.location.search).toBe('?q=shirt')
    expect(result.current.modal.mode).toBeNull()
  })

  it('Back after closeAndRedirect does not reopen the modal', () => {
    const { result } = renderAt('/about', '/search?q=shirt&auth=login')

    act(() => result.current.modal.closeAndRedirect())
    act(() => result.current.navigate(-1))

    expect(result.current.location.pathname).toBe('/about')
    expect(result.current.modal.mode).toBeNull()
  })
})

describe('useAuthModal switchMode', () => {
  it('switchMode changes auth and keeps redirect', () => {
    const { result } = renderAt('/?auth=login&redirect=%2Fcart')

    act(() => result.current.modal.switchMode('register'))

    expect(result.current.modal.mode).toBe('register')
    expect(result.current.modal.redirect).toBe('/cart')
  })

  it('Back after switchMode closes the modal', () => {
    const { result } = renderAt('/about', '/about?auth=login')

    act(() => result.current.modal.switchMode('register'))
    act(() => result.current.navigate(-1))

    expect(result.current.location.pathname).toBe('/about')
    expect(result.current.modal.mode).toBeNull()
  })
})
