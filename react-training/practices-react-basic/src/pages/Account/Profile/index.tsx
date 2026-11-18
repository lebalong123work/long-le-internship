import { useEffect, useId, useRef } from 'react'
import { ErrorState } from '@/components/shared/ErrorState'
import { ACCOUNT_HEADING, ACCOUNT_SECTION_HEADING } from '@/components/shared/pageLayout'
import { focusWithVisibleRing, isFocusFree } from '@/components/ui/focusWithVisibleRing'
import { CHANGE_PASSWORD_TEXT, PROFILE_TEXT } from '@/constants/profile'
import { useAuth } from '@/hooks/useAuth'
import { useFirstLoadRetry } from '@/hooks/useFirstLoadRetry'
import { useProfile } from '@/hooks/useProfile'
import { ChangePasswordForm } from './ChangePasswordForm'
import { CHANGE_PASSWORD_LAYOUT } from './profileFormClasses'
import { ProfileForm } from './ProfileForm'
import { ProfileFormSkeleton } from './ProfileFormSkeleton'
import type { ReactNode } from 'react'

export default function Profile(): JSX.Element {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const passwordHeadingId = useId()
  const { user } = useAuth()
  const { data, isPending, isFetching, refetch } = useProfile()
  const { isRetrying, hasRecovered, retry } = useFirstLoadRetry(user?.id, refetch)
  const showSkeleton = data === undefined && isPending && !isRetrying

  useEffect(() => {
    if (hasRecovered && isFocusFree() && headingRef.current) {
      focusWithVisibleRing(headingRef.current)
    }
  }, [hasRecovered])

  function renderContent(): ReactNode {
    if (data !== undefined) return <ProfileForm key={data.id} profile={data} />
    if (showSkeleton) {
      return (
        <div aria-busy="true">
          <ProfileFormSkeleton />
        </div>
      )
    }
    return <ErrorState onRetry={retry} isRetrying={isRetrying || isFetching} />
  }

  return (
    <div>
      <h1 ref={headingRef} tabIndex={-1} className={ACCOUNT_HEADING}>
        {PROFILE_TEXT.heading}
      </h1>
      <p role="status" className="sr-only">
        {showSkeleton ? PROFILE_TEXT.loading : ''}
      </p>
      <div className="mt-6">{renderContent()}</div>
      <section aria-labelledby={passwordHeadingId} className={CHANGE_PASSWORD_LAYOUT.section}>
        <h2 id={passwordHeadingId} className={ACCOUNT_SECTION_HEADING}>
          {CHANGE_PASSWORD_TEXT.heading}
        </h2>
        <ChangePasswordForm />
      </section>
    </div>
  )
}
