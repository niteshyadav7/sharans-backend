import express from 'express';
import { generateGiftCard, checkBalance, getAllGiftCards, toggleGiftCardStatus, deleteGiftCard } from '../controllers/giftCard.controller.js';

import { protect, admin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public check balance (Or protected?) - Let's make it protected for logged in users or public but rate limited.
// For now, protected is safer.
router.post('/balance', protect, checkBalance);
router.get('/', protect, admin, getAllGiftCards);

// Admin generate

router.post('/generate', protect, admin, generateGiftCard);
router.patch('/:id/toggle', protect, admin, toggleGiftCardStatus);
router.delete('/:id', protect, admin, deleteGiftCard);

export default router;
