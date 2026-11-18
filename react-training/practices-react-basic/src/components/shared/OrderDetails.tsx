import { CART_TEXT } from '@/constants/cart'
import { CHECKOUT_TEXT, PAYMENT_METHOD_LABELS } from '@/constants/checkout'
import { ORDER_TEXT } from '@/constants/order'
import { cn } from '@/utils/cn'
import { formatCurrency } from '@/utils/formatCurrency'
import { OrderAmounts } from './OrderAmounts'
import { OrderLineItem } from './OrderLineItem'
import { ORDER_SUMMARY_CLASSES } from './orderSummaryClasses'
import type { ShippingAddress, Order } from '@/types'
import type { ReactNode } from 'react'

interface OrderDetailsProps {
  order: Order
  className?: string
}

interface DetailGroupProps {
  heading: string
  children: ReactNode
}

interface AddressLinesProps {
  address: ShippingAddress
}

function DetailGroup({ heading, children }: DetailGroupProps): JSX.Element {
  return (
    <div className={ORDER_SUMMARY_CLASSES.group}>
      <h2 className={ORDER_SUMMARY_CLASSES.heading}>{heading}</h2>
      {children}
    </div>
  )
}

function AddressLines({ address }: AddressLinesProps): JSX.Element {
  const note = address.note?.trim() ? address.note : undefined

  return (
    <div className={ORDER_SUMMARY_CLASSES.bodyText}>
      <p>{address.fullName}</p>
      <p>{address.phone}</p>
      <p>{address.email}</p>
      <p>{ORDER_TEXT.addressLine(address.address, address.ward, address.province)}</p>
      {note !== undefined && <p>{ORDER_TEXT.note(note)}</p>}
    </div>
  )
}

export function OrderDetails({ order, className }: OrderDetailsProps): JSX.Element {
  return (
    <div className={cn(ORDER_SUMMARY_CLASSES.section, className)}>
      <DetailGroup heading={ORDER_TEXT.productsHeading}>
        <ul className={ORDER_SUMMARY_CLASSES.list}>
          {order.items.map((item, index) => (
            <OrderLineItem
              key={index}
              imageSrc={item.image}
              name={item.name}
              variantLabel={CART_TEXT.variant(item.color, item.size)}
              quantityLabel={CHECKOUT_TEXT.quantity(item.quantity)}
              lineTotalLabel={formatCurrency(item.price * item.quantity, 'long')}
            />
          ))}
        </ul>
      </DetailGroup>
      <hr className={ORDER_SUMMARY_CLASSES.divider} />
      <DetailGroup heading={CHECKOUT_TEXT.shippingLegend}>
        <AddressLines address={order.shippingAddress} />
      </DetailGroup>
      <hr className={ORDER_SUMMARY_CLASSES.divider} />
      <DetailGroup heading={CHECKOUT_TEXT.paymentLegend}>
        <p className={ORDER_SUMMARY_CLASSES.bodyText}>
          {PAYMENT_METHOD_LABELS[order.paymentMethod]}
        </p>
      </DetailGroup>
      <hr className={ORDER_SUMMARY_CLASSES.divider} />
      <OrderAmounts subtotal={order.subtotal} shippingFee={order.shippingFee} total={order.total} />
    </div>
  )
}
