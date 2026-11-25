import { useId } from 'react'
import { ProductGrid, ProductGridSkeleton } from '@/components/shared/ProductGrid'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { PRODUCT_DETAIL_TEXT } from '@/constants/productDetail'
import { useRelatedProducts } from '@/hooks/useProducts'
import { RELATED_LIMIT } from '@/services/productService'
import { parseCategoryParam, shopHref } from '@/utils/shopSearchParams'
import type { Product } from '@/types'

interface SameProductSectionProps {
  product: Product
}

const SECTION_CLASSES = {
  section: 'mt-10 xl:mt-[102px] xl:pb-[38px]',
  title: 'text-center font-heading text-h2 font-bold text-dark',
  grid: 'mt-10',
  seeMoreRow: 'mt-10 flex justify-center',
  seeMore: 'w-[180px]',
}

export function SameProductSection({ product }: SameProductSectionProps): JSX.Element | null {
  const titleId = useId()
  const { data, isPending } = useRelatedProducts(product)

  if (data !== undefined && data.length === 0) return null
  if (data === undefined && !isPending) return null

  return (
    <section aria-labelledby={titleId} className={SECTION_CLASSES.section}>
      <h2 id={titleId} className={SECTION_CLASSES.title}>
        {PRODUCT_DETAIL_TEXT.sameProduct}
      </h2>
      {data === undefined ? (
        <div aria-busy="true" className={SECTION_CLASSES.grid}>
          <ProductGridSkeleton count={RELATED_LIMIT} />
        </div>
      ) : (
        <>
          <ProductGrid products={data} className={SECTION_CLASSES.grid} />
          <div className={SECTION_CLASSES.seeMoreRow}>
            <ButtonLink
              to={shopHref(parseCategoryParam(product.category))}
              className={SECTION_CLASSES.seeMore}
            >
              {PRODUCT_DETAIL_TEXT.seeMore}
            </ButtonLink>
          </div>
        </>
      )}
    </section>
  )
}
