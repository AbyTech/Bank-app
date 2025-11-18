import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, X, AlertCircle } from 'lucide-react'
import Button from './UI/Button'
import Modal from './UI/Modal'
import { useAuth } from '../hooks/useAuth'
import api from '../services/api'

const TransferForm = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    fromAccountId: '',
    toAccountNumber: '',
    amount: '',
    description: ''
  })
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [accountsLoading, setAccountsLoading] = useState(false)

  React.useEffect(() => {
    if (isOpen && user) {
      fetchUserAccounts()
    }
  }, [isOpen, user])

  const fetchUserAccounts = async () => {
    try {
      setAccountsLoading(true)
      const response = await api.get('/api/accounts/')
      setAccounts(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch accounts:', error)
      setError('Failed to load accounts')
    } finally {
      setAccountsLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.fromAccountId || !formData.toAccountNumber || !formData.amount) {
      setError('Please fill in all required fields')
      return
    }

    if (parseFloat(formData.amount) <= 0) {
      setError('Amount must be greater than 0')
      return
    }

    try {
      setLoading(true)
      setError('')

      const response = await api.post('/api/transactions/transfer', {
        fromAccountId: formData.fromAccountId,
        toAccountNumber: formData.toAccountNumber,
        amount: parseFloat(formData.amount),
        description: formData.description || 'Transfer'
      })

      if (response.data.success) {
        onSuccess && onSuccess()
        handleClose()
      }
    } catch (error) {
      console.error('Transfer failed:', error)
      setError(error.response?.data?.error || 'Transfer failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      fromAccountId: '',
      toAccountNumber: '',
      amount: '',
      description: ''
    })
    setError('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-cream dark:bg-primary-800 rounded-lg p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-heading font-semibold text-primary dark:text-cream">
            Transfer Funds
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="p-1"
          >
            <X size={20} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* From Account */}
          <div>
            <label className="block text-sm font-medium text-primary dark:text-cream mb-2">
              From Account *
            </label>
            <select
              name="fromAccountId"
              value={formData.fromAccountId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-cream dark:bg-primary-700 border border-silver dark:border-primary-600 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
              disabled={accountsLoading}
            >
              <option value="">
                {accountsLoading ? 'Loading accounts...' : 'Select account'}
              </option>
              {accounts.map(account => (
                <option key={account._id} value={account._id}>
                  {account.accountNumber} - {account.accountType} (${account.balance.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          {/* To Account Number */}
          <div>
            <label className="block text-sm font-medium text-primary dark:text-cream mb-2">
              Recipient Account Number *
            </label>
            <input
              type="text"
              name="toAccountNumber"
              value={formData.toAccountNumber}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-cream dark:bg-primary-700 border border-silver dark:border-primary-600 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
              placeholder="Enter account number"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-primary dark:text-cream mb-2">
              Amount *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-silver">$</span>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                className="w-full pl-8 pr-3 py-2 bg-cream dark:bg-primary-700 border border-silver dark:border-primary-600 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                placeholder="0.00"
                min="0.01"
                step="0.01"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-primary dark:text-cream mb-2">
              Description (Optional)
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-cream dark:bg-primary-700 border border-silver dark:border-primary-600 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
              placeholder="What's this transfer for?"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 text-danger bg-danger/10 p-3 rounded-lg">
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading || accountsLoading}
              className="flex-1 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-cream border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={16} />
                  <span>Transfer</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </Modal>
  )
}

export default TransferForm
