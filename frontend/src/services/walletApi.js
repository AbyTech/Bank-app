// src/services/walletApi.js
// Thin client for the backend /api/wallets endpoints. Reuses the existing axios
// instance (services/api.jsx) so auth headers + 401 handling stay identical.
import api from './api'

const toError = (err, fallback) => {
  const message = err?.response?.data?.error || err?.message || fallback
  const error = new Error(message)
  error.response = err?.response
  return error
}

export const walletAPI = {
  getCurrent: async () => {
    try {
      const response = await api.get('/api/wallets/current')
      return response.data.data
    } catch (error) {
      // 404 simply means "no connected wallet yet".
      if (error.response && error.response.status === 404) return null
      throw toError(error, 'Failed to load wallet')
    }
  },

  getConnections: async () => {
    try {
      const response = await api.get('/api/wallets')
      return response.data.data || []
    } catch (error) {
      throw toError(error, 'Failed to load wallets')
    }
  },

  /**
   * Save/refresh a connected wallet. Only public metadata + the user-entered
   * name are sent - the API never accepts wallet secrets.
   */
  connect: async (payload) => {
    try {
      const response = await api.post('/api/wallets/connect', payload)
      return response.data.data
    } catch (error) {
      throw toError(error, 'Failed to save wallet connection')
    }
  },

  disconnect: async (id) => {
    try {
      const response = await api.delete(`/api/wallets/${id}`)
      return response.data.data
    } catch (error) {
      throw toError(error, 'Failed to disconnect wallet')
    }
  },

  update: async (id, payload) => {
    try {
      const response = await api.put(`/api/wallets/${id}`, payload)
      return response.data.data
    } catch (error) {
      throw toError(error, 'Failed to update wallet')
    }
  },

  withdraw: async (payload) => {
    try {
      const response = await api.post('/api/wallets/withdraw', payload)
      return response.data
    } catch (error) {
      throw toError(error, 'Withdrawal failed')
    }
  },

  getWithdrawals: async (page = 1, limit = 20) => {
    try {
      const response = await api.get(`/api/wallets/withdrawals?page=${page}&limit=${limit}`)
      return response.data
    } catch (error) {
      throw toError(error, 'Failed to load withdrawals')
    }
  },
}

export default walletAPI