import { CATEGORIES } from './categories'
import { ORDER_LOOKUP_TEXT } from './order'
import { ROUTES } from './routes'
import { STORE_CONTACT } from './store'

export interface FooterLinkItem {
  id: string
  label: string
  to: string
}

export interface FooterLinkGroup {
  id: string
  heading: string
  items: readonly FooterLinkItem[]
  hasLogInItem: boolean
}

export interface SocialLink {
  id: string
  label: string
  href: string | null
  iconSrc: string
}

export const FOOTER_TEXT = {
  description:
    'Explore everyday clothing at Mangcoding Store, from T-shirts and shirts to jackets and jeans. Find pieces that fit your personal style.',
  navLabel: 'Footer',
  socialLabel: 'Social media',
  email: STORE_CONTACT.email,
  homeHeading: 'Home',
  shopHeading: 'Shop',
  categoriesHeading: 'Categories',
  contactHeading: 'Contact',
} as const

export const FOOTER_CATEGORY_LINKS: readonly FooterLinkItem[] = [
  { id: 'men', label: 'Men', to: ROUTES.SHOP },
  { id: 'children', label: 'Children', to: ROUTES.SHOP },
  { id: 'women', label: 'Women', to: ROUTES.SHOP },
]

export const FOOTER_LINK_GROUPS: readonly FooterLinkGroup[] = [
  {
    id: 'home',
    heading: FOOTER_TEXT.homeHeading,
    items: [
      { id: 'product', label: 'Product', to: ROUTES.SHOP },
      { id: 'categories', label: 'Categories', to: ROUTES.SHOP },
      { id: 'shop', label: 'Shop', to: ROUTES.SHOP },
      { id: 'track-order', label: ORDER_LOOKUP_TEXT.linkLabel, to: ROUTES.ORDER_LOOKUP },
    ],
    hasLogInItem: true,
  },
  {
    id: 'shop',
    heading: FOOTER_TEXT.shopHeading,
    items: CATEGORIES.map(({ slug, name }) => ({
      id: slug,
      label: name,
      to: ROUTES.SHOP_CATEGORY(slug),
    })),
    hasLogInItem: false,
  },
  {
    id: 'categories',
    heading: FOOTER_TEXT.categoriesHeading,
    items: FOOTER_CATEGORY_LINKS,
    hasLogInItem: false,
  },
]

export const SOCIAL_LINKS: readonly SocialLink[] = [
  {
    id: 'facebook',
    label: 'Facebook',
    href: 'https://www.facebook.com',
    iconSrc: '/icons/social-facebook.svg',
  },
  { id: 'twitter', label: 'Twitter', href: 'https://x.com', iconSrc: '/icons/social-twitter.svg' },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    href: 'https://www.linkedin.com',
    iconSrc: '/icons/social-linkedin.svg',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    href: 'https://www.instagram.com',
    iconSrc: '/icons/social-instagram.svg',
  },
]
