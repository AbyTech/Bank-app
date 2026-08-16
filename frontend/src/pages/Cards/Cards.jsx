import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  CreditCard,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  LayoutGrid,
  Sparkles,
  Info,
} from 'lucide-react'
import Button from '../../components/UI/Button'
import DebitCard from '../../components/UI/DebitCard'
import CardCatalog from './CardCatalog'
import ApplyCardModal from './ApplyCardModal'
import { useAuth } from '../../hooks/useAuth'
import api from '../../services/api'

const CATEGORY_VARIANTS = { standard: 'teal', gold: 'gold', platinum: 'platinum', black: 'black' }

const STATUS_META = {
  active: { label: 'Active', cls: 'bg-success/15 text-success border-success/30' },
  pending: { label: 'Pending', cls: 'bg-gold/10 text-gold border-gold/40' },
  pending_payment: { label: 'Payment Pending', cls: 'bg-gold/10 text-gold border-gold/40' },
  rejected: { label: 'Rejected', cls: 'bg-danger/10 text-danger border-danger/30' },
  blocked: { label: 'Blocked', cls: 'bg-danger/10 text-danger border-danger/30' },
  expired: { label: 'Expired', cls: 'bg-silver/20 text-silver border-silver/40' },
}

const formatCardExpiry = (date) => {
  if (!date) return '--/--'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '--/--'
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(-2)}`
}

const Cards = () => {
  const { user } = useAuth()
  const [cards, setCards] = useState([])
  const [categories, setCategories] = useState({ virtual: [], physical: [] })
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('mine') // 'mine' | 'new'
  const [cardType, setCardType] = useState('virtual')
  const [selectedCategory, setSelectedCategory] = useState(null)

  useEffect(() => {
    if (user) {
      fetchCards()
      fetchCategories()
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

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/cards/categories')
      setCategories(response.data.data || { virtual: [], physical: [] })
    } catch (error) {
      console.error('Failed to fetch card categories:', error)
    }
  }

  const handleToggleCardNumber = (card) => {
    setCards((prev) => prev.map((c) =>
      c._id === card._id ? { ...c, showFullNumber: !c.showFullNumber } : c
    ))
  }

  const statusCounts = {
    total: cards.length,
    active: cards.filter((c) => c.status === 'active').length,
    pending: cards.filter((c) => c.approvalStatus === 'pending').length,
    rejected: cards.filter((c) => c.status === 'rejected').length,
  }

  return (
    <div className="min-h-screen bg-cream dark:bg-primary-900 pt-16 lg:pt-0">
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

        {/* Tab switcher */}
        <div className="mb-8 inline-flex rounded-2xl bg-white dark:bg-primary-800 border border-silver/30 dark:border-primary-600 p-1.5 shadow-lux-card">
          <button
            onClick={() => setView('mine')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              view === 'mine'
                ? 'bg-primary-600 text-white shadow-md'
                : 'text-silver hover:text-primary dark:hover:text-cream'
            }`}
          >
            <LayoutGrid size={16} />
            <span className="hidden sm:inline">My Cards</span>
            <span className="sm:hidden">Mine</span>
          </button>
          <button
            onClick={() => setView('new')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              view === 'new'
                ? 'bg-primary-600 text-white shadow-md'
                : 'text-silver hover:text-primary dark:hover:text-cream'
            }`}
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Get a New Card</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>

        {view === 'mine' ? (
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Cards', value: statusCounts.total, icon: CreditCard, color: 'text-primary-600 dark:text-gold-300' },
                { label: 'Active', value: statusCounts.active, icon: CheckCircle2, color: 'text-success' },
                { label: 'Pending', value: statusCounts.pending, icon: Clock, color: 'text-gold' },
                { label: 'Rejected', value: statusCounts.rejected, icon: XCircle, color: 'text-danger' },
              ].map((stat, index) => (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                  <div className="rounded-2xl bg-white dark:bg-primary-800 border border-silver/30 dark:border-primary-600 p-4 sm:p-5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                      <stat.icon size={18} className={stat.color} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-silver">{stat.label}</p>
                      <p className="text-xl font-bold text-primary dark:text-cream">{stat.value}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold" />
                <p className="text-silver mt-4">Loading your cards...</p>
              </div>
            ) : cards.length === 0 ? (
              <div className="rounded-3xl bg-white dark:bg-primary-800 border border-silver/30 dark:border-primary-600 p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-5">
                  <CreditCard className="text-gold" size={36} />
                </div>
                <h3 className="text-xl font-heading font-semibold text-primary dark:text-cream mb-2">No Cards Yet</h3>
                <p className="text-silver text-sm mb-6 max-w-sm mx-auto">
                  Order your first virtual or physical card to unlock secure online payments and more.
                </p>
                <Button variant="brand" onClick={() => setView('new')}>
                  <Sparkles size={16} className="mr-2" />
                  Get a Card
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {cards.map((card, index) => {
                  const statusMeta = STATUS_META[card.status] || { label: card.status?.replace('_', ' ') || 'Unknown', cls: 'bg-silver/20 text-silver border-silver/40' }
                  const StatusIcon = statusMeta.icon || Info
                  const isRejected = card.status === 'rejected'
                  return (
                    <motion.div
                      key={card._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.06 }}
                    >
                      <div className="rounded-3xl bg-white dark:bg-primary-800 border border-silver/30 dark:border-primary-600 shadow-lux-card overflow-hidden h-full flex flex-col">
                        <div className="p-4 sm:p-5">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusMeta.cls}`}>
                                <StatusIcon size={12} />
                                {statusMeta.label}
                              </span>
                              {card.cardPinSet && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold bg-primary-600/10 text-primary-600 dark:text-gold-300 border border-primary-600/30" title="Card PIN set">
                                  <ShieldCheck size={11} />
                                  PIN
                                </span>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-[10px] uppercase tracking-wider text-silver">{card.type || 'card'}</p>
                              <p className="text-sm font-bold text-primary dark:text-cream capitalize">{card.category || 'standard'}</p>
                            </div>
                          </div>

                          <DebitCard
                            cardNumber={card.cardNumber}
                            cardName={card.cardName}
                            expiry={formatCardExpiry(card.expiryDate)}
                            cvv={card.cvv}
                            status={card.status}
                            showNumber={card.showFullNumber}
                            onToggleShow={() => handleToggleCardNumber(card)}
                            variant={CATEGORY_VARIANTS[card.category] || 'teal'}
                            categoryLabel={card.category}
                          />

                          <div className="mt-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-silver">Issuance Fee</span>
                              <span className="font-semibold text-primary dark:text-cream">
                                {card.fee ? `$${card.fee.toFixed(2)}` : card.purchaseAmount ? `$${Number(card.purchaseAmount).toFixed(2)}` : '—'}
                              </span>
                            </div>
                            {card.status === 'pending' && card.createdAt && (
                              <div className="flex justify-between">
                                <span className="text-silver">Applied</span>
                                <span className="font-semibold text-primary dark:text-cream">{new Date(card.createdAt).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>

                          {isRejected && card.rejectionReason && (
                            <div className="mt-4 bg-danger-light dark:bg-danger/10 border border-danger/30 rounded-xl p-3">
                              <p className="text-xs font-semibold text-danger mb-1">Rejection Reason</p>
                              <p className="text-xs text-danger-dark dark:text-danger-light">{card.rejectionReason}</p>
                              {card.rejectionDate && (
                                <p className="text-[10px] text-silver mt-1">
                                  {new Date(card.rejectionDate).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          )}

                          {card.status === 'active' && (
                            <div className="mt-4 flex items-center gap-2 bg-success/10 border border-success/30 rounded-xl p-3">
                              <CheckCircle2 size={14} className="text-success shrink-0" />
                              <p className="text-xs text-primary dark:text-cream">
                                Card is active and ready to use.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Virtual / Physical toggle */}
            <div className="inline-flex rounded-2xl bg-white dark:bg-primary-800 border border-silver/30 dark:border-primary-600 p-1.5 shadow-lux-card">
              {['virtual', 'physical'].map((t) => (
                <button
                  key={t}
                  onClick={() => setCardType(t)}
                  className={`flex items-center gap-2 px-5 sm:px-8 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${
                    cardType === t
                      ? 'bg-gold text-white shadow-lux-gold'
                      : 'text-silver hover:text-primary dark:hover:text-cream'
                  }`}
                >
                  {t === 'virtual' ? <CreditCard size={16} /> : <CreditCard size={16} className="rotate-0" />}
                  {t} Card
                </button>
              ))}
            </div>

            <CardCatalog
              type={cardType}
              categories={categories}
              onSelectCategory={(category) => setSelectedCategory(category)}
            />

            <p className="text-xs text-silver text-center pb-4">
              The issuance fee is paid to the bank through another account — contact our support team for the payment details. Applications expire automatically after 7 days if not paid for.
            </p>
          </div>
        )}

        {/* Card application wizard */}
        <ApplyCardModal
          isOpen={!!selectedCategory}
          onClose={() => setSelectedCategory(null)}
          type={cardType}
          category={selectedCategory}
          onSuccess={() => {
            setSelectedCategory(null)
            fetchCards()
          }}
        />
      </div>
    </div>
  )
}

export default Cards
