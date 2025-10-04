import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: { type: Number, required: true },
    expiryDate: { type: Date },
    minPurchase: { type: Number, default: 0 },
    maxDiscount: { type: Number },
    usageLimit: { type: Number, default: null }, // total uses allowed
    usedCount: { type: Number, default: 0 }, // track how many times used
  },
  { timestamps: true }
);

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;
