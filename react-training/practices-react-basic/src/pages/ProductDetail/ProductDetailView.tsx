import { useEffect, useRef, useState } from 'react'
import { RatingStars } from '@/components/shared/RatingStars'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { focusWithVisibleRing, SCRIPT_FOCUS_RING } from '@/components/ui/focusWithVisibleRing'
import { FOCUS_RING } from '@/components/ui/interactionClasses'
import { QuantityStepper } from '@/components/ui/QuantityStepper'
import { RATING_TEXT } from '@/constants/product'
import { DEFAULT_SIZE, PRODUCT_DETAIL_TEXT } from '@/constants/productDetail'
import { ROUTES } from '@/constants/routes'
import { clampQuantity } from '@/utils/clampQuantity'
import { cn } from '@/utils/cn'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatReviewCount } from '@/utils/formatReviewCount'
import { ColorPicker } from './ColorPicker'
import { ProductGallery } from './ProductGallery'
import { PRODUCT_DETAIL_LAYOUT } from './productDetailLayout'
import { SizePicker } from './SizePicker'
import type { BreadcrumbItem } from '@/components/ui/Breadcrumb'
import type { Product } from '@/types'

interface ProductDetailViewProps {
  product: Product
  focusHeadingOnMount?: boolean
}

interface StockProps {
  stock: number
}

const LABEL_CLASS = 'font-body text-lg font-bold leading-normal text-dark'
const STOCK_ICON = '/icons/stock.svg'

function defaultSize(sizes: string[]): string | null {
  return sizes.includes(DEFAULT_SIZE) ? DEFAULT_SIZE : (sizes[0] ?? null)
}

function breadcrumbItems(productName: string): BreadcrumbItem[] {
  return [
    { label: PRODUCT_DETAIL_TEXT.breadcrumbHome, to: ROUTES.HOME },
    { label: PRODUCT_DETAIL_TEXT.breadcrumbShop, to: ROUTES.SHOP },
    { label: productName },
  ]
}

function isFocusFree(): boolean {
  const focused = document.activeElement
  return focused === null || focused === document.body
}

function Stock({ stock }: StockProps): JSX.Element {
  return (
    <div className="xl:col-start-2 xl:row-span-2 xl:row-start-1 xl:justify-self-end">
      <p className={LABEL_CLASS}>
        {stock > 0 ? PRODUCT_DETAIL_TEXT.inStock : PRODUCT_DETAIL_TEXT.outOfStock}
      </p>
      <p className="mt-4 flex items-center gap-2 font-body text-lg leading-normal text-medium-dark">
        <span aria-hidden="true">{PRODUCT_DETAIL_TEXT.stockCount(stock)}</span>
        <span className="sr-only">{PRODUCT_DETAIL_TEXT.stockCountLabel(stock)}</span>
        <img src={STOCK_ICON} alt="" width={24} height={24} className="size-6" />
      </p>
    </div>
  )
}

export function ProductDetailView({
  product,
  focusHeadingOnMount = false,
}: ProductDetailViewProps): JSX.Element {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const [chosenColor, setChosenColor] = useState<string | null>(null)
  const [chosenSize, setChosenSize] = useState<string | null>(null)
  const [chosenQuantity, setChosenQuantity] = useState(1)

  const color = chosenColor !== null && product.colors.includes(chosenColor) ? chosenColor : null
  const size =
    chosenSize !== null && product.sizes.includes(chosenSize)
      ? chosenSize
      : defaultSize(product.sizes)
  const quantity = clampQuantity(chosenQuantity, product.stock)

  useEffect(() => {
    if (focusHeadingOnMount && headingRef.current && isFocusFree()) {
      focusWithVisibleRing(headingRef.current)
    }
  }, [focusHeadingOnMount])

  return (
    <>
      <Breadcrumb items={breadcrumbItems(product.name)} />
      <div className={PRODUCT_DETAIL_LAYOUT.columns}>
        <div className={PRODUCT_DETAIL_LAYOUT.gallery}>
          <ProductGallery images={product.images} productName={product.name} />
        </div>
        <div className={PRODUCT_DETAIL_LAYOUT.info}>
          <h1
            ref={headingRef}
            tabIndex={-1}
            className={cn(
              'break-words font-heading text-h2 font-bold text-dark',
              FOCUS_RING,
              SCRIPT_FOCUS_RING
            )}
          >
            {product.name}
          </h1>
          <p className="mt-6 font-body text-body-lg text-medium-dark">{product.description}</p>
          <div className="mt-4 flex items-center gap-4">
            <RatingStars rating={product.rating} className="gap-2" />
            <p className="font-heading text-sm leading-normal text-medium-dark">
              <span aria-hidden="true">
                {RATING_TEXT.reviewCountShort(formatReviewCount(product.reviewCount))}
              </span>
              <span className="sr-only">{RATING_TEXT.reviews(product.reviewCount)}</span>
            </p>
          </div>
          <div className="mt-6 grid gap-y-6 xl:grid-cols-[1fr_auto]">
            <Stock stock={product.stock} />
            <p className="font-heading text-h2 font-bold text-dark xl:col-start-2 xl:row-start-3 xl:mt-[43px] xl:text-right">
              {formatCurrency(product.price, 'long')}
            </p>
            <div className="xl:col-start-1 xl:row-start-1">
              <ColorPicker colors={product.colors} value={color} onChange={setChosenColor} />
            </div>
            <div className="xl:col-start-1 xl:row-start-2">
              <SizePicker sizes={product.sizes} value={size} onChange={setChosenSize} />
            </div>
            <div className="flex flex-col gap-[18px] xl:col-start-1 xl:row-start-3">
              <p className={LABEL_CLASS}>{PRODUCT_DETAIL_TEXT.quantity}</p>
              <QuantityStepper
                value={quantity}
                onChange={(next) => setChosenQuantity(clampQuantity(next, product.stock))}
                productName={product.name}
                max={product.stock}
                bordered
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
