// @ts-check
import React from 'react'
import { Link } from 'react-router-dom'
import { Wallet } from 'lucide-react'
import { useWallet } from '../context/WalletContext'
import { shortAddress } from '../services/walletNetworks'
import { getWalletById } from '../services/walletList'
import WalletIcon from './Wallet/WalletIcon'

/**
 * WalletBadge - compact "connected wallet" chip shown in the app shell.
 * Links to the /wallet page for management. Public metadata only.
 */
const WalletBadge = ({ className = '' }) => {
  const { connection, loading } = useWallet()

  if (loading) return null

  if (!connection) {
    return (
      <Link
        to="/wallet"
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-silver/30 dark:border-primary-600 text-silver hover:text-primary dark:hover:text-cream hover:border-gold/60 transition-colors ${className}`}
      >
        <Wallet size={14} className="text-gold" />
        Connect wallet
      </Link>
    )
  }

  const wallet = getWalletById(connection.walletProviderId)
  return (
    <Link
      to="/wallet"
      title={`${connection.walletProviderName} · ${connection.walletAddress}`}
      className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-700/60 border border-success/25 hover:border-success/60 transition-colors ${className}`}
    >
      {wallet && <WalletIcon wallet={wallet} size="sm" showRing={false} />}
      <span className="text-xs font-semibold text-primary dark:text-cream hidden sm:inline">{connection.walletProviderName}</span>
      <span className="text-xs font-mono text-success">{shortAddress(connection.walletAddress)}</span>
      <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
    </Link>
  )
}

export default WalletBadge