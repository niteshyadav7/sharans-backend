// import express from "express";
// import {
//   createProduct,
//   deleteProduct,
//   getProductById,
//   getProducts,
//   updateProduct,
// } from "../controllers/product.controller.js";
// import { admin, protect } from "../middlewares/auth.middleware.js";

// const router = express.Router();

// // Admin only routes(only admin can add,update,delete)
// router.post("/", protect, admin, createProduct);
// router.put("/:id", protect, admin, updateProduct);
// router.delete("/:id", protect, admin, deleteProduct);

// // Public routes(Anyone can access this)
// router.get("/", getProducts);
// router.get("/:id", getProductById);

// export default router;

import express from "express";
import multer from "multer";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getProductById,
  bulkUploadProducts,
} from "../controllers/product.controller.js";
import { protect, admin } from "../middlewares/auth.middleware.js";
import { productValidation } from "../middlewares/validators.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Bulk upload (no validation needed - CSV handles structure)
router.post("/bulk", protect, admin, upload.single("file"), bulkUploadProducts);

// Admin routes with validation
router.post("/", protect, admin, productValidation, createProduct);
router.put("/:id", protect, admin, productValidation, updateProduct);
router.delete("/:id", protect, admin, deleteProduct);

// Public routes
router.get("/", getProducts);
router.get("/:id", getProductById);

export default router;

