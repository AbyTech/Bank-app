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
  X,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react'
import { toast } from 'react-hot-toast'
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
  const [hideBalance, setHideBalance] = useState(false)
  const [primaryAccount, setPrimaryAccount] = useState(null)

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

      const cardsResponse = await api.get('/api/cards/')
      const activeCards = cardsResponse.data.data.filter(card => card.purchase_status === 'active').length

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

        {/* Desktop Stats Grid */}
        <div className="hidden lg:grid grid-cols-4 gap-6 mb-8">
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

        {/* Mobile View */}
        <div className="lg:hidden space-y-6">
          {primaryAccount && (
            <div className="mb-8">
              <Card className="!bg-[#223032] dark:!bg-[#223032] backdrop-blur-sm border-gold/30 shadow-2xl">
                <CardHeader>
                  <h3 className="text-lg font-heading font-semibold text-gold dark:text-cream">
                    Account Overview
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                <div className="space-y-6 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-silver dark:text-silver">Total Balance</span>
                    <div className="flex items-center space-x-2">
                      <motion.span 
                        key={hideBalance ? 'hidden' : 'shown'}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-2xl font-bold bg-gradient-to-r from-gold via-gold-300 to-gold bg-clip-text text-transparent drop-shadow-lg"
                      >
                        {hideBalance 
                          ? '******' 
                          : formatAmount(primaryAccount.balance, currency)
                        }
                      </motion.span>
                      <button
                        onClick={() => setHideBalance(!hideBalance)}
                        className="p-2 text-silver hover:text-gold hover:bg-gold/20 rounded-lg transition-all duration-200"
                      >
                        {hideBalance ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-silver/20 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-silver dark:text-silver">Account Number</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm font-semibold text-primary dark:text-cream bg-cream/50 dark:bg-primary-800 px-3 py-1 rounded-lg">
                          {primaryAccount.accountNumber}
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(primaryAccount.accountNumber)
                            toast.success('Account number copied!')
                          }}
                          className="p-2 text-silver hover:text-gold hover:bg-gold/20 rounded-lg transition-all duration-200"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-silver dark:text-silver">Account Type</span>
                      <span className="px-3 py-1 bg-success/20 text-success text-sm font-semibold rounded-lg">
                        Savings
                      </span>
                    </div>
                  </div>
                </div>
                </CardContent>
              </Card>
            </div>
          )}
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
    </div>
  )
}

export default Dashboard