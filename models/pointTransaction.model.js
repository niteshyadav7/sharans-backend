import mongoose from 'mongoose';

const pointTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true, // Positive for earned, negative for spent
    },
    type: {
      type: String,
      enum: ['earned_order', 'redeemed', 'referral_bonus', 'admin_adjustment'],
      required: true,
    },
    description: String,
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
  },
  {
    timestamps: true,
  }
);

pointTransactionSchema.index({ user: 1, createdAt: -1 });

const PointTransaction = mongoose.model('PointTransaction', pointTransactionSchema);
export default PointTransaction;
