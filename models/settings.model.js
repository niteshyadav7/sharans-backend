import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    shippingFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    loyaltyPointsPer100: {
      type: Number,
      default: 1,
      min: 0,
    },
    referralPoints: {
      type: Number,
      default: 50,
      min: 0,
    },
    pointsToRupeeRate: {
      type: Number,
      default: 1,
      min: 0.1,
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
      min: 1
    },
    storeName: {
      type: String,
      default: "Sharans Store"
    },
    maintenanceMode: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model("Settings", settingsSchema);
