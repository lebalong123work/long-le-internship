import { afterEach, describe, expect, it, vi } from 'vitest'
import { focusWithVisibleRing } from './focusWithVisibleRing'

function focusableBox(): HTMLDivElement {
  const element = document.createElement('div')
  element.tabIndex = -1
  document.body.append(element)
  return element
}

afterEach(() => {
  document.body.replaceChildren()
  vi.restoreAllMocks()
})

describe('focusWithVisibleRing', () => {
  it('focuses the element and asks for a visible focus ring', () => {
    const element = focusableBox()
    const focus = vi.spyOn(element, 'focus')
    focusWithVisibleRing(element)
    expect(focus).toHaveBeenCalledWith({ focusVisible: true })
    expect(document.activeElement).toBe(element)
  })

  it('leaves no mark when the element could not take focus', () => {
    const element = document.createElement('div')
    focusWithVisibleRing(element)
    expect(element.dataset.scriptFocus).toBeUndefined()
  })

  it('marks the element for the ring while it has focus', () => {
    const element = focusableBox()
    focusWithVisibleRing(element)
    expect(element).toHaveAttribute('data-script-focus', 'true')
  })

  it('removes the mark when the element loses focus', () => {
    const element = focusableBox()
    focusWithVisibleRing(element)
    element.blur()
    expect(element).not.toHaveAttribute('data-script-focus')
  })

  it('keeps the mark when the browser ignores the focusVisible option', () => {
    const element = focusableBox()
    const nativeFocus = HTMLElement.prototype.focus
    vi.spyOn(element, 'focus').mockImplementation(() => nativeFocus.call(element))
    focusWithVisibleRing(element)
    expect(element).toHaveAttribute('data-script-focus', 'true')
  })

  it('a second call keeps one mark that a single blur removes', () => {
    const element = focusableBox()
    focusWithVisibleRing(element)
    focusWithVisibleRing(element)
    expect(element).toHaveAttribute('data-script-focus', 'true')
    element.blur()
    expect(element).not.toHaveAttribute('data-script-focus')
  })
})
