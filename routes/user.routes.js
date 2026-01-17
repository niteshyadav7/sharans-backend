import express from "express";
import { protect, admin } from "../middlewares/auth.middleware.js";
import { getUsers, toggleUserStatus, deleteUser } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", protect, admin, getUsers);
router.patch("/:id/status", protect, admin, toggleUserStatus);
router.delete("/:id", protect, admin, deleteUser);

export default router;
