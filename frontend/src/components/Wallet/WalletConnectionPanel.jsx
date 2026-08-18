// @ts-check
import React, { useState, useEffect } from 'react'
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  PlugZap,
  Unplug,
  Copy,
  Check,
  Network,
  User,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { getNetwork, shortAddress } from '../../services/walletNetworks'
import { useWallet } from '../../context/WalletContext'
import WalletIcon from './WalletIcon'
import Button from '../UI/Button'

/**
 * WalletConnectionPanel - the wallet connection screen.
 * Lets the user pick a network (from the wallets' supported chains), type the
 * name they want shown for this wallet, then connects. The connection is
 * simulated instantly (demo mode) - no real wallet extension or app is needed.
 *
 * Only the user-entered name plus public wallet metadata (provider, address,
 * network) are saved. No seed phrases, private keys or recovery phrases are
 * ever requested, transmitted or stored.
 */
const WalletConnectionPanel = ({ wallet, onBack, onConnected, isModal = true }) => {
  const { connection, disconnect, simulateConnect } = useWallet()

  const defaultNetworkId = (wallet.networks || []).includes(connection?.network)
    ? connection.network
    : wallet.networks[0]
  const [networkId, setNetworkId] = useState(defaultNetworkId)
  const [ownerName, setOwnerName] = useState(connection?.walletOwnerName || '')
  const [nameError, setNameError] = useState('')
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState('')
  const [disconnecting, setDisconnecting] = useState(false)
  const [copied, setCopied] = useState(false)

  const network = getNetwork(networkId)
  const alreadyConnected = connection && connection.walletProviderId === wallet.id && connection.network === networkId

  useEffect(() => {
    const next = (wallet.networks || []).includes(connection?.network)
      ? connection.network
      : wallet.networks[0]
    setNetworkId(next)
    setError('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet.id])

  const validateName = () => {
    const value = String(ownerName || '').trim()
    if (!value) {
      setNameError('Please enter your name so we can identify this wallet.')
      return false
    }
    if (value.length > 1000) {
      setNameError('Name must be 1000 characters or fewer.')
      return false
    }
    setNameError('')
    return true
  }

  const handleConnect = async () => {
    if (!network) return
    if (!validateName()) return
    setError('')
    setConnecting(true)
    try {
      const saved = await simulateConnect(wallet, network, String(ownerName).trim())
      toast.success(`${wallet.name} connected`)
      onConnected?.(saved)
    } catch (connectError) {
      const rawMessage = connectError?.message || 'Connection failed. Please try again.'
      setError(rawMessage)
    } finally {
      setConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    if (!connection) return
    setDisconnecting(true)
    try {
      await disconnect()
      toast.success('Wallet disconnected')
      onBack?.()
    } catch (disconnectError) {
      toast.error(disconnectError?.message || 'Failed to disconnect wallet.')
    } finally {
      setDisconnecting(false)
    }
  }

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

  const header = (
    <div className="relative bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 px-6 py-6 text-center overflow-hidden">
      <div className="pointer-events-none absolute -top-16 -right-10 w-44 h-44 rounded-full bg-gold/20 blur-3xl" />
      <div className="relative flex flex-col items-center">
        <WalletIcon wallet={wallet} size="lg" showRing />
        <h3 className="text-lg font-heading font-semibold text-white mt-3">Connect {wallet.name}</h3>
        <p className="text-xs text-white/60 mt-1 max-w-xs">
          Approve the connection inside your wallet. Your keys never leave it.
        </p>
      </div>
    </div>
  )

  return (
    <>
      {header}

      <div className="p-6">
      {connecting ? (
        <div className="text-center py-8">
          <Loader2 size={38} className="animate-spin text-gold mx-auto" />
          <h4 className="font-heading font-semibold text-lg text-primary dark:text-cream mt-4">
            Connecting...
          </h4>
          <p className="text-sm text-silver mt-2">
            Connecting <span className="font-semibold text-primary dark:text-cream">{wallet.name}</span> on{' '}
            <span className="font-mono">{network?.name}</span>. Your wallet is being set up.
          </p>
          <p className="text-xs text-silver/70 mt-4 flex items-center justify-center gap-1.5">
            <PlugZap size={13} className="text-gold" /> No seed phrases or private keys are ever requested.
          </p>
        </div>
      ) : alreadyConnected ? (
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-success/15 text-success flex items-center justify-center mx-auto">
            <CheckCircle2 size={30} />
          </div>
          <h4 className="font-heading font-semibold text-lg text-primary dark:text-cream mt-3">Wallet connected</h4>
          {connection.walletOwnerName && (
            <p className="text-sm font-medium text-primary dark:text-cream mt-1.5 flex items-center justify-center gap-1.5">
              <User size={13} className="text-gold" /> {connection.walletOwnerName}
            </p>
          )}
          <button
            onClick={copyAddress}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-100 dark:bg-primary-700 text-primary dark:text-cream font-mono text-sm hover:bg-primary-200 dark:hover:bg-primary-600 transition-colors"
          >
            {shortAddress(connection.walletAddress)}
            {copied ? <Check size={15} className="text-success" /> : <Copy size={15} className="text-silver" />}
          </button>
          <p className="text-xs text-silver mt-1.5 capitalize">{network?.name} · {wallet.name}</p>

          <div className="flex flex-col sm:flex-row gap-2 mt-6">
            <Button variant="ghost" className="flex-1" onClick={handleDisconnect} disabled={disconnecting}>
              {disconnecting ? <Loader2 size={15} className="animate-spin mr-1" /> : <Unplug size={15} className="mr-1" />}
              Disconnect
            </Button>
            <Button variant="ghost" className="flex-1" onClick={onBack}>
              <RefreshCw size={15} className="mr-1" /> Change wallet
            </Button>
            <Button variant="brand" className="flex-1" onClick={() => onConnected?.(connection)}>
              Continue <ArrowLeft size={15} className="ml-1 rotate-180" />
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Name input - the only identifying info we store about this wallet */}
          <div>
            <label className="block text-sm font-medium text-primary dark:text-cream mb-2 flex items-center gap-2">
              <User size={15} className="text-gold" /> Your name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-silver" size={16} />
              <input
                type="text"
                value={ownerName}
                onChange={(e) => { setOwnerName(e.target.value); setNameError('') }}
                placeholder="Enter the name to save for this wallet"
                maxLength={1000}
                className="w-full pl-9 pr-3 py-3 bg-primary-100 dark:bg-primary-700 border border-silver/40 dark:border-primary-600 rounded-xl text-sm focus:ring-2 focus:ring-gold focus:border-transparent"
              />
            </div>
            {nameError && <p className="text-xs text-danger mt-1.5">{nameError}</p>}
            <p className="text-xs text-silver mt-2">
              This name is shown to our support team so we can identify your wallet. No wallet secrets are stored.
            </p>
          </div>

          {/* Network selector - only networks this wallet actually supports */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-primary dark:text-cream mb-2 flex items-center gap-2">
              <Network size={15} className="text-gold" /> Network
            </label>
            <select
              value={networkId}
              onChange={(e) => { setNetworkId(e.target.value); setError('') }}
              className="w-full px-4 py-3 bg-primary-100 dark:bg-primary-700 border border-silver/40 dark:border-primary-600 rounded-xl text-sm focus:ring-2 focus:ring-gold focus:border-transparent"
            >
              {(wallet.networks || []).map((nid) => {
                const n = getNetwork(nid)
                return (
                  <option key={nid} value={nid}>
                    {n ? `${n.name} (${n.shortName})` : nid}
                  </option>
                )
              })}
            </select>
            <p className="text-xs text-silver mt-2">
              Only networks supported by {wallet.name} are listed.
            </p>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2 bg-danger-light dark:bg-danger/10 border border-danger/30 rounded-xl p-3">
              <AlertCircle size={16} className="text-danger shrink-0 mt-0.5" />
              <p className="text-sm text-danger-dark dark:text-danger-light">{error}</p>
            </div>
          )}

          <div className="mt-5 flex flex-col sm:flex-row gap-2">
            <Button variant="ghost" className="flex-1" onClick={onBack}>
              <ArrowLeft size={15} className="mr-1" /> Change wallet
            </Button>
            <Button
              variant="brand"
              className="flex-1"
              onClick={handleConnect}
              disabled={!network || !String(ownerName || '').trim()}
            >
              <PlugZap size={16} className="mr-1" /> Connect
            </Button>
          </div>

          <p className="text-xs text-silver text-center mt-4">
            This is a simulated connection — no real wallet is required. Your recovery phrase or private key
            is never requested, stored or shared.
          </p>
        </>
      )}
      </div>
    </>
  )
}
export default WalletConnectionPanel