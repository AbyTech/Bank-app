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
import AddMoneyModal from '../../components/AddMoneyModal'
import WithdrawModal from '../../components/WithdrawModal'
import { useAuth } from '../../hooks/useAuth'
import api from '../../services/api'

const QuickActions = () => {
  const { user } = useAuth()
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
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
      const activeCards = response.data.data.filter(card => card.status === 'active')
      setHasActiveCard(activeCards.length > 0)
    } catch (error) {
      console.error('Failed to check cards:', error)
    }
  }

  const handleWithdrawClick = () => {
    // The unified withdrawal modal offers both the existing card/bank method
    // and the new "Withdraw to Wallet" method.
    setShowWithdrawModal(true)
  }

  const actions = [
    {
      icon: Send,
      label: 'Send Money',
      description: 'Transfer to anyone',
      color: 'from-primary-600 to-primary-400',
      onClick: () => {
        sessionStorage.setItem('openTransferModal', 'true')
        window.location.href = '/transactions'
      }
    },
    {
      icon: Plus,
      label: 'Add Money',
      description: 'Deposit funds',
      color: 'from-success to-green-600',
      onClick: () => setShowAddMoneyModal(true)
    },
    {
      icon: CreditCard,
      label: 'Cards',
      description: 'Manage cards',
      color: 'from-gold to-gold-600',
      href: '/cards'
    },
    {
      icon: Download,
      label: 'Withdraw',
      description: 'Cash out',
      color: 'from-gold to-gold-600',
      onClick: handleWithdrawClick
    },
    {
      icon: Shield,
      label: 'Security',
      description: 'Protect account',
      color: 'from-danger to-gold-600',
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
      <CardContent className="p-2 sm:p-4">
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
          {actions.map((action, index) => (
            <motion.div
              key={action.label}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="ghost"
                className="w-full h-14 sm:h-16 md:h-20 flex flex-col items-center justify-center space-y-1 sm:space-y-1.5 md:space-y-2 bg-cream dark:bg-primary-700 hover:bg-silver/20 transition-all p-1 sm:p-2"
                onClick={action.onClick || (() => window.location.href = action.href)}
              >
                <div className={`p-1.5 sm:p-2 md:p-2 rounded-lg sm:rounded-xl bg-gradient-to-r ${action.color} text-white`}>
                  <action.icon size={16} className="sm:size-18 md:size-20" />
                </div>
                <div className="text-center">
                  <p className="text-xs sm:text-sm font-medium text-primary dark:text-cream leading-tight">
                    {action.label}
                  </p>
                  <p className="text-[10px] sm:text-xs text-silver leading-tight">
                    {action.description}
                  </p>
                </div>
              </Button>
            </motion.div>
          ))}
        </div>
      </CardContent>

      {/* Add Money - funding methods modal */}
      <AddMoneyModal
        isOpen={showAddMoneyModal}
        onClose={() => setShowAddMoneyModal(false)}
      />

      {/* Unified withdrawal modal (card/bank + withdraw to wallet) */}
      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
      />
    </Card>
  )
}

export default QuickActions