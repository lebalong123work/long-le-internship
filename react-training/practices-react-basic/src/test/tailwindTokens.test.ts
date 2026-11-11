import postcss from 'postcss'
import tailwindcss from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'
import resolveConfig from 'tailwindcss/resolveConfig'
import config from '../../tailwind.config'
import indexHtml from '../../index.html?raw'

const theme = resolveConfig(config).theme

const MOUSE_MEDIA_PARAMS = '(hover: hover) and (pointer: fine)'
const GOOGLE_FONTS_CSS_URL = 'https://fonts.googleapis.com/css2'

async function generateCss(classes: string): Promise<string> {
  const result = await postcss([
    tailwindcss({ ...config, content: [{ raw: `<div class="${classes}"></div>` }] }),
  ]).process('@tailwind components; @tailwind utilities;', { from: undefined })
  return result.css
}

function fontFamilies(): string[] {
  const page = new DOMParser().parseFromString(indexHtml, 'text/html')
  const stylesheets = Array.from(page.querySelectorAll('link[rel="stylesheet"]'))
  const fontLink = stylesheets.find((link) =>
    link.getAttribute('href')?.startsWith(GOOGLE_FONTS_CSS_URL)
  )
  const url = new URL(fontLink?.getAttribute('href') ?? GOOGLE_FONTS_CSS_URL)
  return [...url.searchParams.getAll('family'), `display=${url.searchParams.get('display')}`]
}

function parentTypeOf(css: string, selector: string): string | undefined {
  let parentType: string | undefined
  postcss.parse(css).walkRules((rule) => {
    if (rule.selector === selector) parentType = rule.parent?.type
  })
  return parentType
}

describe('color tokens', () => {
  it('maps every color token to its Figma hex', () => {
    expect(theme.colors).toMatchObject({
      primary: '#5463FF',
      dark: '#0D1222',
      'medium-dark': '#646464',
      medium: '#969696',
      'light-medium': '#DDDDDD',
      light: '#F4F4F4',
      footer: '#393E46',
      badge: '#EF8484',
      star: '#FFD43C',
      white: '#fff',
      black: '#000',
    })
  })

  it('generates no class for a color outside the token list', async () => {
    expect(await generateCss('bg-secondary')).not.toContain('.bg-secondary')
  })
})

describe('gradient token', () => {
  it('generates the brand gradient for bg-brand', async () => {
    expect(await generateCss('bg-brand')).toContain(
      'background-image: linear-gradient(180deg, #7D89FF 0%, #AB40FF 66.67%)'
    )
  })

  it('generates no class for an unknown gradient name', async () => {
    expect(await generateCss('bg-gradient')).not.toContain('.bg-gradient')
  })
})

describe('font families', () => {
  it('maps heading, body, numeric and logo to Mada, Poppins, Signika and Roboto', () => {
    expect(theme.fontFamily).toMatchObject({
      heading: ['Mada', 'sans-serif'],
      body: ['Poppins', 'sans-serif'],
      numeric: ['Signika', 'sans-serif'],
      logo: ['Roboto', 'sans-serif'],
    })
  })

  it('generates no class named after a font family', async () => {
    expect(await generateCss('font-mada')).not.toContain('.font-mada')
  })
})

describe('font sizes', () => {
  it('maps display, h1, h2, h3, h4 and body-lg to the Figma size and line-height', () => {
    expect(theme.fontSize).toMatchObject({
      display: ['3rem', { lineHeight: '4.6875rem' }],
      h1: ['3rem', { lineHeight: '1.2' }],
      h2: ['2.5rem', { lineHeight: '3.25rem' }],
      h3: ['2.25rem', { lineHeight: '2.9375rem' }],
      h4: ['1.5rem', { lineHeight: '1.9375rem' }],
      'body-lg': ['1.125rem', { lineHeight: '1.875rem' }],
    })
  })

  it('generates no class for a size outside the token list', async () => {
    expect(await generateCss('text-h5')).not.toContain('.text-h5')
  })
})

describe('normal line-height', () => {
  it('uses CSS normal line-height for leading-normal', async () => {
    expect(await generateCss('leading-normal')).toContain('line-height: normal')
  })

  it('keeps the Tailwind default line-height on text-lg without leading-normal', async () => {
    expect(await generateCss('text-lg')).toContain('line-height: 1.75rem')
  })
})

describe('radius tokens', () => {
  it('maps rounded-5, rounded-10 and rounded-hero to the Figma radius', () => {
    expect(theme.borderRadius).toMatchObject({
      5: '5px',
      10: '10px',
      hero: '100px 100px 100px 0',
      sm: '0.125rem',
    })
  })

  it('generates no class for a radius outside the token list', async () => {
    expect(await generateCss('rounded-100')).not.toContain('.rounded-100')
  })
})

describe('shadow tokens', () => {
  it('maps the six shadow tokens to the Figma raw values', () => {
    expect(theme.boxShadow).toMatchObject({
      header: '0 10px 20px rgba(0, 0, 0, 0.1)',
      card: '0 20px 20px rgba(0, 0, 0, 0.05)',
      'card-hover': '0 20px 20px rgba(0, 0, 0, 0.15)',
      button: '0 20px 20px rgba(0, 0, 0, 0.1)',
      'button-light': '0 20px 20px rgba(0, 0, 0, 0.05)',
      thumb: '0 4px 10px rgba(0, 0, 0, 0.25)',
    })
  })

  it('generates no class for an unknown shadow name', async () => {
    expect(await generateCss('shadow-hover')).not.toContain('.shadow-hover')
  })
})

describe('card size', () => {
  it('maps w-card to 265px and h-card to 366px', async () => {
    const css = await generateCss('w-card h-card')
    expect(css).toContain('width: 265px')
    expect(css).toContain('height: 366px')
  })

  it('generates no spacing class for the card size', async () => {
    expect(await generateCss('p-card')).not.toContain('.p-card')
  })
})

describe('container', () => {
  it('centers the container and caps it at 1200px from 1200px wide', async () => {
    const css = await generateCss('container')
    expect(css).toContain('margin-right: auto')
    expect(css).toContain('margin-left: auto')
    expect(css).toMatch(/@media \(min-width: 1200px\) \{\s*\.container \{\s*max-width: 1200px\s*\}/)
  })

  it('sets no max-width on the container below 1200px', async () => {
    const maxWidthParents: (string | undefined)[] = []
    postcss.parse(await generateCss('container')).walkDecls('max-width', (decl) => {
      maxWidthParents.push(decl.parent?.parent?.type)
    })
    expect(maxWidthParents).toEqual(['atrule'])
  })
})

describe('screens', () => {
  it('uses the Tailwind default screens', () => {
    expect(theme.screens).toEqual(defaultTheme.screens)
    expect(theme.screens).toMatchObject({ md: '768px', lg: '1024px', xl: '1280px' })
  })

  it('has no custom screen', () => {
    expect(Object.keys(theme.screens)).toEqual(['sm', 'md', 'lg', 'xl', '2xl'])
  })
})

describe('can-hover variant', () => {
  it('wraps can-hover classes in the mouse media query', async () => {
    const css = await generateCss('can-hover:opacity-0')
    expect(css).toContain(`@media ${MOUSE_MEDIA_PARAMS}`)
    expect(parentTypeOf(css, '.can-hover\\:opacity-0')).toBe('atrule')
  })

  it('does not wrap focus-within classes in the mouse media query', async () => {
    const css = await generateCss('focus-within:opacity-100')
    expect(css).not.toContain(MOUSE_MEDIA_PARAMS)
    expect(parentTypeOf(css, '.focus-within\\:opacity-100:focus-within')).toBe('root')
  })
})

describe('Google Fonts link', () => {
  it('loads Mada, Poppins, Signika 400/700 and Roboto 700 with display swap', () => {
    expect(fontFamilies()).toEqual([
      'Mada:wght@400;700',
      'Poppins:wght@400;700',
      'Signika:wght@400;700',
      'Roboto:wght@700',
      'display=swap',
    ])
  })
})
