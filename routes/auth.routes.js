import express from "express";
import { registerUser, loginUser, updateProfile, getAllUsers } from "../controllers/auth.controller.js";
import { admin, protect } from "../middlewares/auth.middleware.js";


const router = express.Router();

// User routes
router.post("/register", registerUser);
router.post("/login", loginUser);
// Protected routes
router.put("/profile", protect, updateProfile); // Update logged-in user's profile

// Admin-only routes
router.get("/all", protect, admin, getAllUsers); // Get all users

// Admin routes
// router.post("/admin/login", loginAdmin);

export default router;
 