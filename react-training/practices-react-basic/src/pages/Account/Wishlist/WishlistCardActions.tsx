import { Button } from '@/components/ui/Button'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { ROUTES } from '@/constants/routes'
import { WISHLIST_TEXT } from '@/constants/wishlist'
import type { Product } from '@/types'

interface WishlistCardActionsProps {
  product: Product
  onRemove: () => void
}

const CARD_BUTTON = 'h-auto min-h-12 w-full px-2 text-center'

export function WishlistCardActions({ product, onRemove }: WishlistCardActionsProps): JSX.Element {
  return (
    <>
      <ButtonLink to={ROUTES.PRODUCT(product.id)} className={CARD_BUTTON}>
        <span>
          {WISHLIST_TEXT.chooseOptions}
          <span className="sr-only">{WISHLIST_TEXT.chooseOptionsName(product.name)}</span>
        </span>
      </ButtonLink>
      <Button variant="light" onClick={onRemove} className={CARD_BUTTON}>
        {WISHLIST_TEXT.remove}
        <span className="sr-only">{WISHLIST_TEXT.removeName(product.name)}</span>
      </Button>
    </>
  )
}
