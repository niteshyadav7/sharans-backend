import User from '../../models/user.model.js';

describe('User Model Test', () => {
  describe('User Creation', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'user',
      };

      const user = await User.create(userData);

      expect(user._id).toBeDefined();
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(user.password).not.toBe(userData.password); // Should be hashed
      expect(user.role).toBe('user');
      expect(user.isActive).toBe(true);
    });

    it('should fail to create user without required fields', async () => {
      const userData = {
        name: 'Test User',
        // Missing email and password
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should fail to create user with duplicate email', async () => {
      const userData = {
        name: 'Test User',
        email: 'duplicate@example.com',
        password: 'password123',
      };

      await User.create(userData);
      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should hash password before saving', async () => {
      const userData = {
        name: 'Test User',
        email: 'hash@example.com',
        password: 'plainPassword',
      };

      const user = await User.create(userData);
      
      expect(user.password).not.toBe('plainPassword');
      expect(user.password).toMatch(/^\$2[ayb]\$.{56}$/); // bcrypt hash pattern
    });
  });

  describe('Password Methods', () => {
    it('should correctly match valid password', async () => {
      const userData = {
        name: 'Test User',
        email: 'match@example.com',
        password: 'correctPassword',
      };

      const user = await User.create(userData);
      const isMatch = await user.matchPassword('correctPassword');

      expect(isMatch).toBe(true);
    });

    it('should not match invalid password', async () => {
      const userData = {
        name: 'Test User',
        email: 'nomatch@example.com',
        password: 'correctPassword',
      };

      const user = await User.create(userData);
      const isMatch = await user.matchPassword('wrongPassword');

      expect(isMatch).toBe(false);
    });
  });

  describe('User Roles', () => {
    it('should default to user role', async () => {
      const userData = {
        name: 'Test User',
        email: 'defaultrole@example.com',
        password: 'password123',
      };

      const user = await User.create(userData);

      expect(user.role).toBe('user');
    });

    it('should allow admin role', async () => {
      const userData = {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin',
      };

      const user = await User.create(userData);

      expect(user.role).toBe('admin');
    });
  });

  describe('User Status', () => {
    it('should default to active status', async () => {
      const userData = {
        name: 'Test User',
        email: 'active@example.com',
        password: 'password123',
      };

      const user = await User.create(userData);

      expect(user.isActive).toBe(true);
    });

    it('should allow inactive status', async () => {
      const userData = {
        name: 'Test User',
        email: 'inactive@example.com',
        password: 'password123',
        isActive: false,
      };

      const user = await User.create(userData);

      expect(user.isActive).toBe(false);
    });
  });
});
