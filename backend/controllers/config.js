const fundingMethods = require('../data/fundingMethods');

// @desc    Get funding methods (PayPal / crypto wallet addresses)
// @route   GET /api/config/funding
// @access  Private
// Wallet addresses come from server-side environment variables and are only
// exposed to authenticated users. PayPal intentionally has no address - users
// are directed to contact support.
exports.getFundingConfig = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: fundingMethods,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
