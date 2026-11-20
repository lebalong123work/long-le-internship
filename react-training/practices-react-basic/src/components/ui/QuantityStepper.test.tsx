import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { QuantityStepper } from './QuantityStepper'

const PRODUCT_NAME = 'Smart T-Shirt'

interface StepperOptions {
  value: number
  max?: number
  bordered?: boolean
}

function renderStepper({ value, max, bordered }: StepperOptions) {
  const onChange = vi.fn()
  const view = render(
    <QuantityStepper
      value={value}
      onChange={onChange}
      productName={PRODUCT_NAME}
      max={max}
      bordered={bordered}
    />
  )
  return { onChange, ...view }
}

function minus(): HTMLElement {
  return screen.getByRole('button', { name: 'Decrease quantity' })
}

function plus(): HTMLElement {
  return screen.getByRole('button', { name: 'Increase quantity' })
}

function group(): HTMLElement {
  return screen.getByRole('group', { name: `Quantity of ${PRODUCT_NAME}` })
}

function liveRegion(): Element | null {
  return group().querySelector('[aria-live]')
}

function iconOf(button: HTMLElement): Element | null {
  return button.querySelector('img')
}

describe('QuantityStepper value', () => {
  it('shows the value in a polite live region', () => {
    renderStepper({ value: 2 })

    expect(liveRegion()).toHaveTextContent('2')
    expect(liveRegion()).toHaveAttribute('aria-live', 'polite')
  })

  it('updates the live region when the value changes', () => {
    const { rerender, onChange } = renderStepper({ value: 2 })

    rerender(<QuantityStepper value={3} onChange={onChange} productName={PRODUCT_NAME} />)

    expect(liveRegion()).toHaveTextContent('3')
  })
})

describe('QuantityStepper names', () => {
  it('names the group "Quantity of Smart T-Shirt" and the buttons Decrease / Increase quantity', () => {
    renderStepper({ value: 2 })

    expect(group()).toBeInTheDocument()
    expect(minus()).toBeInTheDocument()
    expect(plus()).toBeInTheDocument()
  })

  it('hides the icons from assistive tech (empty alt)', () => {
    renderStepper({ value: 2 })

    expect(iconOf(minus())).toHaveAttribute('alt', '')
    expect(iconOf(plus())).toHaveAttribute('alt', '')
  })
})

describe('QuantityStepper minus', () => {
  it('enables minus and calls onChange with 1 at value 2', async () => {
    const { onChange } = renderStepper({ value: 2 })

    await userEvent.click(minus())

    expect(minus()).toBeEnabled()
    expect(iconOf(minus())).toHaveAttribute('src', '/icons/minus.svg')
    expect(onChange).toHaveBeenCalledWith(1)
  })

  it('disables minus with the grey icon and does not call onChange at 1', async () => {
    const { onChange } = renderStepper({ value: 1 })

    await userEvent.click(minus())

    expect(minus()).toBeDisabled()
    expect(iconOf(minus())).toHaveAttribute('src', '/icons/minus-disabled.svg')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('disables minus below the minimum (value 0)', () => {
    renderStepper({ value: 0 })

    expect(minus()).toBeDisabled()
    expect(iconOf(minus())).toHaveAttribute('src', '/icons/minus-disabled.svg')
  })
})

describe('QuantityStepper plus and max', () => {
  it('calls onChange with max at value max − 1', async () => {
    const { onChange } = renderStepper({ value: 4, max: 5 })

    await userEvent.click(plus())

    expect(onChange).toHaveBeenCalledWith(5)
  })

  it('keeps plus enabled without max', async () => {
    const { onChange } = renderStepper({ value: 1234 })

    await userEvent.click(plus())

    expect(plus()).toBeEnabled()
    expect(onChange).toHaveBeenCalledWith(1235)
  })

  it('disables plus and does not call onChange at max', async () => {
    const { onChange } = renderStepper({ value: 5, max: 5 })

    await userEvent.click(plus())

    expect(plus()).toBeDisabled()
    expect(plus()).toHaveClass('disabled:opacity-50')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('keeps minus enabled and plus disabled when the value is above max', () => {
    renderStepper({ value: 7, max: 5 })

    expect(minus()).toBeEnabled()
    expect(plus()).toBeDisabled()
  })

  it('disables both buttons when max is 0 (out of stock)', () => {
    renderStepper({ value: 0, max: 0 })

    expect(minus()).toBeDisabled()
    expect(plus()).toBeDisabled()
    expect(liveRegion()).toHaveTextContent('0')
  })
})

describe('QuantityStepper border', () => {
  it('adds the 1px medium border when bordered', () => {
    renderStepper({ value: 1, bordered: true })

    expect(group()).toHaveClass('border', 'border-medium', 'h-12', 'w-[142px]')
  })

  it('has no border by default', () => {
    renderStepper({ value: 1 })

    expect(group()).not.toHaveClass('border')
    expect(group()).not.toHaveClass('border-medium')
  })
})

describe('QuantityStepper live region', () => {
  it('has exactly one atomic live region that holds only the value', () => {
    renderStepper({ value: 2 })

    const regions = group().querySelectorAll('[aria-live]')
    expect(regions).toHaveLength(1)
    expect(regions[0]).toHaveAttribute('aria-atomic', 'true')
    expect(regions[0].textContent).toBe('2')
    expect(regions[0].children).toHaveLength(0)
  })

  it('does not change the live region text when re-rendered with the same value', () => {
    const { rerender, onChange } = renderStepper({ value: 2 })
    const region = liveRegion()
    if (!region) throw new Error('Live region not rendered')
    const observer = new MutationObserver(() => undefined)
    observer.observe(region, { characterData: true, childList: true, subtree: true })

    rerender(<QuantityStepper value={2} onChange={onChange} productName={PRODUCT_NAME} />)

    expect(observer.takeRecords()).toHaveLength(0)
    observer.disconnect()
  })
})
