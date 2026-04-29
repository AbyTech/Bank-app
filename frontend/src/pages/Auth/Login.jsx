import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import Button from '../../components/UI/Button'
import toast from 'react-hot-toast'
import BlockedUserModal from '../../components/BlockedUserModal'
import { authAPI } from '../../services/auth'
import logo from '../../assets/logo.png'

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
        error.message?.toLowerCase().includes('blocked');
      
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-cream dark:from-primary-900 dark:to-primary-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-primary-800 rounded-2xl shadow-lux-card p-8">
          <div className="text-center mb-8">
            <img src={logo} alt="Logo" className="w-14 h-14 rounded-xl bg-blue-900 mx-auto mb-4" />
            <h1 className="text-3xl font-heading font-bold text-primary dark:text-cream">
              Primewave Bank
            </h1>
            <p className="text-silver dark:text-silver mt-2">
              Secure access to your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-primary dark:text-cream mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-silver" size={20} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-cream dark:bg-primary-700 border border-silver dark:border-primary-600 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary dark:text-cream mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-silver" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-12 py-3 bg-cream dark:bg-primary-700 border border-silver dark:border-primary-600 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-silver hover:text-gold transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-xs text-silver mt-2">
                Enter your password or use seed phrase below
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary dark:text-cream mb-2">
                Seed Phrase (Old Users Only)
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-silver" size={20} />
                <input
                  type={showSeedPhrase ? "text" : "password"}
                  value={formData.seedPhrase}
                  onChange={(e) => setFormData({ ...formData, seedPhrase: e.target.value })}
                  className="w-full pl-12 pr-12 py-3 bg-cream dark:bg-primary-700 border border-silver dark:border-primary-600 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                  placeholder="Enter your 12-word seed phrase"
                />
                <button
                  type="button"
                  onClick={() => setShowSeedPhrase(!showSeedPhrase)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-silver hover:text-gold transition-colors"
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
              loading={loading}
              className="w-full"
            >
              Access My Account
            </Button>

            <div className="text-center">
              <p className="text-silver dark:text-silver">
                Don't have an account?{' '}
                <Link to="/register" className="text-gold hover:text-gold-600 font-semibold">
                  Create Account
                </Link>
              </p>
            </div>
          </form>

          <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-700 rounded-xl">
            <h4 className="font-semibold text-primary dark:text-cream mb-2 flex items-center gap-2">
              <Lock size={16} />
              Security Tips
            </h4>
            <ul className="text-xs text-silver space-y-1">
              <li>• Never share your seed phrase with anyone</li>
              <li>• Ensure you're on the official Primewave Bank website</li>
              <li>• Use a secure network when accessing your account</li>
            </ul>
          </div>
        </div>
      </motion.div>

      <BlockedUserModal 
        isOpen={isBlockedModalOpen} 
        onClose={() => setIsBlockedModalOpen(false)} 
      />
    </div>
  )
}

export default Login