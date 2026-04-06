import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'

import toast from 'react-hot-toast'
import authAPI from '../../services/auth.jsx'
import logo from '../../assets/logo.png'

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', country: '', password: '', confirmPassword: '' })
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-cream dark:from-primary-900 dark:to-primary-800 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-white dark:bg-primary-800 rounded-2xl shadow-lux-card p-8">
          <div className="text-center mb-8">
            <img src={logo} alt="Logo" className="w-14 h-14 rounded-xl bg-blue-900 mx-auto mb-4" />
            <h1 className="text-3xl font-heading font-bold text-primary dark:text-cream">Primewave Bank</h1>
            <p className="text-silver dark:text-silver mt-2">Create your secure banking account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-primary dark:text-cream mb-2">
                Full Name
              </label>
              <input 
                type="text" 
                required 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                className="w-full px-4 py-3 bg-cream dark:bg-primary-700 border border-silver dark:border-primary-600 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent" 
                placeholder="Enter your full name" 
              />
            </div>
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
                  required 
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
            </div>
            <div>
              <label className="block text-sm font-medium text-primary dark:text-cream mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-silver" size={20} />
                <input 
                  type={showConfirmPassword ? "text" : "password"}
                  required 
                  value={formData.confirmPassword} 
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} 
                  className="w-full pl-12 pr-12 py-3 bg-cream dark:bg-primary-700 border border-silver dark:border-primary-600 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent transition-all" 
                  placeholder="Confirm your password" 
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-silver hover:text-gold transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary dark:text-cream mb-2">
                Country
              </label>
              <select 
                required 
                value={formData.country} 
                onChange={(e) => setFormData({ ...formData, country: e.target.value })} 
                className="w-full px-4 py-3 bg-cream dark:bg-primary-700 border border-silver dark:border-primary-600 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
              >
                <option value="">Select your country</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name} ({country.currency})
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-gold to-gold-400 text-primary font-semibold py-3 px-4 rounded-xl hover:shadow-lux-gold disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="text-center">
            <p className="text-silver dark:text-silver">Already have an account? <Link to="/login" className="text-gold hover:text-gold-600 font-semibold">Sign In</Link></p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Register

