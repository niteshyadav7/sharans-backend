import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    cart: { type: mongoose.Schema.Types.ObjectId, ref: "Cart", required: true },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
  },
  { timestamps: true }
);

const CartItem = mongoose.model("CartItem", cartItemSchema);
export default CartItem;
// working