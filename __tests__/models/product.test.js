import Product from '../../models/product.model.js';
import Category from '../../models/category.model.js';

describe('Product Model Test', () => {
  let testCategory;

  beforeEach(async () => {
    // Create a test category for products
    testCategory = await Category.create({
      name: 'Test Category',
      slug: 'test-category',
    });
  });

  describe('Product Creation', () => {
    it('should create a new product successfully', async () => {
      const productData = {
        name: 'Test Product',
        description: 'Test Description',
        originalPrice: 1000,
        currentPrice: 800,
        stock: 50,
        category: testCategory._id,
        images: ['image1.jpg', 'image2.jpg'],
        sku: 'TEST-001',
      };

      const product = await Product.create(productData);

      expect(product._id).toBeDefined();
      expect(product.name).toBe(productData.name);
      expect(product.currentPrice).toBe(800);
      expect(product.stock).toBe(50);
      expect(product.status).toBe('active'); // Default status
    });

    it('should fail without required fields', async () => {
      const productData = {
        name: 'Test Product',
        // Missing required fields
      };

      await expect(Product.create(productData)).rejects.toThrow();
    });

    it('should create product with default status', async () => {
      const productData = {
        name: 'Test Product',
        originalPrice: 1000,
        currentPrice: 800,
        stock: 10,
        category: testCategory._id,
        images: ['image.jpg'],
      };

      const product = await Product.create(productData);

      expect(product.status).toBe('active');
    });
  });

  describe('Product Pricing', () => {
    it('should allow current price less than original price', async () => {
      const productData = {
        name: 'Discounted Product',
        originalPrice: 1000,
        currentPrice: 700,
        stock: 10,
        category: testCategory._id,
        images: ['image.jpg'],
      };

      const product = await Product.create(productData);

      expect(product.currentPrice).toBeLessThan(product.originalPrice);
    });

    it('should allow current price equal to original price', async () => {
      const productData = {
        name: 'Regular Product',
        originalPrice: 1000,
        currentPrice: 1000,
        stock: 10,
        category: testCategory._id,
        images: ['image.jpg'],
      };

      const product = await Product.create(productData);

      expect(product.currentPrice).toBe(product.originalPrice);
    });
  });

  describe('Product Stock', () => {
    it('should track stock correctly', async () => {
      const productData = {
        name: 'Stock Product',
        originalPrice: 1000,
        currentPrice: 800,
        stock: 25,
        category: testCategory._id,
        images: ['image.jpg'],
      };

      const product = await Product.create(productData);

      expect(product.stock).toBe(25);
    });

    it('should allow zero stock', async () => {
      const productData = {
        name: 'Out of Stock Product',
        originalPrice: 1000,
        currentPrice: 800,
        stock: 0,
        category: testCategory._id,
        images: ['image.jpg'],
      };

      const product = await Product.create(productData);

      expect(product.stock).toBe(0);
    });
  });

  describe('Product Status', () => {
    it('should allow different status values', async () => {
      const statuses = ['active', 'inactive', 'out-of-stock'];

      for (const status of statuses) {
        const product = await Product.create({
          name: `Product ${status}`,
          originalPrice: 1000,
          currentPrice: 800,
          stock: 10,
          category: testCategory._id,
          images: ['image.jpg'],
          status,
        });

        expect(product.status).toBe(status);
      }
    });
  });

  describe('Product Images', () => {
    it('should store multiple images', async () => {
      const productData = {
        name: 'Multi Image Product',
        originalPrice: 1000,
        currentPrice: 800,
        stock: 10,
        category: testCategory._id,
        images: ['image1.jpg', 'image2.jpg', 'image3.jpg'],
      };

      const product = await Product.create(productData);

      expect(product.images).toHaveLength(3);
      expect(product.images).toContain('image1.jpg');
    });
  });

  describe('Product Timestamps', () => {
    it('should have createdAt and updatedAt timestamps', async () => {
      const productData = {
        name: 'Timestamp Product',
        originalPrice: 1000,
        currentPrice: 800,
        stock: 10,
        category: testCategory._id,
        images: ['image.jpg'],
      };

      const product = await Product.create(productData);

      expect(product.createdAt).toBeDefined();
      expect(product.updatedAt).toBeDefined();
    });
  });
});
