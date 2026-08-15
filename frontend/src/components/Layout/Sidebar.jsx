import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  ArrowLeftRight,
  CreditCard,
  Landmark,
  Headphones,
  Shield,
  Bell,
  LogOut,
  X,
  Menu,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useWebSocket } from '../../hooks/useWebSocket'
import api from '../../services/api'
import logo from '../../assets/logo.png'

const Sidebar = () => {
  const { user, logout, isAdmin } = useAuth()
  const [isOpen, setIsOpen] = useState(false) // mobile drawer
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const location = useLocation()

  // WebSocket for real-time notifications
  useWebSocket({
    newTransaction: (data) => {
      const newNotification = {
        id: data.transaction._id,
        type: 'transaction',
        title: data.transaction.description,
        amount: data.transaction.amount,
        transactionType: data.transaction.type,
        date: data.transaction.createdAt,
        read: false,
      }
      setNotifications(prev => [newNotification, ...prev.slice(0, 4)])
    },
  })

  const baseNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
    { name: 'Cards', href: '/cards', icon: CreditCard },
    { name: 'Loans', href: '/loans', icon: Landmark },
    { name: 'Support', href: '/support', icon: Headphones },
  ]
  const navigation = isAdmin
    ? [...baseNavigation, { name: 'Admin', href: '/admin', icon: Shield }]
    : baseNavigation

  const fetchNotifications = async () => {
    if (!user) return
    try {
      setLoading(true)
      const response = await api.get('/api/transactions/')
      const transactions = response.data.data || []
      const recentTransactions = transactions
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(t => ({
          id: t._id,
          type: 'transaction',
          title: t.description,
          amount: t.amount,
          transactionType: t.type,
          date: t.createdAt,
          read: false,
        }))
      setNotifications(recentTransactions)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications)
    if (!showNotifications) {
      fetchNotifications()
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="text-success" size={16} />
      default:
        return <ArrowUpRight className="text-danger" size={16} />
    }
  }

  const initials = (
    (user?.firstName?.[0] || '') + (user?.lastName?.[0] || '')
  ).toUpperCase() || 'U'

  const sidebarInner = (
    <div className="relative flex flex-col h-full w-72 bg-gradient-to-b from-primary-700 via-primary-800 to-primary-900 text-white">
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -top-20 -right-16 w-56 h-56 rounded-full bg-gold/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -left-16 w-48 h-48 rounded-full bg-primary-500/30 blur-3xl" />

      {/* Logo + Bell */}
      <div className="flex items-center justify-between px-6 pt-6 pb-5 relative">
        <Link
          to="/dashboard"
          className="flex items-center gap-3"
          onClick={() => setIsOpen(false)}
        >
          <img
            src={logo}
            alt="Logo"
            className="w-11 h-11 rounded-xl bg-primary ring-2 ring-gold/70"
          />
          <div>
            <h1 className="font-heading font-bold text-lg leading-tight">
              Primewave
            </h1>
            <p className="text-[10px] font-semibold text-gold-300 tracking-[0.3em]">
              BANK
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-1">
          <div className="relative">
            <button
              onClick={handleNotificationClick}
              className="p-2 rounded-xl text-cream/80 hover:text-white hover:bg-white/10 transition-colors relative"
            >
              <Bell size={19} />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gold rounded-full ring-2 ring-primary-800" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-primary-800 rounded-xl shadow-lux-card border border-silver/20 dark:border-primary-700 z-50"
              >
                <div className="p-4 border-b border-silver/20 dark:border-primary-700">
                  <h3 className="text-base font-heading font-semibold text-primary dark:text-cream">
                    Recent Transactions
                  </h3>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {loading ? (
                    <div className="p-4 text-center text-silver">
                      Loading notifications...
                    </div>
                  ) : notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="p-3 border-b border-silver/20 dark:border-primary-700/50 hover:bg-cream/50 dark:hover:bg-primary-700/50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${
                            notification.transactionType === 'deposit'
                              ? 'bg-success/20 text-success'
                              : 'bg-danger/20 text-danger'
                          }`}>
                            {getNotificationIcon(notification.transactionType)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-primary dark:text-cream truncate">
                              {notification.title}
                            </p>
                            <p className="text-xs text-silver">
                              {new Date(notification.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-semibold ${
                              notification.transactionType === 'deposit' ? 'text-success' : 'text-danger'
                            }`}>
                              {notification.transactionType === 'deposit' ? '+' : '-'}$
                              {Math.abs(notification.amount).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-silver">
                      No recent transactions
                    </div>
                  )}
                </div>

                <div className="p-3 border-t border-silver/20 dark:border-primary-700">
                  <Link
                    to="/transactions"
                    className="block w-full text-center text-gold hover:text-gold-600 transition-colors font-medium text-sm"
                    onClick={() => setShowNotifications(false)}
                  >
                    View All Transactions
                  </Link>
                </div>
              </motion.div>
            )}
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 rounded-xl text-cream/80 hover:text-white hover:bg-white/10"
          >
            <X size={19} />
          </button>
        </div>
      </div>

      <div className="mx-6 border-t border-white/10" />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-cream/40">
          Main Menu
        </p>
        {navigation.map((item) => {
          const active = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setIsOpen(false)}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                active
                  ? 'bg-gold text-white shadow-lux-gold'
                  : 'text-cream/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <item.icon
                size={18}
                className={active ? '' : 'text-cream/50 group-hover:text-gold-300 transition-colors'}
              />
              <span>{item.name}</span>
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />}
            </Link>
          )
        })}
      </nav>

      {/* Promo card */}
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

      {/* User card */}
      <div className="px-4 pb-6">
        <div className="rounded-2xl bg-white/5 backdrop-blur border border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
              {initials}
            </div>
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
        </div>
        <p className="text-center text-[10px] text-cream/30 mt-3">
          Primewave Bank © 2026
        </p>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile floating menu button */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
        className="lg:hidden fixed top-4 left-4 z-40 p-2.5 rounded-xl bg-primary-600 text-white shadow-lux-gold border border-white/10"
      >
        <Menu size={20} />
      </button>

      {/* Desktop fixed sidebar */}
      <aside className="hidden lg:block fixed top-0 left-0 h-screen z-40">
        {sidebarInner}
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
              className="lg:hidden fixed top-0 left-0 h-screen z-50"
            >
              {sidebarInner}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default Sidebar
