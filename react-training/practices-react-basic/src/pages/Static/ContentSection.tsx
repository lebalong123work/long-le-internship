import { ACCOUNT_SECTION_HEADING } from '@/components/shared/pageLayout'
import type { ReactNode } from 'react'

export const CONTENT_BODY = 'mt-4 font-body text-body-lg text-medium-dark'

interface ContentSectionProps {
  heading: string
  children: ReactNode
}

export function ContentSection({ heading, children }: ContentSectionProps): JSX.Element {
  return (
    <section className="mt-10">
      <h2 className={ACCOUNT_SECTION_HEADING}>{heading}</h2>
      {children}
    </section>
  )
}
