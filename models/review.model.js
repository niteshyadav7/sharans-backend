import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      maxlength: 1000,
    },
    images: [{
      type: String, // URLs of review images
    }],
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
    helpfulBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved', // Auto-approve or set to 'pending' for moderation
    },
    adminResponse: {
      comment: String,
      respondedAt: Date,
      respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },
  },
  { 
    timestamps: true,
  }
);

// Indexes for performance
reviewSchema.index({ product: 1, createdAt: -1 }); // Get product reviews sorted by date
reviewSchema.index({ user: 1 }); // Get user's reviews
reviewSchema.index({ product: 1, user: 1 }, { unique: true }); // One review per user per product
reviewSchema.index({ rating: 1 }); // Filter by rating
reviewSchema.index({ status: 1 }); // Filter by status

// Static method to calculate average rating
reviewSchema.statics.calculateAverageRating = async function(productId) {
  const stats = await this.aggregate([
    {
      $match: { 
        product: productId,
        status: 'approved'
      }
    },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);

  if (stats.length > 0) {
    // Calculate rating distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    stats[0].ratingDistribution.forEach(rating => {
      distribution[rating]++;
    });

    return {
      averageRating: Math.round(stats[0].averageRating * 10) / 10, // Round to 1 decimal
      totalReviews: stats[0].totalReviews,
      ratingDistribution: distribution,
    };
  }

  return {
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  };
};

// Update product rating after review save/update/delete
reviewSchema.post('save', async function() {
  await this.constructor.updateProductRating(this.product);
});

reviewSchema.post('remove', async function() {
  await this.constructor.updateProductRating(this.product);
});

// Static method to update product rating
reviewSchema.statics.updateProductRating = async function(productId) {
  const Product = mongoose.model('Product');
  const stats = await this.calculateAverageRating(productId);
  
  await Product.findByIdAndUpdate(productId, {
    averageRating: stats.averageRating,
    totalReviews: stats.totalReviews,
    ratingDistribution: stats.ratingDistribution,
  });
};

const Review = mongoose.model('Review', reviewSchema);
export default Review;
