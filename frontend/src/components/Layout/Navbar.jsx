import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Menu,
  X,
  User,
  LogOut,
  Sun,
  Moon,
  Bell,
  Settings,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useWebSocket } from '../../hooks/useWebSocket'
import api from '../../services/api'
import logo from '../../assets/logo.png'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  // Apply dark mode on initial load
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  // WebSocket for real-time notifications
  useWebSocket({
    newTransaction: (data) => {
      // Add new transaction to notifications
      const newNotification = {
        id: data.transaction._id,
        type: 'transaction',
        title: data.transaction.description,
        amount: data.transaction.amount,
        transactionType: data.transaction.type,
        date: data.transaction.createdAt,
        read: false
      }
      setNotifications(prev => [newNotification, ...prev.slice(0, 4)]) // Keep only 5 most recent
    }
  })

  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Transactions', href: '/transactions' },
    { name: 'Cards', href: '/cards' },
    { name: 'Loans', href: '/loans' },
    { name: 'Support', href: '/support' },
  ]

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const fetchNotifications = async () => {
    if (!user) return
    try {
      setLoading(true)
      const response = await api.get('/api/transactions/')
      const transactions = response.data.data || []
      // Get the 5 most recent transactions as notifications
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
          read: false
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

  return (
    <nav className="fixed top-0 w-full bg-white/80 dark:bg-primary-800/80 backdrop-blur-lg border-b border-silver/30 dark:border-primary-700 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
          >
            <img src={logo} alt="Logo" className="w-14 h-14 rounded-xl bg-blue-900" />
            <div>
              <h1 className="text-xl font-heading font-bold text-primary dark:text-cream">
                Primewave
              </h1>
              <p className="text-xs text-gold font-semibold">BANK</p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 rounded-lg font-medium transition-all ${
                  location.pathname === item.href
                    ? 'text-gold bg-gold/10 border-b-2 border-gold'
                    : 'text-primary dark:text-cream hover:text-gold dark:hover:text-gold'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 text-primary dark:text-cream hover:text-gold dark:hover:text-gold transition-colors"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <div className="relative">
              <button
                onClick={handleNotificationClick}
                className="p-2 text-primary dark:text-cream hover:text-gold dark:hover:text-gold transition-colors relative"
              >
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></span>
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 bg-white dark:bg-primary-800 rounded-xl shadow-lux-card border border-silver/30 dark:border-primary-700 z-50"
                >
                  <div className="p-4 border-b border-silver/30 dark:border-primary-700">
                    <h3 className="text-lg font-heading font-semibold text-primary dark:text-cream">
                      Recent Transactions
                    </h3>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {loading ? (
                      <div className="p-4 text-center text-silver">
                        Loading notifications...
                      </div>
                    ) : notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="p-4 border-b border-silver/20 dark:border-primary-700/50 hover:bg-cream/50 dark:hover:bg-primary-700/50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-full ${
                              notification.transactionType === 'deposit'
                                ? 'bg-success/20 text-success'
                                : 'bg-danger/20 text-danger'
                            }`}>
                              {getNotificationIcon(notification.transactionType)}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-primary dark:text-cream">
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
                                {notification.transactionType === 'deposit' ? '+' : '-'}${Math.abs(notification.amount).toFixed(2)}
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

                  <div className="p-4 border-t border-silver/30 dark:border-primary-700">
                    <Link
                      to="/transactions"
                      className="block w-full text-center text-gold hover:text-gold-400 transition-colors font-medium"
                      onClick={() => setShowNotifications(false)}
                    >
                      View All Transactions
                    </Link>
                  </div>
                </motion.div>
              )}
            </div>

            <Link
              to="/profile"
              className="p-2 text-primary dark:text-cream hover:text-gold dark:hover:text-gold transition-colors"
            >
              <User size={20} />
            </Link>

            <button
              onClick={() => navigate('/login')}
              className="bg-gradient-to-r from-gold to-gold-400 text-primary px-4 py-2 rounded-xl font-semibold hover:shadow-lux-gold transition-all"
            >
              Sign Out
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-primary dark:text-cream hover:text-gold transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-primary-800 border-t border-silver/30 dark:border-primary-700"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-3 py-2 rounded-lg font-medium transition-all ${
                    location.pathname === item.href
                      ? 'text-gold bg-gold/10'
                      : 'text-primary dark:text-cream hover:text-gold'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="flex items-center space-x-4 pt-4 border-t border-silver/30 dark:border-primary-700">
                <button
                  onClick={toggleDarkMode}
                  className="p-2 text-primary dark:text-cream hover:text-gold transition-colors"
                >
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <div className="relative">
                  <button
                    onClick={handleNotificationClick}
                    className="p-2 text-primary dark:text-cream hover:text-gold dark:hover:text-gold transition-colors relative"
                  >
                    <Bell size={20} />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></span>
                  </button>

                  {/* Mobile Notifications Dropdown */}
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-primary-800 rounded-xl shadow-lux-card border border-silver/30 dark:border-primary-700 z-50"
                    >
                      <div className="p-4 border-b border-silver/30 dark:border-primary-700">
                        <h3 className="text-lg font-heading font-semibold text-primary dark:text-cream">
                          Recent Transactions
                        </h3>
                      </div>

                      <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                          <div className="p-4 text-center text-silver">
                            Loading notifications...
                          </div>
                        ) : notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className="p-4 border-b border-silver/20 dark:border-primary-700/50 hover:bg-cream/50 dark:hover:bg-primary-700/50 transition-colors"
                            >
                              <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-full ${
                                  notification.transactionType === 'deposit'
                                    ? 'bg-success/20 text-success'
                                    : 'bg-danger/20 text-danger'
                                }`}>
                                  {getNotificationIcon(notification.transactionType)}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-primary dark:text-cream">
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
                                    {notification.transactionType === 'deposit' ? '+' : '-'}${Math.abs(notification.amount).toFixed(2)}
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

                      <div className="p-4 border-t border-silver/30 dark:border-primary-700">
                        <Link
                          to="/transactions"
                          className="block w-full text-center text-gold hover:text-gold-400 transition-colors font-medium"
                          onClick={() => {
                            setShowNotifications(false)
                            setIsOpen(false)
                          }}
                        >
                          View All Transactions
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </div>

                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-primary dark:text-cream hover:text-gold transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <User size={20} />
                  <span>My Account</span>
                </Link>
                <button
                  onClick={() => {
                    navigate('/login')
                    setIsOpen(false)
                  }}
                  className="bg-gradient-to-r from-gold to-gold-400 text-primary px-4 py-2 rounded-xl font-semibold"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  )
}

export default Navbar