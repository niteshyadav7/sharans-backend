import express from "express";
import { getSettings, updateSettings } from "../controllers/settings.controller.js";
import { admin, protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", getSettings);
router.post("/", protect, admin, updateSettings);

export default router;
