import { NavLink } from 'react-router-dom'
import { HEADER_TEXT, MAIN_NAV_ITEMS } from '@/constants/header'
import { cn } from '@/utils/cn'
import { NAV_LINK_CLASSES, PANEL_ROW } from './headerClasses'
import type { Ref } from 'react'

const ACTIVE_DOT_ICON = '/icons/nav-active-dot.svg'

type NavOrientation = 'row' | 'column'

interface MainNavProps {
  orientation: NavOrientation
  firstLinkRef?: Ref<HTMLAnchorElement>
  className?: string
}

const LIST_CLASSES: Record<NavOrientation, string> = {
  row: 'flex items-center gap-10',
  column: 'flex flex-col',
}

const LINK_LAYOUT: Record<NavOrientation, string[]> = {
  row: ['relative block'],
  column: ['block', PANEL_ROW],
}

export function MainNav({ orientation, firstLinkRef, className }: MainNavProps): JSX.Element {
  return (
    <nav aria-label={HEADER_TEXT.mainNav} className={className}>
      <ul className={LIST_CLASSES[orientation]}>
        {MAIN_NAV_ITEMS.map((item, index) => (
          <li key={item.to}>
            <NavLink
              ref={index === 0 ? firstLinkRef : undefined}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  NAV_LINK_CLASSES.idle,
                  LINK_LAYOUT[orientation],
                  isActive && NAV_LINK_CLASSES.active
                )
              }
            >
              {({ isActive }) => (
                <>
                  {item.label}
                  {isActive && orientation === 'row' && (
                    <img
                      src={ACTIVE_DOT_ICON}
                      alt=""
                      className="absolute left-1/2 top-full mt-[5px] size-1 -translate-x-1/2"
                    />
                  )}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
