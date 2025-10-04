import express from "express";
import {
  registerUser,
  loginUser,
  loginAdmin,
} from "../controllers/auth.controller.js";

const router = express.Router();

// User routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Admin routes
router.post("/admin/login", loginAdmin);

export default router;
