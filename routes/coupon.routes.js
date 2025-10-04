import express from "express";
import { admin, protect } from "../middlewares/auth.middleware.js";
import {
  createCoupon,
  deleteCoupon,
  generateBulkCoupons,
  getCoupons,
} from "../controllers/coupon.controller.js";

const router = express.Router();

// Admin only routes
router.post("/", protect, admin, createCoupon); // create single coupon
router.post("/bulk", protect, admin, generateBulkCoupons); // bulk generate
router.get("/", protect, admin, getCoupons); // list all coupons
router.delete("/:id", protect, admin, deleteCoupon); // delete coupon

export default router;
