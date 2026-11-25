import { PAGE_HEADING, PAGE_SUBTEXT } from '@/components/shared/pageLayout'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { ROUTES } from '@/constants/routes'
import { ABOUT_TEXT } from '@/constants/staticPages'
import { cn } from '@/utils/cn'
import { CONTENT_BODY, ContentSection } from '../ContentSection'
import { STATIC_PAGE_LAYOUT } from '../staticPageLayout'
import type { ContentSectionText } from '@/constants/staticPages'

function SectionBody({ body }: Pick<ContentSectionText, 'body'>): JSX.Element {
  if (typeof body === 'string') return <p className={CONTENT_BODY}>{body}</p>

  return (
    <ul className={cn(CONTENT_BODY, 'list-disc pl-6')}>
      {body.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

export default function AboutUs(): JSX.Element {
  return (
    <section className={STATIC_PAGE_LAYOUT.page}>
      <div className={STATIC_PAGE_LAYOUT.column}>
        <h1 className={PAGE_HEADING}>{ABOUT_TEXT.title}</h1>
        <p className={PAGE_SUBTEXT}>{ABOUT_TEXT.intro}</p>
        {ABOUT_TEXT.sections.map((section) => (
          <ContentSection key={section.id} heading={section.heading}>
            <SectionBody body={section.body} />
          </ContentSection>
        ))}
        <ButtonLink to={ROUTES.SHOP} className="mt-10 w-fit">
          {ABOUT_TEXT.shopCta}
        </ButtonLink>
      </div>
    </section>
  )
}
