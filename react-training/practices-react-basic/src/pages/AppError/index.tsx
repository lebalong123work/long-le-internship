import { useEffect } from 'react'
import { SiteLogo } from '@/components/layout/SiteLogo'
import { STATUS_PAGE_LAYOUT, PAGE_CONTAINER } from '@/components/shared/pageLayout'
import { Button } from '@/components/ui/Button'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { ROUTES } from '@/constants/routes'
import { UI_STATE_MESSAGES } from '@/constants/uiStateMessages'
import { cn } from '@/utils/cn'

function reloadPage(): void {
  window.location.reload()
}

export function AppErrorPage(): JSX.Element {
  useEffect(() => {
    document.title = UI_STATE_MESSAGES.appErrorTitle
  }, [])

  return (
    <>
      <header className={PAGE_CONTAINER}>
        <SiteLogo />
      </header>
      <main className={STATUS_PAGE_LAYOUT.section}>
        <h1 className={STATUS_PAGE_LAYOUT.heading}>{UI_STATE_MESSAGES.appErrorHeading}</h1>
        <p className={STATUS_PAGE_LAYOUT.message}>{UI_STATE_MESSAGES.appErrorMessage}</p>
        <div className={cn(STATUS_PAGE_LAYOUT.action, 'flex flex-wrap justify-center gap-4')}>
          <Button onClick={reloadPage}>{UI_STATE_MESSAGES.retry}</Button>
          <ButtonLink to={ROUTES.HOME} variant="light" reloadDocument>
            {UI_STATE_MESSAGES.backToHome}
          </ButtonLink>
        </div>
      </main>
    </>
  )
}
