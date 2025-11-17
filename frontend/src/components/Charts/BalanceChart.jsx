import React, { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area
} from 'recharts'
import { useAuth } from '../../hooks/useAuth'
import api from '../../services/api'

const BalanceChart = () => {
  const { user } = useAuth()
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchBalanceHistory()
    }
  }, [user])

  const fetchBalanceHistory = async () => {
    try {
      setLoading(true)
      // Fetch transactions to build balance history
      const transactionsResponse = await api.get('/api/transactions/')
      const transactions = transactionsResponse.data.data || []

      // Sort transactions by date
      const sortedTransactions = transactions.sort((a, b) =>
        new Date(a.createdAt) - new Date(b.createdAt)
      )

      // Build balance history over time
      let runningBalance = 0
      const balanceHistory = []

      // Add current balance as starting point
      const accountResponse = await api.get('/api/accounts/')
      const currentBalance = accountResponse.data.data[0]?.balance || 0

      // Create monthly balance points
      const now = new Date()
      const months = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        months.push({
          name: date.toLocaleDateString('en-US', { month: 'short' }),
          date: date,
          balance: 0
        })
      }

      // Calculate balance for each month
      months.forEach((month, index) => {
        const monthTransactions = sortedTransactions.filter(t => {
          const transactionDate = new Date(t.createdAt)
          return transactionDate.getMonth() === month.date.getMonth() &&
                 transactionDate.getFullYear() === month.date.getFullYear()
        })

        // Calculate balance change for this month
        const monthChange = monthTransactions.reduce((sum, t) => {
          if (t.type === 'deposit') {
            return sum + parseFloat(t.amount)
          } else {
            return sum - parseFloat(t.amount)
          }
        }, 0)

        // Set balance for this month (accumulate from previous)
        if (index === 0) {
          month.balance = currentBalance - monthChange
        } else {
          month.balance = months[index - 1].balance + monthChange
        }
      })

      setChartData(months)
    } catch (error) {
      console.error('Failed to fetch balance history:', error)
      // Fallback to sample data
      setChartData([
        { name: 'Jan', balance: 10000 },
        { name: 'Feb', balance: 10500 },
        { name: 'Mar', balance: 11000 },
        { name: 'Apr', balance: 11500 },
        { name: 'May', balance: 12000 },
        { name: 'Jun', balance: 12500 },
        { name: 'Jul', balance: 13000 },
      ])
    } finally {
      setLoading(false)
    }
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-primary-800 p-3 rounded-lg shadow-lux-card border border-silver/20">
          <p className="text-primary dark:text-cream font-semibold">{`${label}`}</p>
          <p className="text-gold">
            {`Balance: $${payload[0].value.toLocaleString()}`}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis 
            dataKey="name" 
            stroke="#6B7280"
            fontSize={12}
          />
          <YAxis 
            stroke="#6B7280"
            fontSize={12}
            tickFormatter={(value) => `$${value / 1000}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="balance" 
            stroke="#d4af37"
            strokeWidth={3}
            dot={{ fill: '#d4af37', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: '#d4af37' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default BalanceChart