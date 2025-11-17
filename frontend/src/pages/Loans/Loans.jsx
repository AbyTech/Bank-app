import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react'
import Card, { CardContent, CardHeader } from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Modal from '../../components/UI/Modal'
import { useAuth } from '../../hooks/useAuth'
import api from '../../services/api'

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="text-success" size={16} />
      case 'pending':
        return <Clock className="text-gold" size={16} />
      case 'rejected':
        return <XCircle className="text-danger" size={16} />
      default:
        return null
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

  return (
    <div className="min-h-screen bg-cream dark:bg-primary-900 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-heading font-bold text-primary dark:text-cream mb-2">
            Loans
          </h1>
          <p className="text-silver dark:text-silver">
            Apply for and manage your loans
          </p>
        </motion.div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-heading font-semibold text-primary dark:text-cream">
            Your Loans
          </h2>
          <Button 
            variant="primary" 
            className="flex items-center space-x-2"
            onClick={() => setShowApplication(true)}
          >
            <TrendingUp size={20} />
            <span>Apply for Loan</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loans.map((loan, index) => (
            <motion.div
              key={loan._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-primary dark:text-cream">
                        ${loan.loanAmount.toLocaleString()}
                      </h3>
                      <p className="text-silver text-sm">{loan.termMonths} months</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(loan.status)}
                      <span className={`text-sm capitalize ${
                        loan.status === 'approved' ? 'text-success' : 
                        loan.status === 'pending' ? 'text-gold' : 'text-danger'
                      }`}>
                        {loan.status}
                      </span>
                    </div>
                  </div>

                  {loan.status === 'approved' && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-silver mb-1">
                        <span>Repayment Progress</span>
                        <span>{loan.repaymentProgress}%</span>
                      </div>
                      <div className="w-full bg-silver/20 rounded-full h-2">
                        <div 
                          className="bg-success h-2 rounded-full" 
                          style={{ width: `${loan.repaymentProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 text-sm text-silver">
                    <div className="flex justify-between">
                      <span>Interest Rate</span>
                      <span className="text-primary dark:text-cream">{loan.interestRate}%</span>
                    </div>
                    {loan.monthlyPayment && (
                      <div className="flex justify-between">
                        <span>Monthly Payment</span>
                        <span className="text-primary dark:text-cream">${loan.monthlyPayment}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Applied</span>
                      <span>{new Date(loan.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-3">
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
                    {loan.status === 'approved' && (
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
          ))}
        </div>

        {/* Success Modal */}
        <Modal
          isOpen={showSuccessModal}
          onClose={handleSuccessModalClose}
          title="Loan Approved!"
        >
          <div className="text-center py-8">
            <CheckCircle className="text-success mx-auto mb-4" size={64} />
            <h3 className="text-xl font-semibold text-primary dark:text-cream mb-2">
              Congratulations!
            </h3>
            <p className="text-silver mb-6">
              Your loan application has been approved immediately and the funds have been deposited to your account.
            </p>
            <Button
              variant="primary"
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
        >
          <form onSubmit={handleApplicationSubmit} className="space-y-6">
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
                  className="w-full pl-10 pr-4 py-3 bg-cream dark:bg-primary-700 border border-silver dark:border-primary-600 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                  placeholder="Enter loan amount"
                  min="100"
                  max="50000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary dark:text-cream mb-2">
                Loan Duration
              </label>
              <select
                name="duration"
                value={applicationForm.duration}
                onChange={handleFormChange}
                className="w-full px-4 py-3 bg-cream dark:bg-primary-700 border border-silver dark:border-primary-600 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
              >
                <option value="6">6 months</option>
                <option value="12">12 months</option>
                <option value="24">24 months</option>
                <option value="36">36 months</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary dark:text-cream mb-2">
                Phone Number
              </label>
              <input
                type="number"
                required
                name="phoneNumber"
                value={applicationForm.phoneNumber}
                onChange={handleFormChange}
                className="w-full px-4 py-3 bg-cream dark:bg-primary-700 border border-silver dark:border-primary-600 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary dark:text-cream mb-2">
                Address
              </label>
              <textarea
                required
                name="address"
                value={applicationForm.address}
                onChange={handleFormChange}
                rows="3"
                className="w-full px-4 py-3 bg-cream dark:bg-primary-700 border border-silver dark:border-primary-600 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                placeholder="Enter your full address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary dark:text-cream mb-2">
                Means of Identification
              </label>
              <select
                name="identificationType"
                value={applicationForm.identificationType}
                onChange={handleFormChange}
                className="w-full px-4 py-3 bg-cream dark:bg-primary-700 border border-silver dark:border-primary-600 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
              >
                <option value="passport">Passport</option>
                <option value="drivers_license">Driver's License</option>
                <option value="id_card">National ID Card</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary dark:text-cream mb-2">
                Upload Identification Document
              </label>
              <input
                type="file"
                required
                name="identificationDocument"
                onChange={handleFormChange}
                className="w-full text-sm text-silver file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gold-100 file:text-gold-700 hover:file:bg-gold-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary dark:text-cream mb-2">
                Loan Purpose
              </label>
              <textarea
                required
                name="purpose"
                value={applicationForm.purpose}
                onChange={handleFormChange}
                rows="3"
                className="w-full px-4 py-3 bg-cream dark:bg-primary-700 border border-silver dark:border-primary-600 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                placeholder="Describe what you need the loan for..."
              />
            </div>

            <div className="bg-primary-50 dark:bg-primary-700 rounded-xl p-4">
              <h4 className="font-semibold text-primary dark:text-cream mb-2">
                Estimated Terms
              </h4>
              <div className="text-sm text-silver space-y-1">
                <div className="flex justify-between">
                  <span>Interest Rate:</span>
                  <span className="text-primary dark:text-cream">5.5% - 7.5%</span>
                </div>
                <div className="flex justify-between">
                  <span>Processing Time:</span>
                  <span className="text-primary dark:text-cream">1-3 business days</span>
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
        >
          {selectedLoan && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-primary dark:text-cream mb-4">
                    Loan Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-silver">Loan Amount:</span>
                      <span className="text-primary dark:text-cream font-semibold">
                        ${selectedLoan.loanAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-silver">Interest Rate:</span>
                      <span className="text-primary dark:text-cream font-semibold">
                        {selectedLoan.interestRate}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-silver">Term:</span>
                      <span className="text-primary dark:text-cream font-semibold">
                        {selectedLoan.termMonths} months
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-silver">Monthly Payment:</span>
                      <span className="text-primary dark:text-cream font-semibold">
                        ${selectedLoan.monthlyPayment}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-silver">Status:</span>
                      <span className={`font-semibold capitalize ${
                        selectedLoan.status === 'approved' ? 'text-success' :
                        selectedLoan.status === 'pending' ? 'text-gold' : 'text-danger'
                      }`}>
                        {selectedLoan.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-silver">Applied Date:</span>
                      <span className="text-primary dark:text-cream font-semibold">
                        {new Date(selectedLoan.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-primary dark:text-cream mb-4">
                    Personal Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-silver">Phone Number:</span>
                      <span className="text-primary dark:text-cream font-semibold">
                        {selectedLoan.phoneNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-silver">Address:</span>
                      <span className="text-primary dark:text-cream font-semibold">
                        {selectedLoan.address}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-silver">Identification Type:</span>
                      <span className="text-primary dark:text-cream font-semibold capitalize">
                        {selectedLoan.identificationType.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-primary dark:text-cream mb-4">
                  Loan Purpose
                </h3>
                <p className="text-silver bg-primary-50 dark:bg-primary-700 p-4 rounded-lg">
                  {selectedLoan.purpose}
                </p>
              </div>

              {selectedLoan.status === 'approved' && (
                <div>
                  <h3 className="text-lg font-semibold text-primary dark:text-cream mb-4">
                    Repayment Progress
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-silver">
                      <span>Remaining Balance:</span>
                      <span className="text-primary dark:text-cream font-semibold">
                        ${selectedLoan.remainingBalance.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-silver mb-1">
                      <span>Repayment Progress</span>
                      <span>{selectedLoan.repaymentProgress}%</span>
                    </div>
                    <div className="w-full bg-silver/20 rounded-full h-3">
                      <div
                        className="bg-success h-3 rounded-full"
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
              <div className="bg-primary-50 dark:bg-primary-700 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-primary dark:text-cream mb-4">
                  Payment Details
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-silver">Remaining Balance:</span>
                    <span className="text-primary dark:text-cream font-semibold">
                      ${selectedLoan.remainingBalance.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-silver">Monthly Payment:</span>
                    <span className="text-primary dark:text-cream font-semibold">
                      ${selectedLoan.monthlyPayment}
                    </span>
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
                      className="w-full pl-10 pr-4 py-3 bg-cream dark:bg-primary-700 border border-silver dark:border-primary-600 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
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
