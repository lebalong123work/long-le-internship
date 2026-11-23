import { ButtonLink } from '@/components/ui/ButtonLink'
import { ROUTES } from '@/constants/routes'
import { UI_STATE_MESSAGES } from '@/constants/uiStateMessages'
import { STATUS_PAGE_LAYOUT } from './pageLayout'

interface UnderDevelopmentProps {
  title: string
}

export function UnderDevelopment({ title }: UnderDevelopmentProps): JSX.Element {
  return (
    <section className={STATUS_PAGE_LAYOUT.section}>
      <h1 className={STATUS_PAGE_LAYOUT.heading}>{title}</h1>
      <p className={STATUS_PAGE_LAYOUT.message}>This page is under development</p>
      <ButtonLink to={ROUTES.HOME} className={STATUS_PAGE_LAYOUT.action}>
        {UI_STATE_MESSAGES.backToHome}
      </ButtonLink>
    </section>
  )
}
