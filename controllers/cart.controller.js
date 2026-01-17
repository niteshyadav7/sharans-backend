// controllers/cart.controller.js
import Cart from "../models/cart.model.js";
import CartItem from "../models/cartItem.model.js";
import Coupon from "../models/coupon.model.js";
import Product from "../models/product.model.js"; // ✅ import Product for stock validation
import Wishlist from "../models/wishlist.model.js";
import { calculateCartTotal } from "../utils/calculateCartTotal.js";



// Get or Create Cart
export const getOrCreateCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: "items",
        populate: { path: "product" },
      })
      .populate("coupon");

    if (!cart) {
      cart = await Cart.create({ user: req.user._id });
    }

    const totals = await calculateCartTotal(CartItem, cart._id, cart.coupon);
    cart.total = totals.total;
    await cart.save();

    res.status(200).json({ cart, totals });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add Item to Cart
export const addItemToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // ✅ Validate quantity
    if (quantity < 1 || quantity > 10) {
      return res.status(400).json({ message: 'Quantity must be between 1 and 10' });
    }

    // ✅ Check product stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (product.stock < quantity) {
      return res.status(400).json({ 
        message: `Only ${product.stock} items available in stock` 
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = await Cart.create({ user: req.user._id });

    let item = await CartItem.findOne({ cart: cart._id, product: productId });
    if (item) {
      // ✅ Check stock for updated quantity
      const newQuantity = item.quantity + quantity;
      if (product.stock < newQuantity) {
        return res.status(400).json({ 
          message: `Only ${product.stock} items available in stock. You already have ${item.quantity} in cart.` 
        });
      }
      item.quantity = newQuantity;
    } else {
      item = await CartItem.create({
        cart: cart._id,
        product: productId,
        quantity,
      });
    }


    await item.save();
    if (!cart.items.includes(item._id)) cart.items.push(item._id);

    const totals = await calculateCartTotal(CartItem, cart._id, cart.coupon);
    cart.total = totals.total;
    await cart.save();

    res.status(200).json({ message: "Item added to cart", cart, totals });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove Item from Cart
export const removeItemFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const item = await CartItem.findById(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    await CartItem.findByIdAndDelete(itemId);

    const cart = await Cart.findById(item.cart);
    cart.items.pull(itemId);

    const totals = await calculateCartTotal(CartItem, cart._id, cart.coupon);
    cart.total = totals.total;
    await cart.save();

    res.status(200).json({ message: "Item removed", cart, totals });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Apply Coupon
export const applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const coupon = await Coupon.findOne({ code });
    if (!coupon) return res.status(404).json({ message: "Invalid coupon" });

    // Check expiry
    if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
      return res.status(400).json({ message: "Coupon expired" });
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: "Coupon usage limit reached" });
    }

    const totals = await calculateCartTotal(CartItem, cart._id, coupon._id);
    if (totals.subtotal < coupon.minPurchase) {
      return res.status(400).json({
        message: `Minimum purchase ₹${coupon.minPurchase} required`,
      });
    }

    // Apply coupon
    cart.coupon = coupon._id;
    cart.total = totals.total;
    await cart.save();

    // Note: Coupon usage count will be incremented when order is completed
    res
      .status(200)
      .json({ message: "Coupon applied successfully", cart, totals });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Clear Cart
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    await CartItem.deleteMany({ cart: cart._id });
    cart.items = [];
    cart.total = 0;
    cart.coupon = null;
    await cart.save();

    res.status(200).json({ message: "Cart cleared successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Move Item to Wishlist
export const moveToWishlist = async (req, res) => {
  try {
    const { itemId } = req.params;

    // 1. Find cart item
    const cartItem = await CartItem.findById(itemId);
    if (!cartItem) return res.status(404).json({ message: "Cart item not found" });

    // 2. Add to wishlist
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        products: []
      });
    }

    // Check if duplicate
    const exists = wishlist.products.some(
      p => p.product.toString() === cartItem.product.toString()
    );

    if (!exists) {
      wishlist.products.push({ product: cartItem.product });
      await wishlist.save();
    }

    // 3. Remove from cart
    await CartItem.findByIdAndDelete(itemId);
    
    const cart = await Cart.findById(cartItem.cart);
    cart.items.pull(itemId);
    
    // Recalculate totals
    const totals = await calculateCartTotal(CartItem, cart._id, cart.coupon);
    cart.total = totals.total;
    await cart.save();

    res.json({
      success: true,
      message: 'Moved to wishlist',
      cart,
      totals
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

