import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import validator from 'validator';

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      // required: [true, 'Please tell us your name'],
    },
    phoneNumber: {
      type: String,
      // required: [true, 'Please tell us your mobile number'],
      unique: true,
      trim: true,
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
      validate: {
        // This only works on CREATE or SAVE !!
        validator: function (val) {
          return val === this.password;
        },
        message: 'Passwords are not same',
      },
    },
    avatar: { type: String },

    kycDetails: {
      name: { type: String },
      idType: {
        type: String,
        enum: ['aadhar', 'voter', 'pan', 'passport', 'license'],
      },
      idNumber: { type: String },
      idImage: { type: String },
    },
    underReview: {
      type: Boolean,
      default: true,
    },
    // to add items by user
    listings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    currentlyRenting: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    ],

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
  // this.password is not available because this refers to current document and current document does not have password as it is false

  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = async function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000, // milliseconds to seconds
      10 // base 10
    ); // change date object to timestamp (unix)

    // console.log(changedTimeStamp, JWTTimestamp);
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

const User = mongoose.model('User', userSchema);

export default User;
