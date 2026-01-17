// import express from "express";
// import {
//   registerUser,
//   loginUser,
//   getAllUsers,
//   updateProfile,
// } from "../controllers/auth.controller.js";
// import { admin, protect } from "../middlewares/auth.middleware.js";

// const router = express.Router();

// // User routes
// router.post("/register", registerUser);
// router.post("/login", loginUser);
// // Protected routes
// router.put("/profile", protect, updateProfile); // Update logged-in user's profile

// // Admin-only routes
// router.get("/all", protect, admin, getAllUsers); // Get all users

// // Admin routes
// // router.post("/admin/login", loginAdmin);

// export default router;

import express from "express";
import {
  registerUser,
  loginUser,
  updateProfile,
  getAllUsers,
  toggleUserStatus,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";
import { admin, protect } from "../middlewares/auth.middleware.js";
import { 
  registerValidation, 
  loginValidation, 
  updateProfileValidation 
} from "../middlewares/validators.js";
import { body } from "express-validator";
import { validateRequest } from "../middlewares/validators.js";

const router = express.Router();

// Public routes with validation
router.post("/register", registerValidation, registerUser);
router.post("/login", loginValidation, loginUser);

// Email verification routes
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", protect, resendVerificationEmail);

// Password reset routes
router.post("/forgot-password", [
  body('email').isEmail().withMessage('Please provide a valid email'),
  validateRequest
], forgotPassword);

router.post("/reset-password/:token", [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validateRequest
], resetPassword);

// Protected routes
router.put("/profile", protect, updateProfileValidation, updateProfile);

// Admin-only routes
router.get("/all", protect, admin, getAllUsers);
router.patch("/toggle/:userId", protect, admin, toggleUserStatus);

export default router;


