/**
 * PrimeWave Bank - Funding methods configuration
 * ---------------------------------------------------------------------------
 * Wallet addresses for crypto funding are read from environment variables so
 * they can be managed per-deployment. If an env var is not set, the official
 * wallet address below is used as the fallback. The backend exposes them to
 * authenticated users through GET /api/config/funding.
 *
 * Customers do NOT pay from their account balance - they copy the wallet
 * address or scan the QR code and pay through their own crypto wallet/medium.
 *
 * Set the following in backend/.env to override:
 *   BTC_WALLET_ADDRESS=...
 *   USDT_WALLET_ADDRESS=...
 *   ETH_WALLET_ADDRESS=...
 */

const fundingMethods = [
  {
    id: 'paypal',
    name: 'PayPal',
    type: 'contact_support',
    enabled: true,
    description: 'Fund your account securely using PayPal. Contact support for the official payment details.',
  },
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    type: 'crypto',
    enabled: true,
    description: 'Send Bitcoin to the wallet address below. Your account is credited after network confirmation.',
    address: process.env.BTC_WALLET_ADDRESS || 'bc1qqewmm3lx7vcw6kwhhx4yfkdav2y04tjmj5sgr4',
  },
  {
    id: 'usdt',
    name: 'USDT',
    type: 'crypto',
    enabled: true,
    description: 'Send USDT (TRC-20) to the wallet address below. Your account is credited after confirmation.',
    address: process.env.USDT_WALLET_ADDRESS || 'TYQZA5U7JLw4fw9JH4F96kSVhTAaNeK7db',
  },
  {
    id: 'eth',
    name: 'Ethereum',
    type: 'crypto',
    enabled: true,
    description: 'Send ETH to the wallet address below. Your account is credited after network confirmation.',
    address: process.env.ETH_WALLET_ADDRESS || '0x0FE884e5B0d6eCd44B565986af8A582ea25CeC45',
  },
];

module.exports = fundingMethods;
