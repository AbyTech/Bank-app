import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, X, AlertCircle, RefreshCw } from 'lucide-react'
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
  const [recipientName, setRecipientName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [accountsLoading, setAccountsLoading] = useState(false)
  const [conversionInfo, setConversionInfo] = useState(null)
  const [calculatingConversion, setCalculatingConversion] = useState(false)

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

    // Trigger conversion calculation when relevant fields change
    if (name === 'fromAccountId' || name === 'toAccountNumber' || name === 'amount') {
      calculateConversionPreview()
    }
  }

  const calculateConversionPreview = async () => {
    const { fromAccountId, toAccountNumber, amount } = formData

    if (!fromAccountId || !toAccountNumber || !amount || parseFloat(amount) <= 0) {
      setConversionInfo(null)
      return
    }

    try {
      setCalculatingConversion(true)

      // Find accounts
      const fromAccount = accounts.find(acc => acc._id === fromAccountId)
      let toAccount = accounts.find(acc => acc.accountNumber === toAccountNumber)

      // If recipient account not in user's accounts, we can't preview conversion
      // In a real app, you'd call an API to get recipient account details
      if (!toAccount) {
        setConversionInfo(null)
        return
      }

      if (fromAccount.currency === toAccount.currency) {
        setConversionInfo(null)
        return
      }

      // Use mock rates for preview (same as backend fallback)
      const mockRates = {
        'USD_NGN': 1600,
        'USD_GHS': 12,
        'USD_ZAR': 18,
        'USD_EUR': 0.85,
        'USD_GBP': 0.75,
        'USD_CAD': 1.25,
        'USD_AUD': 1.35,
        'USD_BRL': 5.2,
        'EUR_USD': 1.18,
        'GBP_USD': 1.33,
        'CAD_USD': 0.8,
        'AUD_USD': 0.74,
        'BRL_USD': 0.19,
        'NGN_USD': 0.000625,
        'GHS_USD': 0.083,
        'ZAR_USD': 0.056
      }

      const rateKey = `${fromAccount.currency}_${toAccount.currency}`
      const rate = mockRates[rateKey] || 1
      const convertedAmount = parseFloat(amount) * rate

      setConversionInfo({
        originalAmount: parseFloat(amount),
        originalCurrency: fromAccount.currency,
        convertedAmount: convertedAmount.toFixed(2),
        convertedCurrency: toAccount.currency,
        exchangeRate: rate.toFixed(4)
      })
    } catch (error) {
      console.error('Error calculating conversion:', error)
      setConversionInfo(null)
    } finally {
      setCalculatingConversion(false)
    }
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
    setRecipientName('')
    setError('')
    setConversionInfo(null)
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
              onBlur={() => {
                if (formData.toAccountNumber.length >= 10) {
                  const fetchRecipientName = async () => {
                    try {
                      const response = await api.get(`/api/accounts/recipient/${formData.toAccountNumber}`)
                      if (response.data.success) {
                        setRecipientName(response.data.data.name)
                      } else {
                        setRecipientName('')
                      }
                    } catch (error) {
                      console.error('Error fetching recipient:', error)
                      setRecipientName('')
                    }
                  }
                  fetchRecipientName()
                } else {
                  setRecipientName('')
                }
              }}
              className="w-full px-3 py-2 bg-cream dark:bg-primary-700 border border-silver dark:border-primary-600 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
              placeholder="Enter account number"
            />
          </div>

          {/* Recipient Name */}
          <div>
            <label className="block text-sm font-medium text-primary dark:text-cream mb-2">
              Recipient Name
            </label>
            <input
              type="text"
              value={recipientName}
              readOnly
              className="w-full px-3 py-2 bg-silver/20 dark:bg-primary-600/20 border border-silver dark:border-primary-600 rounded-lg text-primary dark:text-cream cursor-not-allowed"
              placeholder="Name will appear here when account number is entered"
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

          {/* Conversion Preview */}
          {conversionInfo && (
            <div className="bg-gold/10 border border-gold/20 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <RefreshCw size={16} className="text-gold" />
                <span className="text-sm font-medium text-primary dark:text-cream">
                  Currency Conversion Preview
                </span>
              </div>
              <div className="text-sm text-primary dark:text-cream space-y-1">
                <div>
                  Sending: {conversionInfo.originalAmount.toFixed(2)} {conversionInfo.originalCurrency}
                </div>
                <div>
                  Recipient receives: {conversionInfo.convertedAmount} {conversionInfo.convertedCurrency}
                </div>
                <div className="text-xs text-silver">
                  Exchange rate: 1 {conversionInfo.originalCurrency} = {conversionInfo.exchangeRate} {conversionInfo.convertedCurrency}
                </div>
              </div>
            </div>
          )}

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
              disabled={loading || accountsLoading || calculatingConversion}
              className="flex-1 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-cream border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={16} />
                  <span>Send</span>
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
