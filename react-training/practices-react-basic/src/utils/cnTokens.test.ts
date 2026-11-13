import config from '../../tailwind.config'
import { cn } from './cn'

const extend = config.theme?.extend ?? {}

function keysOf(group: object | undefined): string[] {
  return Object.keys(group ?? {})
}

const fontSizes = keysOf(extend.fontSize)
const shadows = keysOf(extend.boxShadow)
const radii = keysOf(extend.borderRadius)

describe('cn with project font-size tokens', () => {
  it('keeps every custom font-size token next to a text colour', () => {
    for (const size of fontSizes) {
      expect(cn(`text-${size}`, 'text-dark')).toBe(`text-${size} text-dark`)
    }
  })

  it('lets a custom font-size token replace a Tailwind font size', () => {
    for (const size of fontSizes) {
      expect(cn('text-lg', `text-${size}`)).toBe(`text-${size}`)
    }
  })
})

describe('cn with card size tokens', () => {
  it('lets a Tailwind max-width, width, height and aspect class replace the card tokens', () => {
    expect(cn('max-w-card', 'max-w-none')).toBe('max-w-none')
    expect(cn('w-card', 'w-full')).toBe('w-full')
    expect(cn('h-card', 'h-auto')).toBe('h-auto')
    expect(cn('aspect-card', 'aspect-square')).toBe('aspect-square')
  })

  it('keeps the card tokens when nothing conflicts', () => {
    expect(cn('w-full max-w-card', 'aspect-card h-auto')).toBe('w-full max-w-card aspect-card h-auto')
  })
})

describe('cn with shadow and radius tokens', () => {
  it('lets shadow-none and rounded-none replace every custom shadow and radius token', () => {
    for (const shadow of shadows) {
      expect(cn(`shadow-${shadow}`, 'shadow-none')).toBe('shadow-none')
    }
    for (const radius of radii) {
      expect(cn(`rounded-${radius}`, 'rounded-none')).toBe('rounded-none')
    }
  })

  it('keeps a custom shadow next to a shadow colour', () => {
    expect(cn('shadow-card', 'shadow-primary')).toBe('shadow-card shadow-primary')
  })
})

describe('cn with the gradient token', () => {
  it('keeps bg-brand next to a background colour', () => {
    expect(cn('bg-brand', 'bg-white')).toBe('bg-brand bg-white')
  })

  it('lets bg-none replace bg-brand', () => {
    expect(cn('bg-brand', 'bg-none')).toBe('bg-none')
  })
})
