import plugin from 'tailwindcss/plugin'
import type { Config } from 'tailwindcss'

const MOUSE_MEDIA_QUERY = '@media (hover: hover) and (pointer: fine)'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      screens: {
        content: '1200px',
      },
    },
    extend: {
      colors: {
        primary: '#5463FF',
        dark: '#0D1222',
        'medium-dark': '#646464',
        medium: '#969696',
        'light-medium': '#DDDDDD',
        light: '#F4F4F4',
        footer: '#393E46',
        badge: '#EF8484',
        star: '#FFD43C',
        error: '#DC2626',
      },
      backgroundImage: {
        brand: 'linear-gradient(180deg, #7D89FF 0%, #AB40FF 66.67%)',
      },
      fontFamily: {
        heading: ['Mada', 'sans-serif'],
        body: ['Poppins', 'sans-serif'],
        numeric: ['Signika', 'sans-serif'],
        logo: ['Roboto', 'sans-serif'],
      },
      fontSize: {
        display: ['3rem', { lineHeight: '4.6875rem' }],
        h1: ['3rem', { lineHeight: '1.2' }],
        h2: ['2.5rem', { lineHeight: '3.25rem' }],
        h3: ['2.25rem', { lineHeight: '2.9375rem' }],
        h4: ['1.5rem', { lineHeight: '1.9375rem' }],
        'body-lg': ['1.125rem', { lineHeight: '1.875rem' }],
      },
      lineHeight: {
        normal: 'normal',
      },
      borderRadius: {
        5: '5px',
        10: '10px',
        hero: '100px 100px 100px 0',
      },
      boxShadow: {
        header: '0 10px 20px rgba(0, 0, 0, 0.1)',
        card: '0 20px 20px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 20px 20px rgba(0, 0, 0, 0.15)',
        button: '0 20px 20px rgba(0, 0, 0, 0.1)',
        'button-light': '0 20px 20px rgba(0, 0, 0, 0.05)',
        thumb: '0 4px 10px rgba(0, 0, 0, 0.25)',
      },
      width: {
        card: '265px',
      },
      height: {
        card: '366px',
      },
      maxWidth: {
        card: '265px',
      },
      aspectRatio: {
        card: '265 / 248',
      },
    },
  },
  plugins: [
    plugin(({ addVariant }) => {
      addVariant('can-hover', MOUSE_MEDIA_QUERY)
    }),
  ],
}

export default config
