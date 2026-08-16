const Card = require('../models/Card');

/**
 * Card application expiration.
 * ---------------------------------------------------------------------------
 * If a card application remains pending for 7 days without being approved it
 * automatically expires. On the admin side it disappears from the active
 * pending list (because its approvalStatus becomes 'declined') while the user
 * still sees it in their history as Rejected with the reason
 * "Due to delay in payment".
 *
 * The mechanism is server-side and idempotent: it is triggered both by a
 * background interval (see server.js) and lazily before the relevant card
 * queries so it never depends on the frontend to calculate expiration.
 */

const CARD_APPLICATION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Mark every overdue pending card application as expired/rejected.
 * @returns {Promise<number>} number of applications expired
 */
async function expireOverdueCards() {
  const cutoff = new Date(Date.now() - CARD_APPLICATION_TTL_MS);

  const overdue = await Card.find({
    approvalStatus: 'pending',
    createdAt: { $lt: cutoff },
  });

  let expiredCount = 0;
  for (const card of overdue) {
    card.approvalStatus = 'declined';
    card.purchaseStatus = 'declined';
    card.status = 'rejected';
    card.rejectionReason = 'Due to delay in payment';
    card.rejectionDate = new Date();
    await card.save();
    expiredCount += 1;
  }

  if (expiredCount > 0) {
    console.log(`[cardExpiration] Expired ${expiredCount} pending card application(s) older than 7 days.`);
  }

  return expiredCount;
}

module.exports = { expireOverdueCards, CARD_APPLICATION_TTL_MS };
