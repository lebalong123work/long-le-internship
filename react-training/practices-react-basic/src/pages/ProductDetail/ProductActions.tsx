import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { WishlistHeartIcon } from '@/components/shared/WishlistHeartIcon'
import { Button } from '@/components/ui/Button'
import { ARIA_DISABLED } from '@/components/ui/interactionClasses'
import { PRODUCT_CARD_TEXT } from '@/constants/productCard'
import { PRODUCT_DETAIL_TEXT } from '@/constants/productDetail'
import { ROUTES } from '@/constants/routes'
import { useAddToCart } from '@/hooks/useCart'
import { useSubmitLock } from '@/hooks/useSubmitLock'
import { useWishlist } from '@/hooks/useWishlist'
import type { AddToCartDto, Product } from '@/types'

interface ProductActionsProps {
  product: Product
  color: string | null
  size: string | null
  quantity: number
  onMissingColor: () => void
}

interface HeartButtonProps {
  product: Product
}

type CartAction = 'add' | 'buy'

const BAG_ICON = '/icons/bag.svg'

function HeartButton({ product }: HeartButtonProps): JSX.Element {
  const { isInWishlist, toggle, isLoaded } = useWishlist()

  return (
    <Button
      variant="icon-gradient"
      aria-label={PRODUCT_CARD_TEXT.saveToWishlist(product.name)}
      aria-pressed={isInWishlist(product.id)}
      aria-disabled={isLoaded ? undefined : true}
      onClick={() => toggle(product.id)}
      className={ARIA_DISABLED}
    >
      <WishlistHeartIcon isSaved={isInWishlist(product.id)} />
    </Button>
  )
}

export function ProductActions({
  product,
  color,
  size,
  quantity,
  onMissingColor,
}: ProductActionsProps): JSX.Element {
  const addToCart = useAddToCart()
  const submitLock = useSubmitLock()
  const navigate = useNavigate()
  const [activeAction, setActiveAction] = useState<CartAction | null>(null)

  function submit(action: CartAction): void {
    if (product.colors.length > 0 && color === null) {
      onMissingColor()
      return
    }
    const payload: AddToCartDto = {
      productId: product.id,
      color: color ?? '',
      size: size ?? '',
      quantity,
    }
    if (!submitLock.acquire()) return
    setActiveAction(action)
    addToCart.mutate(payload, {
      onSuccess: () => {
        if (action === 'buy') navigate(ROUTES.CHECKOUT)
      },
      onSettled: submitLock.release,
    })
  }

  const isPending = addToCart.isPending

  return (
    <div className="mt-10 flex flex-wrap gap-4">
      <Button
        onClick={() => submit('add')}
        disabled={quantity < 1}
        isLoading={isPending && activeAction === 'add'}
        className="min-w-fit flex-1"
      >
        {PRODUCT_DETAIL_TEXT.addToCart}
      </Button>
      <div className="flex shrink-0 gap-4">
        <HeartButton product={product} />
        <Button
          variant="icon-gradient"
          aria-label={PRODUCT_DETAIL_TEXT.buyNow}
          onClick={() => submit('buy')}
          disabled={quantity < 1}
          isLoading={isPending && activeAction === 'buy'}
        >
          <img src={BAG_ICON} alt="" width={32} height={32} className="size-8" />
        </Button>
      </div>
    </div>
  )
}
