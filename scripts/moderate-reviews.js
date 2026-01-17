import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Review from '../models/review.model.js';
import readline from 'readline';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Connect to database
await mongoose.connect(process.env.MONGO_URI);

console.log('\n🛡️  Review Moderation Tool\n');
console.log('='.repeat(60));

// Get pending reviews
const pendingReviews = await Review.find({ status: 'pending' })
  .populate('user', 'name email')
  .populate('product', 'name')
  .sort('-createdAt');

if (pendingReviews.length === 0) {
  console.log('\n✅ No pending reviews to moderate!\n');
  await mongoose.connection.close();
  rl.close();
  process.exit(0);
}

console.log(`\nFound ${pendingReviews.length} pending review(s)\n`);

for (let i = 0; i < pendingReviews.length; i++) {
  const review = pendingReviews[i];
  
  console.log('\n' + '='.repeat(60));
  console.log(`Review ${i + 1} of ${pendingReviews.length}`);
  console.log('='.repeat(60));
  console.log(`\nProduct:    ${review.product?.name || 'Unknown'}`);
  console.log(`User:       ${review.user?.name || 'Unknown'} (${review.user?.email || 'N/A'})`);
  console.log(`Rating:     ${'⭐'.repeat(review.rating)} (${review.rating}/5)`);
  console.log(`Verified:   ${review.isVerifiedPurchase ? '✓ Yes' : '✗ No'}`);
  console.log(`Date:       ${review.createdAt.toLocaleString()}`);
  
  if (review.title) {
    console.log(`\nTitle:      ${review.title}`);
  }
  
  console.log(`\nComment:\n${'-'.repeat(60)}`);
  console.log(review.comment);
  console.log('-'.repeat(60));
  
  if (review.images && review.images.length > 0) {
    console.log(`\nImages:     ${review.images.length} image(s)`);
    review.images.forEach((img, idx) => {
      console.log(`  ${idx + 1}. ${img}`);
    });
  }
  
  console.log(`\nReview ID:  ${review._id}`);
  
  // Ask for action
  console.log('\n' + '-'.repeat(60));
  console.log('Actions:');
  console.log('  [a] Approve');
  console.log('  [r] Reject');
  console.log('  [s] Skip (keep pending)');
  console.log('  [q] Quit');
  console.log('-'.repeat(60));
  
  const action = await question('\nYour choice: ');
  
  switch (action.toLowerCase()) {
    case 'a':
      review.status = 'approved';
      await review.save();
      await Review.updateProductRating(review.product);
      console.log('✅ Review APPROVED');
      break;
      
    case 'r':
      review.status = 'rejected';
      await review.save();
      await Review.updateProductRating(review.product);
      console.log('❌ Review REJECTED');
      break;
      
    case 's':
      console.log('⏭️  Review SKIPPED (remains pending)');
      break;
      
    case 'q':
      console.log('\n👋 Exiting moderation tool...\n');
      await mongoose.connection.close();
      rl.close();
      process.exit(0);
      break;
      
    default:
      console.log('⚠️  Invalid choice. Review remains pending.');
  }
}

console.log('\n' + '='.repeat(60));
console.log('✅ All pending reviews processed!\n');

await mongoose.connection.close();
rl.close();
process.exit(0);
