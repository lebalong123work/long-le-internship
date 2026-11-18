export const SCRIPT_FOCUS_RING =
  'data-[script-focus=true]:outline-none data-[script-focus=true]:ring-2 data-[script-focus=true]:ring-primary'

interface VisibleFocusOptions extends FocusOptions {
  focusVisible: boolean
}

const VISIBLE_FOCUS: VisibleFocusOptions = { focusVisible: true }

const markCleanups = new WeakMap<HTMLElement, AbortController>()

function clearMark(element: HTMLElement): void {
  markCleanups.get(element)?.abort()
  markCleanups.delete(element)
  delete element.dataset.scriptFocus
}

export function focusWithVisibleRing(element: HTMLElement): void {
  clearMark(element)
  element.dataset.scriptFocus = 'true'
  element.focus(VISIBLE_FOCUS)
  if (document.activeElement !== element) {
    clearMark(element)
    return
  }
  const controller = new AbortController()
  markCleanups.set(element, controller)
  element.addEventListener('blur', () => clearMark(element), {
    once: true,
    signal: controller.signal,
  })
}

export function isFocusFree(): boolean {
  const focused = document.activeElement
  return focused === null || focused === document.body
}
