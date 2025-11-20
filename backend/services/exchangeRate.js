const axios = require('axios');

// Cache for exchange rates (15 minutes)
let rateCache = {};
let cacheTimestamp = 0;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

const EXCHANGE_API_KEY = process.env.EXCHANGE_API_KEY || 'fca_live_your_api_key_here';
const EXCHANGE_API_URL = 'https://api.freecurrencyapi.com/v1/latest';

class ExchangeRateService {
  async getExchangeRate(fromCurrency, toCurrency) {
    try {
      // Check cache first
      const cacheKey = `${fromCurrency}_${toCurrency}`;
      const now = Date.now();

      if (rateCache[cacheKey] && (now - cacheTimestamp) < CACHE_DURATION) {
        return rateCache[cacheKey];
      }

      // Fetch from API
      const response = await axios.get(EXCHANGE_API_URL, {
        params: {
          apikey: EXCHANGE_API_KEY,
          base_currency: fromCurrency,
          currencies: toCurrency
        }
      });

      if (response.data && response.data.data && response.data.data[toCurrency]) {
        const rate = response.data.data[toCurrency];

        // Cache the rate
        rateCache[cacheKey] = rate;
        cacheTimestamp = now;

        return rate;
      }

      throw new Error('Exchange rate not found');
    } catch (error) {
      console.error('Exchange rate API error:', error.message);

      // Fallback rates for common conversions
      const fallbackRates = {
        'USD_NGN': 1600,
        'USD_GHS': 12,
        'USD_ZAR': 18,
        'USD_EUR': 0.85,
        'USD_GBP': 0.75,
        'USD_CAD': 1.25,
        'USD_AUD': 1.35,
        'USD_BRL': 5.2,
        'EUR_USD': 1.18,
        'GBP_USD': 1.33,
        'CAD_USD': 0.8,
        'AUD_USD': 0.74,
        'BRL_USD': 0.19,
        'NGN_USD': 0.000625,
        'GHS_USD': 0.083,
        'ZAR_USD': 0.056
      };

      const fallbackKey = `${fromCurrency}_${toCurrency}`;
      if (fallbackRates[fallbackKey]) {
        console.log(`Using fallback rate for ${fallbackKey}: ${fallbackRates[fallbackKey]}`);
        return fallbackRates[fallbackKey];
      }

      // If no fallback, assume 1:1 conversion
      console.log(`No exchange rate found, using 1:1 conversion for ${fromCurrency} to ${toCurrency}`);
      return 1;
    }
  }

  async convertAmount(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    const rate = await this.getExchangeRate(fromCurrency, toCurrency);
    return amount * rate;
  }

  clearCache() {
    rateCache = {};
    cacheTimestamp = 0;
  }
}

module.exports = new ExchangeRateService();