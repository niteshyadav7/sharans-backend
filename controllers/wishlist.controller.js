import Wishlist from '../models/wishlist.model.js';
import Product from '../models/product.model.js';

// Get user wishlist
export const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate({
        path: 'products.product',
        select: 'name currentPrice originalPrice images stock status description slug'
      });

    if (!wishlist) {
      // Return empty structure if no wishlist exists yet
      return res.json({
        success: true,
        wishlist: [],
        count: 0
      });
    }

    // Filter out null products (in case a product was deleted)
    wishlist.products = wishlist.products.filter(item => item.product !== null);

    res.json({
      success: true,
      wishlist: wishlist.products,
      count: wishlist.products.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add to wishlist
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      // Create new wishlist
      wishlist = await Wishlist.create({
        user: req.user._id,
        products: [{ product: productId }]
      });
    } else {
      // Check if product already exists
      const exists = wishlist.products.some(
        item => item.product.toString() === productId
      );

      if (exists) {
        return res.status(400).json({ success: false, message: 'Product already in wishlist' });
      }

      wishlist.products.push({ product: productId });
      await wishlist.save();
    }

    res.status(200).json({
      success: true,
      message: 'Product added to wishlist',
      count: wishlist.products.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      return res.status(404).json({ success: false, message: 'Wishlist not found' });
    }

    // Filter out the product
    const initialLength = wishlist.products.length;
    wishlist.products = wishlist.products.filter(
      item => item.product.toString() !== productId
    );

    if (wishlist.products.length === initialLength) {
      return res.status(404).json({ success: false, message: 'Product not found in wishlist' });
    }

    await wishlist.save();

    res.json({
      success: true,
      message: 'Product removed from wishlist',
      count: wishlist.products.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Check if product is in wishlist
export const checkWishlistStatus = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });

    const isInWishlist = wishlist 
      ? wishlist.products.some(item => item.product.toString() === productId)
      : false;

    res.json({
      success: true,
      isInWishlist
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
