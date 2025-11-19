import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Copy, Check } from 'lucide-react'
import { generateMnemonic } from 'bip39'
import toast from 'react-hot-toast'
import authAPI from '../../services/auth.jsx'
import logo from '../../assets/logo.png'

const Register = () => {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({ name: '', email: '', country: '' })
  const [seedPhrase, setSeedPhrase] = useState('')
  const [confirmedPhrase, setConfirmedPhrase] = useState('')
  const [showSeedPhrase, setShowSeedPhrase] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [countries, setCountries] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const countryData = await authAPI.getCountries()
        setCountries(countryData)
      } catch (error) {
        toast.error('Could not load countries.')
      }
    }
    fetchCountries()
  }, [])

  const generateSeed = () => {
    // Use bip39 to generate a secure 12-word mnemonic
    const mnemonic = generateMnemonic()
    setSeedPhrase(mnemonic)
    setStep(2)
  }

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(seedPhrase)
    setCopied(true)
    toast.success('Seed phrase copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (step === 1) {
      generateSeed()
      return
    }

    if (step === 2 && confirmedPhrase !== seedPhrase) {
      toast.error('Seed phrases do not match!')
      return
    }

    setLoading(true)
    try {
      await authAPI.register({ ...formData, seed_phrase: seedPhrase })
      toast.success('Account created! Please login.')
      navigate('/login')
    } catch (error) {
      toast.error(error.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-cream dark:from-primary-900 dark:to-primary-800 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-white dark:bg-primary-800 rounded-2xl shadow-lux-card p-8">
          <div className="text-center mb-8">
            <img src={logo} alt="Logo" className="w-14 h-14 rounded-xl bg-blue-900 mx-auto mb-4" />
            <h1 className="text-3xl font-heading font-bold text-primary dark:text-cream">Primewave Bank</h1>
            <p className="text-silver dark:text-silver mt-2">Create your secure banking account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <>
                <div><label className="block text-sm font-medium text-primary dark:text-cream mb-2">Full Name</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 bg-cream dark:bg-primary-700 border border-silver dark:border-primary-600 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent" placeholder="Enter your full name" />
                </div>
                <div><label className="block text-sm font-medium text-primary dark:text-cream mb-2">Email Address</label>
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 bg-cream dark:bg-primary-700 border border-silver dark:border-primary-600 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent" placeholder="Enter your email" />
                </div>
                <div><label className="block text-sm font-medium text-primary dark:text-cream mb-2">Country</label>
                  <select required value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="w-full px-4 py-3 bg-cream dark:bg-primary-700 border border-silver dark:border-primary-600 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent">
                    <option value="">Select your country</option>
                    {countries.map((country) => (<option key={country.code} value={country.code}>{country.name} ({country.currency})</option>))}
                  </select>
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-gold to-gold-400 text-primary font-semibold py-3 px-4 rounded-xl hover:shadow-lux-gold transition-all">Generate Secure Seed Phrase</button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">🔒 Important Security Notice</h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">Write down your seed phrase and store it securely. This is your only way to access your account.</p>
                </div>

                <div className="relative">
                  <div className="bg-cream dark:bg-primary-700 rounded-xl p-4 border-2 border-dashed border-gold/50">
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-sm font-medium text-primary dark:text-cream">Your Seed Phrase (12 words)</label>
                      <button type="button" onClick={() => setShowSeedPhrase(!showSeedPhrase)} className="text-gold hover:text-gold-600 transition-colors">
                        {showSeedPhrase ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    
                    {showSeedPhrase ? (
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {seedPhrase.split(' ').map((word, index) => (
                          <div key={index} className="bg-white dark:bg-primary-600 rounded-lg px-2 py-1 text-center text-sm font-mono">
                            <span className="text-xs text-silver mr-1">{index + 1}.</span>{word}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-primary-100 dark:bg-primary-600 rounded-lg p-4 text-center">
                        <p className="text-silver dark:text-silver">Click the eye icon to reveal your seed phrase</p>
                      </div>
                    )}

                    <button type="button" onClick={copyToClipboard} className="w-full bg-primary-100 dark:bg-primary-600 hover:bg-primary-200 dark:hover:bg-primary-500 text-primary dark:text-cream py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
                      {copied ? <Check size={16} /> : <Copy size={16} />}{copied ? 'Copied!' : 'Copy to Clipboard'}
                    </button>
                  </div>
                </div>

                <div><label className="block text-sm font-medium text-primary dark:text-cream mb-2">Confirm Seed Phrase</label>
                  <textarea required value={confirmedPhrase} onChange={(e) => setConfirmedPhrase(e.target.value)} rows="3" className="w-full px-4 py-3 bg-cream dark:bg-primary-700 border border-silver dark:border-primary-600 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent" placeholder="Type your seed phrase here to confirm" />
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 bg-silver dark:bg-primary-600 text-primary dark:text-cream font-semibold py-3 px-4 rounded-xl hover:bg-silver/80 transition-colors">Back</button>
                  <button type="submit" disabled={loading || confirmedPhrase !== seedPhrase} className="flex-1 bg-gradient-to-r from-gold to-gold-400 text-primary font-semibold py-3 px-4 rounded-xl hover:shadow-lux-gold disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </div>
              </>
            )}

            <div className="text-center">
              <p className="text-silver dark:text-silver">Already have an account? <Link to="/login" className="text-gold hover:text-gold-600 font-semibold">Sign In</Link></p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

export default Register