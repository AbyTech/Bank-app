// @ts-check
import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, X, History, ShieldCheck } from 'lucide-react'
import {
  walletList,
  getWalletById,
  WALLET_CATEGORIES,
  getRecentWalletIds,
} from '../../services/walletList'
import WalletIcon from './WalletIcon'
import Modal from '../UI/Modal'

/**
 * WalletPicker - a beautiful, searchable wallet selection screen.
 * Shows 60+ supported wallets grouped by category, a search bar and a
 * "recently used" row. Selecting a wallet returns it to the parent which then
 * runs the real connection flow. No secrets are ever requested here.
 */
const WalletPicker = ({ isOpen, onClose, onSelect }) => {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')

  const recentIds = useMemo(() => getRecentWalletIds().map(getWalletById).filter(Boolean), [isOpen])
  const recent = recentIds.length > 0 ? recentIds : []

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    return walletList.filter((w) => {
      if (category !== 'all' && w.category !== category) return false
      if (!term) return true
      return (
        w.name.toLowerCase().includes(term) ||
        w.id.toLowerCase().includes(term) ||
        (w.networks || []).some((n) => n.includes(term))
      )
    })
  }, [query, category])

  const reset = () => {
    setQuery('')
    setCategory('all')
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <div className="w-full">
        {/* Header */}
        <div className="text-center mb-4">
          <h3 className="font-heading font-bold text-xl text-primary dark:text-cream">Connect a wallet</h3>
          <p className="text-sm text-silver mt-1">
            Select your wallet provider. Your keys stay inside your wallet — we only ever receive your public address.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-silver" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search 60+ wallets e.g. MetaMask, Ledger, Phantom..."
            className="w-full pl-10 pr-3 py-3 bg-primary-100 dark:bg-primary-700 border border-silver/40 dark:border-primary-600 rounded-xl text-sm focus:ring-2 focus:ring-gold focus:border-transparent"
          />
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {WALLET_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                category === cat.id
                  ? 'bg-gold text-white border-gold shadow-lux-gold'
                  : 'bg-white dark:bg-primary-800 text-silver border-silver/30 dark:border-primary-600 hover:text-primary dark:hover:text-cream'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Recently used */}
        {recent.length > 0 && query === '' && category === 'all' && (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gold flex items-center gap-1.5 mb-2">
              <History size={13} /> Recently used
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {recent.map((wallet) => (
                <button
                  key={wallet.id}
                  onClick={() => onSelect(wallet)}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-cream dark:bg-primary-700/60 border border-silver/25 dark:border-primary-600 hover:border-gold/60 hover:shadow-lux-card transition-all text-left"
                >
                  <WalletIcon wallet={wallet} size="sm" />
                  <span className="text-xs font-semibold text-primary dark:text-cream truncate">{wallet.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Wallet grid */}
        <div className="mt-4 max-h-[46vh] overflow-y-auto pr-1 -mr-1">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-700 flex items-center justify-center mx-auto mb-3">
                <X size={26} className="text-silver" />
              </div>
              <p className="font-medium text-primary dark:text-cream">No wallets found</p>
              <p className="text-sm text-silver mt-1">Try a different search term or category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {filtered.map((wallet, index) => (
                <motion.button
                  key={wallet.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.012, 0.2) }}
                  onClick={() => onSelect(wallet)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-primary-800 border border-silver/25 dark:border-primary-600 hover:border-gold/60 hover:shadow-lux-card hover:-translate-y-0.5 active:translate-y-0 transition-all text-left"
                >
                  <WalletIcon wallet={wallet} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-primary dark:text-cream truncate">{wallet.name}</p>
                    <p className="text-[11px] text-silver truncate capitalize">{wallet.category}</p>
                  </div>
                  <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary-600/10 text-primary-600 dark:text-gold-300 border border-primary-600/20">
                    {wallet.networks.length > 1 ? `${wallet.networks.length} chains` : wallet.networks[0]}
                  </span>
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Footer note */}
        <div className="mt-4 flex items-start gap-2 bg-primary-50 dark:bg-primary-700/60 rounded-xl p-3">
          <ShieldCheck size={15} className="text-success shrink-0 mt-0.5" />
          <p className="text-xs text-silver leading-relaxed">
            Primewave Bank never asks for, stores or transmits your recovery phrase, private keys or wallet passwords.
            Connection happens inside your own wallet.
          </p>
        </div>
      </div>
    </Modal>
  )
}

export default WalletPicker