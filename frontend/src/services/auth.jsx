// src/services/auth.jsx
import api from './api';

export const authAPI = {
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      // The new backend returns { success: true, token, seedPhrase }
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        throw new Error(error.response.data.error || 'Registration failed');
      }
      throw error;
    }
  },

  login: async (email, seedPhrase) => {
    try {
      const response = await api.post('/auth/login', { email, seedPhrase });
      const { token, user } = response.data;
      localStorage.setItem('access_token', token);
      // Return the user object from login response
      return { token, user };
    } catch (error) {
      if (error.response && error.response.data) {
        throw new Error(error.response.data.error || 'Login failed');
      }
      throw error;
    }
  },

  // 2FA is not implemented in the new backend yet.
  verify2FA: async (code) => {
    console.warn('2FA verification is not implemented in the new backend.');
    return Promise.resolve({ success: true });
  },

  getProfile: async () => {
    try {
      const response = await api.get('/profile');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      throw error.response?.data || error;
    }
  },

  getCountries: async () => {
    try {
      const response = await api.get('/countries');
      return response.data.data; // The new endpoint wraps data in a 'data' property
    } catch (error) {
      console.error('Failed to fetch countries:', error);
      return [];
    }
  },

  getAccounts: async () => {
    try {
      const response = await api.get('/accounts');
      return response.data.data; // The new endpoint wraps data in a 'data' property
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
      return [];
    }
  },

  getCards: async () => {
    try {
      const response = await api.get('/cards');
      return response.data.data; // The new endpoint wraps data in a 'data' property
    } catch (error) {
      console.error('Failed to fetch cards:', error);
      return [];
    }
  },

  createCard: async (cardData) => {
    try {
      const response = await api.post('/cards', cardData);
      return response.data.data;
    } catch (error) {
      console.error('Failed to create card:', error);
      throw error.response?.data || error;
    }
  },

  getLoans: async () => {
    try {
      const response = await api.get('/loans');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch loans:', error);
      return [];
    }
  },

  applyForLoan: async (loanData) => {
    try {
      const response = await api.post('/loans', loanData);
      return response.data.data;
    } catch (error) {
      console.error('Failed to apply for loan:', error);
      throw error.response?.data || error;
    }
  },

  makeLoanPayment: async (loanId, paymentData) => {
    try {
      const response = await api.post(`/loans/${loanId}/payment`, paymentData);
      return response.data.data;
    } catch (error) {
      console.error('Failed to make loan payment:', error);
      throw error.response?.data || error;
    }
  },

  getTransactions: async (page = 1, limit = 20) => {
    try {
      const response = await api.get(`/transactions?page=${page}&limit=${limit}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      return [];
    }
  },

  deposit: async (depositData) => {
    try {
      const response = await api.post('/transactions/deposit', depositData);
      return response.data.data;
    } catch (error) {
      console.error('Failed to make deposit:', error);
      throw error.response?.data || error;
    }
  },

  withdraw: async (withdrawData) => {
    try {
      const response = await api.post('/transactions/withdraw', withdrawData);
      return response.data.data;
    } catch (error) {
      console.error('Failed to make withdrawal:', error);
      throw error.response?.data || error;
    }
  },

  transfer: async (transferData) => {
    try {
      const response = await api.post('/transactions/transfer', transferData);
      return response.data.data;
    } catch (error) {
      console.error('Failed to make transfer:', error);
      throw error.response?.data || error;
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token'); // Keep this for now
    window.location.href = '/login';
  }
};

// Named exports for convenience
export const registerUser = authAPI.register;
export const loginUser = authAPI.login;
export const verify2FA = authAPI.verify2FA;
export const getProfile = authAPI.getProfile;
export const logoutUser = authAPI.logout;
export const getCountries = authAPI.getCountries;
export const getAccounts = authAPI.getAccounts;
export const getCards = authAPI.getCards;
export const createCard = authAPI.createCard;
export const getLoans = authAPI.getLoans;
export const applyForLoan = authAPI.applyForLoan;
export const makeLoanPayment = authAPI.makeLoanPayment;
export const getTransactions = authAPI.getTransactions;
export const deposit = authAPI.deposit;
export const withdraw = authAPI.withdraw;
export const transfer = authAPI.transfer;

// Default export
export default authAPI;
