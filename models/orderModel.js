import mongoose from 'mongoose';

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product',
    },
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pinCode: { type: Number, required: true },
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },
    subTotal: {
      type: Number,
      required: true,
      default: 0.0,
    },
    serviceCharge: {
      type: Number,
      required: true,
      default: 0.0,
    },
    depositCharged: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },

    // renting vars
    startDate: Date,

    // payment vars
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: { type: Date },

    // delivery vars
    isPickedUp: Boolean,
    pickedUpAt: Date,

    // return vars
    returnDate: Date,
    returnDelivered: Boolean,

    // User reimbursement variables
    // transaction object needs to be added
    transactionDate: Date,
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ user: 1, item: 1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
