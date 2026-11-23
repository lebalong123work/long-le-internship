import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PRODUCT_DETAIL_TEXT } from '@/constants/productDetail'
import { ColorPicker } from './ColorPicker'

const COLORS = ['Black', 'Blue', 'Green']

function renderPicker(colors: string[] = COLORS, value: string | null = null, errorId?: string) {
  const onChange = vi.fn()
  const view = render(
    <ColorPicker colors={colors} value={value} onChange={onChange} errorId={errorId} />
  )
  return { ...view, onChange, user: userEvent.setup() }
}

function group(): HTMLElement {
  return screen.getByRole('group', { name: PRODUCT_DETAIL_TEXT.color })
}

function swatchOf(color: string): HTMLElement {
  const label = screen.getByRole('radio', { name: color }).closest('label')
  const swatch = label?.querySelector('.size-4')
  if (!(swatch instanceof HTMLElement)) throw new Error(`no swatch for ${color}`)
  return swatch
}

describe('ColorPicker', () => {
  it('renders a Color group with one radio per color', () => {
    renderPicker()
    expect(
      within(group())
        .getAllByRole('radio')
        .map((radio) => radio.getAttribute('value'))
    ).toEqual(COLORS)
  })

  it('checks nothing when value is null', () => {
    renderPicker()
    for (const radio of screen.getAllByRole('radio')) expect(radio).not.toBeChecked()
  })

  it('checks the chosen color', () => {
    renderPicker(COLORS, 'Blue')
    expect(screen.getByRole('radio', { name: 'Blue' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Black' })).not.toBeChecked()
  })

  it('draws the chosen swatch as a white ring with a color dot', () => {
    renderPicker(COLORS, 'Blue')
    const selected = swatchOf('Blue')
    expect(selected).toHaveClass('bg-white', 'border-[0.5px]', 'border-medium')
    expect(selected.querySelector('span')).toHaveStyle({ backgroundColor: '#5463FF' })
    expect(swatchOf('Green').querySelector('span')).toBeNull()
  })

  it('calls onChange once with the clicked color', async () => {
    const { user, onChange } = renderPicker()
    await user.click(screen.getByRole('radio', { name: 'Green' }))
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith('Green')
  })

  it('does not call onChange for the checked color', async () => {
    const { user, onChange } = renderPicker(COLORS, 'Green')
    await user.click(screen.getByRole('radio', { name: 'Green' }))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('shows an unknown color as a neutral swatch with its name', () => {
    renderPicker(['Black', 'Sunset Orange'])
    const swatch = swatchOf('Sunset Orange')
    expect(swatch).toHaveClass('bg-light', 'border-medium')
    expect(swatch).not.toHaveAttribute('style')
    expect(within(group()).getByText('Sunset Orange')).toBeInTheDocument()
  })

  it('lets the user select an unknown color', async () => {
    const { user, onChange } = renderPicker(['Sunset Orange'])
    await user.click(screen.getByRole('radio', { name: 'Sunset Orange' }))
    expect(onChange).toHaveBeenCalledWith('Sunset Orange')
  })

  it('U7 draws a selected unknown color as a white ring with a dot and a bold name', () => {
    renderPicker(['Sunset Orange', 'Moss'], 'Sunset Orange')
    const selected = swatchOf('Sunset Orange')
    expect(selected).toHaveClass('bg-white')
    expect(selected).not.toHaveClass('bg-light')
    expect(selected.querySelector('span')).toHaveClass('bg-medium-dark')
    expect(within(group()).getByText('Sunset Orange')).toHaveClass('font-bold')

    const other = swatchOf('Moss')
    expect(other).toHaveClass('bg-light')
    expect(other.querySelector('span')).toBeNull()
    expect(within(group()).getByText('Moss')).not.toHaveClass('font-bold')
  })

  it('renders nothing for no colors', () => {
    const { container } = renderPicker([])
    expect(container).toBeEmptyDOMElement()
  })

  it('paints Black with #19181D', () => {
    renderPicker()
    expect(swatchOf('Black')).toHaveStyle({ backgroundColor: '#19181D' })
  })

  it('describes the group with errorId', () => {
    renderPicker(COLORS, null, 'color-error')
    expect(group()).toHaveAttribute('aria-describedby', 'color-error')
  })

  it('rings the swatch row in the error color with errorId', () => {
    renderPicker(COLORS, null, 'color-error')
    expect(swatchOf('Black').closest('label')?.parentElement).toHaveClass('ring-1', 'ring-error')
  })

  it('has no description and no ring without errorId', () => {
    renderPicker()
    expect(group()).not.toHaveAttribute('aria-describedby')
    expect(swatchOf('Black').closest('label')?.parentElement).not.toHaveClass('ring-error')
  })

  it('checks nothing when value is not in the list', () => {
    renderPicker(COLORS, 'Purple')
    for (const radio of screen.getAllByRole('radio')) expect(radio).not.toBeChecked()
  })
})
