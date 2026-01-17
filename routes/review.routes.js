import express from 'express';
import {
  createReview,
  getProductReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  markReviewHelpful,
  getAllReviews,
  updateReviewStatus,
  addAdminResponse,
  adminDeleteReview,
} from '../controllers/review.controller.js';
import { protect, admin } from '../middlewares/auth.middleware.js';
import { body } from 'express-validator';
import { validateRequest } from '../middlewares/validators.js';

const router = express.Router();

// Review validation
const reviewValidation = [
  body('productId').isMongoId().withMessage('Valid product ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').trim().isLength({ min: 10, max: 1000 }).withMessage('Comment must be between 10 and 1000 characters'),
  body('title').optional().trim().isLength({ max: 100 }).withMessage('Title must be less than 100 characters'),
  validateRequest
];

// Public routes
router.get('/product/:productId', getProductReviews); // Get all reviews for a product

// Protected routes (authenticated users)
router.post('/', protect, reviewValidation, createReview); // Create a review
router.get('/my-reviews', protect, getUserReviews); // Get user's reviews
router.put('/:reviewId', protect, reviewValidation, updateReview); // Update own review
router.delete('/:reviewId', protect, deleteReview); // Delete own review
router.post('/:reviewId/helpful', protect, markReviewHelpful); // Mark review as helpful

// Admin routes
router.get('/admin/all', protect, admin, getAllReviews); // Get all reviews (admin)
router.patch('/admin/:reviewId/status', protect, admin, [
  body('status').isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status'),
  validateRequest
], updateReviewStatus); // Update review status
router.post('/admin/:reviewId/response', protect, admin, [
  body('comment').trim().notEmpty().withMessage('Response comment is required'),
  validateRequest
], addAdminResponse); // Add admin response
router.delete('/admin/:reviewId', protect, admin, adminDeleteReview); // Delete any review

export default router;
