// @ts-check
import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Wallet,
  Unplug,
  RefreshCw,
  Copy,
  Check,
  Loader2,
  ArrowLeftRight,
  ShieldCheck,
  History,
  Plus,
  User,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useWallet } from '../../context/WalletContext'
import { walletAPI } from '../../services/walletApi'
import { getNetwork, shortAddress } from '../../services/walletNetworks'
import { getWalletById } from '../../services/walletList'
import Card, { CardContent, CardHeader } from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Modal from '../../components/UI/Modal'
import WalletIcon from '../../components/Wallet/WalletIcon'
import WalletPicker from '../../components/Wallet/WalletPicker'
import WalletConnectionPanel from '../../components/Wallet/WalletConnectionPanel'
import WalletWithdrawForm from '../../components/Wallet/WalletWithdrawForm'

/**
 * /wallet - manage your connected wallet, withdraw to it and review history.
 * Only public wallet data is shown; no secrets exist anywhere in this feature.
 */
const WalletPage = () => {
  const { connection, loading, refresh, disconnect } = useWallet()
  const [showPicker, setShowPicker] = useState(false)
  const [connectingWallet, setConnectingWallet] = useState(null)
  const [withdrawals, setWithdrawals] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [showWithdraw, setShowWithdraw] = useState(false)

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true)
    try {
      const response = await walletAPI.getWithdrawals(1, 20)
      setWithdrawals(response.data || [])
    } catch (e) {
      setWithdrawals([])
    } finally {
      setHistoryLoading(false)
    }
  }, [])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  const copyAddress = async () => {
    if (!connection) return
    try {
      await navigator.clipboard.writeText(connection.walletAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (e) {
      toast.error('Could not copy address.')
    }
  }

  const handleDisconnect = async () => {
    setDisconnecting(true)
    try {
      await disconnect()
      toast.success('Wallet disconnected')
    } catch (e) {
      toast.error(e?.message || 'Failed to disconnect wallet.')
    } finally {
      setDisconnecting(false)
    }
  }

  const wallet = getWalletById(connection?.walletProviderId)
  const network = getNetwork(connection?.network)

  return (
    <div className="min-h-screen bg-cream dark:bg-primary-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-primary dark:text-cream mb-2">Wallet</h1>
          <p className="text-silver">Connect a wallet and withdraw funds securely.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: connection card + withdraw */}
          <div className="lg:col-span-2 space-y-6">
            {loading ? (
              <Card><CardContent className="py-12 text-center"><Loader2 size={28} className="animate-spin text-gold mx-auto" /></CardContent></Card>
            ) : connection ? (
              <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <h3 className="text-lg font-heading font-semibold text-primary dark:text-cream flex items-center gap-2">
                    <Wallet size={18} className="text-gold" /> Connected Wallet
                  </h3>
                  <span className="flex items-center gap-2 ml-0 sm:ml-auto">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-success/15 text-success border border-success/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> Connected
                    </span>
                  </span>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {wallet && <WalletIcon wallet={wallet} size="xl" />}
                    <div className="min-w-0 flex-1">
                      <p className="font-heading font-semibold text-lg text-primary dark:text-cream">{connection.walletProviderName}</p>
                      {connection.walletOwnerName && (
                        <p className="text-sm font-medium text-primary dark:text-cream mt-0.5 flex items-center gap-1.5">
                          <User size={14} className="text-gold shrink-0" /> {connection.walletOwnerName}
                        </p>
                      )}
                      <button onClick={copyAddress} className="inline-flex items-center gap-2 font-mono text-sm text-primary-600 dark:text-gold-300 hover:underline mt-1" title="Copy full address">
                        {connection.walletAddress}
                        {copied ? <Check size={14} className="text-success" /> : <Copy size={14} className="text-silver" />}
                      </button>
                    </div>
                    <span className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary-600/10 text-primary-600 dark:text-gold-300 border border-primary-600/20 capitalize">
                      {network?.name || connection.network}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-cream dark:bg-primary-700/60 rounded-xl p-3">
                      <p className="text-[11px] text-silver mb-1">Wallet name</p>
                      <p className="text-sm font-semibold text-primary dark:text-cream truncate">{connection.walletOwnerName || '—'}</p>
                    </div>
                    <div className="bg-cream dark:bg-primary-700/60 rounded-xl p-3">
                      <p className="text-[11px] text-silver mb-1">Network</p>
                      <p className="text-sm font-semibold text-primary dark:text-cream capitalize">{network?.name || connection.network}</p>
                    </div>
                    <div className="bg-cream dark:bg-primary-700/60 rounded-xl p-3">
                      <p className="text-[11px] text-silver mb-1">Connected</p>
                      <p className="text-sm font-semibold text-primary dark:text-cream">{new Date(connection.connectedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-cream dark:bg-primary-700/60 rounded-xl p-3">
                      <p className="text-[11px] text-silver mb-1">Last used</p>
                      <p className="text-sm font-semibold text-primary dark:text-cream">
                        {connection.lastUsedAt ? new Date(connection.lastUsedAt).toLocaleDateString() : '—'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="ghost" className="flex-1" onClick={handleDisconnect} disabled={disconnecting}>
                      {disconnecting ? <Loader2 size={15} className="animate-spin mr-1" /> : <Unplug size={15} className="mr-1" />} Disconnect
                    </Button>
                    <Button variant="secondary" className="flex-1" onClick={() => setShowPicker(true)}>
                      <RefreshCw size={15} className="mr-1" /> Change wallet
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-16">
                  <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-700 flex items-center justify-center mx-auto mb-4">
                    <Wallet size={34} className="text-gold" />
                  </div>
                  <h3 className="text-lg font-heading font-semibold text-primary dark:text-cream">No wallet connected</h3>
                  <p className="text-sm text-silver mt-1 max-w-sm mx-auto">
                    Connect a wallet to withdraw funds to your own address. Connection happens inside your wallet — we never
                    see your keys.
                  </p>
                  <Button variant="brand" className="mt-6" onClick={() => setShowPicker(true)}>
                    <Plus size={16} className="mr-1" /> Connect a wallet
                  </Button>
                </CardContent>
              </Card>
            )}

            {connection && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-heading font-semibold text-primary dark:text-cream flex items-center gap-2">
                    <ArrowLeftRight size={18} className="text-gold" /> Withdraw to Wallet
                  </h3>
                </CardHeader>
                <CardContent>
                  {showWithdraw ? (
                    <WalletWithdrawForm
                      connection={connection}
                      onCancel={() => setShowWithdraw(false)}
                      onDone={() => { setShowWithdraw(false); loadHistory() }}
                    />
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-sm text-silver">Send funds from your account balance to your connected wallet.</p>
                      <Button variant="brand" className="mt-5" onClick={() => setShowWithdraw(true)}>
                        <ArrowLeftRight size={16} className="mr-1" /> Start withdrawal
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <Card>
              <CardHeader>
                <h3 className="text-lg font-heading font-semibold text-primary dark:text-cream flex items-center gap-2">
                  <History size={18} className="text-gold" /> Wallet Withdrawals
                </h3>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="py-10 text-center"><Loader2 size={26} className="animate-spin text-gold mx-auto" /></div>
                ) : withdrawals.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="w-14 h-14 rounded-full bg-primary-100 dark:bg-primary-700 flex items-center justify-center mx-auto mb-3">
                      <History size={24} className="text-silver" />
                    </div>
                    <p className="text-sm text-silver">No wallet withdrawals yet</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[480px] overflow-y-auto">
                    {withdrawals.map((tx) => (
                      <div key={tx._id} className="p-3 rounded-xl bg-cream dark:bg-primary-700/50 border border-silver/20 dark:border-primary-600">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-primary dark:text-cream">-${Number(tx.amount).toFixed(2)}</p>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-success/15 text-success capitalize">{tx.status}</span>
                        </div>
                        <p className="text-xs text-silver mt-1 break-all font-mono">{tx.walletAddress ? shortAddress(tx.walletAddress) : ''}</p>
                        <p className="text-[11px] text-silver mt-1 capitalize">{tx.walletNetwork || ''} · {new Date(tx.createdAt).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="mt-5 flex items-start gap-2 bg-primary-50 dark:bg-primary-700/60 rounded-2xl p-4">
              <ShieldCheck size={18} className="text-success shrink-0 mt-0.5" />
              <p className="text-xs text-silver leading-relaxed">
                <span className="font-semibold text-primary dark:text-cream">Your keys stay with you.</span> Primewave Bank
                never stores recovery phrases, private keys or wallet passwords. We only keep the public wallet address you
                approved.
              </p>
            </div>
          </div>
        </div>

        {/* Pick + connect modals */}
        <WalletPicker
          isOpen={showPicker}
          onClose={() => setShowPicker(false)}
          onSelect={(w) => { setShowPicker(false); setConnectingWallet(w) }}
        />
        {connectingWallet && (
          <Modal isOpen onClose={() => setConnectingWallet(null)}>
            <WalletConnectionPanel
              wallet={connectingWallet}
              onBack={() => setConnectingWallet(null)}
              onConnected={() => { setConnectingWallet(null); refresh(); loadHistory() }}
            />
          </Modal>
        )}
      </div>
    </div>
  )
}

export default WalletPage