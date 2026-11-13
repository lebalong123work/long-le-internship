import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { clearTopLayerHost, setTopLayerHost, useTopLayerHost } from './topLayer'

const first = document.createElement('dialog')
const second = document.createElement('dialog')

afterEach(() => {
  act(() => {
    clearTopLayerHost(first)
    clearTopLayerHost(second)
  })
})

function renderHost() {
  let renders = 0
  const view = renderHook(() => {
    renders += 1
    return useTopLayerHost()
  })
  return { ...view, renderCount: () => renders }
}

describe('topLayer', () => {
  it('returns the host that was set', () => {
    setTopLayerHost(first)

    expect(renderHost().result.current).toBe(first)
  })

  it('returns null when no host is set', () => {
    expect(renderHost().result.current).toBeNull()
  })

  it('clears the host it set', () => {
    const { result } = renderHost()
    act(() => setTopLayerHost(first))

    act(() => clearTopLayerHost(first))

    expect(result.current).toBeNull()
  })

  it('does not clear a host set by another element', () => {
    const { result } = renderHost()
    act(() => setTopLayerHost(first))

    act(() => clearTopLayerHost(second))

    expect(result.current).toBe(first)
  })

  it('re-renders subscribers when the host changes', () => {
    const { result } = renderHost()

    act(() => setTopLayerHost(first))
    expect(result.current).toBe(first)
    act(() => setTopLayerHost(second))

    expect(result.current).toBe(second)
  })

  it('does not re-render when the same host is set again', () => {
    const { renderCount } = renderHost()
    act(() => setTopLayerHost(first))
    const before = renderCount()

    act(() => setTopLayerHost(first))

    expect(renderCount()).toBe(before)
  })
})
