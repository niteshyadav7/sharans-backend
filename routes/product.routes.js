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

// Admin only routes(only admin can add,update,delete)
router.post("/", protect, admin, createProduct);
router.put("/:id", protect, admin, updateProduct);
router.delete("/:id", protect, admin, deleteProduct);

// Public routes(Anyone can access this)
router.get("/", getProducts);
router.get("/:id", getProductById);

export default router;
