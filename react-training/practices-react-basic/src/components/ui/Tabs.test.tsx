import { createRef } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TABS_ERRORS } from './tabsErrors'
import { Tabs } from './Tabs'
import type { TabItem } from './Tabs'

type Fruit = 'apple' | 'pear' | 'plum'

const ITEMS: readonly TabItem<Fruit>[] = [
  { id: 'apple', label: 'Apple' },
  { id: 'pear', label: 'Pear' },
  { id: 'plum', label: 'Plum' },
]

const LIST_LABEL = 'Fruits'

interface RenderOptions {
  items?: readonly TabItem<Fruit>[]
  activeId?: Fruit
  label?: string
  activationMode?: 'automatic' | 'manual'
  panelFocusable?: boolean
  disabled?: boolean
  className?: string
  listClassName?: string
}

const onSelect = vi.fn()

function renderTabs({
  items = ITEMS,
  activeId = 'apple',
  label = LIST_LABEL,
  ...rest
}: RenderOptions = {}) {
  return render(
    <Tabs items={items} activeId={activeId} onSelect={onSelect} label={label} {...rest}>
      <p>Panel content</p>
    </Tabs>
  )
}

function tab(name: string): HTMLElement {
  return screen.getByRole('tab', { name })
}

function silenceRenderErrors(): void {
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
}

afterEach(() => {
  vi.restoreAllMocks()
  onSelect.mockReset()
})

describe('Tabs structure', () => {
  it('renders a named tablist with one tab per item in order', () => {
    renderTabs()
    expect(screen.getByRole('tablist', { name: LIST_LABEL })).toBeInTheDocument()
    expect(screen.getAllByRole('tab').map((element) => element.textContent)).toEqual([
      'Apple',
      'Pear',
      'Plum',
    ])
  })

  it('throws when items are empty', () => {
    silenceRenderErrors()
    expect(() => renderTabs({ items: [] })).toThrow(TABS_ERRORS.emptyItems)
  })

  it('marks only the active tab as selected and focusable', () => {
    renderTabs({ activeId: 'pear' })
    expect(tab('Pear')).toHaveAttribute('aria-selected', 'true')
    expect(tab('Pear')).toHaveAttribute('tabindex', '0')
    for (const name of ['Apple', 'Plum']) {
      expect(tab(name)).toHaveAttribute('aria-selected', 'false')
      expect(tab(name)).toHaveAttribute('tabindex', '-1')
    }
  })

  it('throws when the active id is not one of the items', () => {
    silenceRenderErrors()
    expect(() => renderTabs({ items: ITEMS.slice(0, 2), activeId: 'plum' })).toThrow(
      TABS_ERRORS.unknownActiveId
    )
  })

  it('links the panel to the active tab', () => {
    renderTabs({ activeId: 'plum' })
    const panel = screen.getByRole('tabpanel', { name: 'Plum' })
    for (const element of screen.getAllByRole('tab')) {
      expect(element).toHaveAttribute('aria-controls', panel.id)
    }
    expect(new Set(screen.getAllByRole('tab').map((element) => element.id)).size).toBe(3)
  })

  it('throws for duplicate item ids', () => {
    silenceRenderErrors()
    const items: TabItem<Fruit>[] = [
      { id: 'apple', label: 'Apple' },
      { id: 'apple', label: 'Green apple' },
    ]
    expect(() => renderTabs({ items })).toThrow(TABS_ERRORS.duplicateId)
  })

  it('shows each label exactly as given', () => {
    const items: TabItem<Fruit>[] = [
      { id: 'apple', label: 'T-Shirt' },
      { id: 'pear', label: 'Big  Pear' },
    ]
    renderTabs({ items })
    expect(screen.getAllByRole('tab').map((element) => element.textContent)).toEqual([
      'T-Shirt',
      'Big  Pear',
    ])
  })

  it('throws for a blank list label', () => {
    silenceRenderErrors()
    expect(() => renderTabs({ label: '   ' })).toThrow(TABS_ERRORS.blankLabel)
  })

  it('throws for a blank tab label', () => {
    silenceRenderErrors()
    const items: TabItem<Fruit>[] = [
      { id: 'apple', label: 'Apple' },
      { id: 'pear', label: '' },
    ]
    expect(() => renderTabs({ items })).toThrow(TABS_ERRORS.blankLabel)
  })
})

describe('Tabs selection', () => {
  it('click on another tab calls onSelect with its id', async () => {
    renderTabs()
    await userEvent.click(tab('Plum'))
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith('plum')
  })

  it('click on the active tab does not call onSelect', async () => {
    renderTabs()
    await userEvent.click(tab('Apple'))
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('automatic mode: ArrowRight and ArrowLeft wrap, select and move focus', async () => {
    const { rerender } = renderTabs({ activeId: 'plum' })
    tab('Plum').focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(onSelect).toHaveBeenLastCalledWith('apple')
    expect(tab('Apple')).toHaveFocus()
    rerender(
      <Tabs items={ITEMS} activeId="apple" onSelect={onSelect} label={LIST_LABEL}>
        <p>Panel content</p>
      </Tabs>
    )
    await userEvent.keyboard('{ArrowLeft}')
    expect(onSelect).toHaveBeenLastCalledWith('plum')
    expect(tab('Plum')).toHaveFocus()
  })

  it('automatic mode: Home and End select the first and last tab', async () => {
    renderTabs({ activeId: 'pear' })
    tab('Pear').focus()
    await userEvent.keyboard('{End}')
    expect(onSelect).toHaveBeenLastCalledWith('plum')
    expect(tab('Plum')).toHaveFocus()
    await userEvent.keyboard('{Home}')
    expect(onSelect).toHaveBeenLastCalledWith('apple')
    expect(tab('Apple')).toHaveFocus()
  })

  it('other keys do not change the selection', async () => {
    renderTabs()
    tab('Apple').focus()
    await userEvent.keyboard('{ArrowDown}{ArrowUp}a')
    expect(onSelect).not.toHaveBeenCalled()
    expect(tab('Apple')).toHaveFocus()
  })

  it('a disabled tab list ignores clicks and arrow keys', () => {
    renderTabs({ disabled: true })
    for (const element of screen.getAllByRole('tab')) expect(element).toBeDisabled()
    fireEvent.click(tab('Pear'))
    fireEvent.keyDown(tab('Apple'), { key: 'ArrowRight' })
    expect(onSelect).not.toHaveBeenCalled()
    expect(tab('Pear')).not.toHaveFocus()
  })

  it('tabs are enabled by default', () => {
    renderTabs()
    for (const element of screen.getAllByRole('tab')) expect(element).toBeEnabled()
  })
})

describe('Tabs manual activation', () => {
  it('manual mode: arrow, Home and End keys move focus without selecting', async () => {
    renderTabs({ activationMode: 'manual' })
    tab('Apple').focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(tab('Pear')).toHaveFocus()
    await userEvent.keyboard('{End}')
    expect(tab('Plum')).toHaveFocus()
    await userEvent.keyboard('{Home}')
    expect(tab('Apple')).toHaveFocus()
    await userEvent.keyboard('{ArrowLeft}')
    expect(tab('Plum')).toHaveFocus()
    expect(onSelect).not.toHaveBeenCalled()
    expect(tab('Apple')).toHaveAttribute('aria-selected', 'true')
  })

  it('manual mode: arrow keys move from the focused tab, not the selected one', async () => {
    renderTabs({ activationMode: 'manual' })
    tab('Apple').focus()
    await userEvent.keyboard('{ArrowRight}{ArrowRight}')
    expect(tab('Plum')).toHaveFocus()
  })

  it('manual mode: Enter and Space select the focused tab exactly once', async () => {
    renderTabs({ activationMode: 'manual' })
    tab('Apple').focus()
    await userEvent.keyboard('{ArrowRight}{Enter}')
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenLastCalledWith('pear')
    await userEvent.keyboard('{ArrowRight} ')
    expect(onSelect).toHaveBeenCalledTimes(2)
    expect(onSelect).toHaveBeenLastCalledWith('plum')
  })

  it('automatic mode is the default', async () => {
    renderTabs()
    tab('Apple').focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(onSelect).toHaveBeenCalledWith('pear')
  })

  it('manual mode: Enter on the active tab does not call onSelect', async () => {
    renderTabs({ activationMode: 'manual' })
    tab('Apple').focus()
    await userEvent.keyboard('{Enter} ')
    expect(onSelect).not.toHaveBeenCalled()
  })
})

describe('Tabs panel focus', () => {
  it('panelFocusable puts the panel in the Tab order with the keyboard and script focus rings', () => {
    renderTabs({ panelFocusable: true })
    const panel = screen.getByRole('tabpanel')
    expect(panel).toHaveAttribute('tabindex', '0')
    expect(panel).toHaveClass('focus-visible:ring-2', 'focus-visible:ring-primary')
    expect(panel).toHaveClass(
      'data-[script-focus=true]:ring-2',
      'data-[script-focus=true]:ring-primary'
    )
  })

  it('forwards panelRef to the tab panel', () => {
    const panelRef = createRef<HTMLDivElement>()
    render(
      <Tabs
        items={ITEMS}
        activeId="apple"
        onSelect={onSelect}
        label={LIST_LABEL}
        panelRef={panelRef}
      >
        <p>Panel content</p>
      </Tabs>
    )
    expect(panelRef.current).toBe(screen.getByRole('tabpanel'))
  })

  it('the panel is not focusable by default', () => {
    renderTabs()
    const panel = screen.getByRole('tabpanel')
    expect(panel).not.toHaveAttribute('tabindex')
    expect(panel).not.toHaveAttribute('class')
  })

  it('the panel never uses a plain focus ring', () => {
    renderTabs({ panelFocusable: true })
    const classes = Array.from(screen.getByRole('tabpanel').classList)
    expect(classes.filter((name) => name.startsWith('focus:'))).toEqual([])
  })
})

describe('Tabs look', () => {
  it('active tab uses the bold primary look with the underline', () => {
    renderTabs()
    expect(tab('Apple')).toHaveClass('font-bold', 'text-primary', 'after:bg-primary')
  })

  it('idle tab uses the medium-dark look with a mouse-only primary hover', () => {
    renderTabs()
    expect(tab('Pear')).toHaveClass(
      'font-normal',
      'text-medium-dark',
      'can-hover:enabled:hover:text-primary'
    )
    expect(tab('Pear')).not.toHaveClass('after:bg-primary')
  })

  it('merges listClassName and className with the base classes', () => {
    const { container } = renderTabs({ className: 'flex flex-col', listClassName: 'gap-10' })
    expect(container.firstElementChild).toHaveClass('flex', 'flex-col')
    expect(screen.getByRole('tablist')).toHaveClass('flex', 'gap-10')
  })

  it('keeps the base layout without class props', () => {
    const { container } = renderTabs()
    expect(container.firstElementChild).not.toHaveAttribute('class')
    expect(screen.getByRole('tablist')).toHaveAttribute('class', 'flex')
  })
})
