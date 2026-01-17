// import crypto from "crypto";
// import Razorpay from "razorpay";
// import Order from "../models/order.model.js";
// import Cart from "../models/cart.model.js";
// import CartItem from "../models/cartItem.model.js";
// import { razorpayInstance } from "../server.js";

// // ✅ Create Order (COD or Razorpay)
// // export const createOrder = async (req, res) => {
// //   try {
// //     const { paymentMethod, shippingAddress } = req.body;
// //     const cart = await Cart.findOne({ user: req.user._id }).populate({
// //       path: "items",
// //       populate: { path: "product" },
// //     });

// //     if (!cart || cart.items.length === 0)
// //       return res.status(400).json({ message: "Cart is empty" });

// //     const totalAmount = cart.total;

// //     if (paymentMethod === "COD") {
// //       // Create order directly
// //       const order = await Order.create({
// //         user: req.user._id,
// //         items: cart.items.map((i) => ({
// //           product: i.product._id,
// //           quantity: i.quantity,
// //           price: i.product.currentPrice,
// //         })),
// //         shippingAddress,
// //         totalAmount,
// //         paymentMethod,
// //         paymentStatus: "pending",
// //         orderStatus: "processing",
// //       });

// //       await CartItem.deleteMany({ cart: cart._id });
// //       cart.items = [];
// //       cart.total = 0;
// //       cart.coupon = null;
// //       await cart.save();

// //       return res.status(201).json({ message: "Order placed (COD)", order });
// //     }

// //     if (paymentMethod === "Razorpay") {
// //       const options = {
// //         amount: totalAmount * 100, // convert to paise
// //         currency: "INR",
// //         receipt: `order_rcpt_${Date.now()}`,
// //       };
// //       const razorpayOrder = await razorpayInstance.orders.create(options);

// //       const order = await Order.create({
// //         user: req.user._id,
// //         items: cart.items.map((i) => ({
// //           product: i.product._id,
// //           quantity: i.quantity,
// //           price: i.product.currentPrice,
// //         })),
// //         shippingAddress,
// //         totalAmount,
// //         paymentMethod,
// //         paymentStatus: "pending",
// //         razorpayOrderId: razorpayOrder.id,
// //       });

// //       res.status(200).json({
// //         message: "Razorpay order created",
// //         razorpayOrderId: razorpayOrder.id,
// //         amount: options.amount,
// //         key: process.env.RAZORPAY_KEY_ID,
// //         order,
// //       });
// //     }
// //   } catch (err) {
// //     res.status(500).json({ message: err.message });
// //   }
// // };

// export const createOrder = async (req, res) => {
//   try {
//     const { paymentMethod, shippingAddress } = req.body;
//     const cart = await Cart.findOne({ user: req.user._id }).populate({
//       path: "items",
//       populate: { path: "product" },
//     });

//     if (!cart || cart.items.length === 0)
//       return res.status(400).json({ message: "Cart is empty" });

//     const shipping = 50; // fixed shipping cost
//     const totalAmount = (cart.total || 0) + shipping;

//     if (paymentMethod === "COD") {
//       const order = await Order.create({
//         user: req.user._id,
//         items: cart.items.map((i) => ({
//           product: i.product._id,
//           quantity: i.quantity,
//           price: i.product.currentPrice,
//         })),
//         shippingAddress,
//         totalAmount,
//         paymentMethod,
//         paymentStatus: "pending",
//         orderStatus: "processing",
//       });

//       await CartItem.deleteMany({ cart: cart._id });
//       cart.items = [];
//       cart.total = 0;
//       cart.coupon = null;
//       await cart.save();

//       return res.status(201).json({ message: "Order placed (COD)", order });
//     }

//     if (paymentMethod === "Razorpay") {
//       const options = {
//         amount: totalAmount * 100, // convert to paise
//         currency: "INR",
//         receipt: `order_rcpt_${Date.now()}`,
//       };
//       const razorpayOrder = await razorpayInstance.orders.create(options);

//       const order = await Order.create({
//         user: req.user._id,
//         items: cart.items.map((i) => ({
//           product: i.product._id,
//           quantity: i.quantity,
//           price: i.product.currentPrice,
//         })),
//         shippingAddress,
//         totalAmount,
//         paymentMethod,
//         paymentStatus: "pending",
//         razorpayOrderId: razorpayOrder.id,
//       });

//       return res.status(200).json({
//         message: "Razorpay order created",
//         razorpayOrderId: razorpayOrder.id,
//         amount: options.amount,
//         key: process.env.RAZORPAY_KEY_ID,
//         order,
//       });
//     }
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ✅ Verify Razorpay Payment
// export const verifyPayment = async (req, res) => {
//   try {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
//       req.body;

//     const body = razorpay_order_id + "|" + razorpay_payment_id;
//     const expectedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(body.toString())
//       .digest("hex");

//     if (expectedSignature === razorpay_signature) {
//       const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
//       order.paymentStatus = "paid";
//       order.razorpayPaymentId = razorpay_payment_id;
//       order.razorpaySignature = razorpay_signature;
//       await order.save();

//       await CartItem.deleteMany({ cart: order.cart });
//       return res.status(200).json({ message: "Payment verified", order });
//     } else {
//       return res.status(400).json({ message: "Invalid signature" });
//     }
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ✅ Get All Orders (for logged-in user)
// export const getUserOrders = async (req, res) => {
//   try {
//     const orders = await Order.find({ user: req.user._id })
//       .populate("items.product")
//       .sort({ createdAt: -1 });
//     res.status(200).json({ orders });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ✅ Admin: Update Order Status
// export const updateOrderStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;

//     const order = await Order.findById(id);
//     if (!order) return res.status(404).json({ message: "Order not found" });

//     order.orderStatus = status;
//     await order.save();

//     res.status(200).json({ message: "Order status updated", order });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ✅ Admin: Get all orders
// export const getAllOrders = async (req, res) => {
//   try {
//     // Optional: Add pagination query params
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 50;
//     const skip = (page - 1) * limit;

//     const orders = await Order.find()
//       .populate("user", "name email")
//       .populate("items.product")
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit);

//     const totalOrders = await Order.countDocuments();

//     res.status(200).json({ orders, totalOrders });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

import crypto from "crypto";
import Razorpay from "razorpay";
import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import CartItem from "../models/cartItem.model.js";
import Product from "../models/product.model.js";
import Coupon from "../models/coupon.model.js"; // ✅ import Coupon for usage tracking
import { razorpayInstance } from "../utils/razorpay.js";

import { calculateCartTotal } from "../utils/calculateCartTotal.js";
import User from "../models/user.model.js";
import PointTransaction from "../models/pointTransaction.model.js";
import GiftCard from "../models/giftCard.model.js";
import GlobalSettings from "../models/settings.model.js";






// ✅ Create Order (COD, Razorpay, or GiftCard)
export const createOrder = async (req, res) => {
  try {
    const { paymentMethod, shippingAddress, giftCardCode } = req.body;

    // 1. Validate Cart
    const cart = await Cart.findOne({ user: req.user._id }).populate({
      path: "items",
      populate: { path: "product" },
    });

    if (!cart || cart.items.length === 0)
      return res.status(400).json({ message: "Cart is empty" });

    // 2. Calculate Total
    const settings = await GlobalSettings.findOne() || {};
    const shipping = settings.shippingFee || 0;
    // Total Value of goods + shipping
    const totalOrderValue = (cart.total || 0) + shipping;
    let amountToPay = totalOrderValue;

    // 3. Validate Stock
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (!product) return res.status(404).json({ message: `Product not found: ${item.product.name}` });
      if (product.stock < item.quantity) return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
    }

    // 4. Gift Card Logic
    let giftCard = null;
    let giftCardDeduction = 0;
    
    if (giftCardCode) {
      giftCard = await GiftCard.findOne({ code: giftCardCode.toUpperCase(), status: 'active' });
      if (!giftCard) return res.status(400).json({ message: "Invalid Gift Card" });
      if (new Date() > giftCard.expiryDate) return res.status(400).json({ message: "Gift Card Expired" });
      if (giftCard.currentBalance <= 0) return res.status(400).json({ message: "Gift Card Balance is 0" });

      giftCardDeduction = Math.min(amountToPay, giftCard.currentBalance);
      amountToPay -= giftCardDeduction;
    }

    // 5. Determine Actual Payment Method
    let activePaymentMethod = paymentMethod;
    if (amountToPay === 0) activePaymentMethod = 'GiftCard'; 

    // 6. Create Order Object
    const orderData = {
      user: req.user._id,
      items: cart.items.map((i) => ({
        product: i.product._id,
        quantity: i.quantity,
        price: i.product.currentPrice,
      })),
      shippingAddress,
      totalAmount: totalOrderValue, // Keep original value for records
      giftCard: giftCard?._id,
      giftCardAmount: giftCardDeduction,
      paymentMethod: activePaymentMethod,
      orderStatus: "processing",
      paymentStatus: "pending"
    };

    // 7. Handle Payment Finalization
    
    // CASE A: Full Gift Card or COD
    if (activePaymentMethod === 'GiftCard' || activePaymentMethod === 'COD') {
      if (activePaymentMethod === 'GiftCard') orderData.paymentStatus = 'paid';
      
      const order = await Order.create(orderData);

      // Deduct Gift Card
      if (giftCard) {
        giftCard.currentBalance -= giftCardDeduction;
        if (giftCard.currentBalance === 0) giftCard.status = 'redeemed';
        await giftCard.save();
      }

      // Stock, Cart, Loyalty
      await processOrderCompletion(order, cart);

      return res.status(201).json({ 
        message: `Order placed (${activePaymentMethod})`, 
        order 
      });
    }

    // CASE B: Razorpay
    if (activePaymentMethod === 'Razorpay') {
      const options = {
        amount: amountToPay * 100, // remaining amount in paise
        currency: "INR",
        receipt: `order_rcpt_${Date.now()}`,
      };

      const razorpayOrder = await razorpayInstance.orders.create(options);
      orderData.razorpayOrderId = razorpayOrder.id;
      
      const order = await Order.create(orderData);

      // Deduct Gift Card Immediately (Refund if payment fails handled separately ideally)
      if (giftCard) {
        giftCard.currentBalance -= giftCardDeduction;
        await giftCard.save();
      }

      return res.status(200).json({
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

// Helper: Process Stock, Cart, Loyalty (for COD/GC)
const processOrderCompletion = async (order, cart) => {
  // 1. Stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
  }

  // 2. Coupon
  if (cart.coupon) {
    await Coupon.findByIdAndUpdate(cart.coupon, { $inc: { usedCount: 1 } });
  }

  // 3. Clear Cart
  await CartItem.deleteMany({ cart: cart._id });
  cart.items = [];
  cart.total = 0;
  cart.coupon = null;
  await cart.save();

  // 4. Loyalty Points & Referral Bonus (Only if Paid)
  if (order.paymentStatus === 'paid') {
     try {
        const settings = await GlobalSettings.findOne() || {};
        const user = await User.findById(order.user);
        if (user) {
          // A. Award Purchase Points
          const multiplier = settings.loyaltyPointsPer100 || 1;
          const earnedPoints = Math.floor((order.totalAmount / 100) * multiplier);
          if (earnedPoints > 0) {
            user.loyaltyPoints += earnedPoints;
            await PointTransaction.create({
              user: user._id,
              amount: earnedPoints,
              type: 'earned_order',
              description: `Points for Order #${order._id.toString().slice(-6)}`,
              orderId: order._id
            });
          }

          // B. Referral Bonus (First Paid Order)
          const paidOrdersCount = await Order.countDocuments({ 
            user: user._id, 
            paymentStatus: 'paid' 
          });

          if (paidOrdersCount === 1 && user.referredBy && !user.isReferralBonusPaid) {
            const bonusPoints = settings.referralPoints || 50; 
            const referrer = await User.findById(user.referredBy);
            
            if (referrer) {
              referrer.loyaltyPoints += bonusPoints;
              await referrer.save();
              
              await PointTransaction.create({
                user: referrer._id,
                amount: bonusPoints,
                type: 'referral_bonus',
                description: `Referral bonus for ${user.name}`
              });
              
              user.isReferralBonusPaid = true;
            }
          }

          await user.save();
        }
      } catch (err) { console.error("Loyalty Error:", err); }
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
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      order.paymentStatus = "paid";
      order.razorpayPaymentId = razorpay_payment_id;
      order.razorpaySignature = razorpay_signature;
      await order.save();

      // Find cart to clear it
      const cart = await Cart.findOne({ user: order.user });
      if (cart) {
        await processOrderCompletion(order, cart);
      }

      return res.status(200).json({ message: "Payment verified", order });




    } else {
      return res.status(400).json({ message: "Invalid signature" });
    }

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get User Orders (Enhanced with Filters)
export const getUserOrders = async (req, res) => {
  try {
    const { status, timeRange, sort = 'newest', page = 1, limit = 10 } = req.query;
    
    const query = { user: req.user._id };
    
    // Filter by status
    if (status) {
      query.orderStatus = status;
    }
    
    // Filter by time range
    if (timeRange) {
      const now = new Date();
      let startTime = new Date();
      
      switch(timeRange) {
        case 'last30days':
          startTime.setDate(now.getDate() - 30);
          break;
        case 'last3months':
          startTime.setMonth(now.getMonth() - 3);
          break;
        case 'last6months':
          startTime.setMonth(now.getMonth() - 6);
          break;
        case '2025':
          startTime = new Date('2025-01-01');
          now.setFullYear(2025, 11, 31);
          break;
        case '2024':
          startTime = new Date('2024-01-01');
          now.setFullYear(2024, 11, 31);
          break;
      }
      
      if (timeRange !== 'all') {
        query.createdAt = { $gte: startTime, $lte: now };
      }
    }
    
    // Sort logic
    let sortOptions = { createdAt: -1 };
    if (sort === 'oldest') sortOptions = { createdAt: 1 };
    if (sort === 'amount_high') sortOptions = { totalAmount: -1 };
    if (sort === 'amount_low') sortOptions = { totalAmount: 1 };
    
    const orders = await Order.find(query)
      .populate("items.product", "name images slug currentPrice")
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);
      
    const total = await Order.countDocuments(query);
    
    res.status(200).json({ 
      success: true,
      orders,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Admin: Update Order Status (With History)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment, trackingNumber } = req.body;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Only update if status implies a change
    if (status && order.orderStatus !== status) {
      order.orderStatus = status;
      order.statusHistory.push({
        status,
        date: new Date(),
        comment: comment || `Order status updated to ${status}`
      });
    }

    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    await order.save();

    res.status(200).json({ message: "Order status updated", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Admin: Get all orders with pagination & filters
export const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { status, paymentStatus, search } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (status) query.orderStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    
    // Search by Order ID or User Email (if joined) - simple search on ID here
    if (search) {
      // Check if valid ObjectId
      if (search.match(/^[0-9a-fA-F]{24}$/)) {
        query._id = search;
      }
    }

    const orders = await Order.find(query)
      .populate("user", "name email phone")
      .populate("items.product", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments(query);

    res.status(200).json({ 
      success: true,
      orders, 
      pagination: {
        total: totalOrders,
        page,
        pages: Math.ceil(totalOrders / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get Order Tracking Details
export const getOrderTracking = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).select('statusHistory orderStatus trackingNumber expectedDelivery');
    
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    // Check authorization (user owns order OR admin)
    if (req.user.role !== 'admin' && order.user && order.user.toString() !== req.user._id.toString()) {
      // Need to populate user to check properly if order.user was not populated
      // But assuming middleware sets req.user
      const fullOrder = await Order.findById(id);
      if (fullOrder.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    res.json({
      success: true,
      tracking: {
        currentStatus: order.orderStatus,
        trackingNumber: order.trackingNumber,
        history: order.statusHistory,
        timeline: order.statusHistory.sort((a,b) => b.date - a.date)
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ✅ Reorder functionality
export const reorder = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Get original order
    const order = await Order.findById(id).populate('items.product');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // 2. Get or create cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = await Cart.create({ user: req.user._id });

    const addedItems = [];
    const outOfStockItems = [];

    // 3. Process each item
    for (const item of order.items) {
      if (!item.product) continue;
      
      const product = await Product.findById(item.product._id);
      
      // Skip check if product deleted
      if (!product) continue;

      // Check stock
      if (product.stock < item.quantity) {
        outOfStockItems.push({
          name: product.name,
          requested: item.quantity,
          available: product.stock
        });
        continue;
      }

      // Check if item already in cart
      let cartItem = await CartItem.findOne({ cart: cart._id, product: product._id });
      
      if (cartItem) {
        // Update quantity
        cartItem.quantity += item.quantity;
        // Cap at stock
        if (cartItem.quantity > product.stock) {
          cartItem.quantity = product.stock;
        }
        await cartItem.save();
      } else {
        // Create new item
        cartItem = await CartItem.create({
          cart: cart._id,
          product: product._id,
          quantity: item.quantity
        });
        cart.items.push(cartItem._id);
      }
      
      addedItems.push(product.name);
    }

    // 4. Update cart totals
    const totals = await calculateCartTotal(CartItem, cart._id, cart.coupon);
    cart.total = totals.total;
    await cart.save();

    res.json({
      success: true,
      message: 'Items added to cart',
      addedItems,
      outOfStockItems: outOfStockItems.length > 0 ? outOfStockItems : undefined,
      cartCount: cart.items.length
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


