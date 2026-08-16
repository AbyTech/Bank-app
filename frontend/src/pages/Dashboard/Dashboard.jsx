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
  ArrowLeftRight,
  Clock,
  Gauge,
  Shield,
  AlertTriangle,
  X,
  Copy,
  Eye,
  EyeOff,
  Wallet,
  Plus
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import Card, { CardContent, CardHeader } from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import NotificationsBell from '../../components/Layout/NotificationsBell'
import QuickActions from './QuickActions'
import ActivityFeed from './ActivityFeed'
import BalanceChart from '../../components/Charts/BalanceChart'
import AddMoneyModal from '../../components/AddMoneyModal'
import { useAuth } from '../../hooks/useAuth'
import api from '../../services/api'
import { formatAmount, getCurrencyByCountry } from '../../services/currency'

// Daily transaction limit: normal users 3/day, admins 100/day
// (no backend field exists for this value)
const getTransactionLimit = (isAdmin) => (isAdmin ? 100 : 3)

// Time-based greeting (based on the user's local time)
const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

// Today's date formatted as "Saturday, August 15, 2026"
const getTodayString = () =>
  new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

const Dashboard = () => {
  const { user, isAdmin } = useAuth()
  const [balance, setBalance] = useState(user?.balance || 0)
  const [currency, setCurrency] = useState(user?.currency_code || 'USD')
  const [stats, setStats] = useState([])
  const [recentTransactions, setRecentTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showProfileNotification, setShowProfileNotification] = useState(false)
  const [hideBalance, setHideBalance] = useState(false)
  const [primaryAccount, setPrimaryAccount] = useState(null)
  const [pendingCount, setPendingCount] = useState(0)
  const [transactionVolume, setTransactionVolume] = useState(0)
  const [accountStatus, setAccountStatus] = useState(user?.accountStatus || 'active')
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
      if (!user.profileCompleted) {
        setShowProfileNotification(true)
      }
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      setAccountStatus(user?.accountStatus || 'active')

      let userCurrency = 'USD'
      if (user?.country) {
        userCurrency = getCurrencyByCountry(user.country)
        setCurrency(userCurrency)
      }

      const accountResponse = await api.get('/api/accounts/')
      const accountData = accountResponse.data.data[0]
      setBalance(accountData.balance)
      setPrimaryAccount(accountData)

      const transactionsResponse = await api.get('/api/transactions/')
      const transactionsData = transactionsResponse.data.data || []
      setRecentTransactions(transactionsData.slice(0, 3))
      setPendingCount(transactionsData.filter(t => t.status === 'pending').length)
      setTransactionVolume(transactionsData.reduce((sum, t) => sum + Math.abs(parseFloat(t.amount) || 0), 0))

      const cardsResponse = await api.get('/api/cards/')
      const activeCards = cardsResponse.data.data.filter(card => card.status === 'active').length

      const loansResponse = await api.get('/api/loans/')
      const activeLoans = loansResponse.data.data.filter(loan => loan.status === 'active').length

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
          value: formatAmount(accountData.balance, userCurrency),
          change: '+12.5%',
          trend: 'up',
          icon: DollarSign,
          color: 'text-success'
        },
        {
          title: 'Monthly Income',
          value: formatAmount(monthlyIncome, userCurrency),
          change: '+5.2%',
          trend: 'up',
          icon: TrendingUp,
          color: 'text-success'
        },
        {
          title: 'Monthly Expenses',
          value: formatAmount(monthlyExpenses, userCurrency),
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
    <div className="min-h-screen bg-cream dark:bg-primary-900 pt-16 lg:pt-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Navbar */}
        <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl bg-white dark:bg-primary-800 border border-silver/20 dark:border-primary-700 shadow-lux-card px-4 sm:px-6 py-3">
          <div className="min-w-0">
            <p className="text-xs sm:text-sm lg:text-base font-medium text-primary dark:text-cream truncate">
              {getTodayString()}
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Wallet + balance (hidden on small mobile) */}
            <div className="hidden sm:flex items-center gap-2 bg-primary-600 text-white rounded-xl px-3.5 py-2">
              <Wallet size={16} className="shrink-0" />
              <span className="font-semibold text-xs sm:text-sm whitespace-nowrap">
                {formatAmount(balance, currency)}
              </span>
            </div>
            <NotificationsBell />
          </div>
        </div>

        {/* Profile Completion Notification */}
        {showProfileNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 bg-gradient-to-r from-gold-100 to-gold-200 dark:from-gold-900/20 dark:to-gold-900/20 border border-gold-200 dark:border-gold-800 rounded-xl p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="text-gold-500 mt-0.5" size={20} />
                <div>
                  <h3 className="text-sm font-semibold text-gold-700 dark:text-gold-200">
                    Complete Your Profile
                  </h3>
                  <p className="text-sm text-gold-700 dark:text-gold-300 mt-1">
                    Please update your profile information to access all features. Add your name, country, and phone number.
                  </p>
                  <Link
                    to="/profile"
                    className="inline-flex items-center mt-2 text-sm font-medium text-gold-700 dark:text-gold-200 hover:text-gold-800 dark:hover:text-gold-100"
                  >
                    Update Profile →
                  </Link>
                </div>
              </div>
              <button
                onClick={() => setShowProfileNotification(false)}
                className="text-gold-500 hover:text-gold-600 dark:hover:text-gold-400"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Inactive Account Banner */}
        {accountStatus === 'inactive' && !user?.isBlocked && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-danger-light dark:bg-danger/10 border border-danger/30 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-danger mt-0.5 shrink-0" size={20} />
              <div>
                <h3 className="text-sm font-semibold text-danger-dark dark:text-danger-light">
                  Account Inactive
                </h3>
                <p className="text-sm text-danger-dark/80 dark:text-danger-light/80 mt-1">
                  Your account is currently inactive. You can still view your dashboard, but money movements and card/loan requests are paused. Please contact support to reactivate your account.
                </p>
              </div>
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
                className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-primary-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Shield size={20} />
                <span>Admin Panel</span>
              </Link>
            )}
          </div>
        </motion.div>

        {/* Desktop Stats Grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-silver dark:text-silver mb-1">
                        {stat.title}
                      </p>
                      <p className="text-lg sm:text-2xl font-bold text-primary dark:text-cream mb-2">
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

        {/* ============ Main Account Overview (all screen sizes) ============ */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Teal Main Account Card */}
          <div className="lg:col-span-3">
            <div className="relative overflow-hidden h-full rounded-3xl bg-primary-600 text-white p-6 sm:p-8 shadow-lux-card">
              <div className="pointer-events-none absolute -top-20 -right-16 w-64 h-64 rounded-full bg-gold/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-primary-400/40 blur-3xl" />
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.10]"
                style={{
                  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.7) 1px, transparent 1px)',
                  backgroundSize: '22px 22px',
                }}
              />

              <div className="relative flex flex-col h-full">
                {/* Greeting + username + date */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-white/70">{getGreeting()},</p>
                    <h3 className="font-heading font-bold text-2xl sm:text-3xl mt-1 truncate">
                      {user?.username || user?.firstName || 'User'}
                    </h3>
                  </div>
                  <span className="inline-flex self-start shrink-0 text-xs text-white/70 font-medium px-3 py-1.5 rounded-full bg-white/10 border border-white/15">
                    {getTodayString()}
                  </span>
                </div>

                {/* Available balance */}
                <div className="mt-6 sm:mt-8">
                  <p className="text-xs uppercase tracking-wider text-white/60 font-semibold">
                    Available Balance
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-3xl sm:text-4xl font-bold break-words">
                      {hideBalance ? '******' : formatAmount(balance, currency)}
                    </p>
                    <button
                      onClick={() => setHideBalance(!hideBalance)}
                      aria-label={hideBalance ? 'Show balance' : 'Hide balance'}
                      className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                    >
                      {hideBalance ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Account number + status */}
                <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4">
                  <div>
                    <p className="text-xs text-white/60">Account Number</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="font-mono font-semibold text-sm sm:text-base">
                        {primaryAccount?.accountNumber || '—'}
                      </p>
                      <button
                        onClick={() => {
                          if (primaryAccount?.accountNumber) {
                            navigator.clipboard.writeText(primaryAccount.accountNumber)
                            toast.success('Account number copied!')
                          }
                        }}
                        aria-label="Copy account number"
                        className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-white/60">Status</p>
                    <span className={`mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                      accountStatus === 'inactive' || user?.isBlocked
                        ? 'bg-danger/80 text-white'
                        : 'bg-white/10 text-white border border-success/50'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${accountStatus === 'inactive' || user?.isBlocked ? 'bg-white' : 'bg-success'}`} />
                      {user?.isBlocked ? 'Blocked' : accountStatus === 'inactive' ? 'Inactive' : 'Active'}
                    </span>
                  </div>
                </div>

                {/* Transactions + Add Money buttons */}
                <div className="mt-8 lg:mt-auto pt-2 flex flex-wrap items-center gap-3">
                  <Link
                    to="/transactions"
                    className="inline-flex items-center gap-2 bg-white text-primary-600 font-semibold px-5 py-2.5 rounded-xl hover:bg-cream hover:shadow-lg transition-all"
                  >
                    <ArrowLeftRight size={16} />
                    Transactions
                  </Link>
                  <button
                    onClick={() => setShowAddMoneyModal(true)}
                    className="inline-flex items-center gap-2 bg-gold text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-gold-600 hover:shadow-lux-gold transition-all"
                  >
                    <Plus size={16} />
                    Add Money
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Account Statistics Card */}
          <div className="lg:col-span-2">
            <div className="h-full bg-white dark:bg-primary-800 rounded-3xl border border-silver/20 dark:border-primary-700 shadow-lux-card p-6 sm:p-8">
              <h3 className="font-heading font-bold text-xl text-primary dark:text-cream">
                Account Statistics
              </h3>
              <p className="text-sm text-silver mt-1">Your activity at a glance</p>

              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-cream dark:bg-primary-700/50 border border-silver/20 dark:border-primary-700">
                  <div className="w-11 h-11 rounded-xl bg-gold/15 text-gold flex items-center justify-center shrink-0">
                    <Clock size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-silver">Pending Transactions</p>
                    <p className="text-xl font-bold text-primary dark:text-cream mt-0.5">
                      {pendingCount}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-cream dark:bg-primary-700/50 border border-silver/20 dark:border-primary-700">
                  <div className="w-11 h-11 rounded-xl bg-primary-600/10 text-primary-600 dark:text-gold-300 flex items-center justify-center shrink-0">
                    <Gauge size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-silver">Transaction Limit</p>
                    <p className="text-xl font-bold text-primary dark:text-cream mt-0.5">
                      {getTransactionLimit(isAdmin)}
                      <span className="text-sm font-medium text-silver ml-1">/ day</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-cream dark:bg-primary-700/50 border border-silver/20 dark:border-primary-700">
                  <div className="w-11 h-11 rounded-xl bg-success/15 text-success flex items-center justify-center shrink-0">
                    <ArrowLeftRight size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-silver">Transaction Volume</p>
                    <p className="text-xl font-bold text-primary dark:text-cream mt-0.5 truncate">
                      {formatAmount(transactionVolume, currency)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile View: Quick Actions */}
        <div className="lg:hidden space-y-6 mt-8">
          <QuickActions />
        </div>
        {/* Desktop Layout: Split Grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left side: Transactions */}
            <div className="lg:col-span-2">
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
                            <div className={`p-2 rounded-full ${getTransactionColor(transaction)}`}>
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
                                {getTransactionAmountPrefix(transaction)}{formatAmount(Math.abs(transaction.amount), currency)}
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

            {/* Right side: Desktop Quick Actions Sidebar */}
            <div className="hidden lg:block">
                <Card className="h-full">
                    <CardHeader>
                        <h3 className="text-lg font-heading font-semibold text-primary dark:text-cream">
                            Quick Actions
                        </h3>
                    </CardHeader>
                    <CardContent className="[&_svg]:w-5 [&_svg]:h-5">
                        <QuickActions />
                    </CardContent>
                </Card>
            </div>
        </div>

        {/* Activity Feed */}
        <div className="mt-8">
          <ActivityFeed />
        </div>
      </div>

      {/* Add Money - funding methods modal */}
      <AddMoneyModal
        isOpen={showAddMoneyModal}
        onClose={() => setShowAddMoneyModal(false)}
      />
    </div>
  )
}

export default Dashboard