export const currencyFormatter = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

export const currencySymbols = {
  USD: '$',
  CAD: 'C$',
  GBP: '£',
  AUD: 'A$',
  EUR: '€',
  NGN: '₦',
  GHS: '₵',
  ZAR: 'R'
}

export const getCurrencySymbol = (currencyCode) => {
  return currencySymbols[currencyCode] || '$'
}

export const formatAmount = (amount, currency = 'USD') => {
  const symbol = getCurrencySymbol(currency)
  return `${symbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`
}

export const getCurrencyByCountry = (countryCode) => {
  const currencies = {
    US: 'USD',
    CA: 'CAD',
    GB: 'GBP',
    AU: 'AUD',
    DE: 'EUR',
    FR: 'EUR',
    NG: 'NGN',
    GH: 'GHS',
    ZA: 'ZAR'
  }
  return currencies[countryCode] || 'USD'
}
