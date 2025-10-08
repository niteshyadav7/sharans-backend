// utils/calculateCartTotal.js
import Coupon from "../models/coupon.model.js";

export const calculateCartTotal = async (CartItem, cartId, couponId = null) => {
  const items = await CartItem.find({ cart: cartId }).populate("product");
  let subtotal = 0;

  for (const item of items) {
    if (item.product && item.product.currentPrice) {
      subtotal += item.product.currentPrice * item.quantity;
    }
  }

  let discount = 0;

  if (couponId) {
    const coupon = await Coupon.findById(couponId);
    if (coupon) {
      // Check expiry
      if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
        discount = 0;
      } else if (subtotal >= coupon.minPurchase) {
        if (coupon.discountType === "percentage") {
          discount = (subtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscount && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount;
          }
        } else if (coupon.discountType === "fixed") {
          discount = coupon.discountValue;
        }
      }
    }
  }

  const total = Math.max(0, subtotal - discount);
  return { subtotal, discount, total };
};
