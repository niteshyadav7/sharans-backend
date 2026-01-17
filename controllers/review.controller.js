import Review from '../models/review.model.js';
import Product from '../models/product.model.js';
import Order from '../models/order.model.js';

// Create a review
export const createReview = async (req, res) => {
  try {
    const { productId, rating, title, comment, images } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      product: productId,
      user: req.user._id,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product',
      });
    }

    // Check if user purchased this product (verified purchase)
    const hasPurchased = await Order.findOne({
      user: req.user._id,
      'items.product': productId,
      orderStatus: 'delivered',
    });

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      rating,
      title,
      comment,
      images: images || [],
      isVerifiedPurchase: !!hasPurchased,
    });

    // Populate user details
    await review.populate('user', 'name profileImage');

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all reviews for a product
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { 
      rating, 
      sort = '-createdAt', 
      page = 1, 
      limit = 10,
      verifiedOnly = false 
    } = req.query;

    const query = { 
      product: productId,
      status: 'approved'
    };

    // Filter by rating
    if (rating) {
      query.rating = parseInt(rating);
    }

    // Filter verified purchases only
    if (verifiedOnly === 'true') {
      query.isVerifiedPurchase = true;
    }

    const reviews = await Review.find(query)
      .populate('user', 'name profileImage')
      .populate('adminResponse.respondedBy', 'name')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments(query);

    // Get rating statistics
    const stats = await Review.calculateAverageRating(productId);

    res.json({
      success: true,
      reviews,
      stats,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user's reviews
export const getUserReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ user: req.user._id })
      .populate('product', 'name images currentPrice')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      reviews,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a review
export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, comment, images } = req.body;

    const review = await Review.findOne({
      _id: reviewId,
      user: req.user._id,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or unauthorized',
      });
    }

    // Update fields
    if (rating) review.rating = rating;
    if (title) review.title = title;
    if (comment) review.comment = comment;
    if (images) review.images = images;

    await review.save();
    await review.populate('user', 'name profileImage');

    res.json({
      success: true,
      message: 'Review updated successfully',
      review,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a review
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findOne({
      _id: reviewId,
      user: req.user._id,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or unauthorized',
      });
    }

    const productId = review.product;
    await review.deleteOne();

    // Update product rating
    await Review.updateProductRating(productId);

    res.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark review as helpful
export const markReviewHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check if user already marked as helpful
    const alreadyMarked = review.helpfulBy.includes(req.user._id);

    if (alreadyMarked) {
      // Remove helpful mark
      review.helpfulBy = review.helpfulBy.filter(
        id => id.toString() !== req.user._id.toString()
      );
      review.helpfulCount = Math.max(0, review.helpfulCount - 1);
    } else {
      // Add helpful mark
      review.helpfulBy.push(req.user._id);
      review.helpfulCount += 1;
    }

    await review.save();

    res.json({
      success: true,
      message: alreadyMarked ? 'Removed helpful mark' : 'Marked as helpful',
      helpfulCount: review.helpfulCount,
      isHelpful: !alreadyMarked,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get all reviews
export const getAllReviews = async (req, res) => {
  try {
    const { status, rating, search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (rating) query.rating = parseInt(rating);
    if (search) {
      query.$or = [
        { comment: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } }
      ];
    }

    const reviews = await Review.find(query)
      .populate('user', 'name email profileImage')
      .populate('product', 'name images')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments(query);
    
    // Summary Stats (Total across all reviews, not just filtered)
    const allStats = await Review.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
          }
        }
      }
    ]);

    const stats = allStats[0] || { avgRating: 0, total: 0, pending: 0 };

    res.json({
      success: true,
      reviews,
      stats: {
        averageRating: Math.round(stats.avgRating * 10) / 10,
        totalReviews: stats.total,
        pendingCount: stats.pending
      },
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Update review status
export const updateReviewStatus = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { status } = req.body;

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { status },
      { new: true }
    ).populate('user', 'name email');

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Update product rating if status changed to/from approved
    await Review.updateProductRating(review.product);

    res.json({
      success: true,
      message: 'Review status updated',
      review,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Add response to review
export const addAdminResponse = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { comment } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.adminResponse = {
      comment,
      respondedAt: new Date(),
      respondedBy: req.user._id,
    };

    await review.save();
    await review.populate('adminResponse.respondedBy', 'name');

    res.json({
      success: true,
      message: 'Response added successfully',
      review,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Delete any review
export const adminDeleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const productId = review.product;
    await review.deleteOne();

    // Update product rating
    await Review.updateProductRating(productId);

    res.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
