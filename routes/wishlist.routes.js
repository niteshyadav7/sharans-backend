import express from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlistStatus
} from '../controllers/wishlist.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { body } from 'express-validator';
import { validateRequest } from '../middlewares/validators.js';

const router = express.Router();

// All wishlist routes require authentication
router.use(protect);

router.get('/', getWishlist);

router.post('/add', [
  body('productId').isMongoId().withMessage('Valid product ID is required'),
  validateRequest
], addToWishlist);

router.delete('/remove/:productId', removeFromWishlist);

router.get('/check/:productId', checkWishlistStatus);

export default router;
