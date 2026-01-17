# Quick Fix Guide

This guide provides step-by-step instructions to apply the remaining critical fixes.

## 🔧 Fix 1: Cart Clearing Bug in Payment Verification

**File:** `controllers/order.controller.js`

**Find line 347** (inside `verifyPayment` function):
```javascript
await CartItem.deleteMany({ cart: order.cart });
```

**Replace with:**
```javascript
// Clear cart properly after successful payment
const cart = await Cart.findOne({ user: order.user });
if (cart) {
  await CartItem.deleteMany({ cart: cart._id });
  cart.items = [];
  cart.total = 0;
  cart.coupon = null;
  await cart.save();
}
```

---

## 🔧 Fix 2: Add Stock Validation to Orders

**File:** `controllers/order.controller.js`

**Step 1:** Add Product import at the top (if not already there):
```javascript
import Product from "../models/product.model.js";
```

**Step 2:** In `createOrder` function, **before line 267** (before creating the order), add:
```javascript
// Validate stock availability
for (const item of cart.items) {
  const product = await Product.findById(item.product._id);
  if (!product) {
    return res.status(404).json({ 
      message: `Product not found: ${item.product.name}` 
    });
  }
  if (product.stock < item.quantity) {
    return res.status(400).json({
      message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
    });
  }
}
```

**Step 3:** **After line 288** (after successful order creation), add:
```javascript
// Reduce stock for each product
for (const item of order.items) {
  await Product.findByIdAndUpdate(item.product, {
    $inc: { stock: -item.quantity }
  });
}
```

---

## 🔧 Fix 3: Fix Coupon Usage Tracking

**File 1:** `controllers/cart.controller.js`

**Find and DELETE lines 117-118** (in `applyCoupon` function):
```javascript
// DELETE THESE LINES:
coupon.usedCount += 1;
await coupon.save();
```

**File 2:** `controllers/order.controller.js`

**In `createOrder` function, after line 288** (after successful order creation), add:
```javascript
// Increment coupon usage count
if (cart.coupon) {
  await Coupon.findByIdAndUpdate(cart.coupon, { $inc: { usedCount: 1 } });
}
```

---

## 🔧 Fix 4: Add Stock Check in Cart

**File:** `controllers/cart.controller.js`

**In `addItemToCart` function, after line 34**, add:
```javascript
// Validate quantity
if (quantity < 1 || quantity > 10) {
  return res.status(400).json({ message: 'Quantity must be between 1 and 10' });
}

// Check product stock
const product = await Product.findById(productId);
if (!product) {
  return res.status(404).json({ message: 'Product not found' });
}
if (product.stock < quantity) {
  return res.status(400).json({ 
    message: `Only ${product.stock} items available in stock` 
  });
}
```

**Add Product import at the top:**
```javascript
import Product from "../models/product.model.js";
```

---

## 🔧 Fix 5: Apply Input Validation to Routes

**File:** `routes/auth.routes.js`

**Add import at the top:**
```javascript
import { registerValidation, loginValidation, updateProfileValidation } from '../middlewares/validators.js';
```

**Update routes:**
```javascript
// Replace:
router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/profile", protect, updateProfile);

// With:
router.post("/register", registerValidation, registerUser);
router.post("/login", loginValidation, loginUser);
router.put("/profile", protect, updateProfileValidation, updateProfile);
```

**File:** `routes/product.routes.js`

**Add import:**
```javascript
import { productValidation } from '../middlewares/validators.js';
```

**Update routes:**
```javascript
router.post("/", protect, admin, productValidation, createProduct);
router.put("/:id", protect, admin, productValidation, updateProduct);
```

**File:** `routes/cart.routes.js`

**Add import:**
```javascript
import { addToCartValidation } from '../middlewares/validators.js';
```

**Update route:**
```javascript
router.post("/add", protect, addToCartValidation, addItemToCart);
```

**File:** `routes/order.routes.js`

**Add import:**
```javascript
import { createOrderValidation, updateOrderStatusValidation } from '../middlewares/validators.js';
```

**Update routes:**
```javascript
router.post("/create", protect, createOrderValidation, createOrder);
router.put("/:id/status", protect, admin, updateOrderStatusValidation, updateOrderStatus);
```

---

## ✅ Verification Steps

After applying all fixes:

1. **Test Registration:**
   ```bash
   # Should fail with validation error
   curl -X POST http://localhost:8080/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"ab","email":"invalid","password":"123"}'
   ```

2. **Test Stock Validation:**
   - Add product with stock = 5
   - Try to order quantity = 10
   - Should fail with "Insufficient stock" message

3. **Test Cart Clearing:**
   - Complete a Razorpay payment
   - Check that cart is empty after payment verification

4. **Test Coupon Usage:**
   - Apply coupon to cart
   - Complete order
   - Check that coupon.usedCount increased by 1

5. **Test Rate Limiting:**
   - Try to login 6 times quickly
   - 6th attempt should be blocked

---

## 🚨 Important Notes

- Make sure to test each fix individually
- Keep a backup of files before editing
- Check for syntax errors after each change
- Restart the server after applying fixes
- Monitor logs for any errors

---

## 📞 Need Help?

If you encounter any issues:
1. Check the syntax carefully
2. Ensure all imports are added
3. Verify line numbers (they may shift as you add code)
4. Check the full CODEBASE_REVIEW.md for detailed explanations

---

**Estimated Time:** 30-45 minutes for all fixes
**Difficulty:** Medium
**Priority:** High (these are critical bugs)
