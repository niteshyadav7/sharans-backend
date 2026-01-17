import express from 'express';
import { getLoyaltyProfile, redeemPoints } from '../controllers/loyalty.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getLoyaltyProfile);
router.post('/redeem', redeemPoints);

export default router;
