// import mongoose from "mongoose";

// const productSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true, trim: true },
//     description: { type: String },
//     originalPrice: { type: Number, required: true }, // original price
//     currentPrice: { type: Number, required: true },  // discounted price
//     stock: { type: Number, required: true, default: 0 },
//     category: { type: String },
//     images: [{ type: String }], // multiple images
//     sku: { type: String }, // optional SKU
//     createdAt: { type: Date, default: Date.now },
//   },
//   { timestamps: true }
// );

// const Product = mongoose.model("Product", productSchema);

// export default Product;

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
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
