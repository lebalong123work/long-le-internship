import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { SiteLogo } from './SiteLogo'
import type { LogoTone } from './SiteLogo'

function logoText(tone?: LogoTone): HTMLElement {
  render(
    <MemoryRouter>
      <SiteLogo tone={tone} />
    </MemoryRouter>
  )
  return screen.getByText('mangcoding Store')
}

describe('SiteLogo tone', () => {
  it('default tone renders dark logo text', () => {
    expect(logoText()).toHaveClass('text-dark')
  })

  it('light tone renders white logo text, not dark', () => {
    const text = logoText('light')
    expect(text).toHaveClass('text-white')
    expect(text).not.toHaveClass('text-dark')
  })
})

describe('SiteLogo width', () => {
  it('is 160 wide and may shrink to 156, never below', () => {
    const link = logoText().closest('a')
    expect(link).toHaveClass('w-40', 'min-w-[156px]', 'shrink')
    expect(link).not.toHaveClass('shrink-0')
  })
})
