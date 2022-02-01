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
      required: [true, 'Please tell us your name'],
    },
    phoneNumber: {
      type: String,
      required: true,
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
    password: { type: String, required: true },
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
    underReview: {
      type: Boolean,
      default: true,
    },
    kycDetails: {
      name: { type: String },
      idType: {
        type: String,
        enum: ['aadhar', 'voter', 'pan', 'passport', 'license'],
      },
      idNumber: { type: String },
      idImage: { type: String },
    },

    listings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],

    currentlyRenting: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    ],

    flagged: { type: Boolean, required: true, default: false },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  // Hash the password with a cost of 10
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  // Delete the confirm password
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000; // subtracting 1 sec to counter the time between issuing jwt and document saving time
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
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
