import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  CreditCard,
  TrendingUp,
  DollarSign,
  UserCheck,
  UserX,
  Eye,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Search,
  ShieldAlert,
  Copy,
  Check,
  Loader2,
  Wallet,
} from 'lucide-react'
import Card, { CardContent, CardHeader } from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Modal from '../../components/UI/Modal'
import AdminBlockButton from '../../components/AdminBlockButton'
import api from '../../services/api'
import { toast } from 'react-hot-toast'
import { getCurrencyByCountry, formatAmount } from '../../services/currency'

const STATUS_BADGE = {
  active: 'bg-success/15 text-success border-success/30',
  inactive: 'bg-danger/10 text-danger border-danger/30',
  blocked: 'bg-danger/10 text-danger border-danger/30',
}

const CARD_STATUS_BADGE = {
  active: 'bg-success/15 text-success border-success/30',
  pending: 'bg-gold/10 text-gold border-gold/40',
  pending_payment: 'bg-gold/10 text-gold border-gold/40',
  rejected: 'bg-danger/10 text-danger border-danger/30',
}

const AdminDashboard = () => {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [userDetails, setUserDetails] = useState(null)
  const [newBalance, setNewBalance] = useState('')
  const [balanceUpdateDescription, setBalanceUpdateDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [pendingCards, setPendingCards] = useState([])
  const [cardsLoading, setCardsLoading] = useState(true)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [selectedCardForRejection, setSelectedCardForRejection] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [activeTab, setActiveTab] = useState('users')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [copied, setCopied] = useState('')
  const [stats, setStats] = useState([
    { title: 'Total Users', value: '0', icon: Users, color: 'text-primary-600 dark:text-gold-300', bg: 'bg-primary-600/10' },
    { title: 'Active Cards', value: '0', icon: CreditCard, color: 'text-gold', bg: 'bg-gold/10' },
    { title: 'Pending Approvals', value: '0', icon: Clock, color: 'text-gold', bg: 'bg-gold/10' },
    { title: 'Total Revenue', value: '$0', icon: DollarSign, color: 'text-success', bg: 'bg-success/10' },
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

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/users/')
      const userData = response.data.data || []
      setUsers(userData)

      // Aggregate platform stats (best effort - never blocks the view)
      const details = await Promise.allSettled(
        userData.map((u) => api.get(`/api/users/${u._id}/details`).then((r) => r.data.data))
      )
      let revenue = 0
      let activeCards = 0
      details.forEach((res) => {
        if (res.status === 'fulfilled' && res.value) {
          revenue += (res.value.accounts || []).reduce((s, a) => s + (a.balance || 0), 0)
          activeCards += (res.value.cards || []).filter((c) => c.status === 'active').length
        }
      })

      setStats([
        { title: 'Total Users', value: userData.length.toString(), icon: Users, color: 'text-primary-600 dark:text-gold-300', bg: 'bg-primary-600/10' },
        { title: 'Active Cards', value: activeCards.toString(), icon: CreditCard, color: 'text-gold', bg: 'bg-gold/10' },
        { title: 'Pending Approvals', value: String(pendingCards.length || 0), icon: Clock, color: 'text-gold', bg: 'bg-gold/10' },
        { title: 'Total Balances', value: `$${revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: DollarSign, color: 'text-success', bg: 'bg-success/10' },
      ])
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
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
      toast.error('Failed to load user details.')
    } finally {
      setDetailsLoading(false)
    }
  }

  const closeUserDetails = () => {
    setSelectedUser(null)
    setUserDetails(null)
    setNewBalance('')
    setBalanceUpdateDescription('')
  }

  const toggleUserStatus = async (userId, currentRole) => {
    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin'
      await api.put(`/api/users/${userId}`, { role: newRole })
      toast.success(`Role updated to ${newRole}`)
      fetchUsers()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update role.')
    }
  }

  const handleSetAccountStatus = async (userId, status) => {
    try {
      await api.put(`/api/users/${userId}/account-status`, { status })
      toast.success(`Account status set to ${status}.`)
      fetchUsers()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update account status.')
    }
  }

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await api.delete(`/api/users/${userId}`)
        toast.success('User deleted.')
        fetchUsers()
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to delete user.')
      }
    }
  }

  const handleUpdateBalance = async (userId) => {
    const balanceValue = parseFloat(newBalance)
    if (isNaN(balanceValue) || balanceValue < 0) {
      toast.error('Please enter a valid positive number for the balance.')
      return
    }
    if (!balanceUpdateDescription) {
      toast.error('Please provide a description for the balance update.')
      return
    }
    try {
      await api.put(`/api/users/${userId}/balance`, {
        balance: balanceValue,
        description: balanceUpdateDescription,
      })
      toast.success('Balance updated successfully!')
      viewUserDetails(selectedUser)
      setNewBalance('')
      setBalanceUpdateDescription('')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update balance.')
    }
  }

  const handleApproveCard = async (cardId, action) => {
    if (action === 'decline') {
      const card = pendingCards.find((c) => c._id === cardId)
      setSelectedCardForRejection(card)
      setShowRejectModal(true)
      return
    }
    try {
      await api.put(`/api/cards/${cardId}/approve`, { action })
      toast.success('Card application approved.')
      fetchPendingCards()
      fetchUsers()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to approve card.')
    }
  }

  const handleRejectCard = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection.')
      return
    }
    try {
      await api.put(`/api/cards/${selectedCardForRejection._id}/approve`, {
        action: 'decline',
        rejectionReason: rejectionReason.trim(),
      })
      toast.success('Card application rejected.')
      setShowRejectModal(false)
      setSelectedCardForRejection(null)
      setRejectionReason('')
      fetchPendingCards()
      fetchUsers()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reject card.')
    }
  }

  const copyText = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(id)
      toast.success('Copied to clipboard!')
      setTimeout(() => setCopied(''), 1500)
    } catch (error) {
      toast.error('Failed to copy.')
    }
  }

  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim()
    return users.filter((u) => {
      const matchesSearch =
        !term ||
        `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase().includes(term) ||
        (u.email || '').toLowerCase().includes(term) ||
        (u.username || '').toLowerCase().includes(term)
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'blocked' && u.isBlocked) ||
        (statusFilter === 'inactive' && !u.isBlocked && u.accountStatus === 'inactive') ||
        (statusFilter === 'active' && !u.isBlocked && u.accountStatus === 'active')
      return matchesSearch && matchesStatus
    })
  }, [users, searchTerm, statusFilter])

  return (
    <div className="min-h-screen bg-cream dark:bg-primary-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-primary dark:text-cream">Admin Dashboard</h1>
          <p className="text-silver dark:text-silver">Manage your banking platform</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}>
              <div className="rounded-2xl bg-white dark:bg-primary-800 border border-silver/30 dark:border-primary-600 p-4 sm:p-5 flex items-center gap-4 shadow-lux-card">
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                  <stat.icon className={stat.color} size={22} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-silver mb-0.5">{stat.title}</p>
                  <p className="text-lg sm:text-2xl font-bold text-primary dark:text-cream truncate">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-8 inline-flex rounded-2xl bg-white dark:bg-primary-800 border border-silver/30 dark:border-primary-600 p-1.5 shadow-lux-card">
          {[
            { id: 'users', label: 'User Management', icon: Users },
            { id: 'cards', label: 'Card Approvals', icon: CreditCard },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-silver hover:text-primary dark:hover:text-cream'
              }`}
            >
              <tab.icon size={16} />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.id === 'users' ? 'Users' : 'Cards'}</span>
            </button>
          ))}
        </div>

        {activeTab === 'users' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center gap-3">
                <h2 className="text-xl font-heading font-semibold text-primary dark:text-cream flex items-center gap-2">
                  <Users size={18} className="text-gold" />
                  User Management
                </h2>
                <div className="flex flex-col sm:flex-row gap-2 sm:ml-auto">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-silver" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search name or email..."
                      className="w-full sm:w-56 pl-9 pr-3 py-2 bg-primary-100 dark:bg-primary-700 border border-silver/40 dark:border-primary-600 rounded-xl text-sm focus:ring-2 focus:ring-gold focus:border-transparent"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-primary-100 dark:bg-primary-700 border border-silver/40 dark:border-primary-600 rounded-xl text-sm focus:ring-2 focus:ring-gold"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="animate-spin text-gold" size={32} />
                    <p className="text-silver mt-3">Loading users...</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-700 flex items-center justify-center mx-auto mb-4">
                      <Users className="text-silver" size={32} />
                    </div>
                    <p className="text-primary dark:text-cream font-medium">No users found</p>
                    <p className="text-silver text-sm mt-1">Try adjusting your search or filters.</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop table */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-silver/30 dark:border-primary-700">
                            <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-silver font-semibold">User</th>
                            <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-silver font-semibold">Role</th>
                            <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-silver font-semibold">Status</th>
                            <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-silver font-semibold">Joined</th>
                            <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-silver font-semibold">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map((user) => {
                            const statusKey = user.isBlocked ? 'blocked' : user.accountStatus || 'active'
                            return (
                              <tr key={user._id} className="border-b border-silver/20 dark:border-primary-700/50 hover:bg-cream dark:hover:bg-primary-700/30 transition-colors">
                                <td className="py-3 px-3">
                                  <div className="flex items-center gap-3">
                                    {user.profilePhoto ? (
                                      <img src={user.profilePhoto} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                                    ) : (
                                      <div className="w-9 h-9 rounded-full bg-gold/15 text-gold flex items-center justify-center font-bold text-xs shrink-0">
                                        {(user.firstName?.[0] || '') + (user.lastName?.[0] || '')}
                                      </div>
                                    )}
                                    <div className="min-w-0">
                                      <p className="text-sm font-semibold text-primary dark:text-cream truncate">
                                        {user.firstName} {user.lastName}
                                      </p>
                                      <p className="text-xs text-silver truncate">{user.email}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-3">
                                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                                    user.role === 'admin'
                                      ? 'bg-gold/10 text-gold border-gold/40'
                                      : 'bg-silver/15 text-silver border-silver/30'
                                  }`}>
                                    {user.role}
                                  </span>
                                </td>
                                <td className="py-3 px-3">
                                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_BADGE[statusKey] || STATUS_BADGE.active}`}>
                                    {statusKey}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-sm text-silver">
                                  {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td className="py-3 px-3">
                                  <div className="flex flex-wrap gap-2">
                                    <Button onClick={() => viewUserDetails(user)} variant="secondary" size="sm">
                                      <Eye size={14} className="mr-1" />
                                      Details
                                    </Button>
                                    <Button
                                      onClick={() => toggleUserStatus(user._id, user.role)}
                                      variant={user.role === 'admin' ? 'danger' : 'primary'}
                                      size="sm"
                                    >
                                      {user.role === 'admin' ? <UserX size={14} className="mr-1" /> : <UserCheck size={14} className="mr-1" />}
                                      {user.role === 'admin' ? 'Remove' : 'Make Admin'}
                                    </Button>
                                    <Button
                                      onClick={() => handleSetAccountStatus(user._id, user.accountStatus === 'inactive' ? 'active' : 'inactive')}
                                      variant={user.accountStatus === 'inactive' ? 'primary' : 'secondary'}
                                      size="sm"
                                    >
                                      {user.accountStatus === 'inactive' ? <UserCheck size={14} className="mr-1" /> : <ShieldAlert size={14} className="mr-1" />}
                                      {user.accountStatus === 'inactive' ? 'Activate' : 'Deactivate'}
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                    {/* Mobile cards */}
                    <div className="md:hidden space-y-3">
                      {filteredUsers.map((user) => {
                        const statusKey = user.isBlocked ? 'blocked' : user.accountStatus || 'active'
                        return (
                          <div key={user._id} className="rounded-2xl bg-cream dark:bg-primary-700/50 border border-silver/20 dark:border-primary-600 p-4">
                            <div className="flex items-center gap-3 mb-3">
                              {user.profilePhoto ? (
                                <img src={user.profilePhoto} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gold/15 text-gold flex items-center justify-center font-bold text-xs shrink-0">
                                  {(user.firstName?.[0] || '') + (user.lastName?.[0] || '')}
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-primary dark:text-cream truncate">{user.firstName} {user.lastName}</p>
                                <p className="text-xs text-silver truncate">{user.email}</p>
                              </div>
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border shrink-0 ${STATUS_BADGE[statusKey] || STATUS_BADGE.active}`}>
                                {statusKey}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button onClick={() => viewUserDetails(user)} variant="secondary" size="sm">Details</Button>
                              <Button onClick={() => toggleUserStatus(user._id, user.role)} variant={user.role === 'admin' ? 'danger' : 'primary'} size="sm">
                                {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                              </Button>
                              <Button
                                onClick={() => handleSetAccountStatus(user._id, user.accountStatus === 'inactive' ? 'active' : 'inactive')}
                                variant={user.accountStatus === 'inactive' ? 'primary' : 'secondary'}
                                size="sm"
                              >
                                {user.accountStatus === 'inactive' ? 'Activate' : 'Deactivate'}
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
        {activeTab === 'cards' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <h2 className="text-xl font-heading font-semibold text-primary dark:text-cream flex items-center gap-2">
                  <CreditCard size={18} className="text-gold" />
                  Card Approvals
                </h2>
              </CardHeader>
              <CardContent>
                {cardsLoading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="animate-spin text-gold" size={32} />
                    <p className="text-silver mt-3">Loading pending applications...</p>
                  </div>
                ) : pendingCards.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-700 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="text-success" size={32} />
                    </div>
                    <p className="text-primary dark:text-cream font-medium">No pending card applications</p>
                    <p className="text-silver text-sm mt-1">All caught up. New applications will appear here.</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop table */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-silver/30 dark:border-primary-700">
                            <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-silver font-semibold">Applicant</th>
                            <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-silver font-semibold">Card</th>
                            <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-silver font-semibold">Fee</th>
                            <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-silver font-semibold">Applied</th>
                            <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-silver font-semibold">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pendingCards.map((card) => (
                            <tr key={card._id} className="border-b border-silver/20 dark:border-primary-700/50 hover:bg-cream dark:hover:bg-primary-700/30 transition-colors">
                              <td className="py-3 px-3">
                                <p className="text-sm font-semibold text-primary dark:text-cream">
                                  {card.user?.firstName} {card.user?.lastName}
                                </p>
                                <p className="text-xs text-silver">{card.user?.email}</p>
                              </td>
                              <td className="py-3 px-3">
                                <span className="px-2.5 py-1 rounded-full text-xs font-semibold border bg-gold/10 text-gold border-gold/40 capitalize">
                                  {card.category || 'Standard'} {card.type || card.cardType || 'card'}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-sm font-semibold text-primary dark:text-cream">
                                ${(card.fee || card.purchaseAmount || 0).toFixed(2)}
                              </td>
                              <td className="py-3 px-3 text-sm text-silver">
                                {new Date(card.createdAt).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-3">
                                <div className="flex gap-2">
                                  <Button onClick={() => handleApproveCard(card._id, 'approve')} variant="brand" size="sm">
                                    <CheckCircle2 size={14} className="mr-1" />
                                    Approve
                                  </Button>
                                  <Button onClick={() => handleApproveCard(card._id, 'decline')} variant="danger" size="sm">
                                    <XCircle size={14} className="mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {/* Mobile cards */}
                    <div className="md:hidden space-y-3">
                      {pendingCards.map((card) => (
                        <div key={card._id} className="rounded-2xl bg-cream dark:bg-primary-700/50 border border-silver/20 dark:border-primary-600 p-4">
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <div className="min-w-0">
                              <p className="font-semibold text-primary dark:text-cream truncate">
                                {card.user?.firstName} {card.user?.lastName}
                              </p>
                              <p className="text-xs text-silver truncate">{card.user?.email}</p>
                            </div>
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold border bg-gold/10 text-gold border-gold/40 capitalize shrink-0">
                              {card.category || 'Standard'} {card.type || card.cardType || 'card'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm mb-3">
                            <span className="text-silver">Fee · ${(card.fee || card.purchaseAmount || 0).toFixed(2)}</span>
                            <span className="text-silver">Applied · {new Date(card.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={() => handleApproveCard(card._id, 'approve')} variant="brand" size="sm" className="flex-1">
                              <CheckCircle2 size={14} className="mr-1" />
                              Approve
                            </Button>
                            <Button onClick={() => handleApproveCard(card._id, 'decline')} variant="danger" size="sm" className="flex-1">
                              <XCircle size={14} className="mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* User details modal */}
        <AnimatePresence>
          {selectedUser && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={closeUserDetails}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-primary-800 w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl shadow-lux-card border border-silver/20 dark:border-primary-700"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="sticky top-0 z-10 bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 px-6 py-5 text-white flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={closeUserDetails}
                      aria-label="Back"
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors shrink-0"
                    >
                      <ArrowLeft size={18} />
                    </button>
                    <div className="min-w-0">
                      <h2 className="font-heading font-bold text-lg truncate">
                        {selectedUser.firstName} {selectedUser.lastName}
                      </h2>
                      <p className="text-white/70 text-xs truncate">{selectedUser.email}</p>
                    </div>
                  </div>
                  {detailsLoading && <Loader2 size={20} className="animate-spin text-gold-300 shrink-0" />}
                </div>

                <div className="p-6">
                  {userDetails ? (
                    <div className="space-y-6">
                      {/* Profile info */}
                      <div>
                        <h3 className="text-sm font-heading font-semibold text-primary dark:text-cream mb-3 flex items-center gap-2">
                          <UserCheck size={16} className="text-gold" /> Profile Information
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          {userDetails.user.profilePhoto ? (
                            <img src={userDetails.user.profilePhoto} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-gold shrink-0" />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-gold/15 text-gold flex items-center justify-center font-bold text-lg shrink-0">
                              {(userDetails.user.firstName?.[0] || '') + (userDetails.user.lastName?.[0] || '')}
                            </div>
                          )}
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1">
                            <div>
                              <p className="text-xs text-silver mb-0.5">Phone</p>
                              <p className="text-sm font-medium text-primary dark:text-cream">{userDetails.user.phone || '—'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-silver mb-0.5">Country</p>
                              <p className="text-sm font-medium text-primary dark:text-cream capitalize">{userDetails.user.country || '—'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-silver mb-0.5">Member Since</p>
                              <p className="text-sm font-medium text-primary dark:text-cream">{new Date(userDetails.user.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-silver mb-0.5">Role</p>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                                userDetails.user.role === 'admin' ? 'bg-gold/10 text-gold border-gold/40' : 'bg-silver/15 text-silver border-silver/30'
                              }`}>{userDetails.user.role}</span>
                            </div>
                            <div>
                              <p className="text-xs text-silver mb-0.5">Account Status</p>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                                userDetails.user.isBlocked ? 'bg-danger/10 text-danger border-danger/30'
                                  : userDetails.user.accountStatus === 'inactive' ? 'bg-danger/10 text-danger border-danger/30'
                                  : 'bg-success/15 text-success border-success/30'
                              }`}>
                                {userDetails.user.isBlocked ? 'Blocked' : userDetails.user.accountStatus || 'active'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Accounts + balance update */}
                      <div className="bg-primary-50 dark:bg-primary-700/60 rounded-2xl p-4">
                        <h3 className="text-sm font-heading font-semibold text-primary dark:text-cream mb-3 flex items-center gap-2">
                          <Wallet size={16} className="text-gold" /> Accounts
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {userDetails.accounts.map((account) => (
                            <div key={account._id} className="bg-white dark:bg-primary-800 border border-silver/30 dark:border-primary-600 rounded-xl p-4">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-primary dark:text-cream capitalize">{account.accountType} Account</span>
                                <button
                                  onClick={() => copyText(account.accountNumber, `acc-${account._id}`)}
                                  className="flex items-center gap-1 text-xs text-gold hover:underline"
                                >
                                  {copied === `acc-${account._id}` ? <Check size={12} /> : <Copy size={12} />}
                                  {copied === `acc-${account._id}` ? 'Copied' : account.accountNumber}
                                </button>
                              </div>
                              <p className="text-xl font-bold text-success">
                                {formatAmount(account.balance, getCurrencyByCountry(userDetails.user.country))}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 pt-4 border-t border-silver/30 dark:border-primary-600">
                          <p className="text-sm font-medium text-primary dark:text-cream mb-2">Update Balance</p>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="number"
                              placeholder="New balance"
                              value={newBalance}
                              onChange={(e) => setNewBalance(e.target.value)}
                              className="flex-1 px-3 py-2 bg-white dark:bg-primary-800 border border-silver/40 dark:border-primary-600 rounded-xl text-sm focus:ring-2 focus:ring-gold"
                            />
                            <input
                              type="text"
                              placeholder="Description"
                              value={balanceUpdateDescription}
                              onChange={(e) => setBalanceUpdateDescription(e.target.value)}
                              className="flex-1 px-3 py-2 bg-white dark:bg-primary-800 border border-silver/40 dark:border-primary-600 rounded-xl text-sm focus:ring-2 focus:ring-gold"
                            />
                            <Button variant="brand" size="sm" onClick={() => handleUpdateBalance(selectedUser._id)}>
                              Save
                            </Button>
                          </div>
                        </div>
                      </div>
                      {/* Cards */}
                      <div>
                        <h3 className="text-sm font-heading font-semibold text-primary dark:text-cream mb-3 flex items-center gap-2">
                          <CreditCard size={16} className="text-gold" /> Cards
                        </h3>
                        {userDetails.cards.length === 0 ? (
                          <p className="text-sm text-silver bg-primary-50 dark:bg-primary-700/60 rounded-xl p-4 text-center">No cards found</p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {userDetails.cards.map((card) => (
                              <div key={card._id} className="bg-primary-50 dark:bg-primary-700/60 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-primary dark:text-cream capitalize">
                                    {card.category || 'Standard'} {card.type || card.cardType || 'card'}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                    CARD_STATUS_BADGE[card.status] || 'bg-silver/15 text-silver border-silver/30'
                                  }`}>{card.status?.replace('_', ' ')}</span>
                                </div>
                                <p className="font-mono text-sm text-silver">•••• {card.cardNumber?.slice(-4)}</p>
                                {card.rejectionReason && (
                                  <p className="text-xs text-danger mt-1">Reason: {card.rejectionReason}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Loans */}
                      <div>
                        <h3 className="text-sm font-heading font-semibold text-primary dark:text-cream mb-3 flex items-center gap-2">
                          <TrendingUp size={16} className="text-gold" /> Loans
                        </h3>
                        {userDetails.loans.length === 0 ? (
                          <p className="text-sm text-silver bg-primary-50 dark:bg-primary-700/60 rounded-xl p-4 text-center">No loans found</p>
                        ) : (
                          <div className="space-y-2">
                            {userDetails.loans.map((loan) => (
                              <div key={loan._id} className="flex items-center justify-between bg-primary-50 dark:bg-primary-700/60 rounded-xl px-4 py-3">
                                <div>
                                  <p className="text-sm font-medium text-primary dark:text-cream">${Number(loan.loanAmount).toLocaleString()}</p>
                                  <p className="text-xs text-silver">{loan.termMonths || loan.loanTerm || '—'} months · ${Number(loan.monthlyPayment).toFixed(2)}/mo</p>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                                  loan.status === 'active' || loan.status === 'approved'
                                    ? 'bg-success/15 text-success border-success/30'
                                    : 'bg-silver/15 text-silver border-silver/30'
                                }`}>{loan.status}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Admin actions */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        <AdminBlockButton
                          userId={selectedUser._id}
                          initialStatus={selectedUser.isBlocked}
                          onStatusChange={fetchUsers}
                        />
                        <Button
                          onClick={() => handleSetAccountStatus(selectedUser._id, selectedUser.accountStatus === 'inactive' ? 'active' : 'inactive')}
                          variant={selectedUser.accountStatus === 'inactive' ? 'primary' : 'secondary'}
                          size="sm"
                        >
                          {selectedUser.accountStatus === 'inactive' ? 'Set Active' : 'Set Inactive'}
                        </Button>
                        <Button onClick={() => handleDelete(selectedUser._id)} variant="danger" size="sm">
                          <Trash2 size={14} className="mr-1" />
                          Delete User
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-silver">Failed to load user details.</div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Reject card application modal */}
        <Modal
          isOpen={showRejectModal}
          onClose={() => {
            setShowRejectModal(false)
            setSelectedCardForRejection(null)
            setRejectionReason('')
          }}
          title="Reject Card Application"
          size="md"
        >
          <div className="space-y-5">
            <div className="bg-primary-50 dark:bg-primary-700 rounded-xl p-4">
              <p className="text-sm text-silver mb-1">Applicant</p>
              <p className="font-semibold text-primary dark:text-cream">
                {selectedCardForRejection?.user?.firstName} {selectedCardForRejection?.user?.lastName}
              </p>
              <p className="text-xs text-silver mt-1">
                {selectedCardForRejection?.category || 'Standard'} {selectedCardForRejection?.type || selectedCardForRejection?.cardType || 'card'} · ${Number(selectedCardForRejection?.fee || selectedCardForRejection?.purchaseAmount || 0).toFixed(2)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary dark:text-cream mb-2">
                Rejection Reason <span className="text-danger">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a clear reason for rejecting this card application..."
                rows={4}
                className="w-full px-4 py-3 bg-primary-100 dark:bg-primary-700 border border-silver/30 dark:border-primary-600 rounded-xl focus:ring-2 focus:ring-danger focus:border-transparent resize-none"
              />
              <p className="text-xs text-silver mt-1">This reason will be visible to the user.</p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => {
                  setShowRejectModal(false)
                  setSelectedCardForRejection(null)
                  setRejectionReason('')
                }}
              >
                Cancel
              </Button>
              <Button variant="danger" className="flex-1" onClick={handleRejectCard}>
                <XCircle size={16} className="mr-2" />
                Reject Application
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}

export default AdminDashboard
