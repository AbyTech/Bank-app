// src/services/smartsupp.js
// Client wrapper for the backend-powered Smartsupp live chat.
// The Smartsupp API token stays server-side (backend/.env) - never exposed here.
import api from './api';

const GUEST_ID_KEY = 'primewave_chat_guest_id';

// Stable per-browser guest id (used when the user is not logged in)
export const getGuestId = () => {
  let guestId = localStorage.getItem(GUEST_ID_KEY);
  if (!guestId) {
    guestId = 'guest-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    localStorage.setItem(GUEST_ID_KEY, guestId);
  }
  return guestId;
};

export const chatAPI = {
  getStatus: async () => {
    try {
      const response = await api.get('/api/smartsupp/status');
      return response.data;
    } catch (error) {
      return { success: false, configured: false };
    }
  },

  sendMessage: async (text) => {
    const response = await api.post('/api/smartsupp/message', {
      text,
      guestId: getGuestId(),
    });
    return response.data;
  },

  getConversation: async () => {
    try {
      const response = await api.get(`/api/smartsupp/conversation?guestId=${encodeURIComponent(getGuestId())}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch chat conversation:', error);
      return { success: false, messages: [] };
    }
  },
};

export default chatAPI;
