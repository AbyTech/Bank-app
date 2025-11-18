import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Download, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import Card, { CardContent, CardHeader } from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import TransferForm from '../../components/TransferForm'
import { useAuth } from '../../hooks/useAuth'
import api from '../../services/api'

const Transactions = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTransferForm, setShowTransferForm] = useState(false)

  useEffect(() => {
    if (user) {
      fetchTransactions()

      // Check if we should open transfer modal from quick actions
      const shouldOpenTransfer = sessionStorage.getItem('openTransferModal')
      if (shouldOpenTransfer === 'true') {
        sessionStorage.removeItem('openTransferModal')
        setShowTransferForm(true)
      }
    }
  }, [user])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/transactions/')
      setTransactions(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || transaction.type === filter
    return matchesSearch && matchesFilter
  })

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="text-success" size={20} />
      case 'withdrawal':
      case 'transfer':
      case 'payment':
      case 'card_purchase':
        return <ArrowUpRight className="text-danger" size={20} />
      default:
        return <ArrowUpRight className="text-silver" size={20} />
    }
  }

  return (
    <div className="min-h-screen bg-cream dark:bg-primary-900 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-heading font-bold text-primary dark:text-cream mb-2">
            Transactions
          </h1>
          <p className="text-silver dark:text-silver">
            View and manage your transaction history
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-heading font-semibold text-primary dark:text-cream">
                  Filters
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-primary dark:text-cream mb-2">
                      Search
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-silver" size={20} />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-cream dark:bg-primary-700 border border-silver dark:border-primary-600 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                        placeholder="Search transactions..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary dark:text-cream mb-2">
                      Transaction Type
                    </label>
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-cream dark:bg-primary-700 border border-silver dark:border-primary-600 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                    >
                      <option value="all">All Transactions</option>
                      <option value="deposit">Deposits</option>
                      <option value="withdrawal">Withdrawals</option>
                      <option value="transfer">Transfers</option>
                      <option value="payment">Payments</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary dark:text-cream mb-2">
                      Date Range
                    </label>
                    <select className="w-full px-3 py-2 bg-cream dark:bg-primary-700 border border-silver dark:border-primary-600 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent">
                      <option>Last 30 days</option>
                      <option>Last 90 days</option>
                      <option>Last year</option>
                      <option>Custom range</option>
                    </select>
                  </div>

                  <Button variant="secondary" className="w-full flex items-center justify-center gap-2">
                    <Filter size={16} />
                    Apply Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transactions List */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                  <h3 className="text-lg font-heading font-semibold text-primary dark:text-cream">
                    Transaction History
                  </h3>
                  <div className="flex space-x-3">
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <Download size={16} />
                      <span>Export</span>
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setShowTransferForm(true)}
                    >
                      Transfer Money
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredTransactions.map((transaction) => (
                    <motion.div
                      key={transaction._id}
                      className="flex items-center justify-between p-4 rounded-lg bg-cream dark:bg-primary-700/50 hover:bg-silver/10 transition-colors"
                      whileHover={{ x: 4 }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-2 rounded-full bg-primary-100 dark:bg-primary-600">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <p className="font-medium text-primary dark:text-cream">
                            {transaction.description}
                          </p>
                          <p className="text-sm text-silver">
                            {transaction.type} • {new Date(transaction.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          transaction.type === 'deposit' ? 'text-success' : 'text-danger'
                        }`}>
                          {transaction.type === 'deposit' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                        </p>
                        <p className="text-xs text-silver capitalize">
                          {transaction.status}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {filteredTransactions.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-primary-100 dark:bg-primary-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="text-silver" size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-primary dark:text-cream mb-2">
                      No transactions found
                    </h3>
                    <p className="text-silver">
                      Try adjusting your search or filters
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Transfer Form Modal */}
        <TransferForm
          isOpen={showTransferForm}
          onClose={() => setShowTransferForm(false)}
          onSuccess={() => {
            fetchTransactions()
            setShowTransferForm(false)
          }}
        />
      </div>
    </div>
  )
}

export default Transactions
