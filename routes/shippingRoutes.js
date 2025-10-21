// shippingRoutes.js

import express from "express";
import {
  getShippingAmount,
  updateShippingAmount,
} from "../controllers/shippingController.js";
import { admin, protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// POST /api/shipping  → Add or Update shipping amount
router.post("/", protect, admin, updateShippingAmount);

// GET /api/shipping   → Get current shipping amount
router.get("/", getShippingAmount); 

export default router;
