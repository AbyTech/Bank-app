# Currency Conversion for Transfers

## Overview
Implement real-time currency conversion for transfers between users with different currencies. When a user sends money to another user with a different currency, the system should convert the amount using current exchange rates.

## Tasks
- [ ] Integrate exchange rate API (exchangerate-api.com)
- [ ] Create exchange rate service/utility
- [ ] Modify transfer controller to handle currency conversion
- [ ] Update transaction model to store conversion details
- [ ] Update TransferForm to show conversion preview
- [ ] Add conversion confirmation dialog
- [ ] Test cross-currency transfers

## Files to Modify
- `backend/controllers/transactions.js` - Transfer logic
- `backend/models/Transaction.js` - Add conversion fields
- `frontend/src/components/TransferForm.jsx` - Conversion preview
- `backend/services/exchangeRate.js` - New service for rates
- `frontend/src/services/currency.jsx` - Add conversion utilities

## API Integration
- Use exchangerate-api.com for real-time rates
- Cache rates for performance (update every 15 minutes)
- Handle API errors gracefully with fallback rates

## Transaction Storage
- Store original amount and currency
- Store converted amount and currency
- Store exchange rate used for the conversion
