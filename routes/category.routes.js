// import express from "express";
// import multer from "multer";
// import {
//   bulkUploadCategories,
//   createCategory,
//   deleteCategory,
//   getCategories,
//   getCategoryById,
//   updateCategory,
// } from "../controllers/category.controller.js";
// import { protect, admin } from "../middlewares/auth.middleware.js";

// const router = express.Router();

// const upload = multer({ dest: "uploads/" });

// router.post(
//   "/bulk",
//   upload.single("file"),
//   protect,
//   admin,
//   bulkUploadCategories
// );

// // Admin routes
// router.post("/", protect, admin, createCategory);
// router.put("/:id", protect, admin, updateCategory);
// router.delete("/:id", protect, admin, deleteCategory);

// // Public routes
// router.get("/", getCategories);
// router.get("/:id", getCategoryById);

// export default router;


import express from "express";
import multer from "multer";
import {
  bulkUploadCategories,
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  updateCategory,
} from "../controllers/category.controller.js";
import { protect, admin } from "../middlewares/auth.middleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Bulk upload CSV
router.post("/bulk", upload.single("file"), protect, admin, bulkUploadCategories);

// Admin routes
router.post("/", protect, admin, createCategory);
router.put("/:id", protect, admin, updateCategory);
router.delete("/:id", protect, admin, deleteCategory);

// Public routes
router.get("/", getCategories);
router.get("/:id", getCategoryById);

export default router;
