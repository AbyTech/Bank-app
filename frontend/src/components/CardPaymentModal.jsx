import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, CreditCard, Mail, X, Loader2, Headphones } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../services/api'
import Button from './UI/Button'
import { FundingDetail, METHOD_META } from './AddMoneyModal'

const SUPPORT_EMAIL = 'helpxprimewavebank@gmail.com'

/**
 * "Pay Now" modal for a user's card.
 * Lets the user either contact support for the official payment details, or pay
 * the card issuance fee using the exact same funding methods as "Add Money"
 * (PayPal, Bitcoin, USDT and ETH) - wallet addresses/QRs come from the backend
 * config endpoint, never from the frontend.
 */
const CardPaymentModal = ({ isOpen, onClose, card = null }) => {
  const [methods, setMethods] = useState([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null) // selected method object
  const [copied, setCopied] = useState('')

  useEffect(() => {
    if (isOpen) {
      setSelected(null)
      setCopied('')
      fetchFundingMethods()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const feeAmount =
    card && card.fee ? `$${Number(card.fee).toFixed(2)}`
      : card && card.purchaseAmount ? `$${Number(card.purchaseAmount).toFixed(2)}`
        : null

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
                    <CreditCard className="text-gold-300" size={24} />
                  </div>
                  <div>
                    <h2 className="font-heading font-bold text-xl text-white">Pay for Card</h2>
                    <p className="text-white/70 text-sm">
                      {card ? `${(card.type || 'card')} • ${(card.category || 'standard')}${feeAmount ? ` • ${feeAmount}` : ''}` : 'Complete your card payment'}
                    </p>
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
                    emailSubject="Card Payment Request"
                  />
                ) : (
                  <div>
                    {/* Contact support for payment details */}
                    <div className="bg-gold/10 border border-gold/30 rounded-2xl p-4 mb-5">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center shrink-0">
                          <Headphones size={20} className="text-gold" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-primary dark:text-cream">
                            Contact Support for Payment Details
                          </p>
                          <p className="text-xs text-silver mt-1 leading-relaxed">
                            Please contact our support team to receive the official payment details and
                            instructions{feeAmount ? ` for your ${feeAmount} card fee` : ''}. Once your payment
                            is confirmed, your card will be issued.
                          </p>
                          <a
                            href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Card Payment Details Request')}`}
                            className="text-gold font-mono text-xs sm:text-sm break-all hover:underline mt-1.5 inline-block"
                          >
                            {SUPPORT_EMAIL}
                          </a>
                          <Button
                            variant="brand"
                            size="sm"
                            className="w-full mt-3"
                            onClick={() => window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Card Payment Details Request')}`}
                          >
                            <Mail size={16} className="mr-2" />
                            Email Support
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex-1 h-px bg-silver/30 dark:bg-primary-600" />
                      <p className="text-xs font-semibold uppercase tracking-wider text-silver">Or pay using these methods</p>
                      <div className="flex-1 h-px bg-silver/30 dark:bg-primary-600" />
                    </div>

                    {loading ? (
                      <div className="flex flex-col items-center justify-center py-10">
                        <Loader2 className="animate-spin text-gold" size={32} />
                        <p className="text-silver text-sm mt-3">Loading payment methods...</p>
                      </div>
                    ) : methods.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Wallet className="text-silver mb-3" size={32} />
                        <p className="text-sm text-primary dark:text-cream font-medium mb-1">No payment methods available</p>
                        <p className="text-xs text-silver">Please contact support to pay for your card.</p>
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
                                <p className="text-xs text-silver truncate">
                                  {method.type === 'crypto' ? 'Crypto payment' : 'Online payment'}
                                </p>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    )}

                    <p className="text-xs text-silver text-center mt-5">
                      Payments are verified manually by our team. Contact support if you need help.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

export default CardPaymentModal
