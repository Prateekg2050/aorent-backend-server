import mongoose from 'mongoose';

const transactionSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'User id is required'],
      ref: 'User',
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Product id is required'],
      ref: 'Product',
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Order id is required'],
      ref: 'Order',
    },
    status: {
      type: String,
      required: [true, 'status of transaction is required'],
    },
    orderId: {
      type: String,
    },
    paymentId: {
      type: String,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
    },
    date: {
      type: Date,
      default: Date.now(),
      required: [true],
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
