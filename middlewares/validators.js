import { body, validationResult } from 'express-validator';

// Middleware to check validation results
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Auth validations
export const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Name must be between 3 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  validateRequest
];

export const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validateRequest
];

export const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Name must be between 3 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  validateRequest
];

// Product validations
export const productValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required'),
  body('currentPrice')
    .isFloat({ min: 0 })
    .withMessage('Current price must be a positive number'),
  body('originalPrice')
    .isFloat({ min: 0 })
    .withMessage('Original price must be a positive number')
    .custom((value, { req }) => {
      if (value < req.body.currentPrice) {
        throw new Error('Original price cannot be less than current price');
      }
      return true;
    }),
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('category')
    .notEmpty()
    .withMessage('Category is required'),
  body('images')
    .isArray({ min: 1 })
    .withMessage('At least one image is required'),
  validateRequest
];

// Category validations
export const categoryValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required'),
  body('description')
    .optional()
    .trim(),
  validateRequest
];

// Coupon validations
export const couponValidation = [
  body('code')
    .trim()
    .notEmpty()
    .isLength({ min: 3, max: 20 })
    .withMessage('Coupon code must be between 3 and 20 characters'),
  body('discountType')
    .isIn(['percentage', 'fixed'])
    .withMessage('Discount type must be either percentage or fixed'),
  body('discountValue')
    .isFloat({ min: 0 })
    .withMessage('Discount value must be a positive number')
    .custom((value, { req }) => {
      if (req.body.discountType === 'percentage' && value > 100) {
        throw new Error('Percentage discount cannot exceed 100');
      }
      return true;
    }),
  body('minPurchase')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum purchase must be a positive number'),
  body('maxDiscount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum discount must be a positive number'),
  body('usageLimit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Usage limit must be at least 1'),
  validateRequest
];

// Bulk Coupon Validations
export const bulkCouponValidation = [
   body('prefix').trim().notEmpty().withMessage('Prefix is required'),
   body('number').isInt({ min: 1, max: 100 }).withMessage('Quantity must be 1-100'),
   body('discountType').isIn(['percentage', 'fixed']),
   body('discountValue').isFloat({ min: 0 }),
   validateRequest
];

// Cart validations
export const addToCartValidation = [
  body('productId')
    .notEmpty()
    .isMongoId()
    .withMessage('Valid product ID is required'),
  body('quantity')
    .isInt({ min: 1, max: 10 })
    .withMessage('Quantity must be between 1 and 10'),
  validateRequest
];

// Order validations
export const createOrderValidation = [
  body('paymentMethod')
    .isIn(['COD', 'Razorpay'])
    .withMessage('Payment method must be either COD or Razorpay'),
  body('shippingAddress.name')
    .trim()
    .notEmpty()
    .withMessage('Recipient name is required'),
  body('shippingAddress.phone')
    .isMobilePhone()
    .withMessage('Valid phone number is required'),
  body('shippingAddress.address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),
  body('shippingAddress.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('shippingAddress.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  body('shippingAddress.zip')
    .trim()
    .notEmpty()
    .withMessage('ZIP code is required'),
  body('shippingAddress.country')
    .trim()
    .notEmpty()
    .withMessage('Country is required'),
  validateRequest
];

export const updateOrderStatusValidation = [
  body('status')
    .isIn(['processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid order status'),
  validateRequest
];
