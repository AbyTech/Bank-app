import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Plus, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import Card, { CardContent, CardHeader } from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Modal from '../../components/UI/Modal'
import { useAuth } from '../../hooks/useAuth'
import api from '../../services/api'
import logo from '../../assets/logo.png'

const Cards = () => {
  const { user } = useAuth()
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [selectedCard, setSelectedCard] = useState(null)
  const [paymentForm, setPaymentForm] = useState({
    cardType: 'virtual',
    amount: 5500.00
  })

  useEffect(() => {
    if (user) {
      fetchCards()
    }
  }, [user])

  const fetchCards = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/cards/')
      setCards(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch cards:', error)
      setCards([])
    } finally {
      setLoading(false)
    }
  }

  const handleOrderCard = () => {
    setShowPaymentModal(true)
  }

  const handlePaymentSubmit = async (e) => {
    e.preventDefault()
    try {
      // Submit card order to backend
      const response = await api.post('/api/cards/order-card/', {
        card_type: paymentForm.cardType,
        amount: paymentForm.amount
      })

      // Refresh cards list
      fetchCards()
      setShowPaymentModal(false)
      setShowSuccessModal(true)
      setPaymentForm({ cardType: 'virtual', amount: 5500.00 })
    } catch (error) {
      console.error('Failed to order card:', error)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="text-success" size={16} />
      case 'pending_payment':
        return <Clock className="text-gold" size={16} />
      case 'expired':
        return <XCircle className="text-danger" size={16} />
      case 'blocked':
        return <XCircle className="text-danger" size={16} />
      default:
        return <AlertTriangle className="text-silver" size={16} />
    }
  }

  const getTimeUntilDeadline = (deadline) => {
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const diff = deadlineDate - now
    
    if (diff <= 0) return 'Overdue'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    return `${days}d ${hours}h`
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
            Cards
          </h1>
          <p className="text-silver dark:text-silver">
            Manage your virtual and physical cards
          </p>
        </motion.div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-heading font-semibold text-primary dark:text-cream">
            Your Cards
          </h2>
          <Button variant="primary" className="flex items-center space-x-2" onClick={handleOrderCard}>
            <Plus size={20} />
            <span>Order New Card</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover>
                <CardContent className="p-6">
                  <div className="flex justify-end items-start mb-4">
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(card.status)}
                      <span className={`text-sm capitalize ${
                        card.status === 'active' ? 'text-success' :
                        card.status === 'pending_payment' ? 'text-gold' :
                        card.status === 'blocked' ? 'text-danger' : 'text-danger'
                      }`}>
                        {card.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="relative bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl p-6 text-white mb-4 shadow-lg overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full -ml-12 -mb-12"></div>
                    </div>

                    {/* Company Logo */}
                    <div className="absolute top-4 right-4">
                      <img src={logo} alt="Logo" className="w-16 h-16 rounded-full" />
                    </div>

                    {/* Card Number */}
                    <div className="mt-8 mb-4">
                      <p className="text-lg font-mono tracking-widest">
                        {card.showFullNumber ? card.cardNumber : `**** **** **** ${card.cardNumber?.slice(-4) || '****'}`}
                      </p>
                    </div>

                    {/* CVV only */}
                    <div className="mb-2">
                      <div className="flex justify-start items-center text-sm">
                        <span>CVV {card.cvv}</span>
                      </div>
                    </div>

                    {/* Bank Name */}
                    <div className="mb-4">
                      <p className="text-sm font-semibold tracking-wide">PRIMEWAVE BANK</p>
                    </div>

                    {/* VISA Text */}
                    <div className="absolute bottom-4 right-4 text-right">
                      <div className="text-xs text-white opacity-75 mb-1">DEBIT</div>
                      <div className="text-white font-bold text-xl tracking-wider">VISA</div>
                    </div>

                    {/* View/Hide Toggle */}
                    <button
                      onClick={() => {
                        const updatedCards = cards.map(c =>
                          c.id === card.id ? { ...c, showFullNumber: !c.showFullNumber } : c
                        )
                        setCards(updatedCards)
                      }}
                      className="absolute bottom-4 left-4 text-xs bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-white hover:bg-white/30 transition-colors"
                    >
                      {card.showFullNumber ? 'Hide' : 'View'}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {card.purchaseStatus === 'pending_payment' && (
                      <div className="flex justify-between">
                        <span className="text-silver">Payment Due</span>
                        <span className="text-gold font-semibold">
                          {getTimeUntilDeadline(card.paymentDeadline)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex space-x-3">
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedCard(card)
                        setShowDetailsModal(true)
                      }}
                    >
                      Details
                    </Button>
                    {card.purchaseStatus === 'pending_payment' && (
                      <Button
                        variant="danger"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setSelectedCard(card)
                          setShowContactModal(true)
                        }}
                      >
                        Pay Now
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Card Statistics */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-heading font-semibold text-primary dark:text-cream">
                Card Statistics
              </h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-primary-50 dark:bg-primary-700 rounded-xl">
                  <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CreditCard className="text-gold" size={24} />
                  </div>
                  <h4 className="font-semibold text-primary dark:text-cream">Total Cards</h4>
                  <p className="text-2xl font-bold text-gold">{cards.length}</p>
                </div>

                <div className="text-center p-4 bg-primary-50 dark:bg-primary-700 rounded-xl">
                  <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="text-success" size={24} />
                  </div>
                  <h4 className="font-semibold text-primary dark:text-cream">Active Cards</h4>
                  <p className="text-2xl font-bold text-success">{cards.filter(card => card.status === 'active').length}</p>
                </div>

                <div className="text-center p-4 bg-primary-50 dark:bg-primary-700 rounded-xl">
                  <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="text-gold" size={24} />
                  </div>
                  <h4 className="font-semibold text-primary dark:text-cream">Pending Payments</h4>
                  <p className="text-2xl font-bold text-gold">{cards.filter(card => card.purchaseStatus === 'pending_payment').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Modal */}
        <Modal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          title="Order New Card"
        >
          <form onSubmit={handlePaymentSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-primary dark:text-cream mb-2">
                Card Type
              </label>
              <select
                value={paymentForm.cardType}
                onChange={(e) => setPaymentForm({
                  ...paymentForm,
                  cardType: e.target.value,
                  amount: e.target.value === 'virtual' ? 5500.00 : 8000.00
                })}
                className="w-full px-4 py-3 bg-cream dark:bg-primary-700 border border-silver dark:border-primary-600 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
              >
                <option value="virtual">Virtual Card - $5,500.00</option>
                <option value="physical">Physical Card - $8,000.00</option>
              </select>
            </div>

            <div className="bg-primary-50 dark:bg-primary-700 rounded-xl p-4">
              <h4 className="font-semibold text-primary dark:text-cream mb-2">
                Order Summary
              </h4>
              <div className="text-sm text-silver space-y-1">
                <div className="flex justify-between">
                  <span>{paymentForm.cardType === 'virtual' ? 'Virtual Card' : 'Physical Card'}</span>
                  <span className="text-primary dark:text-cream">${paymentForm.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Processing Fee</span>
                  <span className="text-primary dark:text-cream">$2.50</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-primary dark:text-cream">${(paymentForm.amount + 2.50).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowPaymentModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
              >
                Order Now
              </Button>
            </div>
          </form>
        </Modal>

        {/* Success Modal */}
        <Modal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          title="Card Ordered Successfully"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-success" size={32} />
            </div>
            <h3 className="text-lg font-heading font-semibold text-primary dark:text-cream mb-2">
              Card Ordered Successfully!
            </h3>
            <p className="text-silver mb-6">
              Your {paymentForm.cardType} card has been ordered and is now pending. You can view the status in your cards list.
            </p>
            <Button
              variant="primary"
              onClick={() => setShowSuccessModal(false)}
              className="w-full"
            >
              Continue
            </Button>
          </div>
        </Modal>

        {/* Details Modal */}
        <Modal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedCard(null)
          }}
          title="Card Details"
        >
          {selectedCard && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-primary to-primary-600 rounded-xl p-6 text-white">
                <div className="flex justify-between items-center mb-4">
                  <CreditCard size={32} />
                  <span className="text-sm font-semibold">{(selectedCard.type || selectedCard.cardType || 'VIRTUAL').toUpperCase()}</span>
                </div>
                <p className="text-2xl font-mono tracking-wider mb-2">
                  {selectedCard.cardNumber}
                </p>
                <div className="flex justify-between text-sm">
                  <span>EXPIRES</span>
                  <span>{selectedCard.expiryDate}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary-50 dark:bg-primary-700 rounded-lg p-4">
                  <h4 className="font-semibold text-primary dark:text-cream mb-2">Card Name</h4>
                  <p className="text-silver">{selectedCard.cardName}</p>
                </div>
                <div className="bg-primary-50 dark:bg-primary-700 rounded-lg p-4">
                  <h4 className="font-semibold text-primary dark:text-cream mb-2">CVV</h4>
                  <p className="text-silver">{selectedCard.cvv}</p>
                </div>
                <div className="bg-primary-50 dark:bg-primary-700 rounded-lg p-4">
                  <h4 className="font-semibold text-primary dark:text-cream mb-2">Status</h4>
                  <p className={`capitalize ${selectedCard.status === 'active' ? 'text-success' : selectedCard.status === 'pending_payment' ? 'text-gold' : selectedCard.status === 'blocked' ? 'text-danger' : 'text-danger'}`}>
                    {selectedCard.status.replace('_', ' ')}
                  </p>
                </div>
                <div className="bg-primary-50 dark:bg-primary-700 rounded-lg p-4">
                  <h4 className="font-semibold text-primary dark:text-cream mb-2">Type</h4>
                  <p className="text-silver capitalize">{selectedCard.type || selectedCard.cardType}</p>
                </div>
              </div>

              {selectedCard.purchaseStatus === 'pending_payment' && (
                <div className="bg-gold/10 border border-gold/20 rounded-lg p-4">
                  <h4 className="font-semibold text-gold mb-2">Payment Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-silver">Purchase Amount:</span>
                      <span className="text-primary dark:text-cream">${selectedCard.purchaseAmount?.toFixed(2) || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-silver">Payment Deadline:</span>
                      <span className="text-gold font-semibold">
                        {selectedCard.paymentDeadline ? new Date(selectedCard.paymentDeadline).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-silver">Time Remaining:</span>
                      <span className="text-gold font-semibold">
                        {getTimeUntilDeadline(selectedCard.paymentDeadline)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowDetailsModal(false)
                    setSelectedCard(null)
                  }}
                  className="flex-1"
                >
                  Close
                </Button>
                {selectedCard.purchaseStatus === 'pending_payment' && (
                  <Button
                    variant="danger"
                    onClick={() => {
                      setShowDetailsModal(false)
                      setShowContactModal(true)
                    }}
                    className="flex-1"
                  >
                    Pay Now
                  </Button>
                )}
              </div>
            </div>
          )}
        </Modal>

        {/* Contact Modal */}
        <Modal
          isOpen={showContactModal}
          onClose={() => {
            setShowContactModal(false)
            setSelectedCard(null)
          }}
          title="Contact Support for Payment"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="text-gold" size={32} />
            </div>
            <h3 className="text-lg font-heading font-semibold text-primary dark:text-cream mb-2">
              Payment Processing
            </h3>
            <p className="text-silver mb-6">
              To proceed with payment for your card, please contact our support team. They will guide you through the secure payment process.
            </p>
            <div className="bg-primary-50 dark:bg-primary-700 rounded-lg p-4 mb-6">
              <p className="text-sm text-primary dark:text-cream font-semibold mb-1">Support Email:</p>
              <p className="text-gold font-mono">helpxprimewavebank@gmail.com</p>
            </div>
            <div className="flex space-x-4">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowContactModal(false)
                  setSelectedCard(null)
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  window.location.href = 'mailto:helpxprimewavebank@gmail.com?subject=Card Payment Request&body=Please help me process payment for my card.'
                  setShowContactModal(false)
                  setSelectedCard(null)
                }}
                className="flex-1"
              >
                Contact Support
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}

export default Cards
