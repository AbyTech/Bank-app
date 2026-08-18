/**
 * PrimeWave Bank - Supported wallet blockchain networks
 * ---------------------------------------------------------------------------
 * Single server-side source of truth for the networks a wallet withdrawal can
 * target, including the address validators used to verify a public address
 * before it is stored or used. Only PUBLIC address/network data lives here and
 * downstream - never any secret key or recovery phrase.
 *
 * EVM networks share one validator (0x...40 hex). Each network exposes a chainId
 * (hex EIP-155) used for `wallet_switchEthereumChain` / `wallet_addEthereumChain`.
 */

const EVM_ADDRESS = /^0x[a-fA-F0-9]{40}$/;

const walletNetworks = [
  { id: 'ethereum', name: 'Ethereum', shortName: 'ETH', family: 'evm', chainId: '0x1', validator: EVM_ADDRESS },
  { id: 'polygon', name: 'Polygon', shortName: 'POL', family: 'evm', chainId: '0x89', validator: EVM_ADDRESS },
  { id: 'arbitrum', name: 'Arbitrum', shortName: 'ARB', family: 'evm', chainId: '0xa4b1', validator: EVM_ADDRESS },
  { id: 'bsc', name: 'BNB Smart Chain', shortName: 'BSC', family: 'evm', chainId: '0x38', validator: EVM_ADDRESS },
  { id: 'optimism', name: 'Optimism', shortName: 'OP', family: 'evm', chainId: '0xa', validator: EVM_ADDRESS },
  { id: 'base', name: 'Base', shortName: 'BASE', family: 'evm', chainId: '0x2105', validator: EVM_ADDRESS },
  { id: 'avalanche', name: 'Avalanche', shortName: 'AVAX', family: 'evm', chainId: '0xa86a', validator: EVM_ADDRESS },
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
];

/** @type {Map<string, object>} */
const networkMap = new Map(walletNetworks.map((n) => [n.id, n]));

/**
 * Validate a public wallet address against a network's format rules.
 * @param {string} networkId
 * @param {string} address
 * @returns {boolean}
 */
function validateWalletAddress(networkId, address) {
  const network = networkMap.get(networkId);
  if (!network) return false;
  return network.validator.test(String(address || '').trim());
}

/** @param {string} id @returns {object|undefined} */
function getNetwork(id) {
  return networkMap.get(id);
}

module.exports = { walletNetworks, getNetwork, networkMap, validateWalletAddress };