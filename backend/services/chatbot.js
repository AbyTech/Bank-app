const knowledgeBase = require('../data/knowledgeBase');

const User = require('../models/User');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const Card = require('../models/Card');
const Loan = require('../models/Loan');

/**
 * PrimeWave Bank - Chatbot engine
 * ---------------------------------------------------------------------------
 * Matches a user's message against the knowledge base intents and returns the
 * best answer. Personalized intents (balance, account number, transactions,
 * cards, loans) look up the user's real data from the database so the bot can
 * give accurate, account-specific answers.
 */

const FALLBACK = `I'm not 100% sure about that one. 🤔

Here are some things I can help with:
• How to open an account or log in
• Checking your balance, account number or transactions
• Sending money and currency conversion
• Cards (ordering, fees, status)
• Loans (applying & repayment)
• Security and contacting our support team

Try rephrasing your question, or tap one of the suggestions below. If you need a human, our team is at 📧 helpxprimewavebank@gmail.com or 💬 @helpxprimewavebank on Telegram.`;

const LOGIN_PROMPT = `I'd love to help with that, but I need to look at your account to give you an accurate answer. 🔐

Please log in to the app (email + password or seed phrase) and come back here — I'll be able to check your details instantly.`;

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\w\s'@+./-]/g, ' ') // keep letters, digits, spaces and a few symbols
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Score an intent against the normalized text.
 * Longer (more specific) keywords carry more weight.
 */
function scoreIntent(text, intent) {
  let score = 0;
  for (const keyword of intent.keywords) {
    const kw = normalize(keyword);
    if (!kw) continue;
    if (text.includes(kw)) {
      score += kw.length;
    }
  }
  return score;
}

function formatMoney(amount, currency = 'USD') {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount || 0);
  } catch (e) {
    return `$${(amount || 0).toLocaleString('en-US')}`;
  }
}

function formatDate(date) {
  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (e) {
    return '';
  }
}

function getUserDisplayName(user) {
  if (!user) return 'there';
  const first = user.firstName || '';
  const last = user.lastName || '';
  return (first + ' ' + last).trim() || user.email || 'there';
}

// ---------------------------------------------------------------------------
// Personalized intent handlers (use the authenticated user's real data)
// ---------------------------------------------------------------------------

async function handleBalance(user) {
  const accounts = await Account.find({ user: user._id });
  if (!accounts.length) {
    return {
      text: `It looks like you don't have any accounts yet, ${getUserDisplayName(user)}. Contact our support team and we'll get one set up for you.`,
      suggestions: ['How do I open an account?', 'How do I contact support?'],
    };
  }

  const lines = accounts.map((acc, i) => {
    return `${i + 1}. ${acc.accountType === 'checking' ? 'Checking' : 'Savings'} account ••• ${acc.accountNumber.slice(-4)} (${acc.currency}): ${formatMoney(acc.balance, acc.currency)}`;
  });

  return {
    text: `Here's your current balance${user.firstName ? `, ${user.firstName}` : ''}: 💰\n\n${lines.join('\n')}\n\nYou can also see this anytime on your Dashboard.`,
    suggestions: ['Show my recent transactions', 'How do I transfer money?', 'How do I contact support?'],
  };
}

async function handleAccountNumber(user) {
  const accounts = await Account.find({ user: user._id });
  if (!accounts.length) {
    return {
      text: `You don't seem to have an account yet, ${getUserDisplayName(user)}. Contact support and we'll help you get set up.`,
      suggestions: ['How do I open an account?', 'How do I contact support?'],
    };
  }

  const lines = accounts.map((acc, i) => {
    return `${i + 1}. ${acc.accountType === 'checking' ? 'Checking' : 'Savings'} (${acc.currency}): ${acc.accountNumber}`;
  });

  return {
    text: `Here are your account number(s) 🔢:\n\n${lines.join('\n')}\n\nShare this number with anyone who wants to send you money.`,
    suggestions: ['How do I transfer money?', 'How do I check my balance?'],
  };
}

async function handleTransactions(user) {
  const transactions = await Transaction.find({ user: user._id })
    .sort({ createdAt: -1 })
    .limit(5);

  if (!transactions.length) {
    return {
      text: `You don't have any transactions yet, ${getUserDisplayName(user)}. Once you make your first deposit or transfer, they'll show up here and on the Transactions page.`,
      suggestions: ['How do I add money?', 'How do I transfer money?', 'How do I contact support?'],
    };
  }

  const currency = (await Account.findOne({ user: user._id }))?.currency || 'USD';
  const lines = transactions.map((t, i) => {
    const sign = ['deposit'].includes(t.type) ? '+' : '-';
    const amount = sign + formatMoney(Math.abs(t.amount), t.currency || currency);
    return `${i + 1}. ${t.description || t.type} — ${amount} (${formatDate(t.createdAt)})`;
  });

  return {
    text: `Here are your 5 most recent transactions 📋:\n\n${lines.join('\n')}\n\nYou can see everything on the Transactions page.`,
    suggestions: ['How do I transfer money?', 'How do I check my balance?'],
  };
}

async function handleMyCards(user) {
  const cards = await Card.find({ user: user._id });
  if (!cards.length) {
    return {
      text: `You don't have any cards yet, ${getUserDisplayName(user)}. 💳 You can order one from the Cards page — orders are reviewed by our admin team before activation.`,
      suggestions: ['How do I order a card?', 'How much does a card cost?', 'How do I contact support?'],
    };
  }

  const lines = cards.map((c, i) => {
    const status = c.status || c.approvalStatus || 'unknown';
    const number = c.cardNumber ? `•••• ${c.cardNumber.slice(-4)}` : '';
    return `${i + 1}. ${c.cardType || 'Card'} ${number} — ${status}${c.purchaseAmount ? ` ($${c.purchaseAmount})` : ''}`;
  });

  return {
    text: `Here are your cards 💳:\n\n${lines.join('\n')}\n\nOpen the Cards page to see full details, deadlines and payment options.`,
    suggestions: ['My card was rejected', 'How do I order a card?', 'How do I contact support?'],
  };
}

async function handleMyLoans(user) {
  const loans = await Loan.find({ user: user._id });
  if (!loans.length) {
    return {
      text: `You don't have any loans right now, ${getUserDisplayName(user)}. 📈 If you need one, you can apply from the Loans page — approval is instant and funds are deposited right away.`,
      suggestions: ['How do I apply for a loan?', 'How do loan repayments work?', 'How do I contact support?'],
    };
  }

  const lines = loans.map((l, i) => {
    return `${i + 1}. Loan of ${formatMoney(l.loanAmount)} — remaining ${formatMoney(l.remainingBalance)} (${l.status}), ${formatMoney(l.monthlyPayment)}/month`;
  });

  return {
    text: `Here's your loan summary 📈:\n\n${lines.join('\n')}\n\nYou can make a payment from the Loans page.`,
    suggestions: ['How do loan repayments work?', 'How do I contact support?'],
  };
}

const PERSONALIZED_HANDLERS = {
  balance: handleBalance,
  account_number: handleAccountNumber,
  transactions: handleTransactions,
  my_cards: handleMyCards,
  my_loans: handleMyLoans,
};

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Get a bot reply for a user message.
 * @param {string} message
 * @param {{user?: object, isAuthenticated?: boolean}} context
 * @returns {Promise<{text: string, intent: string, suggestions: string[]}>}
 */
async function getBotReply(message, context = {}) {
  const text = normalize(message);
  const { user = null, isAuthenticated = false } = context;

  if (!text) {
    return {
      text: FALLBACK,
      intent: 'fallback',
      suggestions: ['What is PrimeWave Bank?', 'How do I check my balance?', 'How do I contact support?'],
    };
  }

  // 1) Personalized intents (only useful with an authenticated user)
  const personalized = knowledgeBase.filter((i) => i.personalized);
  let bestPersonalized = null;
  let bestPersonalizedScore = 0;
  for (const intent of personalized) {
    const score = scoreIntent(text, intent);
    if (score > bestPersonalizedScore) {
      bestPersonalizedScore = score;
      bestPersonalized = intent;
    }
  }

  if (bestPersonalized && bestPersonalizedScore > 0) {
    if (!isAuthenticated || !user) {
      return {
        text: LOGIN_PROMPT,
        intent: bestPersonalized.id,
        suggestions: ['How do I log in?', 'What is a seed phrase?', 'How do I contact support?'],
      };
    }
    const handler = PERSONALIZED_HANDLERS[bestPersonalized.id];
    if (handler) {
      try {
        const result = await handler(user);
        return {
          ...result,
          intent: bestPersonalized.id,
          suggestions: result.suggestions || bestPersonalized.suggestions || [],
        };
      } catch (error) {
        console.error('Chatbot personalized handler error:', error);
        return {
          text: `I ran into a small issue while fetching your details. Please try again in a moment, or contact our support team.`,
          intent: bestPersonalized.id,
          suggestions: ['How do I contact support?'],
        };
      }
    }
  }

  // 2) Static knowledge-base intents
  let bestIntent = null;
  let bestScore = 0;
  for (const intent of knowledgeBase) {
    if (intent.personalized) continue;
    const score = scoreIntent(text, intent);
    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent;
    }
  }

  if (bestIntent && bestScore > 0) {
    return {
      text: bestIntent.response,
      intent: bestIntent.id,
      suggestions: bestIntent.suggestions || [],
    };
  }

  // 3) Fallback
  return {
    text: FALLBACK,
    intent: 'fallback',
    suggestions: ['What is PrimeWave Bank?', 'How do I check my balance?', 'How do I transfer money?', 'How do I contact support?'],
  };
}

module.exports = { getBotReply, normalize, scoreIntent };


