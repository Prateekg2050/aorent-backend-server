import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import validator from 'validator';

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: '',
      // required: [true, 'Please tell us your name'],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Please tell us your phone number'],
      unique: true,
      trim: true,
      minLength: 10,
      maxLength: 10,
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      select: false,
      validate: {
        // This only works on CREATE or SAVE !!
        validator: function (val) {
          return val === this.password;
        },
        message: 'Passwords are not same',
      },
    },
    avatar: { type: String, default: '' },

    // verification
    kycDetails: {
      name: { type: String, default: '' },
      idType: {
        type: String,
        enum: ['aadhar', 'voter', 'pan', 'passport', 'license'],
      },
      idNumber: { type: String },
      idImage: [String],
      verificationDate: { type: Date },
    },
    isVerified: { type: Boolean, default: false },
    underReview: {
      type: Boolean,
    },

    // to add items by user
    listings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],

    currentlyRenting: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    ],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],

    // backlog amount
    backlog: {
      referenceOrder: {
        type: String,
      },
      amount: { type: Number, default: 0 },
      reason: { type: String, default: '' },
    },

    // membership variables
    isPremium: { type: Boolean, default: false },
    premiumPurchasedAt: Date,
    premiumExpiresAt: Date,

    // for blacklisting a user
    flagged: { type: Boolean, required: true, default: false },

    // for private routes access
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },

    // for password handling
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,

    // active
    active: { type: Boolean, default: true, required: true },

    // notifications
    fcm: {
      token: { type: String },
      date: Date,
    },

    notification: [
      {
        date: Date,
        type: { type: String, enum: ['success', 'fail', 'general'] },
        title: { type: String },
        content: { type: String },
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  // Only run this function if password is modified
  if (!this.isModified('password')) return next();

  // Hash the password with a cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete the confirm password
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000; // subtracting 1 sec to counter the time between issuing jwt and document saving time
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = async function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000, // milliseconds to seconds
      10 // base 10
    ); // change date object to timestamp (unix)

    return JWTTimestamp < changedTimeStamp;
  }
  // False means not changed
  return false;
};

userSchema.methods.createPasswordResetToken = async function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // adding miliseconds to date object

  return resetToken; // to send token into email and encrypted version to database and so becomes useless to change password and hence secured
};

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

const User = mongoose.model('User', userSchema);

export default User;
