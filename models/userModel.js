import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: { type: String, required: true },
    avatar: { type: String },

    kycDetails: {
      name: { type: String },
      idType: { type: String, enum: [] },
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
  },
  { timestamps: true }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

export default User;
