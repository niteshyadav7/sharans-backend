import express from "express";
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from "../controllers/product.controller.js";
import { admin, protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Admin only routes
router.post("/", protect, admin, createProduct);
router.put("/:id", protect, admin, updateProduct);
router.delete("/:id", protect, admin, deleteProduct);

// Public routes
router.get("/", getProducts);
router.get("/:id", getProductById);

export default router;
