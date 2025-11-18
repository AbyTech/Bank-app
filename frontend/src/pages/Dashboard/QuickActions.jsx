import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Send,
  Plus,
  CreditCard,
  Download,
  Upload,
  Shield,
  History
} from 'lucide-react'
import Card, { CardContent, CardHeader } from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Modal from '../../components/UI/Modal'
import { useAuth } from '../../hooks/useAuth'
import api from '../../services/api'

const QuickActions = () => {
  const { user } = useAuth()
  const [showCardModal, setShowCardModal] = useState(false)
  const [hasActiveCard, setHasActiveCard] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      checkActiveCard()
    }
  }, [user])

  const checkActiveCard = async () => {
    try {
      const response = await api.get('/api/cards/')
      const activeCards = response.data.data.filter(card => card.purchase_status === 'active')
      setHasActiveCard(activeCards.length > 0)
    } catch (error) {
      console.error('Failed to check cards:', error)
    }
  }

  const handleWithdrawClick = () => {
    if (!hasActiveCard) {
      setShowCardModal(true)
    } else {
      window.location.href = '/transactions'
    }
  }

  const handleOrderCard = () => {
    setShowCardModal(false)
    window.location.href = '/cards'
  }

  const actions = [
    {
      icon: Send,
      label: 'Send Money',
      description: 'Transfer to anyone',
      color: 'from-blue-500 to-cyan-500',
      onClick: () => {
        // Store transfer intent in sessionStorage to open modal on transactions page
        sessionStorage.setItem('openTransferModal', 'true')
        window.location.href = '/transactions'
      }
    },
    {
      icon: Plus,
      label: 'Add Money',
      description: 'Deposit funds',
      color: 'from-green-500 to-emerald-500',
      href: '/transactions'
    },
    {
      icon: CreditCard,
      label: 'Cards',
      description: 'Manage cards',
      color: 'from-gold to-gold-400',
      href: '/cards'
    },
    {
      icon: Download,
      label: 'Withdraw',
      description: 'Cash out',
      color: 'from-purple-500 to-pink-500',
      onClick: handleWithdrawClick
    },
    {
      icon: Shield,
      label: 'Security',
      description: 'Protect account',
      color: 'from-red-500 to-orange-500',
      href: '/profile'
    },
    {
      icon: History,
      label: 'History',
      description: 'View transactions',
      color: 'from-gray-500 to-silver',
      href: '/transactions'
    }
  ]

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-heading font-semibold text-primary dark:text-cream">
          Quick Actions
        </h3>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {actions.map((action, index) => (
            <motion.div
              key={action.label}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-cream dark:bg-primary-700 hover:bg-silver/20 transition-all"
                onClick={action.onClick || (() => window.location.href = action.href)}
              >
                <div className={`p-2 rounded-xl bg-gradient-to-r ${action.color} text-white`}>
                  <action.icon size={20} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-primary dark:text-cream">
                    {action.label}
                  </p>
                  <p className="text-xs text-silver">
                    {action.description}
                  </p>
                </div>
              </Button>
            </motion.div>
          ))}
        </div>
      </CardContent>

      {/* Card Required Modal */}
      <Modal
        isOpen={showCardModal}
        onClose={() => setShowCardModal(false)}
        title="Card Required for Withdrawals"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="text-gold" size={32} />
          </div>
          <h3 className="text-lg font-heading font-semibold text-primary dark:text-cream mb-2">
            Active Card Required
          </h3>
          <p className="text-silver mb-6">
            To withdraw funds from your account, you need to have an active card. Please order a card first to enable withdrawal functionality.
          </p>
          <div className="flex space-x-4">
            <Button
              variant="ghost"
              onClick={() => setShowCardModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleOrderCard}
              className="flex-1"
            >
              Order Card
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  )
}

export default QuickActions
