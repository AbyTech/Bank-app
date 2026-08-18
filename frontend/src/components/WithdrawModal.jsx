// @ts-check
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Wallet,
  CreditCard,
  ArrowRight,
  CheckCircle2,
  Loader2,
  ShieldCheck,
} from 'lucide-react'
import Modal from './UI/Modal'
import Button from './UI/Button'
import { useWallet } from '../context/WalletContext'
import { shortAddress } from '../services/walletNetworks'
import { getWalletById } from '../services/walletList'
import WalletPicker from './Wallet/WalletPicker'
import WalletConnectionPanel from './Wallet/WalletConnectionPanel'
import WalletWithdrawForm from './Wallet/WalletWithdrawForm'
import CardWithdrawForm from './Wallet/CardWithdrawForm'
import WalletIcon from './Wallet/WalletIcon'

/**
 * WithdrawModal - the unified withdrawal flow.
 * Users choose between the existing card/bank method and the new
 * "Withdraw to Wallet" method (connect wallet -> pick network -> amount).
 */
const WithdrawModal = ({ isOpen, onClose, onSuccess }) => {
  const { connection, loading, refresh } = useWallet()
  const [step, setStep] = useState('method') // method | card | wallet | success
  const [wallet, setWallet] = useState(null)
  const [result, setResult] = useState(null)

  useEffect(() => {
    if (isOpen) {
      setStep('method')
      setWallet(null)
      setResult(null)
      refresh()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const handleClose = () => {
    setStep('method')
    setWallet(null)
    setResult(null)
    onClose()
  }

  const handleDone = (transaction) => {
    setResult(transaction)
    setStep('success')
    onSuccess?.(transaction)
  }

  const methodCard = (icon, title, desc, onClick, accent) => (
    <motion.button
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`group text-left w-full flex items-start gap-4 p-5 rounded-2xl border bg-white dark:bg-primary-800 transition-all hover:shadow-lux-card ${accent}`}
    >
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 text-white flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-heading font-semibold text-primary dark:text-cream">{title}</p>
        <p className="text-sm text-silver mt-1 leading-relaxed">{desc}</p>
      </div>
      <ArrowRight size={18} className="text-silver group-hover:text-gold transition-colors shrink-0 mt-3" />
    </motion.button>
  )

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} size="md">
        {step === 'success' && result ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-success/15 text-success flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="font-heading font-bold text-xl text-primary dark:text-cream mt-4">Withdrawal complete</h3>
            <p className="text-sm text-silver mt-2">
              {result.walletAddress ? (
                <>
                  <span className="font-semibold text-primary dark:text-cream">
                    ${Number(result.amount).toFixed(2)}
                  </span>{' '}
                  was sent to {shortAddress(result.walletAddress)} ({result.walletNetwork}).
                </>
              ) : (
                <>
                  <span className="font-semibold text-primary dark:text-cream">
                    ${Number(result.amount).toFixed(2)}
                  </span>{' '}
                  was withdrawn from your account.
                </>
              )}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 mt-6">
              <Button variant="ghost" className="flex-1" onClick={handleClose}>Done</Button>
              <Button variant="brand" className="flex-1" onClick={() => setStep('method')}>Withdraw again</Button>
            </div>
          </div>
        ) : step === 'card' ? (
          <CardWithdrawForm onDone={handleDone} onCancel={() => setStep('method')} />
        ) : step === 'wallet' ? (
          connection ? (
            <WalletWithdrawForm connection={connection} onDone={handleDone} onCancel={() => setStep('method')} />
          ) : (
            <div className="text-center py-8">
              <Loader2 size={30} className="animate-spin text-gold mx-auto" />
              <p className="text-sm text-silver mt-3">Checking your wallet connection...</p>
            </div>
          )
        ) : (
          <>
            <h3 className="font-heading font-bold text-xl text-primary dark:text-cream text-center mb-1">
              Withdraw funds
            </h3>
            <p className="text-sm text-silver text-center mb-5">Choose a withdrawal method</p>

            {connection && (
              <div className="flex items-center gap-3 bg-primary-50 dark:bg-primary-700/60 rounded-2xl p-3 mb-4 border border-silver/25 dark:border-primary-600">
                {(() => {
                  const w = getWalletById(connection.walletProviderId)
                  return w ? <WalletIcon wallet={w} size="sm" /> : <Wallet size={18} className="text-gold" />
                })()}
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-silver">Connected wallet</p>
                  <p className="text-sm font-semibold text-primary dark:text-cream truncate">
                    {connection.walletProviderName}{' '}
                    <span className="font-mono text-silver">· {shortAddress(connection.walletAddress)}</span>
                  </p>
                </div>
                <button onClick={() => setStep('wallet')} className="text-xs font-semibold text-gold hover:underline shrink-0">
                  Withdraw
                </button>
              </div>
            )}

            <div className="space-y-3">
              {methodCard(
                <Wallet size={22} />,
                'Withdraw to Wallet',
                'Send funds directly to your crypto wallet (Ethereum, Solana, BNB Chain and more). Connect safely through your wallet.',
                () => setStep('picker'),
                'border-gold/40 hover:border-gold'
              )}
              {methodCard(
                <CreditCard size={22} />,
                'To Card / Bank',
                'Withdraw to your linked card or bank account using the existing method.',
                () => setStep('card'),
                'border-silver/30 hover:border-primary-400'
              )}
            </div>

            <div className="mt-5 flex items-start gap-2 bg-primary-50 dark:bg-primary-700/60 rounded-xl p-3">
              <ShieldCheck size={15} className="text-success shrink-0 mt-0.5" />
              <p className="text-xs text-silver leading-relaxed">
                Wallet withdrawals use secure connection protocols. Primewave Bank never requests or stores recovery phrases,
                private keys or wallet passwords.
              </p>
            </div>
          </>
        )}
      </Modal>

      {/* Wallet picker modal */}
      {step === 'picker' && (
        <WalletPicker
          isOpen
          onClose={() => setStep('method')}
          onSelect={(selectedWallet) => {
            setWallet(selectedWallet)
            setStep('connect')
          }}
        />
      )}

      {/* Wallet connection modal */}
      {step === 'connect' && wallet && (
        <Modal isOpen onClose={() => setStep('picker')}>
          <WalletConnectionPanel
            wallet={wallet}
            onBack={() => setStep('picker')}
            onConnected={() => setStep('wallet')}
          />
        </Modal>
      )}
    </>
  )
}

export default WithdrawModal