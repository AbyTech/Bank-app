/**
 * PrimeWave Bank - Supported wallet providers
 * ---------------------------------------------------------------------------
 * Server-side allowlist of wallet providers that can be attached to a wallet
 * connection. The backend never trusts a random provider id from the client:
 * it must exist in this list (or match by known alias). Only PUBLIC wallet
 * metadata is represented - never secrets.
 *
 * The `networks` array lists which blockchains a provider supports, so a user
 * cannot withdraw for a wallet it does not support.
 */

const EVM_NETWORKS = ['ethereum', 'polygon', 'arbitrum', 'bsc', 'optimism', 'base', 'avalanche'];

const walletProviders = [
  { id: 'trust-wallet', name: 'Trust Wallet', category: 'Hot Wallet', networks: [...EVM_NETWORKS, 'solana', 'ton', 'bitcoin'] },
  { id: 'metamask', name: 'MetaMask', category: 'Hot Wallet', networks: EVM_NETWORKS },
  { id: 'coinbase-wallet', name: 'Coinbase Wallet', category: 'Hot Wallet', networks: EVM_NETWORKS },
  { id: 'binance-wallet', name: 'Binance Web3 Wallet', category: 'Exchange Wallet', networks: [...EVM_NETWORKS, 'tron', 'solana'] },
  { id: 'phantom', name: 'Phantom', category: 'Hot Wallet', networks: ['solana'] },
  { id: 'exodus', name: 'Exodus', category: 'Hot Wallet', networks: ['ethereum', 'solana', 'bitcoin'] },
  { id: 'okx-wallet', name: 'OKX Wallet', category: 'Exchange Wallet', networks: [...EVM_NETWORKS, 'solana', 'tron'] },
  { id: 'rainbow', name: 'Rainbow', category: 'Hot Wallet', networks: EVM_NETWORKS },
  { id: 'ledger', name: 'Ledger', category: 'Hardware Wallet', networks: [...EVM_NETWORKS, 'solana', 'polkadot', 'bitcoin', 'cardano'] },
  { id: 'trezor', name: 'Trezor', category: 'Hardware Wallet', networks: [...EVM_NETWORKS, 'bitcoin', 'cardano'] },
  { id: 'safe', name: 'Safe', category: 'Institutional/Multi-Sig', networks: EVM_NETWORKS },
  { id: 'solflare', name: 'Solflare', category: 'Hot Wallet', networks: ['solana'] },
  { id: 'rabby', name: 'Rabby', category: 'Hot Wallet', networks: EVM_NETWORKS },
  { id: 'argent', name: 'Argent', category: 'Hot Wallet', networks: EVM_NETWORKS },
  { id: 'zerion', name: 'Zerion', category: 'Hot Wallet', networks: EVM_NETWORKS },
  { id: 'myetherwallet', name: 'MyEtherWallet', category: 'Hot Wallet', networks: ['ethereum'] },
  { id: 'imtoken', name: 'imToken', category: 'Hot Wallet', networks: ['ethereum', 'bsc', 'tron', 'solana'] },
  { id: 'tokenpocket', name: 'TokenPocket', category: 'Hot Wallet', networks: [...EVM_NETWORKS, 'solana', 'tron'] },
  { id: 'bitget-wallet', name: 'Bitget Wallet', category: 'Hot Wallet', networks: [...EVM_NETWORKS, 'solana', 'tron'] },
  { id: 'bybit-wallet', name: 'Bybit Wallet', category: 'Exchange Wallet', networks: EVM_NETWORKS },
  { id: 'coin98', name: 'Coin98', category: 'Hot Wallet', networks: [...EVM_NETWORKS, 'solana', 'cosmos'] },
  { id: 'safepal', name: 'SafePal', category: 'Hot Wallet', networks: [...EVM_NETWORKS, 'solana', 'tron', 'bitcoin'] },
  { id: 'mathwallet', name: 'MathWallet', category: 'Hot Wallet', networks: [...EVM_NETWORKS, 'polkadot', 'cosmos'] },
  { id: 'onekey', name: 'OneKey', category: 'Hardware Wallet', networks: [...EVM_NETWORKS, 'solana', 'polkadot'] },
  { id: 'keplr', name: 'Keplr', category: 'Hot Wallet', networks: ['cosmos', 'ethereum'] },
  { id: 'xverse', name: 'Xverse', category: 'Hot Wallet', networks: ['bitcoin', 'stacks'] },
  { id: 'uniswap-wallet', name: 'Uniswap Wallet', category: 'Hot Wallet', networks: EVM_NETWORKS },
  { id: 'brave-wallet', name: 'Brave Wallet', category: 'Hot Wallet', networks: EVM_NETWORKS },
  { id: 'enjin-wallet', name: 'Enjin Wallet', category: 'Hot Wallet', networks: ['ethereum', 'bsc'] },
  { id: 'dcent-wallet', name: "D'Cent Wallet", category: 'Hardware Wallet', networks: ['ethereum', 'bsc', 'tron'] },
  { id: 'hashkey-wallet', name: 'HashKey Wallet', category: 'Exchange Wallet', networks: EVM_NETWORKS },
  { id: 'htx-wallet', name: 'HTX Wallet', category: 'Exchange Wallet', networks: [...EVM_NETWORKS, 'tron'] },
  { id: 'frontier', name: 'Frontier', category: 'Hot Wallet', networks: [...EVM_NETWORKS, 'solana'] },
  { id: 'pali-wallet', name: 'Pali Wallet', category: 'Hot Wallet', networks: EVM_NETWORKS },
  { id: 'ronin-wallet', name: 'Ronin Wallet', category: 'Hot Wallet', networks: EVM_NETWORKS },
  { id: 'sui-wallet', name: 'Sui Wallet', category: 'Hot Wallet', networks: ['sui'] },
  { id: 'petra', name: 'Petra', category: 'Hot Wallet', networks: ['aptos'] },
  { id: 'martian', name: 'Martian', category: 'Hot Wallet', networks: ['aptos'] },
  { id: 'mynearwallet', name: 'MyNearWallet', category: 'Hot Wallet', networks: ['near'] },
  { id: 'tonkeeper', name: 'Tonkeeper', category: 'Hot Wallet', networks: ['ton'] },
  { id: 'nami', name: 'Nami', category: 'Hot Wallet', networks: ['cardano'] },
  { id: 'yoroi', name: 'Yoroi', category: 'Hot Wallet', networks: ['cardano'] },
  { id: 'daedalus', name: 'Daedalus', category: 'Hot Wallet', networks: ['cardano'] },
  { id: 'atomic-wallet', name: 'Atomic Wallet', category: 'Hot Wallet', networks: ['ethereum', 'bitcoin', 'cosmos'] },
  { id: 'zengo', name: 'Zengo', category: 'Hot Wallet', networks: [...EVM_NETWORKS, 'bitcoin', 'cosmos'] },
  { id: 'pillar-wallet', name: 'Pillar Wallet', category: 'Hot Wallet', networks: ['ethereum'] },
  { id: 'ambire-wallet', name: 'Ambire Wallet', category: 'Hot Wallet', networks: EVM_NETWORKS },
  { id: 'taho', name: 'Taho', category: 'Hot Wallet', networks: ['ethereum', 'arbitrum', 'base', 'optimism'] },
  { id: 'frame', name: 'Frame', category: 'Hardware Wallet', networks: EVM_NETWORKS },
  { id: 'sequence', name: 'Sequence', category: 'Institutional/Multi-Sig', networks: EVM_NETWORKS },
  { id: 'core-wallet', name: 'Core Wallet', category: 'Hot Wallet', networks: ['ethereum', 'avalanche', 'bitcoin'] },
  { id: 'backpack', name: 'Backpack', category: 'Hot Wallet', networks: ['solana'] },
  { id: 'glow', name: 'Glow', category: 'Hot Wallet', networks: ['solana'] },
  { id: 'slope', name: 'Slope', category: 'Hot Wallet', networks: ['solana'] },
  { id: 'talisman', name: 'Talisman', category: 'Hot Wallet', networks: ['polkadot'] },
  { id: 'subwallet', name: 'SubWallet', category: 'Hot Wallet', networks: ['polkadot', 'ethereum'] },
  { id: 'polkadot-js', name: 'Polkadot JS Wallet', category: 'Hot Wallet', networks: ['polkadot'] },
  { id: 'keystone', name: 'Keystone', category: 'Hardware Wallet', networks: [...EVM_NETWORKS, 'solana', 'polkadot'] },
  { id: 'ellipal', name: 'Ellipal', category: 'Hardware Wallet', networks: [...EVM_NETWORKS, 'bitcoin', 'cardano'] },
  { id: 'coolwallet', name: 'CoolWallet', category: 'Hardware Wallet', networks: ['ethereum', 'bitcoin', 'bsc'] },
];

const providerMap = new Map(walletProviders.map((w) => [w.id, w]));

/**
 * Resolve a provider record by id.
 * @param {string} providerId
 * @returns {object|undefined}
 */
function getProvider(providerId) {
  return providerMap.get(providerId);
}

module.exports = { walletProviders, providerMap, getProvider };