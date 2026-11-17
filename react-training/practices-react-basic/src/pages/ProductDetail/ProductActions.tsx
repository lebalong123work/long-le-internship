import { WishlistHeartIcon } from '@/components/shared/WishlistHeartIcon'
import { Button } from '@/components/ui/Button'
import { buttonVariants } from '@/components/ui/buttonVariants'
import { ARIA_DISABLED } from '@/components/ui/interactionClasses'
import { PRODUCT_CARD_TEXT } from '@/constants/productCard'
import { PRODUCT_DETAIL_TEXT } from '@/constants/productDetail'
import { useAuth } from '@/hooks/useAuth'
import { useAddToCart } from '@/hooks/useCart'
import { useRequestLogin } from '@/hooks/usePendingAction'
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

function BagBadge(): JSX.Element {
  return (
    <span aria-hidden="true" className={buttonVariants({ variant: 'icon-gradient' })}>
      <img src={BAG_ICON} alt="" width={32} height={32} className="size-8" />
    </span>
  )
}

export function ProductActions({
  product,
  color,
  size,
  quantity,
  onMissingColor,
}: ProductActionsProps): JSX.Element {
  const { user } = useAuth()
  const addToCart = useAddToCart()
  const requestLogin = useRequestLogin()
  const submitLock = useSubmitLock()

  function handleAdd(): void {
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
    if (!user) {
      requestLogin({ type: 'addToCart', payload })
      return
    }
    if (!submitLock.acquire()) return
    addToCart.mutate(payload, { onSettled: submitLock.release })
  }

  return (
    <div className="mt-10 flex flex-wrap gap-4">
      <Button
        onClick={handleAdd}
        disabled={quantity < 1}
        isLoading={addToCart.isPending}
        className="min-w-fit flex-1"
      >
        {PRODUCT_DETAIL_TEXT.addToCart}
      </Button>
      <div className="flex shrink-0 gap-4">
        <HeartButton product={product} />
        <BagBadge />
      </div>
    </div>
  )
}
