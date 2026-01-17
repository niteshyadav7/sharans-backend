// routes/cart.routes.js
import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  addItemToCart,
  applyCoupon,
  clearCart,
  getOrCreateCart,
  removeItemFromCart,
  moveToWishlist,
} from "../controllers/cart.controller.js";
import { addToCartValidation } from "../middlewares/validators.js";

const router = express.Router();

router.get("/", protect, getOrCreateCart);
router.post("/add", protect, addToCartValidation, addItemToCart);
router.delete("/remove/:itemId", protect, removeItemFromCart);
router.post("/move-to-wishlist/:itemId", protect, moveToWishlist);
router.post("/apply-coupon", protect, applyCoupon);
router.delete("/clear", protect, clearCart);


export default router;

