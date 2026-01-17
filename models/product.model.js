import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    // Pricing
    originalPrice: { type: Number, required: true },
    currentPrice: { type: Number, required: true },
    currency: { type: String, default: "INR" },

    // Stock & SKU
    stock: { type: Number, default: 0 },
    sku: { type: String, unique: true, sparse: true },

    // Categorization
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    brand: { type: String, default: "Sharans" },
    tags: [{ type: String }],

    // Product attributes
    size: { type: String, default: "Free Size" },
    netQuantity: { type: String },
    capacity: { type: String },
    type: { type: String },
    skinType: { type: String, default: "All Skin Types" },
    gender: {
      type: String,
      enum: ["Men", "Women", "Unisex"],
      default: "Unisex",
    },
    features: [{ type: String }],
    countryOfOrigin: { type: String, default: "India" },

    // Media
    images: [{ type: String, required: true }],

    // Seller Info
    seller: {
      name: { type: String },
      rating: { type: Number, default: 0 },
      totalRatings: { type: Number, default: 0 },
      followers: { type: Number, default: 0 },
    },

    // Delivery Info
    delivery: {
      freeDelivery: { type: Boolean, default: true },
      codAvailable: { type: Boolean, default: true },
    },

    status: {
      type: String,
      enum: ["active", "inactive", "out-of-stock"],
      default: "active",
    },

    // Reviews & Ratings (aggregated data)
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    ratingDistribution: {
      1: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      5: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);


// Indexes for performance
productSchema.index({ category: 1, status: 1 }); // Filter by category and status
productSchema.index({ currentPrice: 1 }); // Sort by price
productSchema.index({ status: 1, createdAt: -1 }); // Latest active products
productSchema.index({ name: 'text', description: 'text' }); // Text search

const Product = mongoose.model("Product", productSchema);
export default Product;
