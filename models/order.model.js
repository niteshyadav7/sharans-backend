import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    cart: { type: mongoose.Schema.Types.ObjectId, ref: "Cart", required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: Number,
        price: Number,
      },
    ],
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon" },
    total: Number,
    discount: { type: Number, default: 0 },
    finalAmount: Number,
    paymentStatus: { type: String, enum: ["pending", "paid"], default: "paid" },
    orderStatus: {
      type: String,
      enum: ["processing", "shipped", "delivered"],
      default: "processing",
    },
  },
  { timestamps: true }
);
const Order = mongoose.model("Order", orderSchema);
export default Order;
