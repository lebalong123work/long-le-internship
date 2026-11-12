import { Link } from 'react-router-dom'
import { FOCUS_RING, LINK_HOVER_OPACITY } from '@/components/ui/interactionClasses'
import { HEADER_TEXT } from '@/constants/header'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/utils/cn'

const LOGO_ICON = '/icons/logo.svg'

export function HeaderLogo(): JSX.Element {
  return (
    <Link
      to={ROUTES.HOME}
      className={cn(
        'flex w-40 shrink-0 items-center justify-between gap-1',
        FOCUS_RING,
        LINK_HOVER_OPACITY
      )}
    >
      <img src={LOGO_ICON} alt="" width={36} height={34} className="shrink-0" />
      <span className="whitespace-nowrap font-logo text-sm font-bold leading-4 text-dark">
        {HEADER_TEXT.logo}
      </span>
    </Link>
  )
}
