// @ts-check
import React, { useState, useEffect } from 'react'
import { Loader2, AlertCircle, Send, Wallet, Copy, Check, User } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../../services/api'
import { walletAPI } from '../../services/walletApi'
import { getNetwork, shortAddress } from '../../services/walletNetworks'
import { getWalletById } from '../../services/walletList'
import Button from '../UI/Button'
import WalletIcon from './WalletIcon'

const MIN_WITHDRAWAL = 1
const MAX_WITHDRAWAL = 50000

/**
 * WalletWithdrawForm - amount + account form for a "Withdraw to Wallet".
 * Requires an already-connected WalletConnection (from context). Server-side
 * validation mirrors these client-side checks (limits, balance, ownership).
 */
const WalletWithdrawForm = ({ connection, onDone, onCancel }) => {
  const [accounts, setAccounts] = useState([])
  const [accountsLoading, setAccountsLoading] = useState(true)
  const [accountId, setAccountId] = useState('')
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const network = getNetwork(connection?.network)
  const wallet = getWalletById(connection?.walletProviderId)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setAccountsLoading(true)
      try {
        const response = await api.get('/api/accounts/')
        if (cancelled) return
        const accountData = response.data.data || []
        setAccounts(accountData)
        if (accountData[0]) setAccountId(accountData[0]._id)
      } catch (e) {
        if (!cancelled) setError('Failed to load your accounts.')
      } finally {
        if (!cancelled) setAccountsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(connection.walletAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (e) {
      toast.error('Could not copy address.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const amountNum = Number(amount)
    if (!amountNum || !isFinite(amountNum) || amountNum <= 0) { setError('Please enter a valid withdrawal amount.'); return }
    if (amountNum < MIN_WITHDRAWAL || amountNum > MAX_WITHDRAWAL) {
      setError(`Amount must be between $${MIN_WITHDRAWAL.toFixed(2)} and $${MAX_WITHDRAWAL.toFixed(2)}.`); return
    }
    if (!accountId) { setError('Please select an account.'); return }
    if (!connection) { setError('Please connect a wallet first.'); return }

    setSubmitting(true)
    try {
      const response = await walletAPI.withdraw({
        accountId,
        amount: amountNum,
        walletConnectionId: connection._id || connection.id,
        network: connection.network,
      })
      toast.success('Withdrawal successful')
      onDone?.(response.data || response)
    } catch (submitError) {
      setError(submitError?.message || 'Withdrawal failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Connected wallet summary */}
      <div className="flex items-center gap-3 bg-primary-50 dark:bg-primary-700/60 rounded-2xl p-4 border border-silver/25 dark:border-primary-600">
        {wallet ? <WalletIcon wallet={wallet} size="md" /> : <Wallet size={20} className="text-gold shrink-0" />}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-primary dark:text-cream truncate flex items-center gap-1.5">
            {connection.walletOwnerName && <><User size={13} className="text-gold shrink-0" />{connection.walletOwnerName} · </>}
            {connection.walletProviderName}
          </p>
          <button type="button" onClick={copyAddress}
            className="inline-flex items-center gap-1.5 font-mono text-sm text-primary-600 dark:text-gold-300 hover:underline"
            title="Copy full address">
            {shortAddress(connection.walletAddress)}
            {copied ? <Check size={13} className="text-success" /> : <Copy size={13} className="text-silver" />}
          </button>
        </div>
        <span className="flex items-center gap-2 shrink-0">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-success/15 text-success border border-success/30 capitalize">
            {network?.name || connection.network}
          </span>
        </span>
      </div>

      <div>
        <label className="block text-sm font-medium text-primary dark:text-cream mb-2">From account</label>
        <select value={accountId} onChange={(e) => setAccountId(e.target.value)}
          className="w-full px-4 py-3 bg-primary-100 dark:bg-primary-700 border border-silver/40 dark:border-primary-600 rounded-xl text-sm focus:ring-2 focus:ring-gold focus:border-transparent"
          disabled={accountsLoading}>
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
          min={MIN_WITHDRAWAL} max={MAX_WITHDRAWAL} step="0.01"
          className="w-full px-4 py-3 bg-primary-100 dark:bg-primary-700 border border-silver/40 dark:border-primary-600 rounded-xl text-sm focus:ring-2 focus:ring-gold focus:border-transparent" />
        <p className="text-xs text-silver mt-1.5">
          Minimum ${MIN_WITHDRAWAL.toFixed(2)} · Maximum ${MAX_WITHDRAWAL.toFixed(2)} per withdrawal
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-danger-light dark:bg-danger/10 border border-danger/30 rounded-xl p-3">
          <AlertCircle size={16} className="text-danger shrink-0 mt-0.5" />
          <p className="text-sm text-danger-dark dark:text-danger-light">{error}</p>
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <Button type="button" variant="ghost" className="flex-1" onClick={onCancel} disabled={submitting}>Cancel</Button>
        <Button type="submit" variant="brand" className="flex-1" disabled={submitting || accountsLoading || !connection}>
          {submitting ? <Loader2 size={16} className="animate-spin mr-1" /> : <Send size={16} className="mr-1" />}
          Withdraw to Wallet
        </Button>
      </div>
    </form>
  )
}

export default WalletWithdrawForm