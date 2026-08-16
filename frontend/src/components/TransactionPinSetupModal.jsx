import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Lock, ShieldCheck, KeyRound, CheckCircle, AlertCircle } from 'lucide-react'
import api from '../services/api'
import PinInput from './UI/PinInput'
import Button from './UI/Button'

/**
 * First-time transaction PIN setup.
 * Shown to authenticated users who do not have a transaction PIN yet. The
 * database is the source of truth: once the PIN is created and persisted, this
 * modal will never appear again (across refreshes and logins).
 */
const TransactionPinSetupModal = () => {
  const [checking, setChecking] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [step, setStep] = useState('enter') // enter | confirm | success
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    const check = async () => {
      try {
        const response = await api.get('/api/profile/security')
        if (!cancelled && response.data?.data?.transactionPinSet === false) {
          setShowModal(true)
        }
      } catch (err) {
        console.error('Failed to check transaction PIN status:', err)
      } finally {
        if (!cancelled) setChecking(false)
      }
    }
    check()
    return () => { cancelled = true }
  }, [])

  const reset = useCallback(() => {
    setStep('enter')
    setPin('')
    setConfirmPin('')
    setError('')
  }, [])

  const handleCreate = async () => {
    setError('')
    if (!pin || pin.length !== 4) {
      setError('Please enter your 4-digit transaction PIN.')
      return
    }
    if (pin !== confirmPin) {
      setError('PINs do not match. Please try again.')
      return
    }

    setSaving(true)
    try {
      await api.post('/api/profile/transaction-pin', { pin, confirmPin })
      setStep('success')
      setTimeout(() => {
        setShowModal(false)
        reset()
      }, 1800)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create transaction PIN. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (checking || !showModal) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.stopPropagation()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'tween', duration: 0.25 }}
        className="w-full max-w-md bg-white dark:bg-primary-800 rounded-3xl shadow-lux-card border border-silver/20 dark:border-primary-700 overflow-hidden"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 px-6 pt-8 pb-10 text-center">
          <div className="pointer-events-none absolute -top-12 -right-10 w-40 h-40 rounded-full bg-gold/20 blur-3xl" />
          <div className="mx-auto w-16 h-16 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center mb-4">
            <Lock className="text-gold-300" size={30} />
          </div>
          <h2 className="font-heading font-bold text-2xl text-white">Security Update</h2>
          <p className="text-white/70 text-sm mt-2 max-w-xs mx-auto">
            We've added an extra layer of protection. Create your 4-digit <span className="text-gold-300 font-semibold">transaction PIN</span> to authorize transactions.
          </p>
        </div>

        <div className="p-6 sm:p-8">
          {step === 'success' ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-success" size={32} />
              </div>
              <h3 className="text-lg font-heading font-semibold text-primary dark:text-cream">Transaction PIN Created</h3>
              <p className="text-silver text-sm mt-1">Your account is now protected.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-6">
                <KeyRound size={16} className="text-gold" />
                <p className="text-sm text-silver">
                  {step === 'enter'
                    ? 'Enter a secure 4-digit transaction PIN you will remember.'
                    : 'Re-enter your transaction PIN to confirm it.'}
                </p>
              </div>

              <PinInput
                key={step}
                value={step === 'enter' ? pin : confirmPin}
                onChange={step === 'enter' ? setPin : setConfirmPin}
                autoFocus
                onComplete={() => {
                  if (step === 'enter') {
                    setStep('confirm')
                  }
                }}
              />

              {step === 'confirm' && (
                <p className="text-xs text-silver text-center mt-3">
                  Confirm your PIN to continue
                </p>
              )}

              {error && (
                <div className="mt-4 flex items-start gap-2 bg-danger-light dark:bg-danger/10 border border-danger/30 rounded-xl p-3">
                  <AlertCircle size={16} className="text-danger shrink-0 mt-0.5" />
                  <p className="text-sm text-danger-dark dark:text-danger-light">{error}</p>
                </div>
              )}

              <Button
                variant="brand"
                loading={saving}
                disabled={step === 'enter' ? pin.length !== 4 : confirmPin.length !== 4}
                onClick={handleCreate}
                className="w-full mt-6"
              >
                {step === 'enter' ? 'Continue' : 'Create Transaction PIN'}
              </Button>

              {step === 'confirm' && (
                <button
                  onClick={() => { setStep('enter'); setError('') }}
                  className="w-full text-center text-sm text-silver hover:text-primary dark:hover:text-cream mt-4 transition-colors"
                >
                  ← Back
                </button>
              )}

              <div className="mt-6 flex items-start gap-2 bg-primary-50 dark:bg-primary-700 rounded-xl p-3">
                <ShieldCheck size={16} className="text-primary-600 dark:text-gold-300 shrink-0 mt-0.5" />
                <p className="text-xs text-silver">
                  Your transaction PIN is encrypted and never stored in plaintext. It is used only to authorize transactions and is separate from any card PIN.
                </p>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default TransactionPinSetupModal
