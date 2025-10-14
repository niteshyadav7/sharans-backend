import express from "express";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  updateCategory,
} from "../controllers/category.controller.js";
import { protect, admin } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Admin routes
router.post("/", protect, admin, createCategory);
router.put("/:id", protect, admin, updateCategory);
router.delete("/:id", protect, admin, deleteCategory);

// Public routes
router.get("/", getCategories);
router.get("/:id", getCategoryById);

export default router;
