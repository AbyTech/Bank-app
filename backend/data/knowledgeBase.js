/**
 * PrimeWave Bank - Knowledge Base
 * ---------------------------------------------------------------------------
 * This file contains 100% of the information about the PrimeWave Bank
 * application so the Smartsupp live-chat bot can answer any question a user
 * might ask. Each entry is an "intent" with a set of keywords. The chatbot
 * engine (services/chatbot.js) scores each intent against the user's message
 * and returns the best matching answer.
 */

const knowledgeBase = [
  {
    id: 'welcome',
    title: 'Welcome / Greeting',
    keywords: ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening', 'howdy', 'yo', "what's up", 'wassup'],
    response: `Hello! 👋 Welcome to PrimeWave Bank. I'm the PrimeWave Assistant, your virtual banking helper.

I can answer questions about:
• Opening an account & logging in
• Your balance, account number & transactions
• Sending money & currency conversion
• Cards (ordering, fees, status)
• Loans (applying & repayment)
• Security & support

What would you like help with today?`,
    suggestions: ['What is PrimeWave Bank?', 'How do I check my balance?', 'How do I transfer money?', 'How do I order a card?', 'How do I apply for a loan?', 'How do I contact support?'],
  },
  {
    id: 'thanks',
    title: 'Thanks',
    keywords: ['thank', 'thanks', 'thx', 'appreciate', 'grateful', 'you are the best', 'great help'],
    response: `You're welcome! 😊 Is there anything else I can help you with?

If you ever need a human, our support team is available at:
📧 helpxprimewavebank@gmail.com
💬 Telegram: @helpxprimewavebank
☎️ Phone: +1 (628) 262-9681`,
    suggestions: ['What is PrimeWave Bank?', 'How do I check my balance?', 'How do I contact support?'],
  },
  {
    id: 'about_bank',
    title: 'About PrimeWave Bank',
    keywords: ['what is primewave', 'about the bank', 'about your bank', 'who are you', 'what is this bank', 'about primewave', 'tell me about', 'primewave bank', 'what kind of bank', 'is this a bank', 'who owns', 'company', 'your services', 'what services'],
    response: `PrimeWave Bank is a modern digital (online) banking platform offering a full suite of financial services:

• 💳 Personal checking & savings accounts with multi-currency support
• 💸 Fast internal transfers between accounts, with automatic currency conversion
• 🏦 Debit/Virtual/Physical card issuance (Standard, Gold, Platinum & Black)
• 📈 Personal loans with quick approval and instant funding
• 🪙 Add money via PayPal, Bitcoin, USDT or Ethereum
• 🌍 Accounts in 9+ currencies: USD, NGN, GHS, ZAR, EUR, GBP, CAD, AUD, BRL
• 🔐 Secure login with password or a private seed phrase, plus transaction PIN protection`,

    suggestions: ['Which currencies are supported?', 'How do I open an account?', 'How do I contact support?'],
  },
  {
    id: 'register',
    title: 'Register / Open an account',
    keywords: ['register', 'sign up', 'signup', 'create account', 'create an account', 'create a new account', 'open account', 'open an account', 'open a new account', 'new account', 'how do i join', 'join the bank', 'become a customer', 'enroll', 'get started', 'make an account', 'open a bank account'],
    response: `Opening an account at PrimeWave Bank takes less than a minute! 🎉

1. Go to the Register page (or click "Create Account" on the login page)
2. Enter your full name, email address and choose your country
3. Set a password (at least 6 characters)
4. Click "Create Account"

When you register, we automatically:
• Create your default checking account (with a 10-digit account number)
• Generate a private 12-word seed phrase (BIP39) for recovery
• Notify our admin team so they can monitor the new registration

After registering you'll be directed to log in with your email and password.`,
    suggestions: ['What is a seed phrase?', 'How do I log in?', 'What account do I get when I register?'],
  },
  {
    id: 'login',
    title: 'Login',
    keywords: ['login', 'log in', 'sign in', 'signin', 'access my account', 'access account', 'can not login', "can't login", 'cannot login', 'unable to login', 'login problem', 'authentication'],
    response: `You can log in to PrimeWave Bank in two ways:

🔑 With your password:
1. Go to the Login page
2. Enter your email and password
3. Click "Access My Account"

🔐 With your seed phrase (old users / recovery):
1. Go to the Login page
2. Enter your email
3. Paste your 12-word seed phrase in the "Seed Phrase" field
4. Click "Access My Account"

Your session stays valid for 30 days.

If you can't log in, please make sure your email is spelled correctly, or that your account has not been blocked. If you're still stuck, contact our support team.`,
    suggestions: ['I forgot my password', 'My account is blocked', 'What is a seed phrase?', 'How do I contact support?'],
  },
  {
    id: 'forgot_password',
    title: 'Forgot password / reset',
    keywords: ['forgot password', 'forgot my password', 'reset password', 'change password', 'lost password', 'cant remember password', "can't remember my password", 'password reset', 'recover password'],
    response: `If you've forgotten your password, don't worry — you can still get into your account:

🔐 Use your 12-word seed phrase
1. Go to the Login page
2. Enter your email
3. Type your 12-word seed phrase into the "Seed Phrase (Old Users Only)" field
4. Click "Access My Account"

If you have also lost your seed phrase, the security of your account cannot be guaranteed and we are unable to recover it for you. In that case, please contact our support team immediately:
📧 helpxprimewavebank@gmail.com
💬 Telegram: @helpxprimewavebank
☎️ Phone: +1 (628) 262-9681`,
    suggestions: ['What is a seed phrase?', 'How do I contact support?'],
  },
  {
    id: 'seed_phrase',
    title: 'Seed phrase / recovery phrase',
    keywords: ['seed phrase', 'seed', 'recovery phrase', '12 words', 'mnemonic', 'backup phrase', 'recover account', 'recover my account', 'restore account', 'back up my account'],
    response: `Your seed phrase is the most important piece of your PrimeWave Bank account. 🔐

What it is:
• A sequence of 12 words generated when you register (BIP39 standard)
• The only way to recover your account if you lose your password

How to keep it safe:
✅ Write it down on paper and store it offline
✅ Keep multiple copies in secure locations
✅ Only enter it on the official PrimeWave Bank login page

Never do this:
❌ Never share it with anyone — even our support team will never ask for it
❌ Never store it in plain text online or send it via email/messages
❌ Never take a photo of it on your phone

⚠️ Important: PrimeWave Bank cannot recover a lost seed phrase. If you lose both your password and seed phrase, you lose access to your account permanently.`,
    suggestions: ['How do I log in with my seed phrase?', 'I lost my seed phrase', 'How do I contact support?'],
  },
  {
    id: 'blocked_account',
    title: 'Blocked / restricted account',
    keywords: ['blocked', 'my account is blocked', 'account blocked', 'restricted', 'suspended', 'suspension', 'banned', 'can not access my account', "can't access my account", 'blocked account'],
    response: `If your account has been blocked, it means our security team has placed a restriction on it, usually for verification or security reasons.

What you'll see:
• When you try to log in, you'll get: "Your account has been blocked. Please contact support for more information."
• You won't be able to access any of your banking features.

What to do:
1. Contact our support desk to verify your account and identity
2. Have your registered email and a valid ID ready
3. Our team will review and restore access as quickly as possible

📧 helpxprimewavebank@gmail.com
💬 Telegram: @helpxprimewavebank
☎️ Phone: +1 (628) 262-9681`,
    suggestions: ['How do I contact support?', 'How do I log in?'],
  },
  {
    id: 'two_fa',
    title: 'Two-factor authentication (2FA)',
    keywords: ['2fa', 'two factor', 'two-factor', 'two step verification', 'authentication code', 'otp', 'verification code', 'security code', 'two step'],
    response: `Two-factor authentication (2FA) adds an extra layer of security to your account.

Current status:
• The 2FA page and interface exist in the application (a 6-digit code screen).
• Full 2FA delivery/verification is not active on the backend yet, so the code step is currently skipped.

Recommended security practices in the meantime:
✅ Use a strong, unique password
✅ Keep your seed phrase safe and offline
✅ Only access the app on a secure network
✅ Always check you are on the official PrimeWave Bank website

We are working on full 2FA support. For any questions, contact support@primewavebank.com or helpxprimewavebank@gmail.com.`,
    suggestions: ['What is a seed phrase?', 'How do I secure my account?', 'How do I contact support?'],
  },
  {
    id: 'accounts',
    title: 'Accounts (types & details)',
    keywords: ['account', 'accounts', 'checking account', 'savings account', 'what account do i have', 'account type', 'account types', 'open another account', 'new account type', 'add an account', 'account number'],
    response: `Every PrimeWave Bank customer gets a default checking account when they register. 💳

Account types:
• Checking — your main everyday account (created automatically at signup)
• Savings — available to open later from the Accounts section

Account features:
• 10-digit account number (unique)
• Starts with a $0.00 balance
• Currency is based on your country (USD, NGN, GHS, ZAR, EUR, GBP, CAD, AUD or BRL)

You can view your account(s) and balances on the Dashboard. If you'd like an additional account in a different currency, contact our support team and we'll help you set it up.`,
    suggestions: ['How do I check my balance?', 'Which currencies are supported?', 'How do I contact support?'],
  },
  {
    id: 'balance',
    title: 'Balance inquiry (personalized)',
    keywords: ['balance', 'my balance', 'how much money do i have', 'how much do i have', 'available balance', 'account balance', 'current balance', 'total balance', 'money in my account', 'funds available'],
    response: null, // handled dynamically by the chatbot engine (personalized)
    personalized: true,
    suggestions: ['Show my recent transactions', 'How do I transfer money?'],
  },
  {
    id: 'account_number',
    title: 'Account number (personalized)',
    keywords: ['account number', 'my account number', 'what is my account number', 'account no', 'account number please', 'iban'],
    response: null, // handled dynamically by the chatbot engine (personalized)
    personalized: true,
    suggestions: ['How do I transfer money?', 'How do I check my balance?'],
  },
  {
    id: 'transactions',
    title: 'Recent transactions (personalized)',
    keywords: ['transactions', 'transaction history', 'recent transactions', 'my transactions', 'show my transactions', 'statement', 'account activity', 'last transactions', 'history'],
    response: null, // handled dynamically by the chatbot engine (personalized)
    personalized: true,
    suggestions: ['How do I transfer money?', 'How do I check my balance?'],
  },
  {
    id: 'deposit',
    title: 'Deposit / Add money',
    keywords: ['deposit', 'deposit money', 'add money', 'add funds', 'fund my account', 'credit my account', 'top up', 'topup', 'put money in', 'load money', 'funding', 'paypal', 'fund with paypal', 'add money with paypal'],
    response: `To add money to your PrimeWave Bank account, click "Add Money" on your Dashboard. 💰

You can fund your account using:

💳 PayPal
Contact our support team for the official PayPal payment details:
📧 helpxprimewavebank@gmail.com

₿ Bitcoin — send to:
bc1qqewmm3lx7vcw6kwhhx4yfkdav2y04tjmj5sgr4

💠 USDT (TRC-20) — send to:
TYQZA5U7JLw4fw9JH4F96kSVhTAaNeK7db

◆ Ethereum (ETH) — send to:
0x0FE884e5B0d6eCd44B565986af8A582ea25CeC45

How it works:
• Tap a funding method in the "Add Money" window
• Copy the wallet address or scan the QR code
• Send the payment from your own crypto wallet — it is not deducted from your account balance
• Your account is credited once the payment is confirmed

Need help funding your account? Contact our support team.`,

    suggestions: ['How do I add money with crypto?', 'How do I transfer money?', 'How do I contact support?'],
  },
  {
    id: 'crypto_funding',
    title: 'Crypto funding (Bitcoin / USDT / Ethereum)',
    keywords: ['bitcoin', 'btc', 'ethereum', 'eth', 'usdt', 'crypto', 'cryptocurrency', 'wallet address', 'qr code', 'send bitcoin', 'send eth', 'send usdt', 'pay with crypto', 'crypto payment', 'tron', 'trc20', 'trc-20', 'usdt address', 'bitcoin address'],
    response: `You can fund your PrimeWave Bank account with cryptocurrency. 🪙

How it works:
1. Open the "Add Money" window (Dashboard → Add Money)
2. Choose Bitcoin, USDT or Ethereum
3. Copy the wallet address OR scan the QR code shown
4. Send the payment from your own crypto wallet — it is NOT deducted from your account balance
5. Your account is credited once the payment is confirmed

Wallet addresses:
• Bitcoin (BTC): bc1qqewmm3lx7vcw6kwhhx4yfkdav2y04tjmj5sgr4
• USDT (TRC-20): TYQZA5U7JLw4fw9JH4F96kSVhTAaNeK7db
• Ethereum (ETH): 0x0FE884e5B0d6eCd44B565986af8A582ea25CeC45

Important:
• Send only the matching asset to each address — sending another asset may cause permanent loss
• Confirmations take a little time before your balance is updated

Need help? Contact our support team:
📧 helpxprimewavebank@gmail.com
💬 Telegram: @helpxprimewavebank`,
    suggestions: ['How do I add money?', 'How do I contact support?'],
  },
  {
    id: 'withdrawal',
    title: 'Withdrawal / Cash out',
    keywords: ['withdraw', 'withdrawal', 'withdraw money', 'cash out', 'cashout', 'take out money', 'get my money out', 'make a withdrawal', 'transfer to bank'],
    response: `Withdrawals at PrimeWave Bank require an active card. 🏦

Before you can withdraw:
1. You need an active (approved) card on your account
2. If you don't have one, the app will prompt you to order a card first

How to withdraw:
1. Go to the Transactions page (or use the "Withdraw" Quick Action on the Dashboard)
2. Choose the account and enter the amount
3. Confirm the withdrawal

Notes:
• You can only withdraw up to your available balance
• Withdrawals are recorded instantly in your transaction history

If you don't have an active card yet, tap the "Cards" Quick Action on your Dashboard to order one.`,
    suggestions: ['How do I order a card?', 'How do I transfer money?', 'How do I contact support?'],
  },
  {
    id: 'transfer',
    title: 'Transfers / Send money',
    keywords: ['transfer', 'transfer money', 'send money', 'send funds', 'wire', 'send to someone', 'pay someone', 'make a transfer', 'bank transfer', 'transfer to another account', 'recipient', 'receive money'],
    response: `Sending money with PrimeWave Bank is fast and easy! 💸

How to make a transfer:
1. Open the Transactions page (or click "Send Money" on the Dashboard)
2. Select the account you want to send from
3. Enter the recipient's 10-digit account number
4. Enter the amount and (optionally) a description
5. Confirm the transfer

Good to know:
• The recipient's name is shown after you enter their account number, so you can verify before sending
• If the recipient uses a different currency, the amount is converted automatically using live exchange rates (you'll see a conversion preview)
• Transfers are instant and appear in both your and the recipient's transaction history
• You cannot transfer to your own account

Need to receive money? Just share your own 10-digit account number with the sender.`,
    suggestions: ['How does currency conversion work?', 'How do I find my account number?', 'How do I contact support?'],
  },
  {
    id: 'currency',
    title: 'Currencies & exchange rates',
    keywords: ['currency', 'currencies', 'exchange rate', 'conversion', 'convert', 'exchange', 'usd', 'ngn', 'ghs', 'zar', 'eur', 'gbp', 'cad', 'aud', 'brl', 'naira', 'dollar', 'euro', 'pounds', 'cedis'],
    response: `PrimeWave Bank supports accounts in 9 currencies: 🌍

💵 USD (US Dollar)     ₦ NGN (Nigerian Naira)
₵ GHS (Ghanaian Cedi)   R ZAR (South African Rand)
€ EUR (Euro)             £ GBP (British Pound)
C$ CAD (Canadian Dollar)  A$ AUD (Australian Dollar)
R$ BRL (Brazilian Real)

Your account currency is set automatically based on the country you register with.

Currency conversion:
• When you send money to someone with a different currency, the amount is converted automatically
• Live exchange rates are fetched from a currency API and cached for 15 minutes
• You'll see a conversion preview before confirming the transfer

If you need a specific currency account, contact support and we'll set one up for you.`,
    suggestions: ['How do I transfer money?', 'How do I check my balance?', 'How do I contact support?'],
  },
  {
    id: 'cards',
    title: 'Cards overview',
    keywords: ['card', 'cards', 'debit card', 'credit card', 'virtual card', 'physical card', 'bank card', 'atm card', 'card features'],
    response: `PrimeWave Bank offers banking cards to spend and manage your money. 💳

Card types:
• Virtual card — a digital card for secure online payments, subscription management and more
• Physical card — a plastic card delivered to your address for in-person and ATM use

Both come in four categories with a one-time issuance fee:
• Standard — 1,450
• Gold — 1,830
• Platinum — 2,600
• Black — 3,700

Every card comes with:
• A unique 16-digit card number
• An expiry date (cards are valid for 4 years)
• A 3-digit CVV for online purchases
• Your own secure card PIN (completely separate from your transaction PIN)

The issuance fee is paid to the bank through another account — contact our support team for the payment details. Your card is issued once the payment is confirmed and the application is approved.

To get a card, open the Cards page and choose "Get a New Card". See your cards anytime from the Cards section of the app.`,

    suggestions: ['How do I order a card?', 'How much does a card cost?', 'My card was rejected', 'How do I contact support?'],
  },
  {
    id: 'card_order',
    title: 'Ordering a card',
    keywords: ['order card', 'order a card', 'buy card', 'purchase card', 'get a card', 'apply for card', 'new card', 'request a card', 'how do i get a card', 'order a virtual card', 'order a physical card', 'order virtual card', 'order physical card', 'get a virtual card', 'get a physical card'],
    response: `Ordering a card at PrimeWave Bank is simple: 🛍️

1. Open the Cards page
2. Tap "Get a New Card"
3. Choose your card type (Virtual or Physical)
4. Pick a category (Standard, Gold, Platinum or Black)
5. Complete the application form — physical cards also require your delivery address
6. Create a secure 4-digit card PIN (separate from your transaction PIN)
7. Review your details, agree to the Terms and Conditions and submit

What happens next:
• Your application is reviewed by our admin team
• The one-time issuance fee is paid to the bank through another account — contact our support team for the payment details
• Once the payment is confirmed and the application is approved, the card becomes active
• Applications that are not paid for within 7 days are automatically rejected with the reason "Due to delay in payment"

You can track the status of your card application from the Cards page at any time.

Need help with payment? Our support team will guide you through the secure payment process:
📧 helpxprimewavebank@gmail.com`,
    suggestions: ['How much does a card cost?', 'How long does card approval take?', 'How do I contact support?'],
  },
  {
    id: 'card_cost',
    title: 'Card cost / fees',
    keywords: ['cost', 'price', 'fee', 'fees', 'how much is a card', 'card fee', 'card price', 'payment for card', 'how much to pay', 'charges', 'issuance fee', 'how much does a card cost', 'card cost', 'cost of a card', 'card charges', 'card pricing'],
    response: `Here's the current card pricing: 💰

Virtual & Physical card categories (one-time issuance fee):
• Standard — 1,450
• Gold — 1,830
• Platinum — 2,600
• Black — 3,700

How payment works:
• The fee is paid to the bank through another account — it is not deducted from your account balance
• Contact our support team for the payment details and to confirm your payment
• Your card is issued once the payment is confirmed and the application is approved

Applications that are not paid for within 7 days are automatically rejected with the reason "Due to delay in payment".

For help with payment or questions about charges, contact our support team:
📧 helpxprimewavebank@gmail.com
💬 Telegram: @helpxprimewavebank`,
    suggestions: ['How do I order a card?', 'How do I contact support?'],
  },
  {
    id: 'card_status',
    title: 'Card statuses / tracking',
    keywords: ['card status', 'status of my card', 'pending payment', 'card pending', 'approval', 'card approved', 'card declined', 'card active', 'card expired', 'card blocked', 'track card'],
    response: `Here's how to understand your card application status: 📊

• Active 🟢 — your card is approved and ready to use
• Pending 🟡 — application received, waiting for our admin team to review
• Pending Payment 🟡 — waiting for payment
• Rejected 🔴 — the application was declined (the reason is shown, e.g. "Due to delay in payment")
• Expired ⚪ — the card reached its expiry date
• Blocked 🔴 — the card has been frozen for security reasons

Where to check:
• Open the Cards page — each card shows its status and details
• Applications that are not paid for within 7 days are automatically rejected with the reason "Due to delay in payment"

If a card was rejected and you'd like to understand why, contact our support team — they'll walk you through it.`,
    suggestions: ['My card was rejected', 'How do I order a card?', 'How do I contact support?'],
  },
  {
    id: 'card_rejected',
    title: 'Card rejected',
    keywords: ['rejected', 'rejection', 'card rejected', 'declined card', 'card declined', 'why was my card rejected', 'application rejected', 'due to delay in payment'],
    response: `Sorry your card application was rejected. 😔 Here's what you need to know:

Why it happens:
• Applications are reviewed manually by our admin team
• Applications can be declined for verification or policy reasons
• Applications that are not paid for within 7 days are automatically rejected with the reason "Due to delay in payment"
• The reason for rejection is recorded on the card and shown in the app

What to do next:
1. Open the Cards page and find the rejected card to see the rejection reason
2. Contact our support team to understand the reason and discuss reapplication
3. Our team will help you correct any issues and place a new application

Contact support:
📧 helpxprimewavebank@gmail.com
💬 Telegram: @helpxprimewavebank`,
    suggestions: ['How do I order a card?', 'How do I contact support?'],
  },
  {
    id: 'transaction_pin',
    title: 'Transaction PIN',
    keywords: ['transaction pin', 'set transaction pin', 'change transaction pin', 'create transaction pin', 'my transaction pin', 'forgot my transaction pin', 'what is a transaction pin', 'transaction pin not working', 'setup my pin', 'set up my pin'],
    response: `Your transaction PIN is a secure 4-digit code used to authorize transactions on your account. 🔐

Setting it up (first time):
• The first time you log in without a transaction PIN, a security pop-up will ask you to create one
• Enter a 4-digit PIN and confirm it
• It is saved securely (encrypted) and used to authorize transactions

Changing it:
1. Go to the Profile page
2. Open the "Transaction PIN" section
3. Tap "Change Transaction PIN"
4. Enter your current PIN, then your new PIN (and confirm)

Important:
• Your transaction PIN is completely separate from your card PIN
• It is encrypted and never stored or shown in plaintext
• Never share your transaction PIN with anyone — our support team will never ask for it

If you've forgotten your transaction PIN or need help, contact our support team:
📧 helpxprimewavebank@gmail.com`,
    suggestions: ['How do I set up my transaction PIN?', 'What is my card PIN?', 'How do I contact support?'],
  },
  {
    id: 'card_pin',
    title: 'Card PIN',
    keywords: ['card pin', 'card pin number', 'set card pin', 'create card pin', 'my card pin', 'pin for my card', 'card pin security', 'what is my card pin'],
    response: `Your card PIN is a secure 4-digit code for your card, created when you apply for a virtual or physical card. 💳

How it works:
• You create your card PIN during the card application (after choosing your card type and category)
• It is completely separate from your transaction PIN
• It is encrypted and never stored or shown in plaintext

Important:
• Once you create your card PIN, please contact the official bank support team to ask about any available PIN security or encryption measures to help prevent unauthorized use of your card
• For your protection, never share your PIN with anyone, not even a bank representative
• Legitimate bank staff should never ask you to disclose your PIN

Contact support:
📧 helpxprimewavebank@gmail.com
💬 Telegram: @helpxprimewavebank`,
    suggestions: ['How do I set my transaction PIN?', 'How do I order a card?', 'How do I contact support?'],
  },
  {
    id: 'account_status',
    title: 'Account status (Active / Inactive)',
    keywords: ['account status', 'inactive account', 'my account is inactive', 'why is my account inactive', 'activate my account', 'reactivate account', 'account not active', 'active account', 'why can i not make transactions', 'why cant i make transactions', 'account deactivated'],
    response: `Your account status is either Active or Inactive. 🏦

Active:
• You can use all features — send money, order cards, apply for loans and more

Inactive:
• An inactive account cannot make transactions (transfers, withdrawals, deposits or loans)
• You can still view your dashboard and profile
• For new cards, the one-time issuance fee is paid to the bank through another account — once the card is paid for, the account becomes ready to make transactions

How to reactivate:
• Contact our support team — they will guide you through the process
📧 helpxprimewavebank@gmail.com
💬 Telegram: @helpxprimewavebank
☎️ Phone: +1 (628) 262-9681

Note: only our admin team can change your account status — you cannot change it yourself.`,
    suggestions: ['How do I order a card?', 'How do I contact support?'],
  },
  {
    id: 'loans',
    title: 'Loans overview',
    keywords: ['loan', 'loans', 'borrow', 'credit', 'financing', 'loan options', 'get a loan', 'take a loan'],
    response: `PrimeWave Bank offers personal loans with a simple, fast process. 📈

Key features:
• Apply entirely online from the Loans page
• 8% annual interest rate (fixed)
• Flexible repayment terms (choose your duration in months)
• Loans are approved immediately upon application
• Funds are deposited straight into your checking account

Loan application checklist:
• A completed application form (amount, duration, purpose)
• Your phone number and address
• A government ID document (passport, driver's license, or national ID card) — upload it as a file

Ready to apply? Open the Loans page and click "Apply for a Loan".`,
    suggestions: ['How do I apply for a loan?', 'How do loan repayments work?', 'How do I contact support?'],
  },
  {
    id: 'loan_apply',
    title: 'Applying for a loan',
    keywords: ['apply for loan', 'apply for a loan', 'apply loan', 'loan application', 'how do i get a loan', 'i want a loan', 'can i get a loan', 'loan apply', 'request loan', 'loan requirements', 'loan documents'],
    response: `Applying for a loan takes just a few minutes! 📝

Steps:
1. Open the Loans page
2. Click "Apply for a Loan"
3. Fill in the form:
   • Loan amount and duration (months)
   • Purpose of the loan
   • Phone number and address
4. Choose your identification type and upload your ID document (passport, driver's license or national ID — JPG, PNG or PDF, max 1MB)
5. Submit the application

What happens next:
• Your loan is approved immediately ✅
• The loan amount is deposited straight into your checking account
• A transaction record is added to your history

Interest is fixed at 8% per year, and your monthly payment is calculated automatically.`,
    suggestions: ['How do loan repayments work?', 'What is the loan interest rate?', 'How do I contact support?'],
  },
  {
    id: 'loan_payment',
    title: 'Loan repayment',
    keywords: ['loan payment', 'pay loan', 'repayment', 'pay back', 'monthly payment', 'loan installment', 'settle loan', 'clear loan', 'repay'],
    response: `Repaying your PrimeWave Bank loan is easy: 💳

1. Open the Loans page
2. Find your loan and click "Make Payment"
3. Enter the payment amount (up to the remaining balance)
4. Confirm — the amount is deducted from your checking account and applied to the loan

Details:
• Your monthly payment amount is calculated at approval (8% annual interest)
• You can see the remaining balance and repayment progress on the Loans page
• When the remaining balance reaches zero, the loan is marked as "Paid" ✅

Make sure your checking account has enough balance to cover the payment.`,
    suggestions: ['How do I apply for a loan?', 'What is my loan balance?', 'How do I contact support?'],
  },
  {
    id: 'my_loans',
    title: 'My loans (personalized)',
    keywords: ['my loans', 'my loan', 'my loan balance', 'my loan status', 'loan balance', 'how much do i owe', 'remaining balance', 'active loans'],
    response: null, // handled dynamically by the chatbot engine (personalized)
    personalized: true,
    suggestions: ['How do loan repayments work?', 'How do I contact support?'],
  },
  {
    id: 'profile',
    title: 'Profile & account settings',
    keywords: ['profile', 'edit profile', 'update profile', 'change my name', 'change name', 'profile photo', 'profile picture', 'phone number', 'update my information', 'my details', 'account settings', 'change country'],
    response: `You can manage your personal details from the Profile page. 👤

You can update:
• First name & last name
• Country
• Phone number
• Profile photo (uploaded securely to the cloud — it stays with your account across all devices and logins)
• Transaction PIN (create or change it from the "Transaction PIN" security section)

How to update:
1. Go to the Profile page
2. Click "Edit Profile"
3. Make your changes and save

Notes:
• Your email address is your login identifier
• Your currency is based on the country on your profile
• Completing your profile (name, country and phone) marks your profile as complete in the app

For changes to your email or any issue with your profile, contact support.`,
    suggestions: ['How do I check my balance?', 'How do I contact support?'],
  },
  {
    id: 'my_cards',
    title: 'My cards (personalized)',
    keywords: ['my cards', 'show my cards', 'my card status', 'list my cards', 'my card number', 'my cards list', 'show my card'],
    response: null, // handled dynamically by the chatbot engine (personalized)
    personalized: true,
    suggestions: ['How do I order a card?', 'How do I contact support?'],
  },
  {
    id: 'security',
    title: 'Account security',
    keywords: ['security', 'secure my account', 'is my account safe', 'safe', 'hacked', 'phishing', 'fraud', 'scam', 'protect my account', 'privacy', 'secure', 'identity theft'],
    response: `Your account security is our top priority. 🔐 Here's how we keep you safe and how you can help:

What we do:
• Passwords are encrypted (hashed) before storage
• Transaction PINs and card PINs are encrypted (hashed) — never stored in plaintext
• New registrations are monitored by our admin team
• Blocked-account and inactive-account controls to stop unauthorized access
• Session tokens that expire after 30 days

What you should do:
✅ Use a strong, unique password
✅ Keep your 12-word seed phrase private and offline
✅ Set up your transaction PIN from the security pop-up or the Profile page
✅ Only log in on the official PrimeWave Bank website
✅ Use a secure network (avoid public Wi-Fi for banking)

Never:
❌ Share your seed phrase, transaction PIN, card PIN or password with anyone
❌ Enter your credentials on look-alike sites
❌ Send money to strangers or "support agents" requesting fees
❌ Disclose your card PIN to anyone — even a bank representative should never ask for it

If you suspect fraud on your account, contact us immediately:
📧 helpxprimewavebank@gmail.com
💬 Telegram: @helpxprimewavebank
☎️ Phone: +1 (628) 262-9681`,
    suggestions: ['What is a seed phrase?', 'How does 2FA work?', 'My account is blocked', 'How do I contact support?'],
  },
  {
    id: 'contact',
    title: 'Contact / Reach support',
    keywords: ['contact', 'contact support', 'contact us', 'support email', 'reach you', 'talk to a human', 'human agent', 'real person', 'agent', 'customer service', 'customer support', 'help desk', 'get help', 'complaint'],
    response: `We're here for you 24/7! Here's how to reach the PrimeWave Bank support team: 📞

📧 Email: helpxprimewavebank@gmail.com
💬 Telegram: @helpxprimewavebank (t.me/helpxprimewavebank)
☎️ Phone: +1 (628) 262-9681

Response time: usually within 5 minutes during online hours.

💡 Tip: our support team will never ask for your password or seed phrase.`,
    suggestions: ['My account is blocked', 'How do I secure my account?'],
  },
  {
    id: 'admin_help',
    title: 'Admin panel (for admins)',
    keywords: ['admin', 'admin panel', 'admin dashboard', 'manage users', 'block user', 'approve card', 'user management', 'admin login', 'administrator'],
    response: `The Admin Dashboard gives our team full control over the platform: 🛠️

• 📊 Overview stats — total users, active cards, pending approvals, balances
• 👥 User management — search users, view full details (accounts, transactions, cards, loans)
• 💰 Balance management — update a user's account balance (logged as an admin transaction)
• 🚫 Block/unblock users — instantly restrict or restore account access
• 🏦 Account status management — set a user's account Active or Inactive
• 💳 Card approvals — review and approve/decline pending card applications (with rejection reason)

Only accounts with the "admin" role can access the Admin Dashboard. If you believe you should have admin access, contact the platform administrator.`,
    suggestions: ['How do I contact support?', 'How do I order a card?'],
  },
];

module.exports = knowledgeBase;
