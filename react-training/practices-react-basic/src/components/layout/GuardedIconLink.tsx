import { useAuth } from '@/hooks/useAuth'
import { useAuthModal } from '@/hooks/useAuthModal'
import { HeaderIconLink } from './HeaderIconLink'
import type { MouseEvent } from 'react'
import type { HeaderIconLinkProps } from './HeaderIconLink'

type GuardedIconLinkProps = Omit<HeaderIconLinkProps, 'onClick'>

export function GuardedIconLink({ to, ...linkProps }: GuardedIconLinkProps): JSX.Element {
  const { isAuthenticated } = useAuth()
  const { open } = useAuthModal()

  function handleClick(event: MouseEvent<HTMLAnchorElement>): void {
    if (isAuthenticated) return
    event.preventDefault()
    open('login', to)
  }

  return <HeaderIconLink to={to} onClick={handleClick} {...linkProps} />
}
