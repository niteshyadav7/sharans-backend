import express from "express";
import { admin, protect } from "../middlewares/auth.middleware.js";
import {
  createCoupon,
  deleteCoupon,
  generateBulkCoupons,
  getCoupons,
} from "../controllers/coupon.controller.js";
import { couponValidation, bulkCouponValidation } from "../middlewares/validators.js";

const router = express.Router();

// Admin only routes with validation
router.post("/", protect, admin, couponValidation, createCoupon);
router.post("/bulk", protect, admin, bulkCouponValidation, generateBulkCoupons);
router.get("/", protect, admin, getCoupons);
router.delete("/:id", protect, admin, deleteCoupon);

export default router;

