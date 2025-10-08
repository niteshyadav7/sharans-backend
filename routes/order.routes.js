import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  createOrder,
  verifyPayment,
  getUserOrders,
  updateOrderStatus,
} from "../controllers/order.controller.js";

const router = express.Router();

// Create new order (COD or Razorpay)
router.post("/create", protect, createOrder);

// Verify Razorpay payment
router.post("/verify", protect, verifyPayment);

// Get user orders
router.get("/", protect, getUserOrders);

// Update order status (Admin)
router.put("/:id/status", protect, updateOrderStatus);

export default router;
