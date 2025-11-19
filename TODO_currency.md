# Currency Display Implementation

## Overview
Implement currency display based on user's country for balances and transactions. Currently, the system hardcodes USD ($) in many places. Need to update frontend components to use country-specific currencies.

## Tasks
- [x] Update Transactions.jsx to use currency formatting
- [x] Update Dashboard.jsx recent transactions to use currency
- [x] Update ActivityFeed.jsx messages to use currency
- [x] Update Cards.jsx payment amounts to use currency
- [x] Update AdminDashboard.jsx transaction amounts to use currency
- [x] Update Navbar.jsx notification amounts to use currency
- [x] Update BalanceChart.jsx tooltip to use currency
- [ ] Test currency display for different countries (e.g., Nigeria - NGN)

## Files to Modify
- banking_system/frontend/src/pages/Transactions/Transactions.jsx
- banking_system/frontend/src/pages/Dashboard/Dashboard.jsx
- banking_system/frontend/src/pages/Dashboard/ActivityFeed.jsx
- banking_system/frontend/src/pages/Cards/Cards.jsx
- banking_system/frontend/src/pages/Admin/AdminDashboard.jsx
- banking_system/frontend/src/components/Layout/Navbar.jsx
- banking_system/frontend/src/components/Charts/BalanceChart.jsx

## Notes
- Use `getCurrencyByCountry(user.country)` to get currency code
- Use `formatAmount(amount, currency)` for proper formatting with symbols
- Dashboard already implements this for stats, use as reference
