const VARIANT_SEPARATOR = ' · '
const NAME_SEPARATOR = ', '

function filled(parts: string[]): string[] {
  return parts.filter((part) => part !== '')
}

function lineName(name: string, color: string, size: string): string {
  return filled([name, color, size]).join(NAME_SEPARATOR)
}

export const CART_TEXT = {
  breadcrumbHome: 'Home',
  breadcrumbCart: 'Cart',
  title: 'Cart',
  heading: 'Cart Product',
  loading: 'Loading cart',
  price: 'Price',
  inStock: 'In Stock',
  unavailable: 'Product unavailable',
  unavailableName: 'unavailable product',
  total: 'Total',
  checkout: 'Checkout',
  checkoutBlocked: 'Remove unavailable products to continue to checkout.',
  summaryLabel: 'Order summary',
  shopNow: 'Shop Now',
  variant: (color: string, size: string): string =>
    filled([color && `Color : ${color}`, size && `Size : ${size}`]).join(VARIANT_SEPARATOR),
  quantity: (quantity: number): string => `Quantity : ${quantity}`,
  productCount: (count: number): string => (count === 1 ? '1 Product' : `${count} Products`),
  lineName,
  removeLabel: (name: string, color: string, size: string): string =>
    `Remove ${lineName(name, color, size)} from cart`,
} as const
