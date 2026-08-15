const smartsupp = require('../services/smartsupp');
const { getBotReply } = require('../services/chatbot');

/**
 * Build a stable conversation key (ext_id) for a chat participant.
 * @param {{userId?: string, guestId?: string}} identity
 */
function buildExtId({ userId, guestId }) {
  if (userId) return `primewave-user-${userId}`;
  if (guestId) {
    const safe = String(guestId).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40);
    if (safe) return `primewave-guest-${safe}`;
  }
  return `primewave-guest-${Math.random().toString(36).slice(2, 12)}`;
}

/**
 * Resolve the Smartsupp contact + conversation for the current participant.
 * @param {{userId?: string, guestId?: string, name?: string, email?: string}} identity
 * @param {string} [firstMessage] - used as the opening message for a brand-new conversation
 */
async function resolveConversation({ userId, guestId, name, email }, firstMessage) {
  const extId = buildExtId({ userId, guestId });

  let contact = null;
  if (email) {
    contact = await smartsupp.ensureContact({ name, email });
  } else {
    contact = await smartsupp.ensureContact({
      name: name || (guestId ? `Guest ${String(guestId).slice(0, 6)}` : 'PrimeWave Guest'),
    });
  }

  const variables = {
    app: 'primewave-bank',
    platform: 'web',
  };
  if (name) variables.name = name;
  if (email) variables.email = email;

  const { conversation, created } = await smartsupp.ensureConversation({
    extId,
    contactId: contact.id,
    text: firstMessage || undefined,
    variables,
  });

  return { extId, contact, conversation, created };
}

/**
 * Convert Smartsupp API messages into a simple shape for the frontend.
 */
function toClientMessages(messages) {
  // API returns newest-first; present oldest-first for a natural chat view.
  return [...messages]
    .filter((m) => m.content?.text || m.content?.html) // skip empty/system-only messages
    .reverse()
    .map((m) => ({
      id: m.id,
      sender:
        m.sub_type === 'contact'
          ? 'user'
          : m.sub_type === 'bot'
          ? 'bot'
          : m.sub_type === 'agent'
          ? 'agent'
          : m.sub_type || 'system',
      text: m.content?.text || m.content?.html || '',
      createdAt: m.created_at,
    }));
}

// @desc    Send a message through the chat; returns the bot reply
// @route   POST /api/smartsupp/message
// @access  Public (optional auth)
exports.sendMessage = async (req, res, next) => {
  const { text, guestId } = req.body;

  if (!text || !String(text).trim()) {
    return res.status(400).json({ success: false, error: 'Message text is required' });
  }
  if (String(text).length > 2000) {
    return res.status(400).json({ success: false, error: 'Message is too long' });
  }

  if (!smartsupp.isConfigured()) {
    return res.status(503).json({
      success: false,
      error: 'Live chat is not configured yet. Please contact support.',
    });
  }

  try {
    const user = req.user || null;
    const identity = {
      userId: user ? String(user._id) : null,
      guestId: user ? null : guestId,
      name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : null,
      email: user ? user.email : null,
    };

    const { contact, conversation, created } = await resolveConversation(identity, text);

    // 1) Relay the user's message into Smartsupp as the contact.
    //    For a brand-new conversation the opening message is already part of
    //    the conversation creation, so only relay it for existing threads.
    if (!created) {
      await smartsupp.sendMessage(conversation.id, {
        subType: 'contact',
        contactId: contact.id,
        text,
      });
    }

    // 2) Compute the bot reply from the knowledge base
    const reply = await getBotReply(text, {
      user,
      isAuthenticated: Boolean(user),
    });

    // 3) Send the bot reply into Smartsupp as the bot
    await smartsupp.sendMessage(conversation.id, {
      subType: 'bot',
      text: reply.text,
    });

    res.status(200).json({
      success: true,
      conversationId: conversation.id,
      reply,
      contact: { name: contact.name, email: contact.email },
    });
  } catch (error) {
    console.error('Smartsupp chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Live chat is temporarily unavailable. Please email helpxprimewavebank@gmail.com',
    });
  }
};

// @desc    Get the current chat conversation + messages
// @route   GET /api/smartsupp/conversation
// @access  Public (optional auth)
exports.getConversation = async (req, res, next) => {
  const user = req.user || null;
  const guestId = req.query.guestId;

  if (!smartsupp.isConfigured()) {
    return res.status(503).json({ success: false, error: 'Live chat is not configured yet.' });
  }

  try {
    const extId = buildExtId({ userId: user ? String(user._id) : null, guestId: user ? null : guestId });
    const conversation = await smartsupp.findConversationByExtId(extId);

    if (!conversation) {
      return res.status(200).json({ success: true, conversationId: null, messages: [] });
    }

    const messages = await smartsupp.getMessages(conversation.id);
    res.status(200).json({
      success: true,
      conversationId: conversation.id,
      messages: toClientMessages(messages),
    });
  } catch (error) {
    console.error('Smartsupp getConversation error:', error);
    res.status(500).json({ success: false, error: 'Failed to load conversation' });
  }
};

// Small in-memory cache of message ids we already auto-replied to, so the bot
// never answers the same message twice (even if multiple events fire for it).
const processedMessageIds = new Map(); // messageId -> timestamp (ms)
const PROCESSED_TTL_MS = 60 * 1000; // 60 seconds

function isDuplicateMessage(messageId) {
  if (!messageId) return false;
  const now = Date.now();
  if (processedMessageIds.has(messageId)) {
    const ts = processedMessageIds.get(messageId);
    if (now - ts < PROCESSED_TTL_MS) return true;
    processedMessageIds.delete(messageId);
  }
  processedMessageIds.set(messageId, now);
  return false;
}

/**
 * Decide whether a webhook event represents a new visitor message we should
 * auto-answer. Smartsupp event names follow `entity.action`, e.g.
 * `conversation.closed`. For messages the event is `message.created` (some
 * setups/regions use `message.new`), so we accept any message-like event.
 */
function isMessageEvent(eventName, data) {
  if (eventName === 'message.created' || eventName === 'message.new') return true;
  if (eventName && eventName.startsWith('message.')) return true;
  // Fallback: the event looks like a message event because the payload itself
  // carries a contact message.
  const message = data.message || data;
  return Boolean(message && message.sub_type === 'contact' && message.content?.text);
}

// @desc    Smartsupp webhook endpoint (auto-reply to visitor messages)
// @route   POST /api/smartsupp/webhook
// @access  Public (HMAC-verified)
exports.handleWebhook = async (req, res, next) => {
  // Smartsupp signs the raw request body with HMAC-SHA256.
  const rawBody = req.rawBody || JSON.stringify(req.body || {});
  const signature = req.headers['x-smartsupp-hmac'];

  const verified = smartsupp.verifyWebhookSignature(rawBody, signature);
  if (verified === false) {
    return res.status(403).json({ success: false, error: 'Invalid HMAC signature' });
  }
  if (verified === null) {
    console.warn('Smartsupp webhook received but SMARTSUPP_WEBHOOK_SECRET is not configured. Add it to verify webhooks.');
  }

  const event = req.body || {};
  const eventName = event.event || '';
  const data = event.data || {};

  // Ack fast so Smartsupp does not retry the delivery.
  res.status(200).json({ success: true });

  // Auto-respond only to messages sent by the contact/visitor.
  if (!isMessageEvent(eventName, data)) {
    return;
  }

  const message = data.message || data;
  const messageId = message.id || null;

  if (isDuplicateMessage(messageId)) {
    console.log('Webhook: skipping duplicate message', messageId);
    return;
  }

  if (message && message.sub_type === 'contact' && message.content?.text) {
    try {
      // Skip conversations that belong to the in-app chat (those already get a
      // direct bot reply when the user sends a message, so replying here too
      // would double-answer). The webhook is for the native widget / other
      // channels where no direct reply is made.
      if (message.conversation_id) {
        const conversation = await smartsupp.getConversation(message.conversation_id);
        const extId = conversation && conversation.ext_id ? String(conversation.ext_id) : '';
        if (extId.startsWith('primewave-user-') || extId.startsWith('primewave-guest-')) {
          console.log('Webhook: skipping in-app conversation', message.conversation_id);
          return;
        }
      }

      const reply = await getBotReply(message.content.text, { isAuthenticated: false });
      await smartsupp.sendMessage(message.conversation_id, {
        subType: 'bot',
        text: reply.text,
      });
      console.log(`Webhook: auto-replied to message ${messageId} (intent: ${reply.intent})`);
    } catch (error) {
      console.error('Webhook bot reply error:', error);
    }
  }
};

// @desc    Chat availability status
// @route   GET /api/smartsupp/status
// @access  Public
exports.getStatus = (req, res, next) => {
  res.status(200).json({
    success: true,
    configured: smartsupp.isConfigured(),
    botId: process.env.SMARTSUPP_BOT_ID || 'primewave-bot',
    botName: process.env.SMARTSUPP_BOT_NAME || 'PrimeWave Assistant',
  });
};

