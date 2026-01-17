import mongoose from 'mongoose';

const giftCardSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    initialValue: {
      type: Number,
      required: true,
      min: 0,
    },
    currentBalance: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['active', 'redeemed', 'expired', 'disabled'],
      default: 'active',
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    message: String,
    
    // Who purchased it
    purchasedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    
    // Who it was sent to (email)
    recipientEmail: {
      type: String,
      lowercase: true,
    },
    
    // Linked to a user account? (Optional logic if user adds it to their wallet)
    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Expire automatically logic can be handled in controller orcron
giftCardSchema.index({ code: 1 });
giftCardSchema.index({ recipientEmail: 1 });

const GiftCard = mongoose.model('GiftCard', giftCardSchema);
export default GiftCard;
