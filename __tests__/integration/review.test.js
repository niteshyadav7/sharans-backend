import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import reviewRoutes from '../../routes/review.routes.js';
import Review from '../../models/review.model.js';
import Product from '../../models/product.model.js';
import User from '../../models/user.model.js';
import Order from '../../models/order.model.js';
import Category from '../../models/category.model.js';
import dotenv from 'dotenv';

// Create a minimal Express app for testing
const app = express();
app.use(express.json());
// Mock environment variables
process.env.JWT_SECRET = 'test_secret';

app.use('/api/reviews', reviewRoutes);

describe('Review API Integration Tests', () => {
  let testUser;
  let testAdmin;
  let testProduct;
  let testCategory;
  let userToken;
  let adminToken;

  beforeEach(async () => {
    // Create test category
    testCategory = await Category.create({
      name: 'Test Category',
      slug: 'test-category',
    });

    // Create test user
    testUser = await User.create({
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password123',
      role: 'user',
    });

    // Create test admin
    testAdmin = await User.create({
      name: 'Test Admin',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
    });

    // Create test product
    testProduct = await Product.create({
      name: 'Test Product',
      description: 'Test Description',
      originalPrice: 1000,
      currentPrice: 800,
      stock: 50,
      category: testCategory._id,
      images: ['test.jpg'],
    });

    // Generate real tokens
    userToken = jwt.sign({ id: testUser._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1d' });
    adminToken = jwt.sign({ id: testAdmin._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
  });


  describe('POST /api/reviews - Create Review', () => {
    it('should create a review successfully', async () => {
      const reviewData = {
        productId: testProduct._id,
        rating: 5,
        title: 'Excellent Product',
        comment: 'This product is amazing! Highly recommended for everyone.',
      };

      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send(reviewData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.review.rating).toBe(5);
      expect(response.body.review.title).toBe('Excellent Product');
      expect(response.body.review.isVerifiedPurchase).toBe(false);
    });

    it('should fail with invalid rating', async () => {
      const reviewData = {
        productId: testProduct._id,
        rating: 6, // Invalid
        comment: 'This is a test comment that is long enough.',
      };

      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send(reviewData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail with short comment', async () => {
      const reviewData = {
        productId: testProduct._id,
        rating: 5,
        comment: 'Short', // Too short
      };

      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send(reviewData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should prevent duplicate reviews', async () => {
      const reviewData = {
        productId: testProduct._id,
        rating: 5,
        comment: 'This is a test comment that is long enough.',
      };

      // Create first review
      await Review.create({
        product: testProduct._id,
        user: testUser._id,
        rating: 5,
        comment: 'First review',
      });

      // Try to create second review
      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send(reviewData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already reviewed');
    });

    it('should mark as verified purchase if user bought product', async () => {
      // Create a delivered order
      await Order.create({
        user: testUser._id,
        items: [{
          product: testProduct._id,
          quantity: 1,
          price: 800,
        }],
        totalAmount: 800,
        paymentMethod: 'COD',
        paymentStatus: 'paid',
        orderStatus: 'delivered',
      });

      const reviewData = {
        productId: testProduct._id,
        rating: 5,
        comment: 'This is a test comment that is long enough.',
      };

      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send(reviewData)
        .expect(201);

      expect(response.body.review.isVerifiedPurchase).toBe(true);
    });
  });

  describe('GET /api/reviews/product/:productId - Get Product Reviews', () => {
    beforeEach(async () => {
      // Create multiple reviews
      await Review.create([
        {
          product: testProduct._id,
          user: testUser._id,
          rating: 5,
          comment: 'Excellent product! Really loved it.',
          status: 'approved',
        },
        {
          product: testProduct._id,
          user: testAdmin._id,
          rating: 4,
          comment: 'Good product but could be better.',
          status: 'approved',
        },
      ]);
    });

    it('should get all reviews for a product', async () => {
      const response = await request(app)
        .get(`/api/reviews/product/${testProduct._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.reviews).toHaveLength(2);
      expect(response.body.stats.totalReviews).toBe(2);
      expect(response.body.stats.averageRating).toBeGreaterThan(0);
    });

    it('should filter reviews by rating', async () => {
      const response = await request(app)
        .get(`/api/reviews/product/${testProduct._id}?rating=5`)
        .expect(200);

      expect(response.body.reviews).toHaveLength(1);
      expect(response.body.reviews[0].rating).toBe(5);
    });

    it('should paginate reviews', async () => {
      const response = await request(app)
        .get(`/api/reviews/product/${testProduct._id}?page=1&limit=1`)
        .expect(200);

      expect(response.body.reviews).toHaveLength(1);
      expect(response.body.pagination.total).toBe(2);
      expect(response.body.pagination.pages).toBe(2);
    });
  });

  describe('POST /api/reviews/:reviewId/helpful - Mark as Helpful', () => {
    let testReview;

    beforeEach(async () => {
      testReview = await Review.create({
        product: testProduct._id,
        user: testAdmin._id,
        rating: 5,
        comment: 'This is a helpful review for testing.',
        status: 'approved',
      });
    });

    it('should mark review as helpful', async () => {
      const response = await request(app)
        .post(`/api/reviews/${testReview._id}/helpful`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.helpfulCount).toBe(1);
      expect(response.body.isHelpful).toBe(true);
    });

    it('should toggle helpful mark', async () => {
      // Mark as helpful
      await request(app)
        .post(`/api/reviews/${testReview._id}/helpful`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      // Unmark as helpful
      const response = await request(app)
        .post(`/api/reviews/${testReview._id}/helpful`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.helpfulCount).toBe(0);
      expect(response.body.isHelpful).toBe(false);
    });
  });

  describe('PUT /api/reviews/:reviewId - Update Review', () => {
    let testReview;

    beforeEach(async () => {
      testReview = await Review.create({
        product: testProduct._id,
        user: testUser._id,
        rating: 4,
        title: 'Original Title',
        comment: 'Original comment that is long enough for validation.',
        status: 'approved',
      });
    });

    it('should update own review', async () => {
      const updateData = {
        rating: 5,
        title: 'Updated Title',
        comment: 'Updated comment that is also long enough for validation.',
      };

      const response = await request(app)
        .put(`/api/reviews/${testReview._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.review.rating).toBe(5);
      expect(response.body.review.title).toBe('Updated Title');
    });

    it('should not update other user review', async () => {
      const updateData = {
        rating: 5,
        comment: 'Trying to update someone else review.',
      };

      const response = await request(app)
        .put(`/api/reviews/${testReview._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/reviews/:reviewId - Delete Review', () => {
    let testReview;

    beforeEach(async () => {
      testReview = await Review.create({
        product: testProduct._id,
        user: testUser._id,
        rating: 5,
        comment: 'Review to be deleted for testing purposes.',
        status: 'approved',
      });
    });

    it('should delete own review', async () => {
      const response = await request(app)
        .delete(`/api/reviews/${testReview._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify review is deleted
      const deletedReview = await Review.findById(testReview._id);
      expect(deletedReview).toBeNull();
    });
  });

  describe('Admin Endpoints', () => {
    let testReview;

    beforeEach(async () => {
      testReview = await Review.create({
        product: testProduct._id,
        user: testUser._id,
        rating: 5,
        comment: 'Review for admin moderation testing.',
        status: 'pending',
      });
    });

    it('should update review status (admin)', async () => {
      const response = await request(app)
        .patch(`/api/reviews/admin/${testReview._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'approved' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.review.status).toBe('approved');
    });

    it('should add admin response', async () => {
      const response = await request(app)
        .post(`/api/reviews/admin/${testReview._id}/response`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ comment: 'Thank you for your feedback!' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.review.adminResponse.comment).toBe('Thank you for your feedback!');
    });

    it('should delete any review (admin)', async () => {
      const response = await request(app)
        .delete(`/api/reviews/admin/${testReview._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      const deletedReview = await Review.findById(testReview._id);
      expect(deletedReview).toBeNull();
    });
  });

  describe('Rating Calculation', () => {
    it('should calculate average rating correctly', async () => {
      // Create reviews with different ratings
      await Review.create([
        {
          product: testProduct._id,
          user: testUser._id,
          rating: 5,
          comment: 'Excellent product with great quality.',
          status: 'approved',
        },
        {
          product: testProduct._id,
          user: testAdmin._id,
          rating: 4,
          comment: 'Good product but has some issues.',
          status: 'approved',
        },
      ]);

      const stats = await Review.calculateAverageRating(testProduct._id);

      expect(stats.averageRating).toBe(4.5);
      expect(stats.totalReviews).toBe(2);
      expect(stats.ratingDistribution[5]).toBe(1);
      expect(stats.ratingDistribution[4]).toBe(1);
    });

    it('should update product rating automatically', async () => {
      await Review.create({
        product: testProduct._id,
        user: testUser._id,
        rating: 5,
        comment: 'Testing automatic product rating update.',
        status: 'approved',
      });

      // Wait for post-save hook to execute
      await new Promise(resolve => setTimeout(resolve, 100));

      const updatedProduct = await Product.findById(testProduct._id);
      expect(updatedProduct.averageRating).toBeGreaterThan(0);
      expect(updatedProduct.totalReviews).toBeGreaterThan(0);
    });
  });
});
