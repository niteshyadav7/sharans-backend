import Cart from "../models/cart.model.js";
import CartItem from "../models/cartItem.model.js";
import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import { calculateCartTotal } from "../utils/calculateCartTotal.js";

export const checkout = async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await Cart.findOne({ user: userId })
      .populate({ path: "items", populate: { path: "product" } })
      .populate("coupon");

    if (!cart || cart.items.length === 0)
      return res.status(400).json({ message: "Cart is empty" });

    let total = await calculateCartTotal(CartItem, cart._id);
    let discount = 0;
    let finalAmount = total;

    // Apply coupon
    if (cart.coupon) {
      const coupon = await Coupon.findById(cart.coupon);
      if (coupon) {
        if (coupon.type === "percentage") {
          discount = (total * coupon.value) / 100;
          if (coupon.maxDiscount && discount > coupon.maxDiscount)
            discount = coupon.maxDiscount;
        } else if (coupon.type === "flat") {
          discount = coupon.value;
        }
        finalAmount = total - discount;
      }
    }

    // Stock check
    for (const item of cart.items) {
      if (item.product.stock < item.quantity)
        return res
          .status(400)
          .json({ message: `${item.product.name} is out of stock` });
    }

    // Create order
    const orderItems = cart.items.map((i) => ({
      product: i.product._id,
      quantity: i.quantity,
      price: i.product.price,
    }));

    const order = await Order.create({
      user: userId,
      cart: cart._id,
      items: orderItems,
      coupon: cart.coupon?._id || null,
      total,
      discount,
      finalAmount,
      paymentStatus: "paid",
      orderStatus: "processing",
    });

    // Deduct stock
    for (const i of cart.items) {
      await Product.findByIdAndUpdate(i.product._id, {
        $inc: { stock: -i.quantity },
      });
    }

    // Clear cart
    await CartItem.deleteMany({ cart: cart._id });
    cart.items = [];
    cart.total = 0;
    cart.coupon = null;
    await cart.save();

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
