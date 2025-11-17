const Loan = require('../models/Loan');
const Account = require('../models/Account');

// @desc    Get all loans for a user
// @route   GET /api/loans
// @access  Private
exports.getLoans = async (req, res, next) => {
  try {
    const loans = await Loan.find({ user: req.user.id }).populate('account', 'accountNumber accountType');

    // Calculate repayment progress for each loan
    const loansWithProgress = loans.map(loan => {
      const repaymentProgress = loan.loanAmount > 0
        ? Math.round(((loan.loanAmount - loan.remainingBalance) / loan.loanAmount) * 100)
        : 0;

      return {
        ...loan.toObject(),
        repaymentProgress,
      };
    });

    res.status(200).json({
      success: true,
      count: loans.length,
      data: loansWithProgress,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Apply for a loan
// @route   POST /api/loans/apply
// @access  Private
exports.applyForLoan = async (req, res, next) => {
  console.log('Request Body:', req.body);
  console.log('Request File:', req.file);
  try {
    const {
      amount,
      duration,
      purpose,
      phoneNumber,
      address,
      identificationType
    } = req.body;

    // Get user's checking account
    const account = await Account.findOne({ user: req.user.id, accountType: 'checking' });
    if (!account) {
      return res.status(404).json({ success: false, error: 'No checking account found' });
    }

    // Calculate loan details (simplified calculation)
    const loanAmount = parseFloat(amount);
    const termMonths = parseInt(duration);
    const interestRate = 0.08; // 8% annual interest rate
    const monthlyRate = interestRate / 12;
    const monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
                          (Math.pow(1 + monthlyRate, termMonths) - 1);

    // Handle file upload
    let identificationDocument = '';
    if (req.file) {
      identificationDocument = req.file.path;
    } else {
      return res.status(400).json({ success: false, error: 'Identification document file is missing from the request' });
    }

    const loan = await Loan.create({
      user: req.user.id,
      account: account._id,
      loanAmount,
      interestRate,
      termMonths,
      monthlyPayment: Math.round(monthlyPayment * 100) / 100, // Round to 2 decimal places
      remainingBalance: loanAmount,
      purpose,
      phoneNumber,
      address,
      identificationType,
      identificationDocument,
      status: 'approved', // Loans are approved immediately
    });

    // Immediately add loan amount to user's account balance
    account.balance += loanAmount;
    await account.save();

    // Create a transaction record for the loan deposit
    const Transaction = require('../models/Transaction');
    await Transaction.create({
      user: req.user.id,
      account: account._id,
      type: 'deposit',
      amount: loanAmount,
      description: `Loan deposit - ${purpose}`,
      balance: account.balance,
      status: 'completed',
    });

    console.log(`Loan ${loan._id} approved immediately and funds deposited`);

    res.status(201).json({
      success: true,
      data: loan,
    });
  } catch (error) {
    console.error('Error applying for loan:', error); // Log the full error
    res.status(400).json({ success: false, error: error.message, details: error });
  }
};

// @desc    Make a loan payment
// @route   POST /api/loans/:id/payment
// @access  Private
exports.makePayment = async (req, res, next) => {
  try {
    const { paymentAmount } = req.body;

    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({ success: false, error: 'Loan not found' });
    }

    // Verify loan belongs to user
    if (loan.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    // Check if loan is active
    if (loan.status !== 'approved') {
      return res.status(400).json({ success: false, error: 'Loan is not active' });
    }

    // Get user's checking account
    const account = await Account.findOne({ user: req.user.id, accountType: 'checking' });
    if (!account) {
      return res.status(404).json({ success: false, error: 'No checking account found' });
    }

    // Check if account has sufficient balance
    if (account.balance < paymentAmount) {
      return res.status(400).json({ success: false, error: 'Insufficient account balance' });
    }

    // Update account balance (deduct payment)
    account.balance -= paymentAmount;
    await account.save();

    // Update remaining balance
    loan.remainingBalance = Math.max(0, loan.remainingBalance - paymentAmount);

    // Check if loan is paid off
    if (loan.remainingBalance === 0) {
      loan.status = 'paid';
    }

    await loan.save();

    // Create a transaction record for the payment
    const Transaction = require('../models/Transaction');
    await Transaction.create({
      user: req.user.id,
      account: account._id,
      type: 'payment',
      amount: paymentAmount,
      description: `Loan payment - ${loan._id}`,
      balance: account.balance,
      loan: loan._id,
      status: 'completed',
    });

    res.status(200).json({
      success: true,
      data: loan,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
