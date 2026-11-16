import { useId } from 'react'
import { PRODUCT_DETAIL_TEXT, SWATCH_COLORS } from '@/constants/productDetail'
import { cn } from '@/utils/cn'
import {
  PICKER_FIELDSET,
  PICKER_LEGEND,
  PICKER_OPTION_FOCUS,
  PICKER_OPTION_HOVER,
} from './pickerClasses'

interface ColorPickerProps {
  colors: string[]
  value: string | null
  onChange: (color: string) => void
}

interface SwatchProps {
  color: string
  isSelected: boolean
}

const SWATCH_SHAPE = 'flex size-4 shrink-0 items-center justify-center rounded-full'
const RING_SHAPE = 'border-[0.5px] border-medium'

function KnownSwatch({ color, isSelected }: SwatchProps): JSX.Element {
  const hex = SWATCH_COLORS[color]
  if (isSelected) {
    return (
      <span className={cn(SWATCH_SHAPE, RING_SHAPE, 'bg-white')}>
        <span className="size-2 rounded-full" style={{ backgroundColor: hex }} />
      </span>
    )
  }
  return <span className={SWATCH_SHAPE} style={{ backgroundColor: hex }} />
}

function UnknownSwatch({ color, isSelected }: SwatchProps): JSX.Element {
  return (
    <span className="flex items-center gap-2">
      <span className={cn(SWATCH_SHAPE, RING_SHAPE, isSelected ? 'bg-white' : 'bg-light')}>
        {isSelected && <span className="size-2 rounded-full bg-medium-dark" />}
      </span>
      <span
        aria-hidden="true"
        className={cn('font-body text-sm leading-normal text-dark', isSelected && 'font-bold')}
      >
        {color}
      </span>
    </span>
  )
}

function isKnownColor(color: string): boolean {
  return Object.prototype.hasOwnProperty.call(SWATCH_COLORS, color)
}

export function ColorPicker({ colors, value, onChange }: ColorPickerProps): JSX.Element | null {
  const name = useId()
  if (colors.length === 0) return null

  return (
    <fieldset className={PICKER_FIELDSET}>
      <legend className={PICKER_LEGEND}>{PRODUCT_DETAIL_TEXT.color}</legend>
      <div className="flex flex-wrap items-center gap-2.5">
        {colors.map((color) => {
          const isSelected = color === value
          const Swatch = isKnownColor(color) ? KnownSwatch : UnknownSwatch
          return (
            <label key={color} className="flex cursor-pointer">
              <input
                type="radio"
                name={name}
                value={color}
                checked={isSelected}
                onChange={() => onChange(color)}
                aria-label={color}
                className="peer sr-only"
              />
              <span className={cn('rounded-full', PICKER_OPTION_FOCUS, PICKER_OPTION_HOVER)}>
                <Swatch color={color} isSelected={isSelected} />
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
