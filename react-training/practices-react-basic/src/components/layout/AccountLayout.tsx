import { NavLink, Outlet } from 'react-router-dom'
import { PAGE_CONTAINER } from '@/components/shared/pageLayout'
import { TAB_LOOK } from '@/components/ui/tabClasses'
import { ACCOUNT_NAV_ITEMS, HEADER_TEXT } from '@/constants/header'
import { cn } from '@/utils/cn'

const ACCOUNT_LAYOUT = {
  columns: 'flex flex-col gap-10 lg:flex-row lg:items-start',
  navList: 'flex flex-wrap gap-x-6 gap-y-4 md:gap-x-10 lg:shrink-0 lg:flex-col lg:gap-4',
  link: [TAB_LOOK.base, 'can-hover:hover:text-primary'],
  content: 'min-w-0 flex-1',
} as const

export function AccountLayout(): JSX.Element {
  return (
    <div className={PAGE_CONTAINER}>
      <div className={ACCOUNT_LAYOUT.columns}>
        <nav aria-label={HEADER_TEXT.accountNav}>
          <ul className={ACCOUNT_LAYOUT.navList}>
            {ACCOUNT_NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(ACCOUNT_LAYOUT.link, isActive ? TAB_LOOK.active : TAB_LOOK.idle)
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className={ACCOUNT_LAYOUT.content}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
