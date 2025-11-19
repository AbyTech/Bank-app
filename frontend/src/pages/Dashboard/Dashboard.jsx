import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  TrendingUp,
  TrendingDown,
  CreditCard,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Send,
  Shield,
  AlertTriangle,
  X
} from 'lucide-react'
import Card, { CardContent, CardHeader } from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import QuickActions from './QuickActions'
import ActivityFeed from './ActivityFeed'
import BalanceChart from '../../components/Charts/BalanceChart'
import { useAuth } from '../../hooks/useAuth'
import api from '../../services/api'
import { formatAmount, getCurrencyByCountry } from '../../services/currency'

const Dashboard = () => {
  const { user, isAdmin } = useAuth()
  const [balance, setBalance] = useState(user?.balance || 0)
  const [currency, setCurrency] = useState(user?.currency_code || 'USD')
  const [stats, setStats] = useState([])
  const [recentTransactions, setRecentTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showProfileNotification, setShowProfileNotification] = useState(false)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
      // Check if profile is completed
      if (!user.profileCompleted) {
        setShowProfileNotification(true)
      }
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      // Fetch account data
      const accountResponse = await api.get('/api/accounts/')
      const accountData = accountResponse.data.data[0] // Get first account
      setBalance(accountData.balance)

      // Set currency based on user's country
      if (user?.country) {
        const userCurrency = getCurrencyByCountry(user.country)
        setCurrency(userCurrency)
      }

      // Fetch transactions
      const transactionsResponse = await api.get('/api/transactions/')
      const transactionsData = transactionsResponse.data.data || []
      setRecentTransactions(transactionsData.slice(0, 3))

      // Fetch cards count
      const cardsResponse = await api.get('/api/cards/')
      const activeCards = cardsResponse.data.data.filter(card => card.purchase_status === 'active').length

      // Fetch loans count
      const loansResponse = await api.get('/api/loans/')
      const activeLoans = loansResponse.data.data.filter(loan => loan.status === 'active').length

      // Calculate stats
      const monthlyIncome = transactionsData
        .filter(t => t.type === 'deposit' && new Date(t.createdAt).getMonth() === new Date().getMonth())
        .reduce((sum, t) => sum + parseFloat(t.amount), 0)

      const monthlyExpenses = transactionsData
        .filter(t => ['withdrawal', 'transfer', 'payment', 'card_purchase'].includes(t.type) &&
                     new Date(t.createdAt).getMonth() === new Date().getMonth())
        .reduce((sum, t) => sum + parseFloat(t.amount), 0)

      setStats([
        {
          title: 'Total Balance',
          value: formatAmount(accountData.balance, currency),
          change: '+12.5%',
          trend: 'up',
          icon: DollarSign,
          color: 'text-success'
        },
        {
          title: 'Monthly Income',
          value: formatAmount(monthlyIncome, currency),
          change: '+5.2%',
          trend: 'up',
          icon: TrendingUp,
          color: 'text-success'
        },
        {
          title: 'Monthly Expenses',
          value: formatAmount(monthlyExpenses, currency),
          change: '-2.1%',
          trend: 'down',
          icon: TrendingDown,
          color: 'text-danger'
        },
        {
          title: 'Active Cards',
          value: activeCards.toString(),
          change: '+1',
          trend: 'up',
          icon: CreditCard,
          color: 'text-gold'
        }
      ])
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      // Fallback to default stats if API fails
      setStats([
        {
          title: 'Total Balance',
          value: formatAmount(balance, currency),
          change: '+12.5%',
          trend: 'up',
          icon: DollarSign,
          color: 'text-success'
        },
        {
          title: 'Monthly Income',
          value: formatAmount(0, currency),
          change: '+5.2%',
          trend: 'up',
          icon: TrendingUp,
          color: 'text-success'
        },
        {
          title: 'Monthly Expenses',
          value: formatAmount(0, currency),
          change: '-2.1%',
          trend: 'down',
          icon: TrendingDown,
          color: 'text-danger'
        },
        {
          title: 'Active Cards',
          value: '0',
          change: '+1',
          trend: 'up',
          icon: CreditCard,
          color: 'text-gold'
        }
      ])
    } finally {
      setLoading(false)
    }
  }



  const getTransactionIcon = (transaction) => {
    switch (transaction.type) {
      case 'deposit':
        return <ArrowDownLeft className="text-success" size={20} />
      case 'transfer':
        // For transfers, check if this is the receiving transaction (no toAccount means it's a received transfer)
        return transaction.toAccount ? <ArrowUpRight className="text-danger" size={20} /> : <ArrowDownLeft className="text-success" size={20} />
      case 'withdrawal':
      case 'payment':
      case 'card_purchase':
        return <ArrowUpRight className="text-danger" size={20} />
      default:
        return <ArrowUpRight className="text-silver" size={20} />
    }
  }

  const getTransactionColor = (transaction) => {
    switch (transaction.type) {
      case 'deposit':
        return 'bg-success/20 text-success'
      case 'transfer':
        // For transfers, check if this is the receiving transaction
        return transaction.toAccount ? 'bg-danger/20 text-danger' : 'bg-success/20 text-success'
      case 'withdrawal':
      case 'payment':
      case 'card_purchase':
        return 'bg-danger/20 text-danger'
      default:
        return 'bg-silver/20 text-silver'
    }
  }

  const getTransactionAmountColor = (transaction) => {
    switch (transaction.type) {
      case 'deposit':
        return 'text-success'
      case 'transfer':
        // For transfers, check if this is the receiving transaction
        return transaction.toAccount ? 'text-danger' : 'text-success'
      case 'withdrawal':
      case 'payment':
      case 'card_purchase':
        return 'text-danger'
      default:
        return 'text-silver'
    }
  }

  const getTransactionAmountPrefix = (transaction) => {
    switch (transaction.type) {
      case 'deposit':
        return '+'
      case 'transfer':
        // For transfers, check if this is the receiving transaction
        return transaction.toAccount ? '-' : '+'
      case 'withdrawal':
      case 'payment':
      case 'card_purchase':
        return '-'
      default:
        return '-'
    }
  }

  return (
    <div className="min-h-screen bg-cream dark:bg-primary-900 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Completion Notification */}
        {showProfileNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="text-amber-500 mt-0.5" size={20} />
                <div>
                  <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                    Complete Your Profile
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    Please update your profile information to access all features. Add your name, country, and phone number.
                  </p>
                  <Link
                    to="/profile"
                    className="inline-flex items-center mt-2 text-sm font-medium text-amber-800 dark:text-amber-200 hover:text-amber-900 dark:hover:text-amber-100"
                  >
                    Update Profile →
                  </Link>
                </div>
              </div>
              <button
                onClick={() => setShowProfileNotification(false)}
                className="text-amber-500 hover:text-amber-600 dark:hover:text-amber-400"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-heading font-bold text-primary dark:text-cream mb-2">
                Welcome back, {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.firstName || 'User'}! 👋
              </h1>
              <p className="text-silver dark:text-silver">
                Here's your financial overview for today
              </p>
            </div>
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center space-x-2 bg-gradient-to-r from-gold to-gold-400 text-primary px-4 py-2 rounded-xl font-semibold hover:from-gold-400 hover:to-gold-500 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Shield size={20} />
                <span>Admin Panel</span>
              </Link>
            )}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-silver dark:text-silver mb-1">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-primary dark:text-cream mb-2">
                        {stat.value}
                      </p>
                      <div className={`flex items-center space-x-1 text-sm ${stat.color}`}>
                        {stat.trend === 'up' ? (
                          <TrendingUp size={16} />
                        ) : (
                          <TrendingDown size={16} />
                        )}
                        <span>{stat.change}</span>
                        <span className="text-silver">from last month</span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-xl bg-gold/10 ${stat.color}`}>
                      <stat.icon size={24} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Balance Chart */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-heading font-semibold text-primary dark:text-cream">
                  Balance Overview
                </h3>
              </CardHeader>
              <CardContent>
                <BalanceChart />
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <QuickActions />
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-heading font-semibold text-primary dark:text-cream">
                Recent Transactions
              </h3>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <motion.div
                    key={transaction._id}
                    className="flex items-center justify-between p-4 rounded-lg bg-cream dark:bg-primary-700/50 hover:bg-silver/10 transition-colors"
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${
                        getTransactionColor(transaction)
                      }`}>
                        {getTransactionIcon(transaction)}
                      </div>
                      <div>
                        <p className="font-medium text-primary dark:text-cream">
                          {transaction.description}
                        </p>
                        <p className="text-sm text-silver">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${getTransactionAmountColor(transaction)}`}>
                        {getTransactionAmountPrefix(transaction)}${Math.abs(transaction.amount).toFixed(2)}
                      </p>
                      <p className="text-xs text-silver capitalize">
                        {transaction.status}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed */}
        <div className="mt-8">
          <ActivityFeed />
        </div>
      </div>
    </div>
  )
}

export default Dashboard