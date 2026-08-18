import React from 'react'
import { walletGradient, walletInitial } from '../../services/walletList'

/** Brand-inspired monogram tile used as a wallet's icon/logo. */
const WalletIcon = ({ wallet, size = 'md', className = '', showRing = true }) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-14 h-14 text-base sm:text-lg',
    xl: 'w-16 h-16 text-xl',
  }
  return (
    <div
      className={`${sizes[size]} rounded-xl bg-gradient-to-br ${walletGradient(wallet)} text-white flex items-center justify-center font-bold shadow-md shrink-0 ${showRing ? 'ring-1 ring-white/20 ring-inset' : ''} ${className}`}
      aria-hidden="true"
    >
      {walletInitial(wallet)}
    </div>
  )
}

export default WalletIcon