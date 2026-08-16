const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false, // Do not return password by default
  },
  firstName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  seedPhrase: {
    type: String,
    select: false,
  },
  profilePhoto: {
    type: String,
    default: null,
  },
  // Cloudinary public id of the current profile photo (used to clean up the
  // previous image when a user uploads a new one). Never exposed to clients.
  profilePhotoPublicId: {
    type: String,
    select: false,
    default: null,
  },
  country: {
    type: String,
    default: null,
  },
  phone: {
    type: String,
    default: null,
  },
  profileCompleted: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  // Account status controlled by admins. Unlike isBlocked (suspension for
  // security/verification reasons), this is the general Active/Inactive state.
  accountStatus: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  // Transaction PIN - hashed with bcrypt, NEVER stored or returned in
  // plaintext. This is completely separate from any card PIN.
  transactionPin: {
    type: String,
    select: false,
  },
  transactionPinSet: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encrypt password using bcrypt before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare entered password with hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
