import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, Eye, EyeOff, Globe, Lock, Mail, User, Sparkles, CreditCard, Shield } from 'lucide-react'
import Button from '../../components/UI/Button'
import AuthSplitLayout from '../../components/Auth/AuthSplitLayout'
import toast from 'react-hot-toast'
import authAPI from '../../services/auth.jsx'
import { getCurrencyByCountry } from '../../services/currency'

const greetingPoints = [
  {
    icon: Sparkles,
    title: 'Instant account setup',
    desc: 'Get a checking account the moment you finish registering.',
  },
  {
    icon: Shield,
    title: 'Private seed phrase',
    desc: 'Your unique 12-word recovery phrase keeps you in full control.',
  },
  {
    icon: CreditCard,
    title: 'Cards & loans',
    desc: 'Order virtual or physical cards and access instantly funded loans.',
  },
]

const inputClass =
  'w-full pl-12 pr-4 py-3.5 bg-primary-100 border border-silver/60 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all text-primary placeholder:text-silver'
const inputClassWide =
  'w-full pl-12 pr-12 py-3.5 bg-primary-100 border border-silver/60 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all text-primary placeholder:text-silver'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    country: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!')
      return
    }

    setLoading(true)
    try {
      const response = await authAPI.register(formData)
      toast.success('Account created! Seed phrase generated and saved securely. Login now.')
      navigate('/login')
    } catch (error) {
      toast.error(error.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthSplitLayout
      tealSide="right"
      badge="Join 10,000+ happy customers"
      title="Join Primewave Bank."
      subtitle="Open your account in under a minute and start banking smarter, safer and faster."
      points={greetingPoints}
    >
      <div className="bg-white rounded-3xl shadow-lux-card border border-silver/20 p-6 sm:p-10">
        <h2 className="font-heading font-bold text-3xl sm:text-4xl text-primary">Create Account</h2>
        <p className="text-silver mt-3">Fill in your details to get started.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-silver" size={18} />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={inputClass}
                placeholder="Enter your full name"
              />
            </div>
          </div>

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
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={inputClassWide}
                placeholder="Create a strong password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-silver hover:text-primary-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-silver" size={18} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className={inputClassWide}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-silver hover:text-primary-600 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Country
            </label>
            <div className="relative">
              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-silver pointer-events-none" size={18} />
              <select
                required
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full pl-12 pr-10 py-3.5 bg-primary-100 border border-silver/60 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all text-primary appearance-none cursor-pointer"
              >
                <option value="">Select your country</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name} ({getCurrencyByCountry(country.code)})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-silver pointer-events-none" size={18} />
            </div>
          </div>

          <Button
            type="submit"
            variant="brand"
            loading={loading}
            className="w-full"
          >
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-silver">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </AuthSplitLayout>
  )
}

export default Register
