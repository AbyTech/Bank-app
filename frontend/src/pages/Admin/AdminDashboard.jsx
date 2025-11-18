import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, CreditCard, TrendingUp, DollarSign, UserCheck, UserX, Eye, ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react'
import Card, { CardContent, CardHeader } from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import api from '../../services/api'
import { getCurrencyByCountry, formatAmount } from '../../services/currency'

const AdminDashboard = () => {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [userDetails, setUserDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [pendingCards, setPendingCards] = useState([])
  const [cardsLoading, setCardsLoading] = useState(true)
  const [stats, setStats] = useState([
    { title: 'Total Users', value: '0', change: '+0%', icon: Users, color: 'text-blue-500' },
    { title: 'Active Cards', value: '0', change: '+0%', icon: CreditCard, color: 'text-gold' },
    { title: 'Transactions', value: '0', change: '+0%', icon: TrendingUp, color: 'text-success' },
    { title: 'Total Revenue', value: '$0', change: '+0%', icon: DollarSign, color: 'text-purple-500' }
  ])

  useEffect(() => {
    fetchUsers()
    fetchPendingCards()
  }, [])

  const fetchPendingCards = async () => {
    try {
      setCardsLoading(true)
      const response = await api.get('/api/cards/admin/pending')
      setPendingCards(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch pending cards:', error)
      setPendingCards([])
    } finally {
      setCardsLoading(false)
    }
  }

  const handleApproveCard = async (cardId, action) => {
    try {
      await api.put(`/api/cards/${cardId}/approve`, { action })
      fetchPendingCards() // Refresh the list
    } catch (error) {
      console.error('Failed to approve card:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/users/')
      const userData = response.data.data || []
      setUsers(userData)

      // Update stats with real data
      setStats([
        { title: 'Total Users', value: userData.length.toString(), change: '+0%', icon: Users, color: 'text-blue-500' },
        { title: 'Active Cards', value: '0', change: '+0%', icon: CreditCard, color: 'text-gold' },
        { title: 'Transactions', value: '0', change: '+0%', icon: TrendingUp, color: 'text-success' },
        { title: 'Total Revenue', value: '$0', change: '+0%', icon: DollarSign, color: 'text-purple-500' }
      ])
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleUserStatus = async (userId, currentRole) => {
    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin'
      await api.put(`/api/users/${userId}`, { role: newRole })
      fetchUsers() // Refresh the list
    } catch (error) {
      console.error('Failed to update user:', error)
    }
  }

  const viewUserDetails = async (user) => {
    setSelectedUser(user)
    setDetailsLoading(true)
    try {
      const response = await api.get(`/api/users/${user._id}/details`)
      setUserDetails(response.data.data)
    } catch (error) {
      console.error('Failed to fetch user details:', error)
    } finally {
      setDetailsLoading(false)
    }
  }

  const closeUserDetails = () => {
    setSelectedUser(null)
    setUserDetails(null)
  }

  return (
    <div className="min-h-screen bg-cream dark:bg-primary-900 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-primary dark:text-cream">Admin Dashboard</h1>
          <p className="text-silver dark:text-silver">Manage your banking platform</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Card hover><CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div><p className="text-sm text-silver mb-1">{stat.title}</p><p className="text-2xl font-bold text-primary dark:text-cream mb-2">{stat.value}</p><p className="text-sm text-success">{stat.change}</p></div>
                  <div className={`p-3 rounded-xl bg-opacity-20 ${stat.color.replace('text-', 'bg-')}`}><stat.icon className={stat.color} size={24} /></div>
                </div>
              </CardContent></Card>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader>
              <h2 className="text-xl font-heading font-semibold text-primary dark:text-cream">User Management</h2>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading users...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-silver/30 dark:border-primary-700">
                        <th className="text-left py-3 px-4 text-primary dark:text-cream font-semibold">Name</th>
                        <th className="text-left py-3 px-4 text-primary dark:text-cream font-semibold">Email</th>
                        <th className="text-left py-3 px-4 text-primary dark:text-cream font-semibold">Role</th>
                        <th className="text-left py-3 px-4 text-primary dark:text-cream font-semibold">Joined</th>
                        <th className="text-left py-3 px-4 text-primary dark:text-cream font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user._id} className="border-b border-silver/20 dark:border-primary-700/50">
                          <td className="py-3 px-4 text-primary dark:text-cream">
                            {user.firstName} {user.lastName}
                          </td>
                          <td className="py-3 px-4 text-silver">{user.email}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.role === 'admin'
                                ? 'bg-gold/20 text-gold'
                                : 'bg-silver/20 text-silver'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-silver">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => viewUserDetails(user)}
                                variant="secondary"
                                size="sm"
                              >
                                <Eye size={14} className="mr-1" />
                                View Details
                              </Button>
                              <Button
                                onClick={() => toggleUserStatus(user._id, user.role)}
                                variant={user.role === 'admin' ? 'danger' : 'primary'}
                                size="sm"
                              >
                                {user.role === 'admin' ? (
                                  <>
                                    <UserX size={14} className="mr-1" />
                                    Remove Admin
                                  </>
                                ) : (
                                  <>
                                    <UserCheck size={14} className="mr-1" />
                                    Make Admin
                                  </>
                                )}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {users.length === 0 && (
                    <div className="text-center py-8 text-silver">No users found</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card>
            <CardHeader>
              <h2 className="text-xl font-heading font-semibold text-primary dark:text-cream">Card Approvals</h2>
            </CardHeader>
            <CardContent>
              {cardsLoading ? (
                <div className="text-center py-8">Loading pending cards...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-silver/30 dark:border-primary-700">
                        <th className="text-left py-3 px-4 text-primary dark:text-cream font-semibold">User</th>
                        <th className="text-left py-3 px-4 text-primary dark:text-cream font-semibold">Card Type</th>
                        <th className="text-left py-3 px-4 text-primary dark:text-cream font-semibold">Amount</th>
                        <th className="text-left py-3 px-4 text-primary dark:text-cream font-semibold">Requested</th>
                        <th className="text-left py-3 px-4 text-primary dark:text-cream font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingCards.map((card) => (
                        <tr key={card._id} className="border-b border-silver/20 dark:border-primary-700/50">
                          <td className="py-3 px-4 text-primary dark:text-cream">
                            {card.user.firstName} {card.user.lastName}
                          </td>
                          <td className="py-3 px-4 text-silver capitalize">
                            {card.cardType}
                          </td>
                          <td className="py-3 px-4 text-primary dark:text-cream">
                            ${card.purchaseAmount?.toFixed(2) || 'N/A'}
                          </td>
                          <td className="py-3 px-4 text-silver">
                            {new Date(card.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => handleApproveCard(card._id, 'approve')}
                                variant="primary"
                                size="sm"
                              >
                                <CheckCircle size={14} className="mr-1" />
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleApproveCard(card._id, 'decline')}
                                variant="danger"
                                size="sm"
                              >
                                <XCircle size={14} className="mr-1" />
                                Decline
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {pendingCards.length === 0 && (
                    <div className="text-center py-8 text-silver">No pending card approvals</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* User Details Modal */}
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={closeUserDetails}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-primary-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <Button onClick={closeUserDetails} variant="ghost" size="sm">
                      <ArrowLeft size={20} />
                    </Button>
                    <div>
                      <h2 className="text-2xl font-heading font-bold text-primary dark:text-cream">
                        {selectedUser.firstName} {selectedUser.lastName}
                      </h2>
                      <p className="text-silver">{selectedUser.email}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedUser.role === 'admin'
                      ? 'bg-gold/20 text-gold'
                      : 'bg-silver/20 text-silver'
                  }`}>
                    {selectedUser.role}
                  </span>
                </div>

                {detailsLoading ? (
                  <div className="text-center py-8">Loading user details...</div>
                ) : userDetails ? (
                  <div className="space-y-6">
                    {/* Profile Information */}
                    <Card>
                      <CardHeader>
                        <h3 className="text-lg font-heading font-semibold text-primary dark:text-cream">Profile Information</h3>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-start space-x-6">
                          <div className="flex-shrink-0">
                            {userDetails.user.profilePhoto ? (
                              <img
                                src={userDetails.user.profilePhoto}
                                alt="Profile"
                                className="w-24 h-24 rounded-full object-cover border-4 border-gold"
                              />
                            ) : (
                              <div className="w-24 h-24 rounded-full bg-gold/20 flex items-center justify-center">
                                <span className="text-2xl font-bold text-gold">
                                  {userDetails.user.firstName?.[0]}{userDetails.user.lastName?.[0]}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-silver mb-1">Full Name</label>
                              <p className="text-primary dark:text-cream font-medium">
                                {userDetails.user.firstName} {userDetails.user.lastName}
                              </p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-silver mb-1">Email</label>
                              <p className="text-primary dark:text-cream font-medium">{userDetails.user.email}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-silver mb-1">Phone Number</label>
                              <p className="text-primary dark:text-cream font-medium">
                                {userDetails.user.phone || 'Not provided'}
                              </p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-silver mb-1">Country</label>
                              <p className="text-primary dark:text-cream font-medium">
                                {userDetails.user.country || 'Not provided'}
                              </p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-silver mb-1">Username</label>
                              <p className="text-primary dark:text-cream font-medium">{userDetails.user.username}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-silver mb-1">Member Since</label>
                              <p className="text-primary dark:text-cream font-medium">
                                {new Date(userDetails.user.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Account Information */}
                    <Card>
                      <CardHeader>
                        <h3 className="text-lg font-heading font-semibold text-primary dark:text-cream">Account Information</h3>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {userDetails.accounts.map((account) => (
                            <div key={account._id} className="p-4 bg-cream dark:bg-primary-700/50 rounded-lg">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium text-primary dark:text-cream">{account.accountType} Account</span>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-silver">{account.accountNumber}</span>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(account.accountNumber)
                                      // You could add a toast notification here
                                    }}
                                    className="text-gold hover:text-gold-400 transition-colors text-sm underline"
                                    title="Copy account number"
                                  >
                                    Copy
                                  </button>
                                </div>
                              </div>
                              <p className="text-2xl font-bold text-success">
                                {formatAmount(account.balance, getCurrencyByCountry(userDetails.user.country))}
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Recent Transactions */}
                    <Card>
                      <CardHeader>
                        <h3 className="text-lg font-heading font-semibold text-primary dark:text-cream">Recent Transactions</h3>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {userDetails.transactions.map((transaction) => (
                            <div key={transaction._id} className="flex items-center justify-between p-3 bg-cream dark:bg-primary-700/50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-full ${
                                  transaction.type === 'deposit'
                                    ? 'bg-success/20 text-success'
                                    : 'bg-danger/20 text-danger'
                                }`}>
                                  {transaction.type === 'deposit' ? '↓' : '↑'}
                                </div>
                                <div>
                                  <p className="font-medium text-primary dark:text-cream">{transaction.description}</p>
                                  <p className="text-sm text-silver">{new Date(transaction.createdAt).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className={`font-semibold ${
                                  transaction.type === 'deposit' ? 'text-success' : 'text-danger'
                                }`}>
                                  {transaction.type === 'deposit' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                                </p>
                                <p className="text-xs text-silver capitalize">{transaction.status}</p>
                              </div>
                            </div>
                          ))}
                          {userDetails.transactions.length === 0 && (
                            <p className="text-center text-silver py-4">No recent transactions</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Cards */}
                    <Card>
                      <CardHeader>
                        <h3 className="text-lg font-heading font-semibold text-primary dark:text-cream">Cards</h3>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {userDetails.cards.map((card) => (
                            <div key={card._id} className="p-4 bg-gradient-to-r from-gold to-gold-400 text-primary rounded-lg">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <p className="font-medium">{card.cardType} Card</p>
                                  <p className="text-sm opacity-80">**** **** **** {card.cardNumber.slice(-4)}</p>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs ${
                                  card.purchase_status === 'active' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
                                }`}>
                                  {card.purchase_status}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Expires: {card.expiryMonth}/{card.expiryYear}</span>
                                <span>Limit: ${card.cardLimit}</span>
                              </div>
                            </div>
                          ))}
                          {userDetails.cards.length === 0 && (
                            <p className="text-center text-silver py-4 col-span-2">No cards found</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Loans */}
                    <Card>
                      <CardHeader>
                        <h3 className="text-lg font-heading font-semibold text-primary dark:text-cream">Loans</h3>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {userDetails.loans.map((loan) => (
                            <div key={loan._id} className="p-4 bg-cream dark:bg-primary-700/50 rounded-lg">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium text-primary dark:text-cream">{loan.loanType} Loan</span>
                                <span className={`px-2 py-1 rounded text-xs ${
                                  loan.status === 'active' ? 'bg-success/20 text-success' : 'bg-silver/20 text-silver'
                                }`}>
                                  {loan.status}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-silver">Amount</p>
                                  <p className="font-semibold text-primary dark:text-cream">${loan.loanAmount}</p>
                                </div>
                                <div>
                                  <p className="text-silver">Interest Rate</p>
                                  <p className="font-semibold text-primary dark:text-cream">{loan.interestRate}%</p>
                                </div>
                                <div>
                                  <p className="text-silver">Term</p>
                                  <p className="font-semibold text-primary dark:text-cream">{loan.loanTerm} months</p>
                                </div>
                                <div>
                                  <p className="text-silver">Monthly Payment</p>
                                  <p className="font-semibold text-primary dark:text-cream">${loan.monthlyPayment}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                          {userDetails.loans.length === 0 && (
                            <p className="text-center text-silver py-4">No loans found</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-8 text-silver">Failed to load user details</div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
export default AdminDashboard
