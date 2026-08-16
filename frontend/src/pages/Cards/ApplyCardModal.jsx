import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  Truck,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Lock,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../../services/api'
import Modal from '../../components/UI/Modal'
import Button from '../../components/UI/Button'
import PinInput from '../../components/UI/PinInput'
import DebitCard from '../../components/UI/DebitCard'
import { useAuth } from '../../hooks/useAuth'

const CATEGORY_VARIANTS = {
  standard: 'teal',
  gold: 'gold',
  platinum: 'platinum',
  black: 'black',
}

const STEP_LABELS = ['Application', 'Card PIN', 'Review']

const inputClass =
  'w-full px-4 py-3 bg-primary-100 dark:bg-primary-700 border border-silver dark:border-primary-600 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent text-primary dark:text-cream placeholder:text-silver'

const ApplyCardModal = ({ isOpen, onClose, type, category, onSuccess }) => {
  const { user } = useAuth()
  const [step, setStep] = useState(0) // 0 = info (physical) / pin (virtual), 1 = pin, 2 = review
  const [countries, setCountries] = useState([])
  const [delivery, setDelivery] = useState({
    fullName: '',
    phone: '',
    country: '',
    state: '',
    city: '',
    address: '',
    zipCode: '',
  })
  const [cardPin, setCardPin] = useState('')
  const [confirmCardPin, setConfirmCardPin] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const isVirtual = type === 'virtual'

  useEffect(() => {
    if (isOpen) {
      setStep(0)
      setCardPin('')
      setConfirmCardPin('')
      setTermsAccepted(false)
      setError('')
      setSubmitted(false)
      if (!isVirtual && user) {
        setDelivery((prev) => ({
          ...prev,
          fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || prev.fullName,
          country: user.country || prev.country,
          phone: user.phone || prev.phone,
        }))
      }
    }
  }, [isOpen, isVirtual, user])

  useEffect(() => {
    if (isOpen && !isVirtual && countries.length === 0) {
      api.get('/api/countries')
        .then((res) => setCountries(res.data.data || []))
        .catch(() => setCountries([]))
    }
  }, [isOpen, isVirtual, countries.length])

  const validateDelivery = () => {
    const required = ['fullName', 'phone', 'country', 'state', 'city', 'address']
    for (const field of required) {
      if (!delivery[field]?.trim()) {
        setError(`Please provide your ${field === 'zipCode' ? 'ZIP / postal code' : field.replace(/([A-Z])/g, ' $1').toLowerCase()}.`)
        return false
      }
    }
    return true
  }

  const canProceedPin = cardPin.length === 4 && confirmCardPin.length === 4 && cardPin === confirmCardPin
  const totalSteps = isVirtual ? 2 : 3

  const handleNext = () => {
    setError('')
    if (step === 0 && !isVirtual) {
      if (!validateDelivery()) return
      setStep(1)
    } else if ((step === 0 && isVirtual) || step === 1) {
      // Card PIN validation step
      if (cardPin.length !== 4 || confirmCardPin.length !== 4) {
        setError('Please enter your 4-digit card PIN and confirm it.')
        return
      }
      if (cardPin !== confirmCardPin) {
        setError('Card PINs do not match. Please try again.')
        return
      }
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    setError('')
    setStep((s) => Math.max(0, s - 1))
  }

  const handleSubmit = async () => {
    setError('')
    if (!termsAccepted) {
      setError('Please agree to the Terms and Conditions before applying.')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        type,
        category: category?.id,
        cardPin,
        confirmCardPin,
        termsAccepted,
      }
      if (!isVirtual) {
        payload.deliveryInfo = delivery
      }
      await api.post('/api/cards/apply', payload)
      setSubmitted(true)
      toast.success('Card application submitted successfully!')
      setTimeout(() => {
        onClose()
        onSuccess?.()
      }, 2200)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit application. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const renderStepper = () => {
    const labels = isVirtual ? ['Card PIN', 'Review'] : STEP_LABELS
    return (
      <div className="flex items-center justify-center gap-2 mb-6">
        {labels.map((label, index) => {
          const activeIndex = isVirtual ? step : step
          const done = index < activeIndex || submitted
          const active = index === activeIndex && !submitted
          return (
            <React.Fragment key={label}>
              {index > 0 && <div className={`h-px w-8 sm:w-12 ${done || active ? 'bg-gold' : 'bg-silver/40'}`} />}
              <div className="flex flex-col items-center gap-1">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  done ? 'bg-success text-white' : active ? 'bg-gold text-white' : 'bg-silver/30 text-silver'
                }`}>
                  {done ? <CheckCircle2 size={15} /> : index + 1}
                </span>
                <span className={`text-[10px] ${active ? 'text-gold font-semibold' : 'text-silver'}`}>{label}</span>
              </div>
            </React.Fragment>
          )
        })}
      </div>
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${category?.name || ''} ${isVirtual ? 'Virtual' : 'Physical'} Card`}
      size="lg"
    >
      <div>
        {renderStepper()}

        {submitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="text-success" size={32} />
            </div>
            <h3 className="text-xl font-heading font-semibold text-primary dark:text-cream mb-2">Application Submitted</h3>
            <p className="text-silver text-sm max-w-sm mx-auto">
              Your {category?.name} {isVirtual ? 'virtual' : 'physical'} card application is now under review. You will be notified once it is approved.
            </p>
            <div className="mt-4 bg-primary-50 dark:bg-primary-700 rounded-xl p-3 inline-block">
              <p className="text-xs text-silver">Issuance fee</p>
              <p className="font-bold text-primary dark:text-cream">${category?.fee.toFixed(2)} — paid to the bank</p>
            </div>
            <p className="text-xs text-silver mt-4 max-w-sm mx-auto">
              Please contact our support team for the payment details. Your card will be issued once the payment is confirmed.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Step 0 - delivery info (physical only) */}
            {!isVirtual && step === 0 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 bg-gold/10 border border-gold/30 rounded-xl p-4">
                  <Truck size={20} className="text-gold shrink-0" />
                  <div>
                    <h4 className="font-semibold text-primary dark:text-cream">Delivery Information</h4>
                    <p className="text-xs text-silver">Your physical card will be shipped to this address.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary dark:text-cream mb-2">Full Name</label>
                    <input type="text" value={delivery.fullName} onChange={(e) => setDelivery({ ...delivery, fullName: e.target.value })} className={inputClass} placeholder="Full name on the card" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary dark:text-cream mb-2">Phone Number</label>
                    <input type="tel" value={delivery.phone} onChange={(e) => setDelivery({ ...delivery, phone: e.target.value })} className={inputClass} placeholder="+1 555 000 0000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary dark:text-cream mb-2">Country</label>
                    <select value={delivery.country} onChange={(e) => setDelivery({ ...delivery, country: e.target.value })} className={inputClass}>
                      <option value="">Select country</option>
                      {countries.map((c) => (
                        <option key={c.code} value={c.code}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary dark:text-cream mb-2">State / Province</label>
                    <input type="text" value={delivery.state} onChange={(e) => setDelivery({ ...delivery, state: e.target.value })} className={inputClass} placeholder="State or province" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary dark:text-cream mb-2">City</label>
                    <input type="text" value={delivery.city} onChange={(e) => setDelivery({ ...delivery, city: e.target.value })} className={inputClass} placeholder="City" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary dark:text-cream mb-2">ZIP / Postal Code</label>
                    <input type="text" value={delivery.zipCode} onChange={(e) => setDelivery({ ...delivery, zipCode: e.target.value })} className={inputClass} placeholder="Postal code" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-primary dark:text-cream mb-2">Full Delivery Address</label>
                    <textarea value={delivery.address} onChange={(e) => setDelivery({ ...delivery, address: e.target.value })} rows={2} className={`${inputClass} resize-none`} placeholder="Street address, building, apartment, etc." />
                  </div>
                </div>
              </div>
            )}

            {/* Step 1 (or 0 for virtual) - card PIN */}
            {(step === 1 || (isVirtual && step === 0)) && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 bg-gold/10 border border-gold/30 rounded-xl p-4">
                  <Lock size={20} className="text-gold shrink-0" />
                  <p className="text-sm text-primary dark:text-cream">
                    Create a secure PIN that you can remember once your card is activated.
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-sm font-medium text-primary dark:text-cream mb-3">Enter your 4-digit card PIN</p>
                  <PinInput
                    key={`pin-${step}`}
                    value={cardPin}
                    onChange={setCardPin}
                    autoFocus
                  />
                  <p className="text-sm font-medium text-primary dark:text-cream mt-5 mb-3">Confirm your card PIN</p>
                  <PinInput
                    key={`confirm-${step}`}
                    value={confirmCardPin}
                    onChange={setConfirmCardPin}
                  />
                </div>

                <div className="flex items-start gap-2 bg-primary-50 dark:bg-primary-700 rounded-xl p-4">
                  <ShieldCheck size={16} className="text-primary-600 dark:text-gold-300 shrink-0 mt-0.5" />
                  <p className="text-xs text-silver leading-relaxed">
                    Once you create your card PIN, please contact the official bank support team to ask about any available PIN security or encryption measures to help prevent unauthorized use of your card. For your protection, never share your PIN with anyone, not even a bank representative. Legitimate bank staff should never ask you to disclose your PIN.
                  </p>
                </div>
              </div>
            )}
            {/* Review step */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <DebitCard
                    cardNumber=""
                    cardName={`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'PRIMEWAVE'}
                    expiry="--/--"
                    variant={CATEGORY_VARIANTS[category?.id] || 'teal'}
                    categoryLabel={category?.name}
                  />
                </div>

                <div className="bg-primary-50 dark:bg-primary-700 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-silver">Card Type</span>
                    <span className="font-semibold text-primary dark:text-cream capitalize">{type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-silver">Category</span>
                    <span className="font-semibold text-primary dark:text-cream">{category?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-silver">Issuance Fee</span>
                    <span className="font-semibold text-primary dark:text-cream">${category?.fee.toFixed(2)}</span>
                  </div>
                  {!isVirtual && (
                    <div className="flex justify-between">
                      <span className="text-silver">Deliver To</span>
                      <span className="font-semibold text-primary dark:text-cream text-right max-w-[60%]">
                        {delivery.city}, {delivery.country}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-silver/30 dark:border-primary-600 pt-2 flex justify-between">
                    <span className="text-silver font-medium">Total (paid to the bank)</span>
                    <span className="font-bold text-gold">${category?.fee.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-gold/10 border border-gold/30 rounded-xl p-3">
                  <AlertCircle size={15} className="text-gold shrink-0 mt-0.5" />
                  <p className="text-xs text-silver leading-relaxed">
                    The fee is paid to the bank through another account — contact our support team for the payment details. Your card will be issued once the payment is confirmed.
                  </p>
                </div>

                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 w-5 h-5 accent-primary-600"
                  />
                  <span className="text-sm text-primary dark:text-cream">
                    Agree to the Terms and Conditions
                    <span className="block text-xs text-silver mt-0.5">By applying for this card, you agree to our Terms of Service and Card Agreement.</span>
                  </span>
                </label>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 bg-danger-light dark:bg-danger/10 border border-danger/30 rounded-xl p-3">
                <AlertCircle size={16} className="text-danger shrink-0 mt-0.5" />
                <p className="text-sm text-danger-dark dark:text-danger-light">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              {step > 0 && !(isVirtual && step === 0) && (
                <Button variant="ghost" className="flex-1" onClick={handleBack} disabled={submitting}>
                  <ArrowLeft size={16} className="mr-2" />
                  Back
                </Button>
              )}
              {step < totalSteps - 1 ? (
                <Button variant="brand" className="flex-1" onClick={handleNext}>
                  Continue
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              ) : (
                <Button
                  variant="primary"
                  className="flex-1"
                  loading={submitting}
                  disabled={!canProceedPin}
                  onClick={handleSubmit}
                >
                  <CreditCard size={16} className="mr-2" />
                  Apply for Card
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default ApplyCardModal
