/**
 * PrimeWave Bank - Supported blockchain networks (frontend mirror).
 * Mirrors backend/data/walletNetworks.js. Used for network pickers, client-side
 * address validation and EVM chain switching (wallet_switchEthereumChain /
 * wallet_addEthereumChain). Only PUBLIC metadata.
 */
export const walletNetworks = [
  { id: 'ethereum', name: 'Ethereum', shortName: 'ETH', family: 'evm', chainId: '0x1', validator: /^0x[a-fA-F0-9]{40}$/ },
  { id: 'polygon', name: 'Polygon', shortName: 'POL', family: 'evm', chainId: '0x89', validator: /^0x[a-fA-F0-9]{40}$/ },
  { id: 'arbitrum', name: 'Arbitrum', shortName: 'ARB', family: 'evm', chainId: '0xa4b1', validator: /^0x[a-fA-F0-9]{40}$/ },
  { id: 'bsc', name: 'BNB Smart Chain', shortName: 'BSC', family: 'evm', chainId: '0x38', validator: /^0x[a-fA-F0-9]{40}$/ },
  { id: 'optimism', name: 'Optimism', shortName: 'OP', family: 'evm', chainId: '0xa', validator: /^0x[a-fA-F0-9]{40}$/ },
  { id: 'base', name: 'Base', shortName: 'BASE', family: 'evm', chainId: '0x2105', validator: /^0x[a-fA-F0-9]{40}$/ },
  { id: 'avalanche', name: 'Avalanche', shortName: 'AVAX', family: 'evm', chainId: '0xa86a', validator: /^0x[a-fA-F0-9]{40}$/ },
  { id: 'solana', name: 'Solana', shortName: 'SOL', family: 'solana', validator: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/ },
  { id: 'tron', name: 'Tron', shortName: 'TRX', family: 'tron', validator: /^T[1-9A-HJ-NP-Za-km-z]{33}$/ },
  { id: 'bitcoin', name: 'Bitcoin', shortName: 'BTC', family: 'bitcoin', validator: /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/ },
  { id: 'cardano', name: 'Cardano', shortName: 'ADA', family: 'cardano', validator: /^(addr1|addr)[a-zA-HJ-NP-Z0-9]{38,110}$/ },
  { id: 'aptos', name: 'Aptos', shortName: 'APT', family: 'aptos', validator: /^0x[0-9a-fA-F]{64}$/ },
  { id: 'sui', name: 'Sui', shortName: 'SUI', family: 'sui', validator: /^0x[0-9a-fA-F]{64}$/ },
  { id: 'ton', name: 'TON', shortName: 'TON', family: 'ton', validator: /^(EQ|UQ)[a-zA-Z0-9_-]{40,64}$/ },
  { id: 'near', name: 'NEAR', shortName: 'NEAR', family: 'near', validator: /^[a-z0-9._-]{2,64}\.(near|testnet)$/ },
  { id: 'cosmos', name: 'Cosmos', shortName: 'ATOM', family: 'cosmos', validator: /^(cosmos|osmo|juno|akash|kava|secret)[1-9a-z]{38,45}$/ },
  { id: 'polkadot', name: 'Polkadot', shortName: 'DOT', family: 'substrate', validator: /^[1-9A-HJ-NP-Za-km-z]{46,49}$/ },
  { id: 'stacks', name: 'Stacks', shortName: 'STX', family: 'stacks', validator: /^S[0-9A-Z]{34}$/ },
  { id: 'stellar', name: 'Stellar', shortName: 'XLM', family: 'stellar', validator: /^G[0-9A-Z]{55}$/ },
]

const networkMap = new Map(walletNetworks.map((n) => [n.id, n]))

export const getNetwork = (id) => networkMap.get(id)

export const validateWalletAddress = (networkId, address) => {
  const network = networkMap.get(networkId)
  if (!network) return false
  return network.validator.test(String(address || '').trim())
}

/** EIP-155 chain params used by wallet_addEthereumChain when a network is missing. */
export const buildChainParams = (network) => ({
  chainId: network.chainId,
  chainName: network.name,
  nativeCurrency: { name: network.name, symbol: network.shortName, decimals: 18 },
  rpcUrls: [`https://${network.id}-rpc.publicnode.com`],
  blockExplorerUrls: [`https://${network.id}.scan`],
})

/** Shorten a public address: 0x12...89AB */
export const shortAddress = (address, leading = 6, trailing = 4) => {
  const a = String(address || '')
  if (a.length <= leading + trailing) return a
  return `${a.slice(0, leading)}...${a.slice(-trailing)}`
}