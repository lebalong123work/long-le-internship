import { useId, useRef, useState } from 'react'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { ProductGrid, ProductGridSkeleton } from '@/components/shared/ProductGrid'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { focusWithVisibleRing } from '@/components/ui/focusWithVisibleRing'
import { Tabs } from '@/components/ui/Tabs'
import { BEST_SELLER_TEXT, CATEGORY_TABS } from '@/constants/bestSeller'
import { CATEGORIES } from '@/constants/categories'
import { ROUTES } from '@/constants/routes'
import { UI_STATE_MESSAGES } from '@/constants/uiStateMessages'
import { useBestSellers } from '@/hooks/useProducts'
import { BEST_SELLER_LIMIT } from '@/services/productService'
import type { CategorySlug } from '@/constants/categories'
import type { Product } from '@/types'

const DEFAULT_CATEGORY: CategorySlug = CATEGORIES[0].slug
const EMPTY_ICON = '/icons/cart.svg'

const SECTION_CLASSES = {
  section: 'container px-4 md:px-6 xl:px-0',
  eyebrow: 'text-center font-body text-body-lg uppercase text-primary',
  title: 'mt-4 text-center font-heading text-h2 font-bold text-dark md:text-h1',
  tabs: 'mt-4 flex flex-col gap-10 xl:gap-[43px]',
  tabList: 'flex-wrap justify-center gap-x-6 gap-y-4 md:gap-x-10',
  seeMoreRow: 'mt-10 flex justify-center xl:mt-[50px]',
  seeMore: 'w-[180px]',
}

interface ResultsProps {
  products: Product[] | undefined
  isRetrying: boolean
  isPending: boolean
  onRetry: () => void
}

function withCategory(
  categories: ReadonlySet<CategorySlug>,
  category: CategorySlug
): ReadonlySet<CategorySlug> {
  return new Set(categories).add(category)
}

function withoutCategory(
  categories: ReadonlySet<CategorySlug>,
  category: CategorySlug
): ReadonlySet<CategorySlug> {
  const next = new Set(categories)
  next.delete(category)
  return next
}

function canTakeFocus(panel: HTMLElement): boolean {
  const focused = document.activeElement
  return focused === null || focused === document.body || panel.contains(focused)
}

function BestSellerResults({
  products,
  isRetrying,
  isPending,
  onRetry,
}: ResultsProps): JSX.Element {
  if (products !== undefined) {
    return products.length === 0 ? (
      <EmptyState iconSrc={EMPTY_ICON} message={UI_STATE_MESSAGES.emptyCategory} />
    ) : (
      <ProductGrid products={products} />
    )
  }
  if (!isRetrying && isPending) {
    return (
      <div aria-busy="true">
        <ProductGridSkeleton count={BEST_SELLER_LIMIT} />
      </div>
    )
  }
  return <ErrorState onRetry={onRetry} isRetrying={isRetrying} />
}

export function BestSellerSection(): JSX.Element {
  const titleId = useId()
  const [activeCategory, setActiveCategory] = useState<CategorySlug>(DEFAULT_CATEGORY)
  const [retryingCategories, setRetryingCategories] = useState<ReadonlySet<CategorySlug>>(
    () => new Set()
  )
  const activeCategoryRef = useRef<CategorySlug>(DEFAULT_CATEGORY)
  const selectionGenerationRef = useRef(0)
  const panelRef = useRef<HTMLDivElement>(null)
  const { data, isPending, refetch } = useBestSellers(activeCategory)
  const isRetrying = retryingCategories.has(activeCategory)
  const isFirstLoad = data === undefined && !isRetrying && isPending

  function selectCategory(category: CategorySlug): void {
    activeCategoryRef.current = category
    selectionGenerationRef.current += 1
    setActiveCategory(category)
  }

  function focusPanelAfterRetry(generation: number): void {
    const panel = panelRef.current
    if (!panel) return
    if (selectionGenerationRef.current !== generation) return
    if (canTakeFocus(panel)) focusWithVisibleRing(panel)
  }

  async function retry(): Promise<void> {
    const category = activeCategoryRef.current
    const generation = selectionGenerationRef.current
    setRetryingCategories((current) => withCategory(current, category))
    const result = await refetch()
    setRetryingCategories((current) => withoutCategory(current, category))
    if (result.status === 'success') focusPanelAfterRetry(generation)
  }

  return (
    <section aria-labelledby={titleId} className={SECTION_CLASSES.section}>
      <p className={SECTION_CLASSES.eyebrow}>{BEST_SELLER_TEXT.eyebrow}</p>
      <h2 id={titleId} className={SECTION_CLASSES.title}>
        {BEST_SELLER_TEXT.title}
      </h2>
      <p role="status" className="sr-only">
        {isFirstLoad ? BEST_SELLER_TEXT.loading : ''}
      </p>
      <Tabs
        items={CATEGORY_TABS}
        activeId={activeCategory}
        onSelect={selectCategory}
        label={BEST_SELLER_TEXT.tabsLabel}
        activationMode="manual"
        panelFocusable
        panelRef={panelRef}
        className={SECTION_CLASSES.tabs}
        listClassName={SECTION_CLASSES.tabList}
      >
        <BestSellerResults
          products={data}
          isRetrying={isRetrying}
          isPending={isPending}
          onRetry={() => {
            void retry()
          }}
        />
      </Tabs>
      <div className={SECTION_CLASSES.seeMoreRow}>
        <ButtonLink to={ROUTES.SHOP_CATEGORY(activeCategory)} className={SECTION_CLASSES.seeMore}>
          {BEST_SELLER_TEXT.seeMore}
        </ButtonLink>
      </div>
    </section>
  )
}
