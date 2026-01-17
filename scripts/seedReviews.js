import mongoose from 'mongoose';
import Product from '../models/product.model.js';
import User from '../models/user.model.js';
import Review from '../models/review.model.js';
import dotenv from 'dotenv';

dotenv.config();

const seedReviews = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sharans-ecommerce');
    console.log('Connected to MongoDB');

    const products = await Product.find().limit(5);
    const users = await User.find({ role: 'user' }).limit(10);

    if (products.length === 0 || users.length === 0) {
      console.log('No products or users found to review');
      process.exit();
    }

    const reviewComments = [
      "Amazing product! Highly recommend it to everyone.",
      "The quality is top-notch. Worth every penny.",
      "Good product, but the delivery took some time.",
      "Excellent customer service and great packaging.",
      "I've been using this for a week and it's perfect.",
      "Satisfied with the purchase. Will buy again.",
      "The product matches the description exactly.",
      "Could be better, but overall decent for the price.",
      "Impressive quality and design.",
      "Very happy with this choice!"
    ];

    const reviews = [];

    for (let i = 0; i < 20; i++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const user = users[Math.floor(Math.random() * users.length)];
      
      reviews.push({
        product: product._id,
        user: user._id,
        rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
        comment: reviewComments[Math.floor(Math.random() * reviewComments.length)],
        status: 'approved',
        isVerifiedPurchase: true,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000))
      });
    }

    await Review.insertMany(reviews);
    console.log('Seeded 20 reviews successfully');

    // Update product ratings
    for (const product of products) {
      await Review.updateProductRating(product._id);
    }
    console.log('Updated product ratings');

    process.exit();
  } catch (error) {
    console.error('Error seeding reviews:', error);
    process.exit(1);
  }
};

seedReviews();
