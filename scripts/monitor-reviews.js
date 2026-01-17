import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Review from '../models/review.model.js';
import Product from '../models/product.model.js';
import User from '../models/user.model.js';

dotenv.config();

// Connect to database
await mongoose.connect(process.env.MONGO_URI);

console.log('📊 Review Monitoring Dashboard\n');
console.log('='.repeat(60));

// 1. Overall Statistics
const totalReviews = await Review.countDocuments();
const approvedReviews = await Review.countDocuments({ status: 'approved' });
const pendingReviews = await Review.countDocuments({ status: 'pending' });
const rejectedReviews = await Review.countDocuments({ status: 'rejected' });
const verifiedPurchases = await Review.countDocuments({ isVerifiedPurchase: true });

console.log('\n📈 OVERALL STATISTICS');
console.log('-'.repeat(60));
console.log(`Total Reviews:           ${totalReviews}`);
console.log(`Approved Reviews:        ${approvedReviews} (${((approvedReviews/totalReviews)*100).toFixed(1)}%)`);
console.log(`Pending Reviews:         ${pendingReviews} (${((pendingReviews/totalReviews)*100).toFixed(1)}%)`);
console.log(`Rejected Reviews:        ${rejectedReviews} (${((rejectedReviews/totalReviews)*100).toFixed(1)}%)`);
console.log(`Verified Purchases:      ${verifiedPurchases} (${((verifiedPurchases/totalReviews)*100).toFixed(1)}%)`);

// 2. Rating Distribution
const ratingStats = await Review.aggregate([
  { $match: { status: 'approved' } },
  {
    $group: {
      _id: '$rating',
      count: { $sum: 1 }
    }
  },
  { $sort: { _id: -1 } }
]);

console.log('\n⭐ RATING DISTRIBUTION (Approved Reviews)');
console.log('-'.repeat(60));
const ratingMap = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
ratingStats.forEach(stat => {
  ratingMap[stat._id] = stat.count;
});

for (let i = 5; i >= 1; i--) {
  const count = ratingMap[i];
  const percentage = approvedReviews > 0 ? ((count/approvedReviews)*100).toFixed(1) : 0;
  const bar = '█'.repeat(Math.floor(percentage/2));
  console.log(`${i} ⭐ ${bar.padEnd(50)} ${count} (${percentage}%)`);
}

// 3. Average Rating
const avgRating = await Review.aggregate([
  { $match: { status: 'approved' } },
  {
    $group: {
      _id: null,
      averageRating: { $avg: '$rating' }
    }
  }
]);

if (avgRating.length > 0) {
  console.log(`\nAverage Rating: ${avgRating[0].averageRating.toFixed(2)} / 5.00`);
}

// 4. Recent Reviews (Last 10)
console.log('\n📝 RECENT REVIEWS (Last 10)');
console.log('-'.repeat(60));

const recentReviews = await Review.find()
  .populate('user', 'name email')
  .populate('product', 'name')
  .sort('-createdAt')
  .limit(10);

recentReviews.forEach((review, index) => {
  const stars = '⭐'.repeat(review.rating);
  const status = review.status === 'approved' ? '✅' : 
                 review.status === 'pending' ? '⏳' : '❌';
  const verified = review.isVerifiedPurchase ? '✓' : '';
  
  console.log(`\n${index + 1}. ${status} ${stars} ${verified}`);
  console.log(`   Product: ${review.product?.name || 'Unknown'}`);
  console.log(`   User: ${review.user?.name || 'Unknown'} (${review.user?.email || 'N/A'})`);
  console.log(`   Comment: ${review.comment.substring(0, 80)}${review.comment.length > 80 ? '...' : ''}`);
  console.log(`   Date: ${review.createdAt.toLocaleDateString()}`);
});

// 5. Pending Reviews (Need Moderation)
if (pendingReviews > 0) {
  console.log('\n⏳ PENDING REVIEWS (Need Moderation)');
  console.log('-'.repeat(60));

  const pending = await Review.find({ status: 'pending' })
    .populate('user', 'name email')
    .populate('product', 'name')
    .sort('-createdAt')
    .limit(5);

  pending.forEach((review, index) => {
    console.log(`\n${index + 1}. ${review.rating} ⭐`);
    console.log(`   Product: ${review.product?.name || 'Unknown'}`);
    console.log(`   User: ${review.user?.name || 'Unknown'}`);
    console.log(`   Comment: ${review.comment.substring(0, 100)}${review.comment.length > 100 ? '...' : ''}`);
    console.log(`   Review ID: ${review._id}`);
  });

  console.log(`\n   ... and ${pendingReviews - 5 > 0 ? pendingReviews - 5 : 0} more pending reviews`);
}

// 6. Top Reviewed Products
console.log('\n🏆 TOP REVIEWED PRODUCTS');
console.log('-'.repeat(60));

const topProducts = await Product.find()
  .sort('-totalReviews')
  .limit(10)
  .select('name averageRating totalReviews');

topProducts.forEach((product, index) => {
  const stars = product.averageRating ? product.averageRating.toFixed(1) : '0.0';
  console.log(`${index + 1}. ${product.name}`);
  console.log(`   Rating: ${stars} ⭐ (${product.totalReviews} reviews)`);
});

// 7. Products Without Reviews
const productsWithoutReviews = await Product.countDocuments({ totalReviews: 0 });
console.log(`\n⚠️  Products without reviews: ${productsWithoutReviews}`);

// 8. Most Helpful Reviews
console.log('\n👍 MOST HELPFUL REVIEWS');
console.log('-'.repeat(60));

const helpfulReviews = await Review.find({ status: 'approved' })
  .sort('-helpfulCount')
  .limit(5)
  .populate('user', 'name')
  .populate('product', 'name');

helpfulReviews.forEach((review, index) => {
  console.log(`\n${index + 1}. ${review.rating} ⭐ - ${review.helpfulCount} helpful votes`);
  console.log(`   Product: ${review.product?.name || 'Unknown'}`);
  console.log(`   User: ${review.user?.name || 'Unknown'}`);
  console.log(`   Comment: ${review.comment.substring(0, 80)}${review.comment.length > 80 ? '...' : ''}`);
});

// 9. Review Activity (Last 7 Days)
const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

const recentActivity = await Review.countDocuments({
  createdAt: { $gte: sevenDaysAgo }
});

console.log('\n📅 RECENT ACTIVITY');
console.log('-'.repeat(60));
console.log(`Reviews in last 7 days: ${recentActivity}`);
console.log(`Average per day: ${(recentActivity / 7).toFixed(1)}`);

// 10. Users with Most Reviews
console.log('\n👥 TOP REVIEWERS');
console.log('-'.repeat(60));

const topReviewers = await Review.aggregate([
  {
    $group: {
      _id: '$user',
      reviewCount: { $sum: 1 },
      averageRating: { $avg: '$rating' }
    }
  },
  { $sort: { reviewCount: -1 } },
  { $limit: 5 }
]);

for (const reviewer of topReviewers) {
  const user = await User.findById(reviewer._id).select('name email');
  if (user) {
    console.log(`${user.name} (${user.email})`);
    console.log(`   Reviews: ${reviewer.reviewCount} | Avg Rating: ${reviewer.averageRating.toFixed(1)} ⭐`);
  }
}

console.log('\n' + '='.repeat(60));
console.log('✅ Monitoring Complete!\n');

// Close connection
await mongoose.connection.close();
process.exit(0);
