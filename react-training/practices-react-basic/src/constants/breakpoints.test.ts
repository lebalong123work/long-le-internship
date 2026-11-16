import resolveConfig from 'tailwindcss/resolveConfig'
import { describe, expect, it } from 'vitest'
import config from '../../tailwind.config'
import { DESKTOP_MEDIA_QUERY } from './breakpoints'

const screens = resolveConfig(config).theme.screens

describe('DESKTOP_MEDIA_QUERY', () => {
  it('desktop media query uses the Tailwind xl width', () => {
    expect(DESKTOP_MEDIA_QUERY).toBe(`(min-width: ${screens.xl})`)
  })

  it('desktop media query is not the lg width', () => {
    expect(DESKTOP_MEDIA_QUERY).not.toBe(`(min-width: ${screens.lg})`)
  })
})
