// @ts-check
import React, { useState, useEffect, useCallback } from 'react'
import {
  Wallet,
  Search,
  Copy,
  Check,
  Loader2,
  History,
  ShieldCheck,
  User,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../../services/api'
import { shortAddress } from '../../services/walletNetworks'
import { walletList } from '../../services/walletList'
import Card, { CardContent, CardHeader } from '../UI/Card'
import Button from '../UI/Button'
import Modal from '../UI/Modal'
import WalletIcon from '../Wallet/WalletIcon'

const STATUS_BADGE = {
  connected: 'bg-success/15 text-success border-success/30',
  disconnected: 'bg-silver/15 text-silver border-silver/30',
}

/**
 * WalletsAdminPanel - admin view of every user's wallet connections.
 * Displays ONLY public wallet metadata (provider, address, network, dates) and
 * the name the user entered when connecting. Admin never sees any wallet
 * secret - none exist in the system by design.
 */
const WalletsAdminPanel = () => {
  const [connections, setConnections] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [q, setQ] = useState('')
  const [provider, setProvider] = useState('')
  const [network, setNetwork] = useState('')
  const [status, setStatus] = useState('')
  const [copied, setCopied] = useState('')
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailWithdrawals, setDetailWithdrawals] = useState([])
  const [activeFilter, setActiveFilter] = useState(false)

  const fetchConnections = useCallback(async (pageNumber = 1, opts = {}) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(pageNumber))
      if (opts.q) params.set('q', opts.q)
      if (opts.provider) params.set('provider', opts.provider)
      if (opts.network) params.set('network', opts.network)
      if (opts.status) params.set('status', opts.status)
      const response = await api.get(`/api/wallets/admin/connections?${params.toString()}`)
      setConnections(response.data.data || [])
      setPage(response.data.pagination?.page || 1)
      setTotalPages(response.data.pagination?.pages || 1)
    } catch (error) {
      setConnections([])
      toast.error(error?.response?.data?.error || 'Failed to load wallet connections.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConnections(1, {})
  }, [fetchConnections])

  const applyFilters = () => {
    setActiveFilter(true)
    fetchConnections(1, { q: q.trim(), provider, network, status })
  }

  const clearFilters = () => {
    setQ('')
    setProvider('')
    setNetwork('')
    setStatus('')
    setActiveFilter(false)
    fetchConnections(1, {})
  }

  const copyAddress = async (id, address) => {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(id)
      setTimeout(() => setCopied(''), 1500)
    } catch (e) {
      toast.error('Could not copy address.')
    }
  }

  const openDetail = async (connection) => {
    setDetail(connection)
    setDetailLoading(true)
    try {
      const response = await api.get(`/api/wallets/admin/connections/${connection._id}`)
      setDetail(response.data.data.connection)
      setDetailWithdrawals(response.data.data.withdrawals || [])
    } catch (error) {
      toast.error(error?.response?.data?.error || 'Failed to load wallet details.')
    } finally {
      setDetailLoading(false)
    }
  }

  return (
    <div>
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="flex flex-col lg:flex-row lg:items-end gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-silver mb-1.5">Search user / address / provider</label>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-silver" />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                placeholder="Name, email, 0x..., Trust Wallet..."
                className="w-full pl-9 pr-3 py-2.5 bg-primary-100 dark:bg-primary-700 border border-silver/40 dark:border-primary-600 rounded-xl text-sm focus:ring-2 focus:ring-gold focus:border-transparent"
              />
            </div>
          </div>
          <div className="w-full sm:w-44">
            <label className="block text-xs font-medium text-silver mb-1.5">Provider</label>
            <select value={provider} onChange={(e) => setProvider(e.target.value)}
              className="w-full px-3 py-2.5 bg-primary-100 dark:bg-primary-700 border border-silver/40 dark:border-primary-600 rounded-xl text-sm focus:ring-2 focus:ring-gold focus:border-transparent">
              <option value="">All providers</option>
              {walletList.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div className="w-full sm:w-40">
            <label className="block text-xs font-medium text-silver mb-1.5">Network</label>
            <select value={network} onChange={(e) => setNetwork(e.target.value)}
              className="w-full px-3 py-2.5 bg-primary-100 dark:bg-primary-700 border border-silver/40 dark:border-primary-600 rounded-xl text-sm focus:ring-2 focus:ring-gold focus:border-transparent">
              <option value="">All networks</option>
              {['ethereum','polygon','arbitrum','bsc','optimism','base','avalanche','solana','tron','bitcoin','ton','near','cosmos','polkadot','cardano','aptos','sui','stacks','stellar'].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div className="w-full sm:w-36">
            <label className="block text-xs font-medium text-silver mb-1.5">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2.5 bg-primary-100 dark:bg-primary-700 border border-silver/40 dark:border-primary-600 rounded-xl text-sm focus:ring-2 focus:ring-gold focus:border-transparent">
              <option value="">All statuses</option>
              <option value="connected">Connected</option>
              <option value="disconnected">Disconnected</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button variant="brand" size="sm" className="px-4" onClick={applyFilters}>Filter</Button>
            {activeFilter && (
              <Button variant="ghost" size="sm" className="px-4" onClick={clearFilters}>Clear</Button>
            )}
          </div>
        </CardContent>
      </Card>

            {/* Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center gap-2">
          <h3 className="text-lg font-heading font-semibold text-primary dark:text-cream flex items-center gap-2">
            <Wallet size={18} className="text-gold" /> Wallet Connections
          </h3>
          <span className="text-xs text-silver ml-0 sm:ml-auto">{connections.length} result(s)</span>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center"><Loader2 size={28} className="animate-spin text-gold mx-auto" /></div>
          ) : connections.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-700 flex items-center justify-center mx-auto mb-3">
                <Wallet size={28} className="text-silver" />
              </div>
              <p className="font-medium text-primary dark:text-cream">No wallet connections found</p>
              <p className="text-sm text-silver mt-1">Users' connected wallets will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-cream dark:bg-primary-700/50 text-[11px] uppercase tracking-wider text-silver">
                  <tr>
                    <th className="px-4 py-3 font-semibold">User</th>
                    <th className="px-4 py-3 font-semibold">Wallet name</th>
                    <th className="px-4 py-3 font-semibold">Provider</th>
                    <th className="px-4 py-3 font-semibold">Address</th>
                    <th className="px-4 py-3 font-semibold">Network</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Connected</th>
                    <th className="px-4 py-3 font-semibold text-right">Last used</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-silver/15 dark:divide-primary-700">
                  {connections.map((conn) => {
                    const wallet = walletList.find((w) => w.id === conn.walletProviderId)
                    return (
                      <tr key={conn._id}
                        onClick={() => openDetail(conn)}
                        className="hover:bg-cream dark:hover:bg-primary-700/40 cursor-pointer transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-primary-600/10 text-primary-600 dark:text-gold-300 flex items-center justify-center text-xs font-bold shrink-0">
                              {((conn.user?.firstName?.[0] || '') + (conn.user?.lastName?.[0] || '')).toUpperCase() || 'U'}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-primary dark:text-cream truncate">
                                {conn.user?.firstName} {conn.user?.lastName}
                              </p>
                              <p className="text-xs text-silver truncate">{conn.user?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-primary dark:text-cream truncate flex items-center gap-1.5">
                            <User size={13} className="text-gold shrink-0" />
                            {conn.walletOwnerName || '—'}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {wallet && <WalletIcon wallet={wallet} size="sm" showRing={false} />}
                            <span className="text-sm text-primary dark:text-cream">{conn.walletProviderName}</span>
                            {conn.isSimulated && (
                              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-gold/10 text-gold border border-gold/40">
                                Simulated
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={(e) => { e.stopPropagation(); copyAddress(conn._id, conn.walletAddress) }}
                            className="inline-flex items-center gap-1.5 font-mono text-sm text-primary-600 dark:text-gold-300 hover:underline" title={conn.walletAddress}>
                            {shortAddress(conn.walletAddress)}
                            {copied === conn._id ? <Check size={13} className="text-success" /> : <Copy size={13} className="text-silver" />}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-sm text-primary dark:text-cream capitalize">{conn.network}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${STATUS_BADGE[conn.connectionStatus] || 'bg-silver/15 text-silver'}`}>
                            {conn.connectionStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-silver">{new Date(conn.connectedAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-right text-sm text-silver">{conn.lastUsedAt ? new Date(conn.lastUsedAt).toLocaleDateString() : '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-silver/15 dark:border-primary-700 flex items-center justify-between">
              <Button variant="ghost" size="sm" disabled={page <= 1}
                onClick={() => fetchConnections(page - 1, { q: q.trim(), provider, network, status })}>Previous</Button>
              <span className="text-xs text-silver">Page {page} of {totalPages}</span>
              <Button variant="ghost" size="sm" disabled={page >= totalPages}
                onClick={() => fetchConnections(page + 1, { q: q.trim(), provider, network, status })}>Next</Button>
            </div>
          )}
        </CardContent>
      </Card>

            {/* Detail modal */}
      <Modal isOpen={!!detail} onClose={() => setDetail(null)} size="lg" title="Wallet Connection Details">
        {detail && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {(() => {
                const wallet = walletList.find((w) => w.id === detail.walletProviderId)
                return wallet ? <WalletIcon wallet={wallet} size="lg" /> : <Wallet size={26} className="text-gold" />
              })()}
              <div className="min-w-0 flex-1">
                <p className="font-heading font-semibold text-lg text-primary dark:text-cream">{detail.walletProviderName}</p>
                {detail.walletOwnerName && (
                  <p className="text-sm font-medium text-primary dark:text-cream mt-0.5 flex items-center gap-1.5">
                    <User size={14} className="text-gold shrink-0" /> {detail.walletOwnerName}
                  </p>
                )}
                <p className="font-mono text-sm text-primary-600 dark:text-gold-300 break-all">{detail.walletAddress}</p>
                <p className="text-xs text-silver mt-1 capitalize">{detail.network} · Connected {new Date(detail.connectedAt).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                {detail.isSimulated && (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase border bg-gold/10 text-gold border-gold/40">
                    Simulated
                  </span>
                )}
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase border ${STATUS_BADGE[detail.connectionStatus] || 'bg-silver/15 text-silver'}`}>
                  {detail.connectionStatus}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 bg-primary-50 dark:bg-primary-700/60 rounded-xl p-3">
              <ShieldCheck size={16} className="text-success shrink-0 mt-0.5" />
              <p className="text-xs text-silver leading-relaxed">
                Only public wallet metadata and the name the user entered are stored. No recovery phrase, private key or wallet password exists anywhere in the system.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-heading font-semibold text-primary dark:text-cream mb-3 flex items-center gap-2">
                <History size={15} className="text-gold" /> Associated Withdrawals
              </h4>
              {detailLoading ? (
                <div className="py-8 text-center"><Loader2 size={22} className="animate-spin text-gold mx-auto" /></div>
              ) : detailWithdrawals.length === 0 ? (
                <p className="text-sm text-silver bg-cream dark:bg-primary-700/50 rounded-xl p-4 text-center">No withdrawals to this wallet</p>
              ) : (
                <div className="space-y-2">
                  {detailWithdrawals.map((tx) => (
                    <div key={tx._id} className="flex items-center justify-between bg-cream dark:bg-primary-700/50 rounded-xl px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-primary dark:text-cream">-${Number(tx.amount).toFixed(2)}</p>
                        <p className="text-xs text-silver">{new Date(tx.createdAt).toLocaleString()}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-success/15 text-success capitalize">{tx.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default WalletsAdminPanel