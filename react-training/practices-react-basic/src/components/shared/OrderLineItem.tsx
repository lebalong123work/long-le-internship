import { ImageThumbnail } from './ProductThumbnail'
import { ORDER_SUMMARY_CLASSES } from './orderSummaryClasses'
import type { ReactNode } from 'react'

interface OrderLineItemProps {
  imageSrc: string | undefined
  name: string
  variantLabel?: string
  quantityLabel: string
  lineTotalLabel: string
  children?: ReactNode
}

export function OrderLineItem({
  imageSrc,
  name,
  variantLabel,
  quantityLabel,
  lineTotalLabel,
  children,
}: OrderLineItemProps): JSX.Element {
  const hasVariant = variantLabel !== undefined && variantLabel.trim() !== ''

  return (
    <li className={ORDER_SUMMARY_CLASSES.row}>
      <ImageThumbnail src={imageSrc} />
      <div className={ORDER_SUMMARY_CLASSES.info}>
        <p className={ORDER_SUMMARY_CLASSES.name}>{name}</p>
        {hasVariant && <p className={ORDER_SUMMARY_CLASSES.detail}>{variantLabel}</p>}
        <p className={ORDER_SUMMARY_CLASSES.detail}>{quantityLabel}</p>
        <p className={ORDER_SUMMARY_CLASSES.name}>{lineTotalLabel}</p>
        {children}
      </div>
    </li>
  )
}
