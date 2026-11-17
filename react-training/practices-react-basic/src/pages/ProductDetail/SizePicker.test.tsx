import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PRODUCT_DETAIL_TEXT } from '@/constants/productDetail'
import { SizePicker } from './SizePicker'

const SIZES = ['S', 'M', 'L', 'XL']

function renderPicker(sizes: string[] = SIZES, value: string | null = 'S') {
  const onChange = vi.fn()
  const view = render(<SizePicker sizes={sizes} value={value} onChange={onChange} />)
  return { ...view, onChange, user: userEvent.setup() }
}

function optionOf(size: string): HTMLElement {
  const option = screen.getByRole('radio', { name: size }).nextElementSibling
  if (!(option instanceof HTMLElement)) throw new Error(`no option for ${size}`)
  return option
}

describe('SizePicker', () => {
  it('renders a Size group with the size letters', () => {
    renderPicker()
    const group = screen.getByRole('group', { name: PRODUCT_DETAIL_TEXT.size })
    expect(
      within(group)
        .getAllByRole('radio')
        .map((radio) => radio.getAttribute('value'))
    ).toEqual(SIZES)
    expect(within(group).getByText('XL')).toBeInTheDocument()
  })

  it('styles the checked size primary and white bold', () => {
    renderPicker()
    expect(screen.getByRole('radio', { name: 'S' })).toBeChecked()
    expect(optionOf('S')).toHaveClass('bg-primary', 'text-white', 'font-bold')
  })

  it('styles idle sizes light and dark', () => {
    renderPicker()
    expect(optionOf('M')).toHaveClass('bg-light', 'text-dark')
    expect(optionOf('M')).not.toHaveClass('font-bold')
  })

  it('calls onChange with the clicked size', async () => {
    const { user, onChange } = renderPicker()
    await user.click(screen.getByRole('radio', { name: 'M' }))
    expect(onChange).toHaveBeenCalledWith('M')
  })

  it('renders nothing for no sizes', () => {
    const { container } = renderPicker([])
    expect(container).toBeEmptyDOMElement()
  })

  it('checks nothing when value is null', () => {
    renderPicker(SIZES, null)
    for (const radio of screen.getAllByRole('radio')) expect(radio).not.toBeChecked()
  })
})
