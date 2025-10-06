import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { checkout } from "../controllers/order.controller.js";

const router = express.Router();
router.post("/checkout", protect, checkout);
export default router;
