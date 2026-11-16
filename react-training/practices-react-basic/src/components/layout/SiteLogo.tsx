import { Link } from 'react-router-dom'
import {
  FOCUS_RING,
  FOCUS_RING_ON_DARK,
  LINK_HOVER_OPACITY,
} from '@/components/ui/interactionClasses'
import { HEADER_TEXT } from '@/constants/header'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/utils/cn'

export type LogoTone = 'dark' | 'light'

interface SiteLogoProps {
  tone?: LogoTone
}

const LOGO_ICON = '/icons/logo.svg'

const TONE_CLASSES: Record<LogoTone, { text: string; focusRing?: string }> = {
  dark: { text: 'text-dark' },
  light: { text: 'text-white', focusRing: FOCUS_RING_ON_DARK },
}

export function SiteLogo({ tone = 'dark' }: SiteLogoProps): JSX.Element {
  const toneClasses = TONE_CLASSES[tone]

  return (
    <Link
      to={ROUTES.HOME}
      className={cn(
        'flex w-40 shrink-0 items-center justify-between gap-1',
        FOCUS_RING,
        toneClasses.focusRing,
        LINK_HOVER_OPACITY
      )}
    >
      <img src={LOGO_ICON} alt="" width={36} height={34} className="shrink-0" />
      <span
        className={cn('whitespace-nowrap font-logo text-sm font-bold leading-4', toneClasses.text)}
      >
        {HEADER_TEXT.logo}
      </span>
    </Link>
  )
}
