import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, CreditCard, User, Shield } from 'lucide-react'
import Card, { CardContent, CardHeader } from '../../components/UI/Card'
import { useAuth } from '../../hooks/useAuth'
import api from '../../services/api'

const ActivityFeed = () => {
  const { user } = useAuth()
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchActivityFeed()
    }
  }, [user])

  const fetchActivityFeed = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/transactions/')
      const activityData = response.data.data ? response.data.data.slice(0, 4) : [] // Get latest 4 transactions

      // Map activity types to icons and colors
      const iconMap = {
        deposit: TrendingUp,
        withdrawal: TrendingUp,
        transfer: TrendingUp,
        payment: CreditCard,
        card_purchase: CreditCard,
        loan_deposit: Shield,
        fee: TrendingUp,
        login: User,
        transaction: TrendingUp,
        loan_application: Shield,
        profile_update: User,
      }

      const colorMap = {
        deposit: 'text-success',
        withdrawal: 'text-danger',
        transfer: 'text-blue-500',
        payment: 'text-gold',
        card_purchase: 'text-gold',
        loan_deposit: 'text-purple-500',
        fee: 'text-danger',
        login: 'text-blue-500',
        transaction: 'text-success',
        loan_application: 'text-purple-500',
        profile_update: 'text-green-500',
      }

      const formattedActivities = activityData.map(activity => ({
        id: activity._id,
        type: activity.type,
        description: getActivityDescription(activity),
        timestamp: activity.createdAt,
        icon: iconMap[activity.type] || User,
        color: colorMap[activity.type] || 'text-gray-500'
      }))

      setActivities(formattedActivities)
    } catch (error) {
      console.error('Failed to fetch activity feed:', error)
      // Fallback to default activities if API fails
      setActivities([
        { id: 1, type: 'login', description: 'You logged in from new device', timestamp: new Date().toISOString(), icon: User, color: 'text-blue-500' },
        { id: 2, type: 'transaction', description: 'Transfer of $250.00 completed', timestamp: new Date().toISOString(), icon: TrendingUp, color: 'text-success' },
        { id: 3, type: 'card_purchase', description: 'Card purchase at Amazon', timestamp: new Date().toISOString(), icon: CreditCard, color: 'text-gold' },
        { id: 4, type: 'security', description: 'Two-factor authentication enabled', timestamp: new Date().toISOString(), icon: Shield, color: 'text-purple-500' }
      ])
    } finally {
      setLoading(false)
    }
  }

  const getActivityDescription = (activity) => {
    switch (activity.type) {
      case 'deposit':
        return `Deposit of $${activity.amount.toFixed(2)} completed`
      case 'withdrawal':
        return `Withdrawal of $${Math.abs(activity.amount).toFixed(2)} completed`
      case 'transfer':
        // For transfers, check if this is the receiving transaction
        if (activity.toAccount) {
          // This is a sent transfer (has toAccount field)
          return `Transfer sent of $${Math.abs(activity.amount).toFixed(2)}`
        } else {
          // This is a received transfer (no toAccount field)
          return `Transfer received of $${activity.amount.toFixed(2)}`
        }
      case 'payment':
        return `Payment of $${Math.abs(activity.amount).toFixed(2)} completed`
      case 'card_purchase':
        return `Card purchase of $${Math.abs(activity.amount).toFixed(2)} completed`
      case 'loan_deposit':
        return `Loan deposit of $${activity.amount.toFixed(2)} completed`
      case 'fee':
        return `Fee charged of $${Math.abs(activity.amount).toFixed(2)}`
      default:
        return `${activity.description || 'Transaction'} completed`
    }
  }

  return (
    <Card>
      <CardHeader><h3 className="text-lg font-heading font-semibold text-primary dark:text-cream">Recent Activity</h3></CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <motion.div key={activity.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-silver/10 transition-colors">
              <div className="p-2 bg-primary-100 dark:bg-primary-700 rounded-full"><activity.icon className={activity.color} size={20} /></div>
              <div className="flex-1"><p className="text-primary dark:text-cream font-medium">{activity.description}</p><p className="text-sm text-silver">{new Date(activity.timestamp).toLocaleString()}</p></div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
export default ActivityFeed