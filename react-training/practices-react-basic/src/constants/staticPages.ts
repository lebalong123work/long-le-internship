import { ORDER_LOOKUP_TEXT } from './order'

export interface ContentSectionText {
  id: string
  heading: string
  body: string | readonly string[]
}

export const ABOUT_TEXT = {
  title: 'About Us',
  intro: 'Everyday clothing, made simple.',
  sections: [
    {
      id: 'story',
      heading: 'Our story',
      body: 'mangcoding Store is a small online shop for everyday clothing. We choose T-shirts, shirts, jackets and jeans that are comfortable, easy to match and made to last.',
    },
    {
      id: 'values',
      heading: 'What we care about',
      body: [
        'Comfort first — soft fabrics you can wear all day.',
        'Simple style — pieces that go with everything.',
        'Fair prices — good quality without a high price.',
      ],
    },
  ] satisfies readonly ContentSectionText[],
  shopCta: 'Shop Now',
} as const

export const CONTACT_TEXT = {
  title: 'Contact',
  intro: 'Questions about an order, a size or a product? We are happy to help.',
  emailHeading: 'Email us',
  emailBody: 'Send us an email and we will get back to you.',
  orderHeading: 'Track an order',
  orderBody: 'Already placed an order? Check its status with your order number.',
  orderLink: ORDER_LOOKUP_TEXT.linkLabel,
} as const
