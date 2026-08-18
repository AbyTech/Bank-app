import React, { useState, useEffect } from 'react'
import { Wallet } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import api from '../../services/api'
import NotificationsBell from './NotificationsBell'
import WalletBadge from '../WalletBadge'
import { formatAmount, getCurrencyByCountry } from '../../services/currency'

/**
 * Sticky top navigation bar rendered on every authenticated page (mobile + desktop).
 * Shows today's date, the primary-account balance and the notification bell.
 * It stays pinned to the top of the viewport while the page scrolls.
 * On mobile the left padding clears the fixed hamburger menu button so the
 * content lines up with the menu icon.
 */
const TopNavbar = () => {
  const { user } = useAuth()
  const [balance, setBalance] = useState(0)
  const [currency, setCurrency] = useState('USD')

  useEffect(() => {
    if (user?.country) {
      setCurrency(getCurrencyByCountry(user.country))
    }
  }, [user])

  useEffect(() => {
    let cancelled = false
    api
      .get('/api/accounts/')
      .then((res) => {
        if (cancelled) return
        const account = res.data?.data?.[0]
        if (account) setBalance(account.balance)
      })
      .catch((err) => console.error('Failed to fetch balance:', err))
    return () => {
      cancelled = true
    }
  }, [])

  const todayString = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <header className="sticky top-0 z-30 bg-white/85 dark:bg-primary-800 backdrop-blur border-b border-silver/20 dark:border-primary-700 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 pl-16 lg:pl-8 pr-4 sm:pr-6 lg:pr-8 py-3">
        <p className="min-w-0 text-xs sm:text-sm lg:text-base font-medium text-primary dark:text-cream truncate">
          {todayString}
        </p>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Connected wallet badge (desktop + tablet) */}
          <div className="hidden sm:block">
            <WalletBadge />
          </div>
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
    </header>
  )
}

export default TopNavbar
