import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  ArrowLeftRight,
  CreditCard,
  Landmark,
  Headphones,
  User,
  Shield,
  LogOut,
  X,
  Menu,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  Wallet,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import NotificationsBell from './NotificationsBell'
import logo from '../../assets/logo.png'

const Sidebar = ({ collapsed = false, onToggleCollapse }) => {
  const { user, logout, isAdmin } = useAuth()
  const [isOpen, setIsOpen] = useState(false) // mobile drawer
  const location = useLocation()

  const baseNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
    { name: 'Cards', href: '/cards', icon: CreditCard },
    { name: 'Loans', href: '/loans', icon: Landmark },
    { name: 'Wallet', href: '/wallet', icon: Wallet },
    { name: 'Support', href: '/support', icon: Headphones },
    { name: 'Profile', href: '/profile', icon: User },
  ]
  const navigation = isAdmin
    ? [...baseNavigation, { name: 'Admin', href: '/admin', icon: Shield }]
    : baseNavigation

  const initials = (
    (user?.firstName?.[0] || '') + (user?.lastName?.[0] || '')
  ).toUpperCase() || 'U'

  const renderSidebar = (isCollapsed) => (
    <div className="relative flex flex-col h-full w-full bg-gradient-to-b from-primary-700 via-primary-800 to-primary-900 text-white">
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -top-20 -right-16 w-56 h-56 rounded-full bg-gold/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -left-16 w-48 h-48 rounded-full bg-primary-500/30 blur-3xl" />

      {/* Collapse/expand toggle (desktop) */}
      {onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="hidden lg:flex absolute -right-3 top-5 z-10 w-6 h-6 rounded-full bg-primary-700 border border-white/20 text-white items-center justify-center shadow-lg hover:bg-primary-600 transition-colors"
        >
          {collapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
        </button>
      )}

      {/* Logo + Bell */}
      <div className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between px-6'} pt-6 pb-5 relative`}>
        <Link
          to="/dashboard"
          className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}
          onClick={() => setIsOpen(false)}
          title="Primewave Bank"
        >
          <img
            src={logo}
            alt="Logo"
            className="w-11 h-11 rounded-xl bg-primary ring-2 ring-gold/70 shrink-0"
          />
          {!isCollapsed && (
            <div className="whitespace-nowrap">
              <h1 className="font-heading font-bold text-lg leading-tight">Primewave</h1>
              <p className="text-[10px] font-semibold text-gold-300 tracking-[0.3em]">BANK</p>
            </div>
          )}
        </Link>

        {!isCollapsed && (
          <div className="flex items-center gap-1">
            <NotificationsBell buttonClassName="p-2 rounded-xl text-cream/80 hover:text-white hover:bg-white/10 transition-colors relative" badgeClassName="bg-gold ring-2 ring-primary-800" />
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-2 rounded-xl text-cream/80 hover:text-white hover:bg-white/10"
            >
              <X size={19} />
            </button>
          </div>
        )}
      </div>

      {!isCollapsed && <div className="mx-6 border-t border-white/10" />}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
        {!isCollapsed && (
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-cream/40">
            Main Menu
          </p>
        )}
        {navigation.map((item) => {
          const active = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setIsOpen(false)}
              title={isCollapsed ? item.name : undefined}
              className={`group flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2.5 rounded-xl font-medium text-sm transition-all ${
                active
                  ? 'bg-gold text-white shadow-lux-gold'
                  : 'text-cream/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <item.icon
                size={18}
                className={active ? '' : 'text-cream/50 group-hover:text-gold-300 transition-colors'}
              />
              {!isCollapsed && <span>{item.name}</span>}
              {active && !isCollapsed && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />}
            </Link>
          )
        })}
      </nav>

      {/* Promo card (expanded only) */}
      {!isCollapsed && (
        <div className="px-4 pb-4">
          <div className="rounded-2xl bg-gradient-to-br from-gold to-gold-600 text-white p-4 shadow-lux-gold">
            <p className="text-sm font-bold">Premium Banking</p>
            <p className="text-[11px] opacity-85 mt-0.5">
              Instant cards, loans &amp; priority support
            </p>
            <Link
              to="/cards"
              onClick={() => setIsOpen(false)}
              className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold bg-white text-primary px-3 py-1.5 rounded-lg hover:bg-cream transition-colors"
            >
              Explore <Sparkles size={12} />
            </Link>
          </div>
        </div>
      )}

      {/* User card */}
      <div className={`${isCollapsed ? 'px-2' : 'px-4'} pb-6`}>
        <div className="rounded-2xl bg-white/5 backdrop-blur border border-white/10 p-4">
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-3">
              {user?.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt={`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Profile'}
                  title={`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email || ''}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-gold/70 shrink-0"
                />
              ) : (
                <div
                  title={`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email || ''}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-600 text-white flex items-center justify-center font-bold text-sm shrink-0"
                >
                  {initials}
                </div>
              )}
              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 rounded-lg text-cream/60 hover:text-white hover:bg-danger/80 transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {user?.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt={`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Profile'}
                  title={`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email || ''}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-gold/70 shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {initials}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-cream/50 truncate">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 rounded-lg text-cream/60 hover:text-white hover:bg-danger/80 transition-colors shrink-0"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <p className="text-center text-[10px] text-cream/30 mt-3">
            Primewave Bank © 2026
          </p>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile floating menu button */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
        className="lg:hidden fixed top-[10px] left-4 z-40 p-2.5 rounded-xl bg-primary-600 text-white shadow-lux-gold border border-white/10"
      >
        <Menu size={20} />
      </button>

      {/* Desktop fixed sidebar */}
      <aside
        className={`hidden lg:block fixed top-0 left-0 h-screen z-40 transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-72'
        }`}
      >
        {renderSidebar(collapsed)}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="lg:hidden fixed top-0 left-0 h-screen z-50 w-72"
            >
              {renderSidebar(false)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default Sidebar
