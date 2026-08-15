import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, KeyRound, Lock, Mail, Shield, Zap, Globe } from 'lucide-react'
import Button from '../../components/UI/Button'
import AuthSplitLayout from '../../components/Auth/AuthSplitLayout'
import toast from 'react-hot-toast'
import BlockedUserModal from '../../components/BlockedUserModal'
import { authAPI } from '../../services/auth'

const greetingPoints = [
  {
    icon: Shield,
    title: 'Bank-grade security',
    desc: 'Your funds are protected with encrypted storage and a private recovery phrase.',
  },
  {
    icon: Zap,
    title: 'Instant transfers',
    desc: 'Send money instantly to any Primewave account in 9+ currencies.',
  },
  {
    icon: Globe,
    title: 'Global banking',
    desc: 'Hold USD, NGN, GHS, ZAR, EUR, GBP, CAD and more — all in one place.',
  },
]

const inputClass =
  'w-full pl-12 pr-4 py-3.5 bg-primary-100 border border-silver/60 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all text-primary placeholder:text-silver'
const inputClassWide =
  'w-full pl-12 pr-12 py-3.5 bg-primary-100 border border-silver/60 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all text-primary placeholder:text-silver'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    seedPhrase: '',
    password: ''
  })
  const [showSeedPhrase, setShowSeedPhrase] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isBlockedModalOpen, setIsBlockedModalOpen] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate that at least one of password or seedPhrase is provided
    if (!formData.password && !formData.seedPhrase) {
      toast.error('Please provide either a password or seed phrase.')
      return
    }

    setLoading(true)

    try {
      await authAPI.login(formData.email, formData.seedPhrase, formData.password)
      toast.success('Login successful!')
      navigate('/dashboard')
    } catch (error) {
      // Check multiple potential locations for the 403 status or the specific error message
      const isBlocked =
        error.response?.status === 403 ||
        error.status === 403 ||
        error.response?.data?.error?.toLowerCase().includes('blocked') ||
        error.message?.toLowerCase().includes('blocked')

      if (isBlocked) {
        setIsBlockedModalOpen(true)
      } else {
        toast.error(error.message || 'Login failed. Please check your credentials.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <AuthSplitLayout
        tealSide="left"
        badge="Secure digital banking"
        title="Welcome back."
        subtitle="Glad to see you again — sign in to keep managing your money with confidence."
        points={greetingPoints}
      >
        <div className="bg-white rounded-3xl shadow-lux-card border border-silver/20 p-8 sm:p-12">
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-primary">Sign In</h2>
          <p className="text-silver mt-3">Enter your credentials to continue.</p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-silver" size={18} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={inputClass}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-silver" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={inputClassWide}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-silver hover:text-primary-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-xs text-silver mt-2">
                Enter your password or use the seed phrase below
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Seed Phrase (Old Users Only)
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-silver" size={18} />
                <input
                  type={showSeedPhrase ? 'text' : 'password'}
                  value={formData.seedPhrase}
                  onChange={(e) => setFormData({ ...formData, seedPhrase: e.target.value })}
                  className={inputClassWide}
                  placeholder="Enter your 12-word seed phrase"
                />
                <button
                  type="button"
                  onClick={() => setShowSeedPhrase(!showSeedPhrase)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-silver hover:text-primary-600 transition-colors"
                >
                  {showSeedPhrase ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-xs text-silver mt-2">
                Enter your 12-word recovery phrase separated by spaces
              </p>
            </div>

            <Button
              type="submit"
              variant="brand"
              loading={loading}
              className="w-full"
            >
              Access My Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-silver">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
                Create Account
              </Link>
            </p>
          </div>

          <div className="mt-8 p-4 bg-primary-50 rounded-xl border border-silver/20">
            <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
              <Shield size={16} className="text-primary-600" />
              Security Tips
            </h4>
            <ul className="text-xs text-silver space-y-1">
              <li>• Never share your seed phrase with anyone</li>
              <li>• Ensure you're on the official Primewave Bank website</li>
              <li>• Use a secure network when accessing your account</li>
            </ul>
          </div>
        </div>
      </AuthSplitLayout>

      <BlockedUserModal
        isOpen={isBlockedModalOpen}
        onClose={() => setIsBlockedModalOpen(false)}
      />
    </>
  )
}

export default Login
