import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, Mail } from 'lucide-react'
import Button from '../UI/Button'
import toast from 'react-hot-toast'

const TwoFAForm = ({ email, onVerify, onResend }) => {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const inputs = useRef([])

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      inputs.current[index + 1].focus()
    }

    // Auto-submit when all digits are entered
    if (newCode.every(digit => digit !== '') && index === 5) {
      handleSubmit(newCode.join(''))
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1].focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text')
    const digits = pastedData.replace(/\D/g, '').split('').slice(0, 6)
    
    const newCode = [...code]
    digits.forEach((digit, index) => {
      newCode[index] = digit
    })
    setCode(newCode)

    // Focus the next empty input or last input
    const nextEmptyIndex = newCode.findIndex(digit => digit === '')
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex
    if (inputs.current[focusIndex]) {
      inputs.current[focusIndex].focus()
    }
  }

  const handleSubmit = async (submittedCode = code.join('')) => {
    if (submittedCode.length !== 6) {
      toast.error('Please enter the complete 6-digit code')
      return
    }

    setLoading(true)
    try {
      await onVerify(submittedCode)
    } catch (error) {
      // Error handled in parent component
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResendCooldown(30)
    try {
      await onResend()
      toast.success('New verification code sent!')
    } catch (error) {
      toast.error('Failed to resend code. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="text-gold" size={32} />
        </div>
        <h2 className="text-2xl font-heading font-bold text-primary dark:text-cream mb-2">
          Two-Factor Authentication
        </h2>
        <p className="text-silver dark:text-silver">
          Enter the 6-digit code sent to your email
        </p>
        <p className="text-gold font-semibold mt-1">{email}</p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-center space-x-3">
          {code.map((digit, index) => (
            <motion.input
              key={index}
              ref={el => inputs.current[index] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              className="w-12 h-12 text-center text-xl font-bold bg-primary-100 dark:bg-primary-700 border-2 border-silver dark:border-primary-600 rounded-xl focus:border-gold focus:ring-2 focus:ring-gold transition-all"
              whileFocus={{ scale: 1.05 }}
            />
          ))}
        </div>

        <Button
          onClick={() => handleSubmit()}
          loading={loading}
          disabled={code.some(digit => digit === '')}
          className="w-full"
        >
          Verify Code
        </Button>
      </div>

      <div className="text-center">
        <p className="text-silver dark:text-silver text-sm mb-3">
          Didn't receive the code?
        </p>
        <button
          onClick={handleResend}
          disabled={resendCooldown > 0}
          className="text-gold hover:text-gold-600 disabled:text-silver disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 mx-auto"
        >
          <Mail size={16} />
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
        </button>
      </div>

      <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-4">
        <h4 className="font-semibold text-primary-600 dark:text-primary-200 mb-2 flex items-center gap-2">
          <Shield size={16} />
          Security Notice
        </h4>
        <p className="text-sm text-primary-600 dark:text-primary-300">
          Two-factor authentication adds an extra layer of security to your account. 
          Even if someone has your seed phrase, they won't be able to access your account without this code.
        </p>
      </div>
    </div>
  )
}

export default TwoFAForm