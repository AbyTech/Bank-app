import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Copy, Check, Download } from 'lucide-react'
import Button from '../UI/Button'
import toast from 'react-hot-toast'

const SeedPhraseDisplay = ({ seedPhrase, onConfirm }) => {
  const [showPhrase, setShowPhrase] = useState(false)
  const [copied, setCopied] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(seedPhrase)
    setCopied(true)
    toast.success('Seed phrase copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadSeedPhrase = () => {
    const element = document.createElement('a')
    const file = new Blob([seedPhrase], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = 'primewave-bank-seed-phrase.txt'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    toast.success('Seed phrase downloaded!')
  }

  const handleConfirm = () => {
    setConfirmed(true)
    onConfirm?.()
  }

  return (
    <div className="space-y-6">
      <div className="bg-gold-100 dark:bg-gold-900/20 border border-gold-200 dark:border-gold-800 rounded-xl p-4">
        <h3 className="font-semibold text-gold-700 dark:text-gold-200 mb-2">
          🔒 Critical Security Warning
        </h3>
        <ul className="text-sm text-gold-700 dark:text-gold-300 space-y-1">
          <li>• Write down these words in the exact order</li>
          <li>• Store them in a secure, offline location</li>
          <li>• Never share your seed phrase with anyone</li>
          <li>• This is your only way to recover your account</li>
          <li>• Primewave Bank cannot recover lost seed phrases</li>
        </ul>
      </div>

      <div className="relative">
        <div className="bg-cream dark:bg-primary-700 rounded-xl p-6 border-2 border-dashed border-gold/50">
          <div className="flex justify-between items-center mb-4">
            <label className="block text-lg font-heading font-semibold text-primary dark:text-cream">
              Your Recovery Seed Phrase
            </label>
            <button
              type="button"
              onClick={() => setShowPhrase(!showPhrase)}
              className="text-gold hover:text-gold-600 transition-colors p-2"
            >
              {showPhrase ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          {showPhrase ? (
            <div className="grid grid-cols-3 gap-3 mb-6">
              {seedPhrase.split(' ').map((word, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-primary-600 rounded-lg px-3 py-2 text-center font-mono border border-silver/30"
                >
                  <span className="text-xs text-silver mr-2">{index + 1}.</span>
                  {word}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-primary-100 dark:bg-primary-600 rounded-lg p-8 text-center mb-6">
              <div className="grid grid-cols-3 gap-3 opacity-40">
                {Array.from({ length: 12 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-primary-500 rounded-lg px-3 py-2 text-center"
                  >
                    <span className="text-xs text-silver mr-2">{index + 1}.</span>
                    ••••••
                  </div>
                ))}
              </div>
              <p className="text-silver dark:text-silver mt-4">
                Click the eye icon to reveal your seed phrase
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={copyToClipboard}
              className="flex-1 flex items-center justify-center gap-2"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy Phrase'}
            </Button>
            <Button
              variant="secondary"
              onClick={downloadSeedPhrase}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Download size={16} />
              Download
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3 p-4 bg-primary-50 dark:bg-primary-800 rounded-xl">
        <input
          type="checkbox"
          id="confirm-saved"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="w-4 h-4 text-gold bg-cream border-silver rounded focus:ring-gold focus:ring-2"
        />
        <label htmlFor="confirm-saved" className="text-sm text-primary dark:text-cream">
          I have securely saved my seed phrase and understand that losing it means losing access to my account permanently.
        </label>
      </div>

      <Button
        onClick={handleConfirm}
        disabled={!confirmed}
        className="w-full"
      >
        I've Saved My Seed Phrase - Continue
      </Button>
    </div>
  )
}

export default SeedPhraseDisplay