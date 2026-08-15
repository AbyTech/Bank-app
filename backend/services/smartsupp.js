const axios = require('axios');
const crypto = require('crypto');

/**
 * Smartsupp REST API v2 client.
 *
 * Docs: https://docs.smartsupp.com/rest-api/
 * Base URL: https://api.smartsupp.com/v2
 * Auth: `Authorization: Bearer <access_token>` (SMARTSUPP_API_TOKEN env var)
 */

const BASE_URL = 'https://api.smartsupp.com/v2';
const DEFAULT_BOT_ID = process.env.SMARTSUPP_BOT_ID || 'primewave-bot';
const DEFAULT_BOT_NAME = process.env.SMARTSUPP_BOT_NAME || 'PrimeWave Assistant';

class SmartsuppService {
  constructor() {
    this.token = process.env.SMARTSUPP_API_TOKEN || '';
  }

  isConfigured() {
    return Boolean(this.token);
  }

  /**
   * Low-level request helper.
   * @param {'GET'|'POST'|'PATCH'|'PUT'|'DELETE'} method
   * @param {string} path e.g. '/conversations'
   * @param {object} [body]
   * @param {{params?: object}} [options]
   */
  async request(method, path, body, options = {}) {
    if (!this.isConfigured()) {
      const error = new Error('Smartsupp API token is not configured (SMARTSUPP_API_TOKEN)');
      error.status = 500;
      error.code = 'SMARTSUPP_NOT_CONFIGURED';
      throw error;
    }

    try {
      const response = await axios({
        method,
        url: `${BASE_URL}${path}`,
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        data: body,
        params: options.params,
        timeout: 15000,
      });
      return response.data;
    } catch (error) {
      const status = error.response?.status;
      const data = error.response?.data || {};
      const apiError = new Error(
        `Smartsupp API error (${status}): ${data.message || data.code || error.message}`
      );
      apiError.status = status;
      apiError.code = data.code;
      apiError.details = data;
      throw apiError;
    }
  }

  // -------------------------------------------------------------------------
  // Contacts
  // -------------------------------------------------------------------------

  /**
   * Find a contact by email. Returns null when not found.
   * @param {string} email
   * @returns {Promise<object|null>}
   */
  async findContactByEmail(email) {
    try {
      return await this.request('GET', '/contacts/find', null, {
        params: { email },
      });
    } catch (error) {
      if (error.code === 'not_found') return null;
      throw error;
    }
  }

  /**
   * Create a new contact.
   * @param {{name?: string, email?: string, phone?: string, identity_id?: string}} contact
   * @returns {Promise<object>}
   */
  async createContact(contact) {
    return this.request('POST', '/contacts', contact);
  }

  /**
   * Make sure a contact exists and return it.
   * @param {{name?: string, email?: string, phone?: string, identity_id?: string}} contact
   * @returns {Promise<object>} contact (with `id`)
   */
  async ensureContact(contact) {
    if (contact.email) {
      const existing = await this.findContactByEmail(contact.email);
      if (existing) return existing;
    }
    return this.createContact(contact);
  }

  // -------------------------------------------------------------------------
  // Conversations
  // -------------------------------------------------------------------------

  /**
   * Get a single conversation by id.
   * @param {string} conversationId
   * @returns {Promise<object|null>}
   */
  async getConversation(conversationId) {
    try {
      return await this.request('GET', `/conversations/${conversationId}`);
    } catch (error) {
      if (error.code === 'not_found') return null;
      throw error;
    }
  }

  /**
   * Find a conversation by our custom id (ext_id). Returns null when not found.
   * @param {string} extId
   * @returns {Promise<object|null>}
   */
  async findConversationByExtId(extId) {
    try {
      return await this.request('GET', '/conversations/find', null, {
        params: { ext_id: extId },
      });
    } catch (error) {
      if (error.code === 'not_found') return null;
      throw error;
    }
  }

  /**
   * Create a new conversation (optionally with a first message).
   * @param {{contactId: string, extId?: string, text?: string, variables?: object}} data
   * @returns {Promise<object>} conversation (with `id`)
   */
  async createConversation({ contactId, extId, text, variables }) {
    const body = { contact_id: contactId };
    if (extId) body.ext_id = extId;
    if (text) body.text = text;
    if (variables && typeof variables === 'object') body.variables = variables;
    return this.request('POST', '/conversations', body);
  }

  /**
   * Make sure a conversation exists for a given ext_id and contact.
   * @param {{extId: string, contactId: string, text?: string, variables?: object}} data
   * @returns {Promise<{conversation: object, created: boolean}>}
   */
  async ensureConversation({ extId, contactId, text, variables }) {
    const existing = await this.findConversationByExtId(extId);
    if (existing) return { conversation: existing, created: false };
    const conversation = await this.createConversation({ contactId, extId, text, variables });
    return { conversation, created: true };
  }

  /**
   * Send a message to a conversation.
   * Supported sub types: 'agent' | 'contact' | 'bot'
   * @param {string} conversationId
   * @param {object} data
   */
  async sendMessage(conversationId, data) {
    const { subType = 'bot', contactId, agentId, botId, botName, text, html } = data;

    const body = {
      type: 'message',
      sub_type: subType,
      content: { type: 'text' },
    };

    if (text) body.content.text = text;
    if (html) body.content.html = html;

    if (subType === 'contact') {
      if (!contactId) throw new Error('contactId is required when sub_type is contact');
      body.contact_id = contactId;
    } else if (subType === 'agent') {
      if (!agentId) throw new Error('agentId is required when sub_type is agent');
      body.agent_id = agentId;
    } else if (subType === 'bot') {
      body.bot_id = botId || DEFAULT_BOT_ID;
      body.bot_name = botName || DEFAULT_BOT_NAME;
    }

    return this.request('POST', `/conversations/${conversationId}/messages`, body);
  }

  /**
   * Get all messages in a conversation (newest first by default).
   * @param {string} conversationId
   * @returns {Promise<object[]>}
   */
  async getMessages(conversationId) {
    const data = await this.request('GET', `/conversations/${conversationId}/messages`);
    return data.items || [];
  }

  /**
   * Close a conversation.
   * @param {string} conversationId
   */
  async closeConversation(conversationId) {
    return this.request('PATCH', `/conversations/${conversationId}/close`, {});
  }

  // -------------------------------------------------------------------------
  // Webhooks
  // -------------------------------------------------------------------------

  /**
   * Verify a Smartsupp webhook signature (HMAC-SHA256 of the raw body).
   * @param {string} rawBody - raw request body (unparsed)
   * @param {string} signature - value of the X-Smartsupp-Hmac header
   * @returns {boolean|null} true/false, or null when no secret is configured
   */
  verifyWebhookSignature(rawBody, signature) {
    const secret = process.env.SMARTSUPP_WEBHOOK_SECRET;
    if (!secret) {
      // No secret configured - do not reject, but log a warning in caller.
      return null;
    }
    if (!signature) return false;
    const expected = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');
    return signature === expected;
  }
}

module.exports = new SmartsuppService();

