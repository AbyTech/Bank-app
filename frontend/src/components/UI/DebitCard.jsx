import React from 'react'
import { Nfc, Eye, EyeOff } from 'lucide-react'
import logo from '../../assets/logo.png'

/**
 * Realistic PrimeWave debit-card visual.
 * Presentational only - all displayed data comes from props.
 * Used by both the Cards page (real user data) and the Landing page (showcase).
 */
const CATEGORY_STYLES = {
  teal: 'bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900',
  gold: 'bg-gradient-to-br from-gold via-gold-500 to-gold-700',
  platinum: 'bg-gradient-to-br from-slate-400 via-slate-500 to-slate-700',
  black: 'bg-gradient-to-br from-gray-700 via-gray-900 to-black',
}

const DebitCard = ({
  cardNumber = '',
  cardName = 'PRIMEWAVE USER',
  expiry = '--/--',
  cvv = '',
  status = 'active',
  showNumber = false,
  onToggleShow = null,
  className = '',
  categoryLabel = null,
  variant = 'teal',
}) => {
  const rejected = status === 'rejected'
  const gradient = rejected
    ? 'bg-gradient-to-br from-red-600 to-red-800 opacity-80'
    : CATEGORY_STYLES[variant] || CATEGORY_STYLES.teal

  const displayNumber = showNumber
    ? cardNumber
    : cardNumber
      ? `••••  ••••  ••••  ${cardNumber.slice(-4)}`
      : '••••  ••••  ••••  ••••'

  return (
    <div
      className={`relative w-full aspect-[1.586] rounded-2xl overflow-hidden shadow-xl select-none ${gradient} ${className}`}
    >
      {/* Sheen + texture */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20" />
      <div className="pointer-events-none absolute -bottom-20 -right-14 w-64 h-64 rounded-full border border-white/10" />
      <div className="pointer-events-none absolute -bottom-12 -right-8 w-40 h-40 rounded-full border border-white/10" />
      <div className="pointer-events-none absolute -top-16 -left-10 w-52 h-52 rounded-full bg-white/5" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)',
          backgroundSize: '18px 18px',
        }}
      />

      <div className="relative flex flex-col h-full p-4 sm:p-5">
        {/* Top row: brand + toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Primewave" className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/10 ring-1 ring-white/20 object-contain" />
            <div className="leading-tight">
              <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.16em] text-white/90">PRIMEWAVE</p>
              <p className="text-[8px] sm:text-[9px] font-semibold tracking-[0.3em] text-gold-300">BANK</p>
            </div>
          </div>
          {onToggleShow && (
            <button
              onClick={onToggleShow}
              aria-label={showNumber ? 'Hide card number' : 'Show card number'}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              {showNumber ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          )}
          {categoryLabel && !onToggleShow && (
            <span className="px-2 py-0.5 rounded-full bg-white/15 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-white/90 border border-white/20">
              {categoryLabel}
            </span>
          )}
        </div>

        {/* EMV chip + contactless */}
        <div className="mt-3 sm:mt-4 flex items-center gap-2.5">
          <div className="w-9 h-7 sm:w-10 sm:h-8 rounded-md bg-gradient-to-br from-gold-200 to-gold-500 relative overflow-hidden shadow-inner">
            <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-black/30" />
            <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-black/30" />
            <div
              className="absolute inset-0 opacity-25"
              style={{
                backgroundImage: 'repeating-linear-gradient(90deg, transparent 0 5px, rgba(0,0,0,0.55) 5px 7px)',
              }}
            />
          </div>
          <Nfc size={22} className="text-white/75" />
        </div>

        {/* Card number */}
        <div className="mt-3 sm:mt-4">
          <p className="font-mono text-sm sm:text-base tracking-[0.12em] sm:tracking-[0.16em] text-white">
            {displayNumber}
          </p>
        </div>

        {/* CVV (existing info, discreet) */}
        {cvv && (
          <p className="mt-1.5 text-[10px] sm:text-[11px] text-white/60 font-medium">
            CVV <span className="tracking-widest">{cvv}</span>
          </p>
        )}

        {/* Bottom: cardholder + expiry */}
        <div className="mt-auto flex items-end justify-between gap-3 pr-16 sm:pr-20">
          <div className="min-w-0">
            <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.18em] text-white/50">Card Holder</p>
            <p className="text-[11px] sm:text-sm font-semibold text-white truncate">{cardName || 'PRIMEWAVE USER'}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.18em] text-white/50">Expires</p>
            <p className="text-[11px] sm:text-sm font-semibold text-white">{expiry}</p>
          </div>
        </div>

        {/* Network branding */}
        <div className="absolute bottom-3 sm:bottom-4 right-4 sm:right-5 flex flex-col items-end leading-tight">
          <p className="text-[8px] tracking-[0.25em] text-white/70 font-semibold">DEBIT</p>
          <p className="text-white font-bold italic text-lg sm:text-xl tracking-wide">VISA</p>
        </div>
      </div>
    </div>
  )
}

export default DebitCard
