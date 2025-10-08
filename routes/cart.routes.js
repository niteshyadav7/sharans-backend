// routes/cart.routes.js
import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  addItemToCart,
  applyCoupon,
  clearCart,
  getOrCreateCart,
  removeItemFromCart,
} from "../controllers/cart.controller.js";

const router = express.Router();

router.get("/", protect, getOrCreateCart);
router.post("/add", protect, addItemToCart);
router.delete("/remove/:itemId", protect, removeItemFromCart);
router.post("/apply-coupon", protect, applyCoupon);
router.delete("/clear", protect, clearCart);

export default router;
