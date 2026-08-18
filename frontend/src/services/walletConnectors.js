/**
 * PrimeWave Bank - Wallet connectors
 * ---------------------------------------------------------------------------
 * Legitimate wallet connection mechanisms only. The user's keys NEVER leave
 * their wallet: for browser wallets we use the official injected provider
 * (EIP-1193 `window.ethereum` / `window.solana`) which asks the user to approve
 * the connection inside their own wallet, and for mobile/hardware wallets we
 * use WalletConnect when the app is configured with a WalletConnect Cloud
 * project id. No seed phrases, no private keys - ever.
 *
 * Every connector returns ONLY public data: { address, network, chainId }.
 */

import { buildChainParams } from './walletNetworks'

export class WalletConnectionError extends Error {
  constructor(code, message, details = {}) {
    super(message)
    this.name = 'WalletConnectionError'
    this.code = code
    this.details = details
  }
}

const err = (code, message, details) => new WalletConnectionError(code, message, details)

export const WALLET_ERRORS = {
  NO_PROVIDER: 'NO_PROVIDER',
  USER_REJECTED: 'USER_REJECTED',
  NETWORK_UNSUPPORTED: 'NETWORK_UNSUPPORTED',
  NETWORK_SWITCH_FAILED: 'NETWORK_SWITCH_FAILED',
  WALLETCONNECT_NOT_CONFIGURED: 'WALLETCONNECT_NOT_CONFIGURED',
  WALLETCONNECT_FAILED: 'WALLETCONNECT_FAILED',
  GENERIC: 'GENERIC',
}

/** Browser extension wallets that expose window.ethereum (EIP-1193). */
export function hasInjectedEVM() {
  return typeof window !== 'undefined' && Boolean(window.ethereum)
}

/** Solana browser extensions expose window.solana. */
export function hasInjectedSolana() {
  return typeof window !== 'undefined' && Boolean(window.solana)
}

export function getWalletConnectProjectId() {
  return import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || ''
}

/**
 * Connect via the injected EVM provider (MetaMask, Rabby, Brave, ...).
 * Asks the wallet itself to approve the connection (eth_requestAccounts) and
 * switches/adds the target chain. The wallet never reveals a secret to us.
 */
export async function connectInjectedEVM(network) {
  if (!hasInjectedEVM()) {
    throw err(WALLET_ERRORS.NO_PROVIDER, 'No compatible browser wallet extension detected.')
  }
  const provider = window.ethereum

  let accounts = null
  try {
    accounts = await provider.request({ method: 'eth_requestAccounts' })
  } catch (requestError) {
    if (requestError && (requestError.code === 4001 || requestError.code === -32002)) {
      throw err(WALLET_ERRORS.USER_REJECTED, 'Connection was rejected in your wallet. Please try again and approve the request.', { code: requestError.code })
    }
    throw err(WALLET_ERRORS.GENERIC, 'Failed to reach your wallet. Please check the extension and try again.', { original: String(requestError?.message || requestError) })
  }

  const address = Array.isArray(accounts) && accounts[0] ? accounts[0] : null
  if (!address) {
    throw err(WALLET_ERRORS.GENERIC, 'Unable to read your wallet address. Please reconnect your wallet.')
  }

  let chainId = null
  if (network.family === 'evm') {
    try {
      await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: network.chainId }] })
      chainId = network.chainId
    } catch (switchError) {
      if (switchError && switchError.code === 4902) {
        // Chain not added to the wallet yet - send the add request (user approves).
        try {
          await provider.request({ method: 'wallet_addEthereumChain', params: [buildChainParams(network)] })
          await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: network.chainId }] })
          chainId = network.chainId
        } catch (addError) {
          if (addError && addError.code === 4001) {
            throw err(WALLET_ERRORS.USER_REJECTED, 'Network was not added in your wallet. Please approve it to continue.')
          }
          throw err(WALLET_ERRORS.NETWORK_SWITCH_FAILED, `Please switch to ${network.name} inside your wallet and try again.`)
        }
      } else if (switchError && switchError.code === 4001) {
        throw err(WALLET_ERRORS.USER_REJECTED, `Please switch to ${network.name} inside your wallet to continue.`)
      } else {
        throw err(WALLET_ERRORS.NETWORK_SWITCH_FAILED, `Please switch to ${network.name} inside your wallet and try again.`)
      }
    }
  }

  return { address, network: network.id, chainId }
}

/**
 * Connect via an injected Solana provider (Phantom, Solflare, Backpack, ...).
 */
export async function connectInjectedSolana() {
  if (!hasInjectedSolana()) {
    throw err(WALLET_ERRORS.NO_PROVIDER, 'No compatible Solana browser wallet extension detected.')
  }
  const provider = window.solana

  try {
    if (!provider.isConnected) {
      await provider.connect()
    }
  } catch (connectError) {
    if (connectError && connectError.code === 4001) {
      throw err(WALLET_ERRORS.USER_REJECTED, 'Connection was rejected in your wallet. Please approve the request to continue.')
    }
    throw err(WALLET_ERRORS.GENERIC, 'Failed to reach your wallet. Please check the extension and try again.', { original: String(connectError?.message || connectError) })
  }

  const address = provider.publicKey ? String(provider.publicKey.toString()) : null
  if (!address) {
    throw err(WALLET_ERRORS.GENERIC, 'Unable to read your wallet address. Please reconnect your wallet.')
  }
  return { address, network: 'solana', chainId: null }
}

/**
 * Connect via WalletConnect (mobile / hardware wallets).
 * Requires VITE_WALLETCONNECT_PROJECT_ID (WalletConnect Cloud). The SDK is
 * imported lazily so the app builds and runs fine even when it is not
 * installed or configured (every error surfaces clearly in the UI).
 */
export async function connectWalletConnect(wallet, network) {
  const projectId = getWalletConnectProjectId()
  if (!projectId) {
    throw err(
      WALLET_ERRORS.WALLETCONNECT_NOT_CONFIGURED,
      `${wallet.name} connects through WalletConnect, which is not configured yet. Set VITE_WALLETCONNECT_PROJECT_ID in frontend/.env to enable QR pairing with your wallet.`
    )
  }

  let EthereumProvider
  try {
    const mod = await import('@walletconnect/ethereum-provider')
    EthereumProvider = mod.default || mod.EthereumProvider
  } catch (importError) {
    throw err(
      WALLET_ERRORS.WALLETCONNECT_NOT_CONFIGURED,
      'WalletConnect could not be loaded. Please ask the platform administrator to verify the @walletconnect/ethereum-provider installation.',
      { original: String(importError?.message || importError) }
    )
  }

  if (!EthereumProvider) {
    throw err(WALLET_ERRORS.WALLETCONNECT_FAILED, 'WalletConnect could not be initialised.')
  }

  try {
    const chains = network.family === 'evm' ? [Number.parseInt(network.chainId, 16)] : [1]
    const provider = await EthereumProvider.init({
      projectId,
      showQrModal: true,
      chains,
      optionalChains: [1, 137, 42161, 56, 10, 8453, 43114],
      metadata: {
        name: 'Primewave Bank',
        description: 'Primewave Bank - Wallet Withdrawals',
        url: window.location.origin,
        icons: [`${window.location.origin}/src/assets/logo.png`],
      },
    })
    await provider.enable()
    const account = provider.accounts && provider.accounts[0]
    if (!account) {
      throw err(WALLET_ERRORS.WALLETCONNECT_FAILED, 'Your wallet did not provide an address. Please try again.')
    }
    return { address: account, network: network.id, chainId: provider.chainId ? String(provider.chainId) : network.chainId }
  } catch (wcError) {
    if (wcError instanceof WalletConnectionError) throw wcError
    if (wcError && wcError.message && /reject|deny|cancel/i.test(wcError.message)) {
      throw err(WALLET_ERRORS.USER_REJECTED, 'The connection request was declined in your wallet.')
    }
    throw err(WALLET_ERRORS.WALLETCONNECT_FAILED, 'WalletConnect pairing failed. Please try again or use a browser wallet extension.', { original: String(wcError?.message || wcError) })
  }
}

/**
 * High-level connection entry point used by the UI.
 * Iterates the wallet's declared connectors and falls back gracefully.
 * @param {{connectors: string[]}} wallet
 * @param {object} network
 * @returns {Promise<{address: string, network: string, chainId: string|null}>}
 */
export async function connectWallet(wallet, network) {
  const modes = wallet.connectors || ['walletconnect']
  let lastError = null

  for (const mode of modes) {
    try {
      if (mode === 'injectedEVM' && network.family === 'evm') {
        return await connectInjectedEVM(network)
      }
      if (mode === 'injectedSolana' && network.family === 'solana') {
        return await connectInjectedSolana()
      }
      if (mode === 'walletconnect') {
        return await connectWalletConnect(wallet, network)
      }
    } catch (connectionError) {
      lastError = connectionError
      // Move to the next connector only when no provider was found at all.
      if (!(connectionError instanceof WalletConnectionError) || connectionError.code !== WALLET_ERRORS.NO_PROVIDER) {
        throw connectionError
      }
    }
  }

  if (lastError) throw lastError
  throw err(WALLET_ERRORS.NO_PROVIDER, 'No supported connection method is available for this wallet.')
}