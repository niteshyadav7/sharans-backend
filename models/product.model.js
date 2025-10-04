import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    originalPrice: { type: Number, required: true }, // original price
    currentPrice: { type: Number, required: true },  // discounted price
    stock: { type: Number, required: true, default: 0 },
    category: { type: String },
    images: [{ type: String }], // multiple images
    sku: { type: String }, // optional SKU
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
