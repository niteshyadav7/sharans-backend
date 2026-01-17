import request from 'supertest';
import express from 'express';
import authRoutes from '../../routes/auth.routes.js';
import User from '../../models/user.model.js';

// Create a minimal Express app for testing
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth API Integration Tests', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'newuser@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.password).toBeUndefined(); // Password should not be returned
    });

    it('should fail with invalid email', async () => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should fail with short password', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: '123',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail with duplicate email', async () => {
      const userData = {
        name: 'Test User',
        email: 'duplicate@example.com',
        password: 'password123',
      };

      // Register first user
      await request(app).post('/api/auth/register').send(userData);

      // Try to register again with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      await User.create({
        name: 'Login Test User',
        email: 'login@example.com',
        password: 'password123',
      });
    });

    it('should login successfully with correct credentials', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe(loginData.email);
    });

    it('should fail with incorrect password', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'wrongpassword',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should fail with non-existent email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid email format', async () => {
      const loginData = {
        email: 'invalid-email',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/auth/profile', () => {
    let authToken;
    let userId;

    beforeEach(async () => {
      // Register and login to get token
      const userData = {
        name: 'Profile Test User',
        email: 'profile@example.com',
        password: 'password123',
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);

      authToken = registerResponse.body.token;
      userId = registerResponse.body.user._id;
    });

    it('should update profile successfully', async () => {
      const updateData = {
        name: 'Updated Name',
        phone: '1234567890',
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.name).toBe(updateData.name);
      expect(response.body.user.phone).toBe(updateData.phone);
    });

    it('should fail without authentication token', async () => {
      const updateData = {
        name: 'Updated Name',
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .send(updateData)
        .expect(401);

      expect(response.body.message).toBe('Not authorized');
    });

    it('should fail with invalid token', async () => {
      const updateData = {
        name: 'Updated Name',
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .send(updateData)
        .expect(401);

      expect(response.body.message).toBe('Token failed');
    });
  });
});
