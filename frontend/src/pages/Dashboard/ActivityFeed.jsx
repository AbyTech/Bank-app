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
      const response = await api.get('/transactions/')
      const activityData = response.data.data ? response.data.data.slice(0, 4) : [] // Get latest 4 transactions

      // Map activity types to icons and colors
      const iconMap = {
        login: User,
        transaction: TrendingUp,
        card_purchase: CreditCard,
        loan_application: Shield,
        profile_update: User,
      }

      const colorMap = {
        login: 'text-blue-500',
        transaction: 'text-success',
        card_purchase: 'text-gold',
        loan_application: 'text-purple-500',
        profile_update: 'text-green-500',
      }

      const formattedActivities = activityData.map(activity => ({
        id: activity._id,
        type: activity.transaction_type,
        description: getActivityDescription(activity),
        timestamp: activity.timestamp,
        icon: iconMap[activity.transaction_type] || User,
        color: colorMap[activity.transaction_type] || 'text-gray-500'
      }))

      setActivities(formattedActivities)
    } catch (error) {
      console.error('Failed to fetch activity feed:', error)
      // Fallback to default activities if API fails
      setActivities([
        { id: 1, type: 'login', description: 'You logged in from new device', timestamp: '2024-01-15 14:30', icon: User, color: 'text-blue-500' },
        { id: 2, type: 'transaction', description: 'Transfer of $250.00 completed', timestamp: '2024-01-15 10:15', icon: TrendingUp, color: 'text-success' },
        { id: 3, type: 'card_purchase', description: 'Card purchase at Amazon', timestamp: '2024-01-14 16:45', icon: CreditCard, color: 'text-gold' },
        { id: 4, type: 'security', description: 'Two-factor authentication enabled', timestamp: '2024-01-14 09:20', icon: Shield, color: 'text-purple-500' }
      ])
    } finally {
      setLoading(false)
    }
  }

  const getActivityDescription = (activity) => {
    switch (activity.transaction_type) {
      case 'deposit':
        return `Deposit of $${activity.amount} completed`
      case 'withdrawal':
        return `Withdrawal of $${Math.abs(activity.amount)} completed`
      case 'transfer':
        return `Transfer of $${Math.abs(activity.amount)} completed`
      case 'payment':
        return `Payment of $${Math.abs(activity.amount)} completed`
      case 'card_purchase':
        return `Card purchase of $${Math.abs(activity.amount)} completed`
      case 'loan_deposit':
        return `Loan deposit of $${activity.amount} completed`
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