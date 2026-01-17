import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: Number,
        price: Number,
      },
    ],
    shippingAddress: {
      name: String,
      phone: String,
      address: String,
      city: String,
      state: String,
      zip: String,
      country: String,
    },
    totalAmount: { type: Number, required: true },
    
    // Gift Card
    giftCard: { type: mongoose.Schema.Types.ObjectId, ref: 'GiftCard' },
    giftCardAmount: { type: Number, default: 0 },
    
    paymentMethod: { type: String, enum: ["COD", "Razorpay", "GiftCard"], required: true },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["processing", "shipped", "delivered", "cancelled"],
      default: "processing",
    },
    statusHistory: [
      {
        status: { type: String, enum: ["processing", "shipped", "delivered", "cancelled", "returned"] },
        date: { type: Date, default: Date.now },
        comment: String,
      }
    ],
    trackingNumber: String,
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
  },
  { timestamps: true }
);

// Pre-save hook to push initial status to history if empty
orderSchema.pre('save', function(next) {
  if (this.isNew && this.statusHistory.length === 0) {
    this.statusHistory.push({
      status: this.orderStatus,
      date: new Date(),
      comment: 'Order placed'
    });
  }
  next();
});


// Indexes for performance
orderSchema.index({ user: 1, createdAt: -1 }); // User's orders sorted by date
orderSchema.index({ orderStatus: 1, createdAt: -1 }); // Admin filter by status
orderSchema.index({ paymentStatus: 1 }); // Filter by payment status
orderSchema.index({ razorpayOrderId: 1 }); // Payment verification lookup

const Order = mongoose.model("Order", orderSchema);
export default Order;
