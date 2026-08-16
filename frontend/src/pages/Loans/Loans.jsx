import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Landmark,
  Wallet,
  Calendar,
  Percent,
  Banknote,
  Phone,
  MapPin,
  BadgeCheck,
  FileText,
  ShieldCheck,
  Sparkles,
  User,
} from 'lucide-react'
import Card, { CardContent } from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Modal from '../../components/UI/Modal'
import { useAuth } from '../../hooks/useAuth'
import api from '../../services/api'

// ---------- Presentation helpers (UI only - no business-logic changes) ----------

// Labels/colours for every loan status the backend can return.
const STATUS_CONFIG = {
  approved: { label: 'Approved', cls: 'bg-success/15 text-success border-success/30', dot: 'bg-success' },
  active: {
    label: 'Active',
    cls: 'bg-primary-100 text-primary-600 border-primary-400/30 dark:bg-primary-600/20 dark:text-primary-300 dark:border-primary-400/40',
    dot: 'bg-primary-400',
  },
  paid: { label: 'Paid Off', cls: 'bg-success/15 text-success border-success/30', dot: 'bg-success' },
  pending: { label: 'Pending', cls: 'bg-gold/10 text-gold border-gold/40', dot: 'bg-gold' },
  defaulted: { label: 'Defaulted', cls: 'bg-danger/10 text-danger border-danger/30', dot: 'bg-danger' },
}
const getStatus = (status) => STATUS_CONFIG[status] || { label: status || 'Unknown', cls: 'bg-silver/10 text-silver border-silver/30', dot: 'bg-silver' }

// Interest rate is stored as a decimal (0.08 = 8%) - present it as a percentage.
const formatRate = (rate) => {
  const num = Number(rate) || 0
  return `${num > 1 ? num : num * 100}%`
}

// Currency formatting for loan amounts.
const formatMoney = (value) => {
  const num = Number(value) || 0
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const Loans = () => {
  const { user } = useAuth()
  const [loans, setLoans] = useState([])
  const [showApplication, setShowApplication] = useState(false)
  const [applicationError, setApplicationError] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedLoan, setSelectedLoan] = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentError, setPaymentError] = useState('')
  const [applicationForm, setApplicationForm] = useState({
    amount: '',
    duration: '12',
    purpose: '',
    phoneNumber: '',
    address: '',
    identificationType: 'passport',
    identificationDocument: null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchLoans()
      // Set up polling to check for loan status updates every 30 seconds
      const interval = setInterval(fetchLoans, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  const fetchLoans = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/loans/')
      setLoans(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch loans:', error)
      setLoans([])
    } finally {
      setLoading(false)
    }
  }

  const handleApplicationSubmit = async (e) => {
    e.preventDefault()
    setApplicationError('') // Clear previous errors

    // Basic validation to ensure a file is selected
    if (!applicationForm.identificationDocument) {
      setApplicationError('Please upload an identification document.')
      return
    }

    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('amount', applicationForm.amount)
      formData.append('duration', applicationForm.duration)
      formData.append('purpose', applicationForm.purpose)
      formData.append('phoneNumber', applicationForm.phoneNumber)
      formData.append('address', applicationForm.address)
      formData.append('identificationType', applicationForm.identificationType)
      formData.append('identificationDocument', applicationForm.identificationDocument)

      // Submit loan application to backend
      const response = await api.post('/api/loans/apply', formData)

      // Close application modal and show success modal
      setShowApplication(false)
      setShowSuccessModal(true)

      // Optimistically update the UI and then refetch
      setLoans(prevLoans => [response.data.data, ...prevLoans])

      // Reset form
      setApplicationForm({
        amount: '',
        duration: '12',
        purpose: '',
        phoneNumber: '',
        address: '',
        identificationType: 'passport',
        identificationDocument: null,
      })
    } catch (error) {
      const message = error.response?.data?.error || 'An unexpected error occurred. Please try again.'
      setApplicationError(message)
      console.error('Failed to submit loan application:', message)
    }
  }

  const handleFormChange = (e) => {
    const { name, value, type, files } = e.target
    setApplicationForm(prevForm => ({
      ...prevForm,
      [name]: type === 'file' ? files[0] : value
    }))
  }

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false)
    fetchLoans() // Re-fetch loans to ensure data consistency
  }

  const handlePaymentSubmit = async (e) => {
    e.preventDefault()
    setPaymentError('')

    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      setPaymentError('Please enter a valid payment amount.')
      return
    }

    try {
      await api.post(`/api/loans/${selectedLoan._id}/payment`, {
        paymentAmount: parseFloat(paymentAmount)
      })

      // Close payment modal and refresh loans
      setShowPaymentModal(false)
      setSelectedLoan(null)
      setPaymentAmount('')
      fetchLoans()
    } catch (error) {
      const message = error.response?.data?.error || 'Payment failed. Please try again.'
      setPaymentError(message)
      console.error('Payment failed:', message)
    }
  }

  // Derived summary stats for the dashboard strip (UI only).
  const totalBorrowed = loans.reduce((sum, l) => sum + (Number(l.loanAmount) || 0), 0)
  const outstanding = loans.reduce((sum, l) => sum + (Number(l.remainingBalance) || 0), 0)
  const activeLoans = loans.filter((l) => l.status === 'approved' || l.status === 'active').length
  const paidLoans = loans.filter((l) => l.status === 'paid').length

  return (
    <div className="min-h-screen bg-cream dark:bg-primary-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ================= Hero header ================= */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white p-6 sm:p-8 shadow-lux-card mb-6"
        >
          <div className="pointer-events-none absolute -top-20 -right-16 w-64 h-64 rounded-full bg-gold/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-primary-400/40 blur-3xl" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.10]"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.7) 1px, transparent 1px)',
              backgroundSize: '22px 22px',
            }}
          />

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gold/20 border border-gold/40 flex items-center justify-center shrink-0">
                <Landmark size={26} className="text-gold-300" />
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.2em] text-gold-300 font-semibold">Loan Center</p>
                <h1 className="font-heading font-bold text-3xl sm:text-4xl mt-1">Loans</h1>
                <p className="text-white/70 text-sm mt-2 max-w-md">
                  Apply for personal loans with instant approval and repay at your own pace.
                </p>
              </div>
            </div>
            <div className="lg:justify-end">
              <Button
                variant="primary"
                size="lg"
                className="shadow-lux-gold"
                onClick={() => setShowApplication(true)}
              >
                <Sparkles size={18} className="mr-2" />
                Apply for Loan
              </Button>
            </div>
          </div>
        </motion.div>

        {/* ================= Summary stats ================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {[
            { label: 'Total Borrowed', value: `$${formatMoney(totalBorrowed)}`, icon: Banknote, color: 'text-gold', bg: 'bg-gold/10' },
            { label: 'Outstanding Balance', value: `$${formatMoney(outstanding)}`, icon: Wallet, color: 'text-success', bg: 'bg-success/10' },
            { label: 'Active Loans', value: activeLoans, icon: TrendingUp, color: 'text-primary-500 dark:text-primary-300', bg: 'bg-primary-100 dark:bg-primary-700' },
            { label: 'Paid Off', value: paidLoans, icon: CheckCircle, color: 'text-success', bg: 'bg-success/10' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 * index }}
            >
              <Card hover>
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-silver mb-1 truncate">{stat.label}</p>
                      <p className="text-lg sm:text-2xl font-bold text-primary dark:text-cream truncate">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-xl shrink-0 ${stat.bg} ${stat.color}`}>
                      <stat.icon size={22} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* ================= Loans list header ================= */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-2xl font-heading font-semibold text-primary dark:text-cream">
              Your Loans
            </h2>
            <p className="text-silver text-sm mt-1">
              {loans.length === 0 ? 'No loan applications yet' : `${loans.length} loan${loans.length === 1 ? '' : 's'} on record`}
            </p>
          </div>
          <Button
            variant="brand"
            onClick={() => setShowApplication(true)}
          >
            <TrendingUp size={18} className="mr-2" />
            Apply for Loan
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => (
              <Card key={i}>
                <CardContent className="p-6 space-y-4">
                  <div className="h-6 bg-silver/15 rounded-full animate-pulse" />
                  <div className="h-9 w-3/4 bg-silver/15 rounded-full animate-pulse" />
                  <div className="h-4 bg-silver/15 rounded-full animate-pulse" />
                  <div className="h-4 bg-silver/15 rounded-full animate-pulse" />
                  <div className="h-11 bg-silver/15 rounded-xl animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : loans.length === 0 ? (
          <Card>
            <CardContent className="p-10 sm:p-16 text-center">
              <div className="w-20 h-20 rounded-3xl bg-gold/10 flex items-center justify-center mx-auto mb-5">
                <Banknote size={36} className="text-gold" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-primary dark:text-cream mb-2">
                No loans yet
              </h3>
              <p className="text-silver max-w-md mx-auto mb-6 leading-relaxed">
                When you take out a loan, it will appear here. Apply now to get instant funding straight into your account.
              </p>
              <Button variant="primary" onClick={() => setShowApplication(true)}>
                <Sparkles size={18} className="mr-2" />
                Apply for your first loan
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loans.map((loan, index) => {
              const status = getStatus(loan.status)
              const repaid = Math.max(0, Math.min(100, Number(loan.repaymentProgress) || 0))
              const showProgress = ['approved', 'active', 'paid'].includes(loan.status)
              const canPay = loan.status === 'approved' || loan.status === 'active'
              return (
                <motion.div
                  key={loan._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="h-full"
                >
                  <Card hover className="h-full flex flex-col">
                    <CardContent className="p-6 flex flex-col flex-1">
                      {/* Top row: status badge + applied date */}
                      <div className="flex items-center justify-between gap-3 mb-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${status.cls}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                        <span className="text-xs text-silver flex items-center gap-1.5">
                          <Calendar size={13} />
                          {new Date(loan.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Amount + purpose */}
                      <p className="font-heading font-bold text-3xl text-primary dark:text-cream">
                        ${formatMoney(loan.loanAmount)}
                      </p>
                      <p className="text-xs text-silver mt-1 mb-5 line-clamp-1">
                        {loan.purpose}
                      </p>

                      {/* Key terms */}
                      <div className="grid grid-cols-3 gap-2 bg-cream dark:bg-primary-700/50 rounded-2xl p-3 mb-5">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-silver font-semibold flex items-center gap-1">
                            <Percent size={11} /> Rate
                          </p>
                          <p className="text-sm font-bold text-primary dark:text-cream mt-0.5">{formatRate(loan.interestRate)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-silver font-semibold">Term</p>
                          <p className="text-sm font-bold text-primary dark:text-cream mt-0.5">{loan.termMonths} mo</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-silver font-semibold">Monthly</p>
                          <p className="text-sm font-bold text-primary dark:text-cream mt-0.5">${formatMoney(loan.monthlyPayment)}</p>
                        </div>
                      </div>

                      {/* Repayment progress */}
                      {showProgress && (
                        <div className="mb-5">
                          <div className="flex justify-between text-xs text-silver mb-1.5">
                            <span>Repayment Progress</span>
                            <span className="font-semibold text-primary dark:text-cream">{repaid}%</span>
                          </div>
                          <div className="w-full bg-silver/20 dark:bg-primary-600 rounded-full h-2.5 overflow-hidden">
                            <div
                              className="h-2.5 rounded-full bg-gradient-to-r from-success to-emerald-400 transition-all duration-500"
                              style={{ width: `${repaid}%` }}
                            />
                          </div>
                          <p className="text-[11px] text-silver mt-1.5">
                            {loan.status === 'paid'
                              ? 'Fully repaid 🎉'
                              : `$${formatMoney(loan.remainingBalance)} remaining`}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="mt-auto pt-2 flex space-x-3">
                        <Button
                          variant="primary"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setSelectedLoan(loan)
                            setShowDetailsModal(true)
                          }}
                        >
                          Details
                        </Button>
                        {canPay && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              setSelectedLoan(loan)
                              setShowPaymentModal(true)
                            }}
                          >
                            Make Payment
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Success Modal */}
        <Modal
          isOpen={showSuccessModal}
          onClose={handleSuccessModalClose}
          title="Loan Approved!"
        >
          <div className="text-center py-8">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 bg-success/20 rounded-full blur-xl" />
              <div className="relative w-20 h-20 rounded-full bg-success/10 border border-success/40 flex items-center justify-center">
                <CheckCircle className="text-success" size={44} />
              </div>
            </div>
            <h3 className="text-2xl font-heading font-semibold text-primary dark:text-cream mb-3">
              Congratulations!
            </h3>
            <p className="text-silver mb-8 max-w-sm mx-auto leading-relaxed">
              Your loan application has been approved immediately and the funds have been deposited to your account.
            </p>
            <Button
              variant="primary"
              size="lg"
              className="shadow-lux-gold"
              onClick={handleSuccessModalClose}
            >
              Continue
            </Button>
          </div>
        </Modal>

        {/* Loan Application Modal */}
        <Modal
          isOpen={showApplication}
          onClose={() => {
            setShowApplication(false)
            setApplicationError('') // Clear errors when closing modal
          }}
          title="Apply for a Loan"
          size="lg"
        >
          <form onSubmit={handleApplicationSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Loan Amount */}
              <div>
                <label className="block text-sm font-medium text-primary dark:text-cream mb-2">
                  Loan Amount
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-silver" size={20} />
                  <input
                    type="number"
                    required
                    name="amount"
                    value={applicationForm.amount}
                    onChange={handleFormChange}
                    className="w-full pl-10 pr-4 py-3 bg-primary-100 dark:bg-primary-700 border border-silver dark:border-primary-600 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                    placeholder="Enter loan amount"
                    min="100"
                    max="500000000000"
                  />
                </div>
              </div>

              {/* Loan Duration */}
              <div>
                <label className="block text-sm font-medium text-primary dark:text-cream mb-2">
                  Loan Duration
                </label>
                <select
                  name="duration"
                  value={applicationForm.duration}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 bg-primary-100 dark:bg-primary-700 border border-silver dark:border-primary-600 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                >
                  <option value="6">6 months</option>
                  <option value="12">12 months</option>
                  <option value="24">24 months</option>
                  <option value="36">36 months</option>
                </select>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-primary dark:text-cream mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-silver" size={18} />
                  <input
                    type="number"
                    required
                    name="phoneNumber"
                    value={applicationForm.phoneNumber}
                    onChange={handleFormChange}
                    className="w-full pl-10 pr-4 py-3 bg-primary-100 dark:bg-primary-700 border border-silver dark:border-primary-600 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              {/* Means of Identification */}
              <div>
                <label className="block text-sm font-medium text-primary dark:text-cream mb-2">
                  Means of Identification
                </label>
                <select
                  name="identificationType"
                  value={applicationForm.identificationType}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 bg-primary-100 dark:bg-primary-700 border border-silver dark:border-primary-600 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                >
                  <option value="passport">Passport</option>
                  <option value="drivers_license">Driver's License</option>
                  <option value="id_card">National ID Card</option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-primary dark:text-cream mb-2">
                Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-silver" size={18} />
                <textarea
                  required
                  name="address"
                  value={applicationForm.address}
                  onChange={handleFormChange}
                  rows="2"
                  className="w-full pl-10 pr-4 py-3 bg-primary-100 dark:bg-primary-700 border border-silver dark:border-primary-600 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                  placeholder="Enter your full address"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary dark:text-cream mb-2">
                Upload Identification Document
              </label>
              <label className="flex flex-col items-center justify-center gap-2 w-full px-4 py-6 border-2 border-dashed border-silver/40 dark:border-primary-600 rounded-xl bg-primary-50 dark:bg-primary-700/50 cursor-pointer hover:border-gold/60 hover:bg-gold/5 transition-colors text-center">
                <div className="w-11 h-11 rounded-xl bg-gold/10 flex items-center justify-center">
                  <BadgeCheck className="text-gold" size={22} />
                </div>
                <span className="text-sm text-primary dark:text-cream font-medium">
                  {applicationForm.identificationDocument
                    ? applicationForm.identificationDocument.name
                    : 'Click to choose a file'}
                </span>
                <span className="text-xs text-silver">
                  {applicationForm.identificationDocument
                    ? 'File selected — ready to upload'
                    : 'Passport, Driver\u2019s License or National ID (JPG, PNG, PDF)'}
                </span>
                <input
                  type="file"
                  required
                  name="identificationDocument"
                  onChange={handleFormChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Loan Purpose */}
            <div>
              <label className="block text-sm font-medium text-primary dark:text-cream mb-2">
                Loan Purpose
              </label>
              <textarea
                required
                name="purpose"
                value={applicationForm.purpose}
                onChange={handleFormChange}
                rows="2"
                className="w-full px-4 py-3 bg-primary-100 dark:bg-primary-700 border border-silver dark:border-primary-600 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                placeholder="Describe what you need the loan for..."
              />
            </div>

            {/* Estimated Terms */}
            <div className="bg-primary-50 dark:bg-primary-700 rounded-xl p-4 border border-silver/20 dark:border-primary-600">
              <h4 className="font-semibold text-primary dark:text-cream mb-3 flex items-center gap-2">
                <ShieldCheck size={16} className="text-gold" />
                Estimated Terms
              </h4>
              <div className="text-sm text-silver space-y-2">
                <div className="flex justify-between">
                  <span>Interest Rate</span>
                  <span className="text-primary dark:text-cream font-semibold">5.5% - 7.5%</span>
                </div>
                <div className="flex justify-between">
                  <span>Processing Time</span>
                  <span className="text-primary dark:text-cream font-semibold">1-3 business days</span>
                </div>
              </div>
            </div>

            {applicationError && (
              <div className="bg-danger-light text-danger-dark dark:bg-danger-dark/30 dark:text-danger-light p-3 rounded-lg text-center text-sm">
                {applicationError}
              </div>
            )}

            <div className="flex space-x-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => { setShowApplication(false); setApplicationError(''); }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
              >
                Submit Application
              </Button>
            </div>
          </form>
        </Modal>

        {/* Loan Details Modal */}
        <Modal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedLoan(null)
          }}
          title="Loan Details"
          size="lg"
        >
          {selectedLoan && (
            <div className="space-y-6">
              {/* Summary banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white p-5">
                <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gold/20 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-14 -left-8 w-40 h-40 rounded-full bg-primary-400/40 blur-2xl" />
                <div className="relative flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-xs text-white/60 uppercase tracking-wider">Loan Amount</p>
                    <p className="font-heading font-bold text-2xl sm:text-3xl mt-1">
                      ${formatMoney(selectedLoan.loanAmount)}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatus(selectedLoan.status).cls}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${getStatus(selectedLoan.status).dot}`} />
                    {getStatus(selectedLoan.status).label}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-silver uppercase tracking-wider mb-4 flex items-center gap-2">
                    <ShieldCheck size={15} className="text-gold" />
                    Loan Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between gap-3">
                      <span className="text-silver">Loan Amount</span>
                      <span className="text-primary dark:text-cream font-semibold">
                        ${formatMoney(selectedLoan.loanAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-silver">Interest Rate</span>
                      <span className="text-primary dark:text-cream font-semibold">
                        {formatRate(selectedLoan.interestRate)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-silver">Term</span>
                      <span className="text-primary dark:text-cream font-semibold">
                        {selectedLoan.termMonths} months
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-silver">Monthly Payment</span>
                      <span className="text-primary dark:text-cream font-semibold">
                        ${formatMoney(selectedLoan.monthlyPayment)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-silver">Applied Date</span>
                      <span className="text-primary dark:text-cream font-semibold">
                        {new Date(selectedLoan.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-silver uppercase tracking-wider mb-4 flex items-center gap-2">
                    <User size={15} className="text-gold" />
                    Personal Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between gap-3">
                      <span className="text-silver">Phone Number</span>
                      <span className="text-primary dark:text-cream font-semibold">
                        {selectedLoan.phoneNumber}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-silver">Address</span>
                      <span className="text-primary dark:text-cream font-semibold text-right">
                        {selectedLoan.address}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-silver">Identification Type</span>
                      <span className="text-primary dark:text-cream font-semibold capitalize">
                        {selectedLoan.identificationType.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Loan Purpose */}
              <div>
                <h3 className="text-sm font-semibold text-silver uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FileText size={15} className="text-gold" />
                  Loan Purpose
                </h3>
                <p className="text-silver bg-primary-50 dark:bg-primary-700 p-4 rounded-xl leading-relaxed border border-silver/20 dark:border-primary-600">
                  {selectedLoan.purpose}
                </p>
              </div>

              {/* Repayment progress */}
              {(selectedLoan.status === 'approved' || selectedLoan.status === 'active' || selectedLoan.status === 'paid') && (
                <div>
                  <h3 className="text-sm font-semibold text-silver uppercase tracking-wider mb-3 flex items-center gap-2">
                    <TrendingUp size={15} className="text-gold" />
                    Repayment Progress
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-silver">
                      <span>Remaining Balance</span>
                      <span className="text-primary dark:text-cream font-semibold">
                        ${formatMoney(selectedLoan.remainingBalance)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-silver mb-1">
                      <span>Repayment Progress</span>
                      <span className="font-semibold text-primary dark:text-cream">
                        {selectedLoan.repaymentProgress}%
                      </span>
                    </div>
                    <div className="w-full bg-silver/20 dark:bg-primary-600 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-success to-emerald-400"
                        style={{ width: `${selectedLoan.repaymentProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-4 pt-4 border-t border-silver/20">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowDetailsModal(false)
                    setSelectedLoan(null)
                  }}
                >
                  Close
                </Button>
                {selectedLoan.status === 'approved' && (
                  <Button
                    variant="primary"
                    onClick={() => {
                      setShowDetailsModal(false)
                      setShowPaymentModal(true)
                    }}
                  >
                    Make Payment
                  </Button>
                )}
              </div>
            </div>
          )}
        </Modal>

        {/* Payment Modal */}
        <Modal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false)
            setSelectedLoan(null)
            setPaymentAmount('')
            setPaymentError('')
          }}
          title="Make Loan Payment"
        >
          {selectedLoan && (
            <div className="space-y-6">
              <div className="relative overflow-hidden bg-primary-50 dark:bg-primary-700 rounded-xl p-5 border border-silver/20 dark:border-primary-600">
                <div className="pointer-events-none absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gold/10 blur-2xl" />
                <div className="relative">
                  <h3 className="text-sm font-semibold text-silver uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Wallet size={15} className="text-gold" />
                    Payment Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-silver">Remaining Balance</span>
                      <span className="text-primary dark:text-cream font-bold">
                        ${formatMoney(selectedLoan.remainingBalance)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-silver">Monthly Payment</span>
                      <span className="text-primary dark:text-cream font-bold">
                        ${formatMoney(selectedLoan.monthlyPayment)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary dark:text-cream mb-2">
                    Payment Amount
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-silver" size={20} />
                    <input
                      type="number"
                      required
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-primary-100 dark:bg-primary-700 border border-silver dark:border-primary-600 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                      placeholder="Enter payment amount"
                      min="1"
                      max={selectedLoan.remainingBalance}
                      step="0.01"
                    />
                  </div>
                </div>

                {paymentError && (
                  <div className="bg-danger-light text-danger-dark dark:bg-danger-dark/30 dark:text-danger-light p-3 rounded-lg text-center text-sm">
                    {paymentError}
                  </div>
                )}

                <div className="flex space-x-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowPaymentModal(false)
                      setSelectedLoan(null)
                      setPaymentAmount('')
                      setPaymentError('')
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1"
                  >
                    Make Payment
                  </Button>
                </div>
              </form>
            </div>
          )}
        </Modal>
      </div>
    </div>
  )
}

export default Loans
