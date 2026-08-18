// @ts-check
import React, { useState, useEffect } from 'react'
import { Loader2, AlertCircle, CreditCard, CheckCircle2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import Button from '../UI/Button'

/** Existing card/bank withdrawal method. Uses POST /api/transactions/withdraw. */
const CardWithdrawForm = ({ onDone, onCancel }) => {
  const [accounts, setAccounts] = useState([])
  const [accountsLoading, setAccountsLoading] = useState(true)
  const [hasActiveCard, setHasActiveCard] = useState(false)
  const [accountId, setAccountId] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setAccountsLoading(true)
      try {
        const accs = await Promise.all([api.get('/api/accounts/'), api.get('/api/cards/')])
        if (cancelled) return
        const accountData = accs[0].data.data || []
        const cardData = accs[1].data.data || []
        setAccounts(accountData)
        setHasActiveCard(cardData.some((c) => c.status === 'active'))
        if (accountData[0]) setAccountId(accountData[0]._id)
      } catch (e) {
        if (!cancelled) setError('Failed to load account details.')
      } finally {
        if (!cancelled) setAccountsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const amountNum = Number(amount)
    if (!amountNum || amountNum <= 0) { setError('Please enter a valid withdrawal amount.'); return }
    if (!accountId) { setError('Please select an account.'); return }
    if (!hasActiveCard) { setError('An active card is required for card withdrawals. Please order a card first.'); return }
    setSubmitting(true)
    try {
      const response = await api.post('/api/transactions/withdraw', {
        accountId,
        amount: amountNum,
        description: description || 'Card withdrawal',
      })
      toast.success('Withdrawal successful')
      onDone?.(response.data.data)
    } catch (submitError) {
      setError(submitError?.response?.data?.error || submitError?.message || 'Withdrawal failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-silver">
        Withdraw to your linked card/bank account. Your account balance is debited immediately.
      </p>

      {!hasActiveCard && !accountsLoading && (
        <div className="flex items-start gap-2 bg-gold/10 border border-gold/30 rounded-xl p-3">
          <CreditCard size={16} className="text-gold shrink-0 mt-0.5" />
          <p className="text-xs text-primary dark:text-cream">
            You need an active card for this method.{' '}
            <Link to="/cards" className="text-gold font-semibold hover:underline">Order a card</Link>{' '}
            or use the wallet withdrawal method instead.
          </p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-primary dark:text-cream mb-2">From account</label>
        <select
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          className="w-full px-4 py-3 bg-primary-100 dark:bg-primary-700 border border-silver/40 dark:border-primary-600 rounded-xl text-sm focus:ring-2 focus:ring-gold focus:border-transparent"
          disabled={accountsLoading}
        >
          {accounts.length === 0 && <option value="">No accounts available</option>}
          {accounts.map((acc) => (
            <option key={acc._id} value={acc._id}>
              {acc.accountType} •••• {String(acc.accountNumber).slice(-4)} — ${Number(acc.balance).toFixed(2)} {acc.currency}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-primary dark:text-cream mb-2">Amount</label>
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00"
          min="0.01" step="0.01"
          className="w-full px-4 py-3 bg-primary-100 dark:bg-primary-700 border border-silver/40 dark:border-primary-600 rounded-xl text-sm focus:ring-2 focus:ring-gold focus:border-transparent" />
      </div>

      <div>
        <label className="block text-sm font-medium text-primary dark:text-cream mb-2">Description (optional)</label>
        <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
          placeholder="What's this withdrawal for?"
          className="w-full px-4 py-3 bg-primary-100 dark:bg-primary-700 border border-silver/40 dark:border-primary-600 rounded-xl text-sm focus:ring-2 focus:ring-gold focus:border-transparent" />
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-danger-light dark:bg-danger/10 border border-danger/30 rounded-xl p-3">
          <AlertCircle size={16} className="text-danger shrink-0 mt-0.5" />
          <p className="text-sm text-danger-dark dark:text-danger-light">{error}</p>
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <Button type="button" variant="ghost" className="flex-1" onClick={onCancel} disabled={submitting}>Cancel</Button>
        <Button type="submit" variant="brand" className="flex-1" disabled={submitting || accountsLoading}>
          {submitting ? <Loader2 size={16} className="animate-spin mr-1" /> : <CheckCircle2 size={16} className="mr-1" />}
          Withdraw
        </Button>
      </div>
    </form>
  )
}

export default CardWithdrawForm