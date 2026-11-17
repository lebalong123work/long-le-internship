import { Link } from 'react-router-dom'
import { FOCUS_RING, HOVER_OPACITY } from '@/components/ui/interactionClasses'
import { QuantityStepper } from '@/components/ui/QuantityStepper'
import { CART_TEXT } from '@/constants/cart'
import { PRODUCT_DETAIL_TEXT } from '@/constants/productDetail'
import { ROUTES } from '@/constants/routes'
import { clampQuantity } from '@/utils/clampQuantity'
import { cn } from '@/utils/cn'
import { formatCurrency } from '@/utils/formatCurrency'
import { CART_LAYOUT } from './cartLayout'
import type { CartLine } from '@/hooks/useCartLines'
import type { CartItem, Product } from '@/types'

interface CartItemRowProps {
  line: CartLine
  onQuantityChange: (quantity: number) => void
  onRemove: () => void
}

interface ThumbnailProps {
  src: string | undefined
}

interface LineInfoProps {
  item: CartItem
  product: Product | null
}

interface ValueBlockProps {
  value: string
  label: string
  className?: string
}

interface RemoveButtonProps {
  label: string
  onClick: () => void
}

const TRASH_ICON = '/icons/trash.svg'

const ROW_CLASSES = {
  row: 'grid grid-cols-2 items-center gap-4 bg-light p-4 md:grid-cols-[minmax(0,1fr)_auto_auto_auto] md:items-start md:gap-6 md:p-6 xl:grid-cols-[364px_172px_minmax(0,1fr)_auto] xl:gap-x-0 xl:gap-y-[37px] xl:p-10',
  identity: 'col-span-2 flex min-w-0 gap-4 md:col-span-1 md:gap-6 xl:gap-10',
  thumbnail: 'size-20 shrink-0 bg-[#C4C4C4] object-cover',
  info: 'min-w-0 xl:pt-[9px]',
  name: 'block break-words font-heading text-h4 font-bold text-dark',
  detail: CART_LAYOUT.detailText,
  value: 'font-heading text-h4 font-bold text-dark',
  price: 'md:pt-1.5 xl:w-fit xl:text-center',
  stock: 'md:pt-1.5',
  stepper: 'md:col-span-full md:row-start-2 md:justify-self-end',
  remove:
    'col-start-2 -mr-2 inline-flex size-10 shrink-0 items-center justify-center justify-self-end md:col-start-4 md:row-start-1 md:-mt-2 xl:mt-[18px]',
}

function thumbnailSrc(product: Product | null): string | undefined {
  const candidates = [product?.images[0]?.src, product?.thumbnail]
  return candidates.find((src) => src !== undefined && src.trim() !== '')
}

function Thumbnail({ src }: ThumbnailProps): JSX.Element {
  if (src === undefined) return <div aria-hidden="true" className={ROW_CLASSES.thumbnail} />
  return <img src={src} alt="" width={80} height={80} className={ROW_CLASSES.thumbnail} />
}

function LineInfo({ item, product }: LineInfoProps): JSX.Element {
  const variant = CART_TEXT.variant(item.color, item.size)

  return (
    <div className={ROW_CLASSES.info}>
      {product ? (
        <Link to={ROUTES.PRODUCT(product.id)} className={cn(ROW_CLASSES.name, FOCUS_RING)}>
          {product.name}
        </Link>
      ) : (
        <p className={ROW_CLASSES.name}>{CART_TEXT.unavailable}</p>
      )}
      {variant !== '' && <p className={cn(ROW_CLASSES.detail, 'mt-2')}>{variant}</p>}
      {product === null && (
        <p className={cn(ROW_CLASSES.detail, 'mt-2')}>{CART_TEXT.quantity(item.quantity)}</p>
      )}
    </div>
  )
}

function ValueBlock({ value, label, className }: ValueBlockProps): JSX.Element {
  return (
    <div className={className}>
      <p className={ROW_CLASSES.value}>{value}</p>
      <p className={cn(ROW_CLASSES.detail, 'mt-[11px]')}>{label}</p>
    </div>
  )
}

function RemoveButton({ label, onClick }: RemoveButtonProps): JSX.Element {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(ROW_CLASSES.remove, FOCUS_RING, HOVER_OPACITY)}
    >
      <img src={TRASH_ICON} alt="" width={24} height={24} className="size-6" />
    </button>
  )
}

export function CartItemRow({ line, onQuantityChange, onRemove }: CartItemRowProps): JSX.Element {
  const { item, product } = line
  const displayName = product?.name ?? CART_TEXT.unavailableName

  function changeQuantity(product: Product, next: number): void {
    const quantity = clampQuantity(next, product.stock)
    if (quantity !== item.quantity) onQuantityChange(quantity)
  }

  return (
    <li className={ROW_CLASSES.row}>
      <div className={ROW_CLASSES.identity}>
        <Thumbnail src={thumbnailSrc(product)} />
        <LineInfo item={item} product={product} />
      </div>
      {product && (
        <>
          <ValueBlock
            value={formatCurrency(product.price, 'long')}
            label={CART_TEXT.price}
            className={ROW_CLASSES.price}
          />
          <ValueBlock
            value={String(product.stock)}
            label={product.stock > 0 ? CART_TEXT.inStock : PRODUCT_DETAIL_TEXT.outOfStock}
            className={ROW_CLASSES.stock}
          />
          <div className={ROW_CLASSES.stepper}>
            <QuantityStepper
              value={item.quantity}
              onChange={(next) => changeQuantity(product, next)}
              productName={CART_TEXT.lineName(product.name, item.color, item.size)}
              max={product.stock}
            />
          </div>
        </>
      )}
      <RemoveButton
        label={CART_TEXT.removeLabel(displayName, item.color, item.size)}
        onClick={onRemove}
      />
    </li>
  )
}
