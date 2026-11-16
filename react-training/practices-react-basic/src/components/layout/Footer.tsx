import { Link } from 'react-router-dom'
import {
  FOCUS_RING,
  FOCUS_RING_ON_DARK,
  LINK_HOVER_OPACITY,
} from '@/components/ui/interactionClasses'
import { FOOTER_LINK_GROUPS, FOOTER_TEXT, SOCIAL_LINKS } from '@/constants/footer'
import { HEADER_TEXT } from '@/constants/header'
import { useAuth } from '@/hooks/useAuth'
import { useAuthModal } from '@/hooks/useAuthModal'
import { cn } from '@/utils/cn'
import { SAFE_AREA_X } from './safeArea'
import { SiteLogo } from './SiteLogo'
import type { FooterLinkGroup, SocialLink } from '@/constants/footer'
import type { ReactNode } from 'react'

const FOOTER_LINK_INTERACTION = cn(FOCUS_RING, FOCUS_RING_ON_DARK, LINK_HOVER_OPACITY)

const FOOTER_TEXT_STYLE = 'mt-6 font-body text-sm leading-normal text-light'

const FOOTER_HEADING = 'font-body text-lg font-bold leading-normal text-white'

const FOOTER_LIST = cn(FOOTER_TEXT_STYLE, 'flex flex-col gap-[11px]')

const SOCIAL_ICON_SIZE = 32

interface FooterColumnProps {
  heading: string
  children: ReactNode
  className?: string
}

function FooterColumn({ heading, children, className }: FooterColumnProps): JSX.Element {
  return (
    <div className={className}>
      <h2 className={FOOTER_HEADING}>{heading}</h2>
      {children}
    </div>
  )
}

function LogInItem(): ReactNode {
  const { isAuthenticated } = useAuth()
  const { open } = useAuthModal()

  if (isAuthenticated) return null

  return (
    <li>
      <button
        type="button"
        onClick={() => open('login')}
        className={cn(FOOTER_LINK_INTERACTION, 'text-left')}
      >
        {HEADER_TEXT.logIn}
      </button>
    </li>
  )
}

function FooterLinkColumn({ group }: { group: FooterLinkGroup }): JSX.Element {
  return (
    <FooterColumn heading={group.heading}>
      <ul className={FOOTER_LIST}>
        {group.items.map((item) => (
          <li key={item.id}>
            <Link to={item.to} className={FOOTER_LINK_INTERACTION}>
              {item.label}
            </Link>
          </li>
        ))}
        {group.hasLogInItem && <LogInItem />}
      </ul>
    </FooterColumn>
  )
}

function SocialItem({ link }: { link: SocialLink }): JSX.Element {
  if (link.href === null) {
    return (
      <li>
        <img
          src={link.iconSrc}
          alt={link.label}
          width={SOCIAL_ICON_SIZE}
          height={SOCIAL_ICON_SIZE}
        />
      </li>
    )
  }

  return (
    <li>
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={link.label}
        className={cn('block', FOOTER_LINK_INTERACTION)}
      >
        <img src={link.iconSrc} alt="" width={SOCIAL_ICON_SIZE} height={SOCIAL_ICON_SIZE} />
      </a>
    </li>
  )
}

function ContactColumn(): JSX.Element {
  return (
    <FooterColumn heading={FOOTER_TEXT.contactHeading} className="col-span-2 md:col-span-1">
      <p className={FOOTER_TEXT_STYLE}>
        <a
          href={`mailto:${FOOTER_TEXT.email}`}
          className={cn(FOOTER_LINK_INTERACTION, 'break-words')}
        >
          {FOOTER_TEXT.email}
        </a>
      </p>
      <ul aria-label={FOOTER_TEXT.socialLabel} className="mt-4 flex flex-wrap gap-4">
        {SOCIAL_LINKS.map((link) => (
          <SocialItem key={link.id} link={link} />
        ))}
      </ul>
    </FooterColumn>
  )
}

export function Footer(): JSX.Element {
  return (
    <footer className="bg-footer pb-[env(safe-area-inset-bottom)]">
      <div className={SAFE_AREA_X}>
        <div className="container flex flex-col gap-6 px-4 py-10 md:gap-10 md:px-6 xl:min-h-[389px] xl:flex-row xl:gap-0 xl:px-0 xl:pt-20">
          <div className="md:max-w-[424px] xl:w-[424px] xl:shrink-0">
            <SiteLogo tone="light" />
            <p className="mt-6 font-body text-sm leading-6 text-light">{FOOTER_TEXT.description}</p>
          </div>
          <nav
            aria-label={FOOTER_TEXT.navLabel}
            className="grid grid-cols-2 gap-6 md:flex md:gap-10 xl:ml-[127px] xl:grid xl:grid-cols-[158px_127px_183px_auto] xl:gap-0"
          >
            {FOOTER_LINK_GROUPS.map((group) => (
              <FooterLinkColumn key={group.id} group={group} />
            ))}
            <ContactColumn />
          </nav>
        </div>
      </div>
    </footer>
  )
}
