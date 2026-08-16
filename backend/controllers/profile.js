const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const { cloudinary, isConfigured: isCloudinaryConfigured } = require('../services/cloudinary');

// Configure multer for profile-photo uploads (memory storage so we can stream
// the file straight to Cloudinary).
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

// Validate a 4-digit numeric PIN
const PIN_REGEX = /^\d{4}$/;

const isPinValid = (pin) => PIN_REGEX.test(String(pin || ''));

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    // Explicitly exclude sensitive fields (negative projections can bypass
    // schema-level `select: false`).
    const user = await User.findById(req.user.id).select('-password -seedPhrase -transactionPin');

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Update user profile (including Cloudinary profile-photo upload)
// @route   PUT /api/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['firstName', 'lastName', 'country', 'phone'];
    const updates = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Handle profile photo upload -> Cloudinary
    if (req.file) {
      if (!isCloudinaryConfigured()) {
        return res.status(500).json({
          success: false,
          error: 'Profile photo uploads are not configured. Please set the Cloudinary environment variables.',
        });
      }

      try {
        const uploadResult = await uploadProfilePhotoToCloudinary(req.file, req.user.id);
        updates.profilePhoto = uploadResult.secure_url;
        updates.profilePhotoPublicId = uploadResult.public_id;
      } catch (uploadError) {
        console.error('Cloudinary upload failed:', uploadError.message);
        return res.status(400).json({
          success: false,
          error: 'Failed to upload profile picture. Please try again.',
        });
      }
    }

    // Check if profile is completed (has required fields)
    const currentUser = await User.findById(req.user.id).select('firstName lastName country phone profilePhoto profilePhotoPublicId');
    const hasFirstName = updates.firstName || currentUser.firstName;
    const hasLastName = updates.lastName || currentUser.lastName;
    const hasCountry = updates.country || currentUser.country;
    const hasPhone = updates.phone || currentUser.phone;

    if (hasFirstName && hasLastName && hasCountry && hasPhone) {
      updates.profileCompleted = true;
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    }).select('-password -seedPhrase -transactionPin');

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Clean up the previous Cloudinary image (best effort - never fails the request)
    if (updates.profilePhotoPublicId && currentUser.profilePhotoPublicId &&
        currentUser.profilePhotoPublicId !== updates.profilePhotoPublicId) {
      deleteCloudinaryImage(currentUser.profilePhotoPublicId);
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Upload a profile photo buffer to Cloudinary.
 * @param {object} file - multer file
 * @param {string} userId
 */
function uploadProfilePhotoToCloudinary(file, userId) {
  return new Promise((resolve, reject) => {
    const publicId = `user-${userId}-${Date.now()}`;
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        folder: 'primewave/profile-photos',
        resource_type: 'image',
        transformation: [
          { width: 600, height: 600, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
        ],
        overwrite: true,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({ secure_url: result.secure_url, public_id: result.public_id });
      }
    );
    stream.end(file.buffer);
  });
}

/**
 * Delete an image from Cloudinary by public id (best effort).
 * @param {string} publicId
 */
async function deleteCloudinaryImage(publicId) {
  try {
    if (!isCloudinaryConfigured() || !publicId) return;
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete failed:', error.message);
  }
}

// @desc    Get security settings (transaction PIN state, account status, etc.)
// @route   GET /api/profile/security
// @access  Private
exports.getSecuritySettings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('transactionPinSet accountStatus isBlocked');
    res.status(200).json({
      success: true,
      data: {
        transactionPinSet: Boolean(user.transactionPinSet),
        accountStatus: user.accountStatus,
        isBlocked: user.isBlocked,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Set transaction PIN (first time setup)
// @route   POST /api/profile/transaction-pin
// @access  Private
exports.setTransactionPin = async (req, res, next) => {
  try {
    const { pin, confirmPin } = req.body;

    if (!isPinValid(pin) || !isPinValid(confirmPin)) {
      return res.status(400).json({ success: false, error: 'Transaction PIN must be exactly 4 digits.' });
    }

    if (pin !== confirmPin) {
      return res.status(400).json({ success: false, error: 'PINs do not match. Please try again.' });
    }

    const user = await User.findById(req.user.id).select('+transactionPin');
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    if (user.transactionPinSet) {
      return res.status(400).json({ success: false, error: 'Transaction PIN already set. Use the change PIN option to update it.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.transactionPin = await bcrypt.hash(String(pin), salt);
    user.transactionPinSet = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Transaction PIN created successfully.',
      data: { transactionPinSet: true },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Change transaction PIN
// @route   PUT /api/profile/transaction-pin
// @access  Private
exports.changeTransactionPin = async (req, res, next) => {
  try {
    const { currentPin, newPin, confirmNewPin } = req.body;

    if (!isPinValid(currentPin) || !isPinValid(newPin) || !isPinValid(confirmNewPin)) {
      return res.status(400).json({ success: false, error: 'Transaction PIN must be exactly 4 digits.' });
    }

    if (newPin !== confirmNewPin) {
      return res.status(400).json({ success: false, error: 'New PINs do not match. Please try again.' });
    }

    const user = await User.findById(req.user.id).select('+transactionPin');
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    if (!user.transactionPinSet || !user.transactionPin) {
      return res.status(400).json({ success: false, error: 'No transaction PIN set yet. Please create one first.' });
    }

    const isMatch = await bcrypt.compare(String(currentPin), user.transactionPin);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Current transaction PIN is incorrect.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.transactionPin = await bcrypt.hash(String(newPin), salt);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Transaction PIN changed successfully.',
      data: { transactionPinSet: true },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// Export multer upload middleware
exports.uploadProfilePhoto = upload.single('profilePhoto');

