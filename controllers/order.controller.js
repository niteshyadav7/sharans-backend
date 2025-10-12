import crypto from "crypto";
import Razorpay from "razorpay";
import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import CartItem from "../models/cartItem.model.js";
import { razorpayInstance } from "../server.js";
// import { razorpayInstance } from "../utils/razorpay.js";

// ✅ Create Order (COD or Razorpay)
export const createOrder = async (req, res) => {
  try {
    const { paymentMethod, shippingAddress } = req.body;
    const cart = await Cart.findOne({ user: req.user._id }).populate({
      path: "items",
      populate: { path: "product" },
    });

    if (!cart || cart.items.length === 0)
      return res.status(400).json({ message: "Cart is empty" });

    const totalAmount = cart.total;

    if (paymentMethod === "COD") {
      // Create order directly
      const order = await Order.create({
        user: req.user._id,
        items: cart.items.map((i) => ({
          product: i.product._id,
          quantity: i.quantity,
          price: i.product.currentPrice,
        })),
        shippingAddress,
        totalAmount,
        paymentMethod,
        paymentStatus: "pending",
        orderStatus: "processing",
      });

      await CartItem.deleteMany({ cart: cart._id });
      cart.items = [];
      cart.total = 0;
      cart.coupon = null;
      await cart.save();

      return res.status(201).json({ message: "Order placed (COD)", order });
    }

    if (paymentMethod === "Razorpay") {
      const options = {
        amount: totalAmount * 100, // convert to paise
        currency: "INR",
        receipt: `order_rcpt_${Date.now()}`,
      };
      const razorpayOrder = await razorpayInstance.orders.create(options);

      const order = await Order.create({
        user: req.user._id,
        items: cart.items.map((i) => ({
          product: i.product._id,
          quantity: i.quantity,
          price: i.product.currentPrice,
        })),
        shippingAddress,
        totalAmount,
        paymentMethod,
        paymentStatus: "pending",
        razorpayOrderId: razorpayOrder.id,
      });

      res.status(200).json({
        message: "Razorpay order created",
        razorpayOrderId: razorpayOrder.id,
        amount: options.amount,
        key: process.env.RAZORPAY_KEY_ID,
        order,
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Verify Razorpay Payment
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
      order.paymentStatus = "paid";
      order.razorpayPaymentId = razorpay_payment_id;
      order.razorpaySignature = razorpay_signature;
      await order.save();

      await CartItem.deleteMany({ cart: order.cart });
      return res.status(200).json({ message: "Payment verified", order });
    } else {
      return res.status(400).json({ message: "Invalid signature" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get All Orders (for logged-in user)
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product")
      .sort({ createdAt: -1 });
    res.status(200).json({ orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Admin: Update Order Status
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.orderStatus = status;
    await order.save();

    res.status(200).json({ message: "Order status updated", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ✅ Admin: Get all orders
export const getAllOrders = async (req, res) => {
  try {
    // Optional: Add pagination query params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments();

    res.status(200).json({ orders, totalOrders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
