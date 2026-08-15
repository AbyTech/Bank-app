import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ArrowLeftRight,
  CreditCard,
  Landmark,
  Headphones,
  Shield,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

/**
 * Fixed mobile bottom navigation bar (visible below the lg breakpoint).
 * Mirrors the desktop sidebar items and highlights the active route.
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
      <div className="flex items-stretch">
        {items.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center justify-center gap-1 pt-2 pb-2.5 text-[10px] font-medium transition-colors ${
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
