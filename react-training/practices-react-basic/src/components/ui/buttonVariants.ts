import { cva } from 'class-variance-authority'

export type ButtonVariant = 'primary' | 'light' | 'icon-gradient'

export const buttonVariants = cva(
  'inline-flex h-12 items-center justify-center gap-2.5 rounded-none font-body text-lg font-bold leading-normal',
  {
    variants: {
      variant: {
        primary: 'bg-brand px-[34px] py-2.5 text-white shadow-button',
        light: 'bg-white px-[34px] py-2.5 text-primary shadow-button-light',
        'icon-gradient': 'size-12 bg-brand text-white shadow-button',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  }
)

export const GRADIENT_TEXT = 'bg-brand bg-clip-text text-transparent'
