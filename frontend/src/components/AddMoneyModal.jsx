import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, Bitcoin, CircleDollarSign, Gem, Copy, Check, ArrowLeft, Mail, X, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../services/api'
import Button from './UI/Button'
import bitcoinQr from '../assets/Bitcoin QR.jpeg'
import ethQr from '../assets/Eth QR.jpeg'
import usdtQr from '../assets/USDT QR.jpeg'

const METHOD_META = {
  paypal: { icon: Wallet, gradient: 'from-blue-500 to-blue-700' },
  bitcoin: { icon: Bitcoin, gradient: 'from-orange-400 to-orange-600' },
  usdt: { icon: CircleDollarSign, gradient: 'from-green-500 to-emerald-700' },
  eth: { icon: Gem, gradient: 'from-indigo-400 to-indigo-700' },
}

// QR code images for the crypto funding methods (served from the app bundle).
const METHOD_QR = {
  bitcoin: bitcoinQr,
  usdt: usdtQr,
  eth: ethQr,
}

// Exported so other parts of the app (e.g. the card payment modal) can reuse
// the exact same funding-method visuals, QR codes and detail screens.
export { METHOD_META, METHOD_QR }

/**
 * "Add Money" funding-method modal.
 * Displays PayPal, Bitcoin, USDT and ETH funding options. Wallet addresses come
 * from the backend config endpoint (server env vars), never from the frontend.
 */
const AddMoneyModal = ({ isOpen, onClose }) => {
  const [methods, setMethods] = useState([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null) // selected method object
  const [copied, setCopied] = useState('')

  useEffect(() => {
    if (isOpen) {
      fetchFundingMethods()
    }
  }, [isOpen])

  const fetchFundingMethods = async () => {
    setLoading(true)
    try {
      const response = await api.get('/api/config/funding')
      setMethods(response.data.data || [])
    } catch (error) {
      console.error('Failed to load funding methods:', error)
      toast.error('Could not load funding methods. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyAddress = async (method) => {
    try {
      await navigator.clipboard.writeText(method.address)
      setCopied(method.id)
      toast.success(`${method.name} address copied to clipboard!`)
      setTimeout(() => setCopied(''), 2000)
    } catch (error) {
      toast.error('Failed to copy. Please copy manually.')
    }
  }

  const handleClose = () => {
    setSelected(null)
    setCopied('')
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-white dark:bg-primary-800 rounded-3xl shadow-lux-card border border-silver/20 dark:border-primary-700 overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="relative bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 px-6 py-6">
                <button
                  onClick={handleClose}
                  aria-label="Close"
                  className="absolute right-4 top-4 p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gold/20 border border-gold/40 flex items-center justify-center shrink-0">
                    <Wallet className="text-gold-300" size={24} />
                  </div>
                  <div>
                    <h2 className="font-heading font-bold text-xl text-white">Add Money</h2>
                    <p className="text-white/70 text-sm">Choose a funding method to deposit funds</p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto">
                {selected ? (
                  <FundingDetail
                    method={selected}
                    copied={copied === selected.id}
                    onCopy={() => copyAddress(selected)}
                    onBack={() => { setSelected(null); setCopied('') }}
                    onClose={handleClose}
                  />
                ) : loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="animate-spin text-gold" size={32} />
                    <p className="text-silver text-sm mt-3">Loading funding methods...</p>
                  </div>
                ) : methods.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <Wallet className="text-silver mb-3" size={32} />
                    <p className="text-sm text-primary dark:text-cream font-medium mb-1">No funding methods available</p>
                    <p className="text-xs text-silver">Please contact support to fund your account.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {methods.map((method) => {
                      const meta = METHOD_META[method.id] || { icon: Wallet, gradient: 'from-primary-600 to-primary-800' }
                      const Icon = meta.icon
                      return (
                        <button
                          key={method.id}
                          onClick={() => setSelected(method)}
                          className="group flex items-center gap-3 p-4 rounded-2xl bg-cream dark:bg-primary-700/60 border border-silver/30 dark:border-primary-600 hover:border-gold/60 hover:shadow-lux-card transition-all text-left"
                        >
                          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${meta.gradient} text-white flex items-center justify-center shrink-0`}>
                            <Icon size={20} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-primary dark:text-cream">{method.name}</p>
                            <p className="text-xs text-silver truncate">{method.type === 'crypto' ? 'Crypto deposit' : 'Online payment'}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}

                <p className="text-xs text-silver text-center mt-5">
                  Deposits are credited manually after verification. Contact support if you need help.
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

const FundingDetail = ({ method, copied, onCopy, onBack, onClose, emailSubject = 'PayPal Funding Request' }) => {
  const meta = METHOD_META[method.id] || { icon: Wallet, gradient: 'from-primary-600 to-primary-800' }
  const Icon = meta.icon

  if (method.type === 'contact_support') {
    return (
      <div className="text-center">
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${meta.gradient} text-white flex items-center justify-center mx-auto mb-4`}>
          <Wallet size={28} />
        </div>
        <h3 className="text-lg font-heading font-semibold text-primary dark:text-cream mb-2">Official PayPal Details</h3>
        <p className="text-silver text-sm mb-6">
          To fund your account via PayPal, please contact our support team to receive the official PayPal payment details and instructions.
        </p>
        <div className="bg-primary-50 dark:bg-primary-700 rounded-xl p-4 mb-6">
          <p className="text-xs font-medium text-silver mb-1">Support Email</p>
          <a href="mailto:helpxprimewavebank@gmail.com" className="text-gold font-mono text-sm break-all hover:underline">
            helpxprimewavebank@gmail.com
          </a>
        </div>
        <Button variant="brand" className="w-full mb-3" onClick={() => window.location.href = `mailto:helpxprimewavebank@gmail.com?subject=${encodeURIComponent(emailSubject)}`}>
          <Mail size={16} className="mr-2" />
          Email Support
        </Button>
        <button onClick={onBack} className="w-full text-sm text-silver hover:text-primary dark:hover:text-cream transition-colors">
          ← Choose another method
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="text-center mb-6">
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${meta.gradient} text-white flex items-center justify-center mx-auto mb-4`}>
          <Icon size={28} />
        </div>
        <h3 className="text-lg font-heading font-semibold text-primary dark:text-cream mb-2">Deposit {method.name}</h3>
        <p className="text-silver text-sm">{method.description}</p>
      </div>

      {/* QR code - scan to pay from your own wallet (not from your balance) */}
      {METHOD_QR[method.id] && (
        <div className="flex flex-col items-center mb-4">
          <div className="bg-white rounded-2xl border border-silver/40 dark:border-primary-600 p-3 shadow-lux-card">
            <img
              src={METHOD_QR[method.id]}
              alt={`${method.name} QR code`}
              className="w-44 h-44 sm:w-52 sm:h-52 object-contain rounded-lg"
            />
          </div>
          <p className="text-xs text-silver mt-2 flex items-center gap-1">
            <Gem size={12} className="text-gold" />
            Scan to pay — or copy the address below
          </p>
        </div>
      )}

      <div className="bg-primary-50 dark:bg-primary-700 rounded-2xl p-4">
        <p className="text-xs font-medium text-silver uppercase tracking-wider mb-2">Wallet Address</p>
        <div className="flex items-center gap-2 bg-white dark:bg-primary-800 border border-silver/40 dark:border-primary-600 rounded-xl p-3">
          <p className="flex-1 font-mono text-xs sm:text-sm text-primary dark:text-cream break-all leading-relaxed">
            {method.address || 'Wallet address not configured yet. Please contact support.'}
          </p>
          {method.address && (
            <Button variant="secondary" size="sm" className="shrink-0 px-3" onClick={onCopy}>
              {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
              <span className="ml-1 hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </Button>
          )}
        </div>
        <div className="flex items-start gap-2 mt-3">
          <Gem size={14} className="text-gold shrink-0 mt-0.5" />
          <p className="text-xs text-silver">
            Send only {method.name} to this address. This payment is made from your own crypto wallet — it is not deducted from your account balance. Sending other assets may result in permanent loss.
          </p>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Button variant="ghost" className="flex-1" onClick={onBack}>
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>
        <Button variant="brand" className="flex-1" onClick={onClose}>Done</Button>
      </div>
    </div>
  )
}

export { FundingDetail }
export default AddMoneyModal
