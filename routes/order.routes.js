import express from "express";
import { admin, protect } from "../middlewares/auth.middleware.js";
import {
  createOrder,
  verifyPayment,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  getOrderTracking,
  reorder,
} from "../controllers/order.controller.js";
import { 
  createOrderValidation, 
  updateOrderStatusValidation 
} from "../middlewares/validators.js";

const router = express.Router();

// Create new order with validation
router.post("/create", protect, createOrderValidation, createOrder);

// Verify Razorpay payment
router.post("/verify", protect, verifyPayment);

// Get user orders
router.get("/", protect, getUserOrders);

// Get order tracking
router.get("/:id/tracking", protect, getOrderTracking);

// Reorder items
router.post("/:id/reorder", protect, reorder);



// Admin routes
router.get("/all", protect, admin, getAllOrders);
router.put("/:id/status", protect, admin, updateOrderStatusValidation, updateOrderStatus);

export default router;

