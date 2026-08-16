import React from 'react'
import { NavLink, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  ArrowLeftRight,
  CreditCard,
  Landmark,
  Headphones,
  Shield,
  User,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

/**
 * Fixed mobile bottom navigation bar (visible below the lg breakpoint).
 * Mirrors the desktop sidebar items and highlights the active route.
 * A raised, teal profile action floats above the bar and navigates to the
 * authenticated user's profile page.
 */
const MobileBottomNav = () => {
  const { isAdmin } = useAuth()

  const baseItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
    { name: 'Cards', href: '/cards', icon: CreditCard },
    { name: 'Loans', href: '/loans', icon: Landmark },
    { name: 'Support', href: '/support', icon: Headphones },
  ]
  const items = isAdmin
    ? [...baseItems, { name: 'Admin', href: '/admin', icon: Shield }]
    : baseItems

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white dark:bg-primary-800 border-t border-silver/30 dark:border-primary-700 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Floating profile action - elevated above the nav bar */}
      <div className="relative">
        <Link
          to="/profile"
          aria-label="My Profile"
          className="absolute left-1/2 -translate-x-1/2 -top-9 z-10"
        >
          <span className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white ring-4 ring-white dark:ring-primary-800 shadow-lux-gold hover:shadow-[0_8px_24px_rgba(187,97,37,0.45)] hover:scale-105 transition-all duration-200">
            <User size={24} />
          </span>
        </Link>
      </div>

      <div className="flex items-stretch pt-5">
        {items.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center justify-center gap-1 pb-2.5 text-[10px] font-medium transition-colors ${
                isActive ? 'text-primary-600 dark:text-gold-300' : 'text-silver dark:text-cream/60 hover:text-primary dark:hover:text-cream'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`relative flex items-center justify-center w-11 h-7 rounded-full transition-colors ${
                    isActive ? 'bg-primary-600/10 dark:bg-gold/15' : ''
                  }`}
                >
                  <item.icon size={19} />
                  {isActive && (
                    <span className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-primary-600 dark:bg-gold-300" />
                  )}
                </span>
                <span>{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default MobileBottomNav
