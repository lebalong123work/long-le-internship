import { Link } from 'react-router-dom'
import { PAGE_HEADING, PAGE_SUBTEXT } from '@/components/shared/pageLayout'
import { TEXT_LINK } from '@/components/ui/interactionClasses'
import { ROUTES } from '@/constants/routes'
import { CONTACT_TEXT } from '@/constants/staticPages'
import { STORE_CONTACT } from '@/constants/store'
import { cn } from '@/utils/cn'
import { CONTENT_BODY, ContentSection } from '../ContentSection'
import { STATIC_PAGE_LAYOUT } from '../staticPageLayout'

const ACTION_LINK = cn(TEXT_LINK, 'mt-4 block break-words font-body text-body-lg text-dark')

export default function Contact(): JSX.Element {
  return (
    <section className={STATIC_PAGE_LAYOUT.page}>
      <div className={STATIC_PAGE_LAYOUT.column}>
        <h1 className={PAGE_HEADING}>{CONTACT_TEXT.title}</h1>
        <p className={PAGE_SUBTEXT}>{CONTACT_TEXT.intro}</p>
        <ContentSection heading={CONTACT_TEXT.emailHeading}>
          <p className={CONTENT_BODY}>{CONTACT_TEXT.emailBody}</p>
          <a href={`mailto:${STORE_CONTACT.email}`} className={ACTION_LINK}>
            {STORE_CONTACT.email}
          </a>
        </ContentSection>
        <ContentSection heading={CONTACT_TEXT.orderHeading}>
          <p className={CONTENT_BODY}>{CONTACT_TEXT.orderBody}</p>
          <Link to={ROUTES.ORDER_LOOKUP} className={ACTION_LINK}>
            {CONTACT_TEXT.orderLink}
          </Link>
        </ContentSection>
      </div>
    </section>
  )
}
