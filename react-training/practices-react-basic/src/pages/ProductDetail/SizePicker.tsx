import { useId } from 'react'
import { PRODUCT_DETAIL_TEXT } from '@/constants/productDetail'
import { cn } from '@/utils/cn'
import {
  PICKER_FIELDSET,
  PICKER_LEGEND,
  PICKER_OPTION_FOCUS,
  PICKER_OPTION_HOVER,
} from './pickerClasses'

interface SizePickerProps {
  sizes: string[]
  value: string | null
  onChange: (size: string) => void
}

export function SizePicker({ sizes, value, onChange }: SizePickerProps): JSX.Element | null {
  const name = useId()
  if (sizes.length === 0) return null

  return (
    <fieldset className={PICKER_FIELDSET}>
      <legend className={PICKER_LEGEND}>{PRODUCT_DETAIL_TEXT.size}</legend>
      <div className="flex flex-wrap gap-3">
        {sizes.map((size) => {
          const isSelected = size === value
          return (
            <label key={size} className="flex cursor-pointer">
              <input
                type="radio"
                name={name}
                value={size}
                checked={isSelected}
                onChange={() => onChange(size)}
                className="peer sr-only"
              />
              <span
                className={cn(
                  'flex h-6 min-w-6 items-center justify-center rounded-full font-body text-sm leading-normal',
                  isSelected ? 'bg-primary font-bold text-white' : 'bg-light text-dark',
                  PICKER_OPTION_FOCUS,
                  PICKER_OPTION_HOVER
                )}
              >
                {size}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
