import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['display', 'h1', 'h2', 'h3', 'h4', 'body-lg'] }],
      shadow: [{ shadow: ['header', 'card', 'card-hover', 'button', 'button-light', 'thumb'] }],
      rounded: [{ rounded: ['5', '10', 'hero'] }],
      'bg-image': [{ bg: ['brand'] }],
      w: [{ w: ['card'] }],
      h: [{ h: ['card'] }],
      'max-w': [{ 'max-w': ['card'] }],
      aspect: [{ aspect: ['card'] }],
    },
  },
})

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
