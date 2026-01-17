import express from "express";
import { getLayout, updateLayout } from "../controllers/layout.controller.js";
import { admin, protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", getLayout); // Publicly accessible for frontend to render
router.post("/", protect, admin, updateLayout);

export default router;
