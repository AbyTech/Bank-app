/**
 * PrimeWave Bank - Card categories & issuance fees
 * ---------------------------------------------------------------------------
 * Single source of truth for card tiers/pricing used across the app.
 * Fees are ALWAYS enforced server-side from this config; the frontend only
 * displays what the backend returns (GET /api/cards/categories). Never trust
 * a price sent by the client.
 */

const cardCategories = {
  virtual: [
    {
      id: 'standard',
      name: 'Standard',
      fee: 1450,
      currency: 'USD',
      tagline: 'Everyday online payments',
      benefits: ['Secure online payments', 'Global acceptance', 'Real-time spending controls', 'Instant issuance'],
    },
    {
      id: 'gold',
      name: 'Gold',
      fee: 1830,
      currency: 'USD',
      tagline: 'Premium online spending',
      benefits: ['All Standard benefits', 'Higher spending limits', 'Priority support', 'Enhanced fraud protection'],
    },
    {
      id: 'platinum',
      name: 'Platinum',
      fee: 2600,
      currency: 'USD',
      tagline: 'Elevated digital experience',
      benefits: ['All Gold benefits', 'Premium limits & controls', 'Dedicated support line', 'Exclusive offers'],
    },
    {
      id: 'black',
      name: 'Black',
      fee: 3700,
      currency: 'USD',
      tagline: 'The ultimate virtual card',
      benefits: ['All Platinum benefits', 'Maximum spending limits', 'White-glove support', 'Luxury perks & rewards'],
    },
  ],
  physical: [
    {
      id: 'standard',
      name: 'Standard',
      fee: 1450,
      currency: 'USD',
      tagline: 'Classic everyday banking',
      benefits: ['EMV chip & contactless', 'ATM withdrawals', 'Global acceptance', 'Free replacement protection'],
    },
    {
      id: 'gold',
      name: 'Gold',
      fee: 1830,
      currency: 'USD',
      tagline: 'Premium lifestyle card',
      benefits: ['All Standard benefits', 'Higher ATM & POS limits', 'Travel insurance', 'Priority customer support'],
    },
    {
      id: 'platinum',
      name: 'Platinum',
      fee: 2600,
      currency: 'USD',
      tagline: 'Elevated financial status',
      benefits: ['All Gold benefits', 'Premium travel & purchase cover', 'Concierge assistance', 'Exclusive merchant offers'],
    },
    {
      id: 'black',
      name: 'Black',
      fee: 3700,
      currency: 'USD',
      tagline: 'The flagship PrimeWave card',
      benefits: ['All Platinum benefits', 'Maximum worldwide limits', 'Luxury lifestyle services', 'Dedicated relationship manager'],
    },
  ],
};

/**
 * Resolve a single category config for a card type.
 * @param {'virtual'|'physical'} type
 * @param {string} categoryId
 * @returns {object|null}
 */
function getCategory(type, categoryId) {
  const list = cardCategories[type] || [];
  return list.find((c) => c.id === categoryId) || null;
}

module.exports = { cardCategories, getCategory };
