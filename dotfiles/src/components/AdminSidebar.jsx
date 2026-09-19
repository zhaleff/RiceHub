import { NavLink } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faGaugeHigh,
  faInbox,
  faCircleCheck,
  faImages,
  faChartLine,
  faFlag,
  faUsers,
  faTags,
  faDesktop,
  faGear,
  faKey,
  faArrowRightFromBracket,
  faArrowUpRightFromSquare,
} from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'
import logo from '../assets/ricehub.png'

export const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: faGaugeHigh, to: '/admin/dashboard' },
      { id: 'queue', label: 'Review queue', icon: faInbox, to: '/admin/queue', badge: true },
      { id: 'approved', label: 'Approved', icon: faCircleCheck, to: '/admin/approved' },
    ],
  },
  {
    label: 'Library',
    items: [
      { id: 'all-rices', label: 'All rices', icon: faImages, soon: true, to: '/admin/rices' },
      { id: 'wm-distros', label: 'WM & distros', icon: faTags, soon: true, to: '/admin/wm-distros' },
      { id: 'featured', label: 'Featured', icon: faDesktop, soon: true, to: '/admin/featured' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { id: 'analytics', label: 'Analytics', icon: faChartLine, soon: true, to: '/admin/analytics' },
      { id: 'reports', label: 'Reports', icon: faFlag, soon: true, to: '/admin/reports' },
      { id: 'authors', label: 'Authors', icon: faUsers, soon: true, to: '/admin/authors' },
    ],
  },
  {
    label: 'System',
    items: [
      { id: 'access', label: 'Access keys', icon: faKey, soon: true, to: '/admin/access' },
      { id: 'settings', label: 'Settings', icon: faGear, soon: true, to: '/admin/settings' },
    ],
  },
]

function NavButton({ item, badge }) {
  const className = ({ isActive }) =>
    clsx(
      'group w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] transition-colors duration-200',
      isActive
        ? 'bg-surface-3 text-text cursor-pointer'
        : 'text-text-dim hover:bg-surface-2 hover:text-text cursor-pointer'
    )

  if (item.soon) {
    return (
      <span className="group w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] text-muted cursor-not-allowed">
        <FontAwesomeIcon icon={item.icon} className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="truncate">{item.label}</span>
        <span className="ml-auto px-2 py-1 rounded-md bg-surface-2 text-[9px] uppercase tracking-[0.12em] text-muted">
          Soon
        </span>
      </span>
    )
  }

  return (
    <NavLink to={item.to} end className={className}>
      <FontAwesomeIcon icon={item.icon} className="w-3.5 h-3.5 flex-shrink-0" />
      <span className="truncate">{item.label}</span>
      {item.badge && badge > 0 && (
        <span className="ml-auto min-w-6 px-2 py-1 rounded-md bg-accent text-[10px] font-semibold text-surface text-center">
          {badge}
        </span>
      )}
    </NavLink>
  )
}

export default function AdminSidebar({ email, pendingCount, onSignOut }) {
  return (
    <aside className="hidden lg:flex flex-col w-[272px] flex-shrink-0 h-screen sticky top-0 border-r border-border bg-surface">
      <div className="px-6 py-7">
        <img src={logo} alt="RiceHub" className="h-14 w-auto" />
      </div>

      <nav className="flex-1 overflow-y-auto px-4 pb-6 flex flex-col gap-7">
        {NAV_SECTIONS.map((section, i) => (
          <div key={section.label} className="flex flex-col gap-1">
            {i > 0 && <div className="mb-5 border-t border-border" />}
            {section.items.map((item) => (
              <NavButton key={item.id} item={item} badge={pendingCount} />
            ))}
          </div>
        ))}
      </nav>

      <div className="border-t border-border px-4 py-5 flex flex-col gap-2">
        <NavLink
          to="/"
          target="_blank"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] text-text-dim hover:bg-surface-2 hover:text-text transition-colors duration-200"
        >
          <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="w-3.5 h-3.5" />
          View site
        </NavLink>

        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-9 h-9 rounded-xl bg-surface-3 flex items-center justify-center text-[12px] font-semibold text-accent flex-shrink-0">
            {email?.[0]?.toUpperCase() ?? 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12.5px] text-text truncate">{email ?? 'admin'}</p>
            <p className="text-[11px] text-muted">Administrator</p>
          </div>
          <button
            type="button"
            onClick={onSignOut}
            title="Sign out"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-muted hover:bg-surface-2 hover:text-text transition-colors duration-200 cursor-pointer"
          >
            <FontAwesomeIcon icon={faArrowRightFromBracket} className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}