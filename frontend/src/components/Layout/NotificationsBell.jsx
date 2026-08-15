import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bell, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useWebSocket } from '../../hooks/useWebSocket'
import api from '../../services/api'

/**
 * Reusable notification bell + dropdown (the app's existing notification
 * functionality). Used by both the desktop sidebar and the dashboard top navbar
 * so the notification logic lives in exactly one place.
 */
const NotificationsBell = ({
  buttonClassName = 'p-2 rounded-xl text-primary dark:text-cream hover:text-primary-600 dark:hover:text-gold-300 hover:bg-silver/10 transition-colors relative',
  badgeClassName = 'bg-danger ring-2 ring-white dark:ring-primary-800',
}) => {
  const { user } = useAuth()
  const [show, setShow] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)

  // Real-time notifications (connection is currently disabled server-side,
  // but the listener stays wired for when it is enabled)
  useWebSocket({
    newTransaction: (data) => {
      const n = {
        id: data.transaction._id,
        title: data.transaction.description,
        amount: data.transaction.amount,
        transactionType: data.transaction.type,
        date: data.transaction.createdAt,
        read: false,
      }
      setNotifications(prev => [n, ...prev.slice(0, 4)])
    },
  })

  const fetchNotifications = async () => {
    if (!user) return
    try {
      setLoading(true)
      const response = await api.get('/api/transactions/')
      const transactions = response.data.data || []
      const recent = transactions
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(t => ({
          id: t._id,
          title: t.description,
          amount: t.amount,
          transactionType: t.type,
          date: t.createdAt,
          read: false,
        }))
      setNotifications(recent)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClick = () => {
    setShow(!show)
    if (!show) {
      fetchNotifications()
    }
  }

  const getIcon = (type) =>
    type === 'deposit'
      ? <ArrowDownLeft className="text-success" size={16} />
      : <ArrowUpRight className="text-danger" size={16} />

  return (
    <div className="relative">
      <button onClick={handleClick} aria-label="Notifications" className={buttonClassName}>
        <Bell size={19} />
        {notifications.length > 0 && (
          <span className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${badgeClassName}`} />
        )}
      </button>

      {show && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-primary-800 rounded-xl shadow-lux-card border border-silver/20 dark:border-primary-700 z-50"
        >
          <div className="p-4 border-b border-silver/20 dark:border-primary-700">
            <h3 className="text-base font-heading font-semibold text-primary dark:text-cream">
              Recent Transactions
            </h3>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-silver">Loading notifications...</div>
            ) : notifications.length > 0 ? (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className="p-3 border-b border-silver/20 dark:border-primary-700/50 hover:bg-cream/50 dark:hover:bg-primary-700/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      n.transactionType === 'deposit'
                        ? 'bg-success/20 text-success'
                        : 'bg-danger/20 text-danger'
                    }`}>
                      {getIcon(n.transactionType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-primary dark:text-cream truncate">
                        {n.title}
                      </p>
                      <p className="text-xs text-silver">
                        {new Date(n.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-sm font-semibold ${
                        n.transactionType === 'deposit' ? 'text-success' : 'text-danger'
                      }`}>
                        {n.transactionType === 'deposit' ? '+' : '-'}$
                        {Math.abs(n.amount).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-silver">No recent transactions</div>
            )}
          </div>

          <div className="p-3 border-t border-silver/20 dark:border-primary-700">
            <Link
              to="/transactions"
              onClick={() => setShow(false)}
              className="block w-full text-center text-gold hover:text-gold-600 transition-colors font-medium text-sm"
            >
              View All Transactions
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default NotificationsBell
