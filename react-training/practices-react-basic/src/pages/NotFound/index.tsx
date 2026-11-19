import { STATUS_PAGE_LAYOUT } from '@/components/shared/pageLayout'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { ROUTES } from '@/constants/routes'
import { UI_STATE_MESSAGES } from '@/constants/uiStateMessages'

export default function NotFound(): JSX.Element {
  return (
    <section className={STATUS_PAGE_LAYOUT.section}>
      <h1 className={STATUS_PAGE_LAYOUT.heading}>Page not found</h1>
      <p className={STATUS_PAGE_LAYOUT.message}>The page you are looking for does not exist.</p>
      <ButtonLink to={ROUTES.HOME} className={STATUS_PAGE_LAYOUT.action}>
        {UI_STATE_MESSAGES.backToHome}
      </ButtonLink>
    </section>
  )
}
